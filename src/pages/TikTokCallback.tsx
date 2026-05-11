import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { callAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, Bug } from "lucide-react";
import { toast } from "sonner";

interface TokenData {
  access_token: string;
  refresh_token: string;
  open_id: string;
  scope: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

const TikTokCallback = () => {
  const [searchParams] = useSearchParams();
  
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const scopes = searchParams.get("scopes");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, string>>({});

  // Fixed redirect URI - must match TikTok Developer Portal configuration
  const fixedRedirectUri = "https://lovix.app/tiktok/callback/";
  const currentDomain = window.location.origin;
  const isCorrectDomain = currentDomain.includes("lovix.app");

  useEffect(() => {
    // Collect debug info
    const codeVerifier = state ? sessionStorage.getItem(`tiktok_code_verifier_${state}`) : null;
    
    setDebugInfo({
      fixedRedirectUri,
      currentDomain,
      isCorrectDomain: isCorrectDomain ? 'Yes' : 'No',
      state: state || 'N/A',
      hasCode: code ? 'Yes' : 'No',
      codeLength: code ? String(code.length) : '0',
      hasCodeVerifier: codeVerifier ? 'Yes (from sessionStorage)' : 'No',
      fullUrl: window.location.href,
    });

    if (code && !tokenData && !loading && !tokenError) {
      exchangeToken();
    }
  }, [code]);

  const exchangeToken = async () => {
    if (!code) return;
    
    setLoading(true);
    setTokenError(null);
    
    // IMPORTANT: Always use the exact same redirect_uri that was used in the authorization request
    // This MUST match what's configured in TikTok Developer Portal
    const redirectUri = "https://lovix.app/tiktok/callback/";
    console.log('Using redirect_uri for token exchange:', redirectUri);
    
    // Try to get code_verifier from sessionStorage (if PKCE was used)
    const codeVerifier = state ? sessionStorage.getItem(`tiktok_code_verifier_${state}`) : null;
    console.log('Code verifier found:', codeVerifier ? 'Yes' : 'No');
    
    try {
      const body: Record<string, string> = { 
        code, 
        redirect_uri: redirectUri
      };
      
      // Include code_verifier if available (for PKCE flow)
      if (codeVerifier) {
        body.code_verifier = codeVerifier;
        // Clean up after use
        sessionStorage.removeItem(`tiktok_code_verifier_${state}`);
      }
      
      const response = await callAPI<{ error?: string; error_description?: string; access_token?: string; refresh_token?: string; open_id?: string; scope?: string; expires_in?: number; refresh_expires_in?: number; token_type?: string }>('tiktok-token-exchange', body);

      if (response.error) {
        throw new Error(response.error_description || response.error);
      }

      setTokenData(response as typeof tokenData);
      toast.success("Token ottenuto con successo!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTokenError(errorMessage);
      toast.error("Errore nello scambio del token");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiato negli appunti!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">TikTok OAuth Callback</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDebug(!showDebug)}
          >
            <Bug className="h-4 w-4 mr-1" />
            Debug
          </Button>
        </div>
        
        {/* Debug Panel */}
        {showDebug && (
          <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Debug Info</h3>
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="text-muted-foreground font-medium">{key}:</span>
                <span className="text-foreground break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
        
        {error ? (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive">Error: {error}</p>
              {error_description && (
                <p className="text-sm text-muted-foreground mt-2">{error_description}</p>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Scambio del codice per access token...</p>
            </div>
          </div>
        ) : tokenError ? (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive">Token Exchange Error</p>
              <p className="text-sm text-muted-foreground mt-2">{tokenError}</p>
            </div>
            <Button onClick={exchangeToken} variant="outline">
              Riprova
            </Button>
          </div>
        ) : tokenData ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-600">✓ Token ottenuto con successo!</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Access Token:</label>
              <div className="p-3 bg-muted rounded-lg break-all flex items-start gap-2">
                <code className="text-sm text-foreground flex-1">{tokenData.access_token}</code>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(tokenData.access_token)}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Open ID:</label>
              <div className="p-3 bg-muted rounded-lg break-all">
                <code className="text-sm text-foreground">{tokenData.open_id}</code>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Scope:</label>
              <div className="p-3 bg-muted rounded-lg break-all">
                <code className="text-sm text-foreground">{tokenData.scope}</code>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Expires In:</label>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm text-foreground">{tokenData.expires_in}s</code>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Token Type:</label>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm text-foreground">{tokenData.token_type}</code>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Code:</label>
              <div className="p-3 bg-muted rounded-lg break-all">
                <code className="text-sm text-foreground">{code || "No code received"}</code>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">State:</label>
              <div className="p-3 bg-muted rounded-lg break-all">
                <code className="text-sm text-foreground">{state || "No state received"}</code>
              </div>
            </div>
            
            {scopes && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Scopes:</label>
                <div className="p-3 bg-muted rounded-lg break-all">
                  <code className="text-sm text-foreground">{scopes}</code>
                </div>
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Questa pagina riceve il callback OAuth da TikTok API.
        </p>
      </div>
    </div>
  );
};

export default TikTokCallback;
