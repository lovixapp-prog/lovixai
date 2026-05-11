import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// PKCE utilities
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64urlEncode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const hashed = await sha256(codeVerifier);
  return base64urlEncode(hashed);
};

const TikTokConnect = () => {
  const [copied, setCopied] = useState(false);
  const [authUrl, setAuthUrl] = useState<string>("");
  const [codeVerifier, setCodeVerifier] = useState<string>("");
  const [codeChallenge, setCodeChallenge] = useState<string>("");
  const [state, setState] = useState<string>("");
  
  // Configuration
  const clientKey = "awl48frezt1n3w7n";
  const requiredDomain = "lovix.app";
  const currentOrigin = window.location.origin;
  const isCorrectDomain = currentOrigin.includes(requiredDomain);
  
  // IMPORTANT: Always use the production domain for redirect_uri
  const redirectUri = `https://${requiredDomain}/tiktok/callback/`;
  const scopes = "user.info.basic,video.upload,video.publish";

  const generateNewAuth = async () => {
    // Generate PKCE values
    const verifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    const stateValue = generateRandomString(16);
    
    setCodeVerifier(verifier);
    setCodeChallenge(challenge);
    setState(stateValue);
    
    // Store code_verifier in sessionStorage for the callback to use
    sessionStorage.setItem(`tiktok_code_verifier_${stateValue}`, verifier);
    
    // Build authorization URL with PKCE
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: stateValue,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    
    const url = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    setAuthUrl(url);
    
    toast.success("Nuovo link di autorizzazione generato!");
  };

  useEffect(() => {
    generateNewAuth();
  }, []);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiato negli appunti!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openAuthUrl = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-card border border-border rounded-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Connetti TikTok</h1>
          <Button onClick={generateNewAuth} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rigenera
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Questa pagina genera un link di autorizzazione TikTok con supporto PKCE (Proof Key for Code Exchange).
          Clicca il pulsante per aprire TikTok e autorizzare l'app.
        </p>

        {/* Domain Warning */}
        {!isCorrectDomain && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive mb-2">⚠️ Dominio non corretto</p>
            <p className="text-sm text-muted-foreground mb-3">
              Stai accedendo da <code className="bg-muted px-1 rounded">{currentOrigin}</code>.
              Per completare l'autorizzazione TikTok, devi aprire questa pagina dal dominio di produzione.
            </p>
            <a 
              href={`https://${requiredDomain}/tiktok/connect`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Apri su https://{requiredDomain}/tiktok/connect
            </a>
          </div>
        )}

        {/* Main Action Button */}
        <Button 
          onClick={openAuthUrl} 
          className="w-full" 
          size="lg" 
          disabled={!authUrl || !isCorrectDomain}
        >
          <ExternalLink className="h-5 w-5 mr-2" />
          {isCorrectDomain ? "Apri TikTok per Autorizzare" : "Cambia dominio per procedere"}
        </Button>

        {/* Debug Information */}
        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">Dettagli Tecnici (Debug)</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Redirect URI:</label>
            <div className="p-3 bg-muted rounded-lg break-all">
              <code className="text-sm text-foreground">{redirectUri}</code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">State:</label>
            <div className="p-3 bg-muted rounded-lg break-all">
              <code className="text-sm text-foreground">{state || "Generating..."}</code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Code Challenge (S256):</label>
            <div className="p-3 bg-muted rounded-lg break-all">
              <code className="text-sm text-foreground">{codeChallenge || "Generating..."}</code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Code Verifier (salvato in sessionStorage):</label>
            <div className="p-3 bg-muted rounded-lg break-all">
              <code className="text-xs text-foreground">{codeVerifier || "Generating..."}</code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">URL Completo:</label>
            <div className="p-3 bg-muted rounded-lg break-all flex items-start gap-2">
              <code className="text-xs text-foreground flex-1">{authUrl || "Generating..."}</code>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => copyToClipboard(authUrl)}
                className="shrink-0"
                disabled={!authUrl}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Importante:</strong> Assicurati che <code className="bg-muted px-1 rounded">{redirectUri}</code> sia 
            configurato esattamente così nella whitelist dei Redirect URI del TikTok Developer Portal.
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Il code_verifier viene salvato automaticamente nel browser e verrà usato dalla pagina callback per lo scambio del token.
        </p>
      </div>
    </div>
  );
};

export default TikTokConnect;
