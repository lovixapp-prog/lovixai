import { Link } from "react-router-dom";
import { ArrowLeft, Wand2, Video, Music, Image, Mic, AlertCircle, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MotionGuide = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Motion Control & Lip Sync Guide - AI Animation Tutorial | LOVIX"
        description="Master AI motion control and lip sync. Learn to transfer motion between videos, animate images, and sync lip movements with audio. Step-by-step motion AI guide."
        keywords="motion control guide, lip sync tutorial, AI animation guide, motion transfer tutorial, video motion AI, image animation guide, lip sync AI how to"
        canonicalPath="/guide/motion"
      />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        {/* Hero */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Wand2 className="w-4 h-4" />
            Motion Control Guide
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Motion Control & Lip Sync
          </h1>
          <p className="text-lg text-muted-foreground">
            Transfer motion between videos and images, or synchronize lip movements with audio.
          </p>
        </div>

        {/* Two Modes Overview */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Two Modes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-lg mb-2">Motion Transfer</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Take motion from a reference video and apply it to a character image. The character will move exactly like the subject in your video.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                <strong>Requires:</strong> 1 video + 1 image
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-lg mb-2">Lip Sync</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Synchronize a character's lip movements with audio. Perfect for dubbing, voice-overs, and creating talking avatars.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                <strong>Requires:</strong> 1 video + 1 audio file
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Guides */}
        <Tabs defaultValue="motion-transfer" className="mb-10 sm:mb-14">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="motion-transfer" className="gap-2">
              <Video className="w-4 h-4" />
              Motion Transfer
            </TabsTrigger>
            <TabsTrigger value="lip-sync" className="gap-2">
              <Mic className="w-4 h-4" />
              Lip Sync
            </TabsTrigger>
          </TabsList>

          {/* Motion Transfer Tab */}
          <TabsContent value="motion-transfer" className="space-y-6">
            {/* How it works */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">How It Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">1. Upload Video</h4>
                  <p className="text-xs text-muted-foreground">A video with clear movement to transfer</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Image className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">2. Upload Image</h4>
                  <p className="text-xs text-muted-foreground">Character or subject to animate</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">3. Generate</h4>
                  <p className="text-xs text-muted-foreground">AI transfers the motion</p>
                </div>
              </div>
            </div>

            {/* Video Requirements */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">Video Requirements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Format & Size</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      MP4, WebM formats
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Max file size: 50MB
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Duration: 2-30 seconds
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Clear, visible movements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Good lighting conditions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Stable camera (minimal shake)
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-amber-400">Tip:</strong> Videos with a single subject and clear body movements work best. Avoid complex multi-person scenes.
                  </p>
                </div>
              </div>
            </div>

            {/* Image Requirements */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">Image Requirements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Format & Size</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      PNG, JPG, WebP formats
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Max file size: 10MB
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Min resolution: 512x512
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Clear, visible character
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      High resolution preferred
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Simple background helps
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Character Orientation */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">Character Orientation Setting</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This setting determines which source's orientation is used for the final result:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground text-sm mb-1">Video Orientation</h4>
                  <p className="text-xs text-muted-foreground">
                    Uses the pose and position from the reference video. Character adapts to match video subject's orientation.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground text-sm mb-1">Image Orientation</h4>
                  <p className="text-xs text-muted-foreground">
                    Preserves the original pose of your character image while applying motion. Best for maintaining character identity.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Lip Sync Tab */}
          <TabsContent value="lip-sync" className="space-y-6">
            {/* How it works */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">How It Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">1. Upload Video</h4>
                  <p className="text-xs text-muted-foreground">Video with a visible face</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">2. Upload Audio</h4>
                  <p className="text-xs text-muted-foreground">Speech or dialogue to sync</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">3. Generate</h4>
                  <p className="text-xs text-muted-foreground">AI syncs lips to audio</p>
                </div>
              </div>
            </div>

            {/* Video Requirements */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">Video Requirements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Format & Size</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      MP4, WebM formats
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Max file size: 50MB
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Duration: 2-60 seconds
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Face clearly visible
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Good lighting on face
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Frontal or 3/4 angle view
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-amber-400">Important:</strong> The face must be visible throughout the video. Extreme angles or obstructions will affect quality.
                  </p>
                </div>
              </div>
            </div>

            {/* Audio Requirements */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">Audio Requirements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Format & Size</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      MP3, WAV, M4A formats
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Max file size: 20MB
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Duration: 2-60 seconds
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Clear speech without music
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Minimal background noise
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Natural speaking pace
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Keep Original Sound */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-4">Keep Original Sound Option</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This toggle controls the audio in your final output:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground text-sm mb-1">On (Keep Sound)</h4>
                  <p className="text-xs text-muted-foreground">
                    Mixes the original video audio with the new lip-synced audio. Good for preserving background sounds.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-foreground text-sm mb-1">Off (Replace Sound)</h4>
                  <p className="text-xs text-muted-foreground">
                    Completely replaces the original audio with your uploaded audio. Best for dubbing and voice-overs.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quality Settings */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Quality Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground text-lg mb-2">Standard</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Good quality output with faster processing times. Suitable for most use cases and previews.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Processing: ~3-5 min</span>
                <span className="text-primary font-medium">150 credits</span>
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border border-primary/50">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-foreground text-lg">Pro</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Recommended</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Higher quality with better detail preservation. Best for final renders and professional content.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Processing: ~5-10 min</span>
                <span className="text-primary font-medium">200 credits</span>
              </div>
            </div>
          </div>
        </section>

        {/* Format Summary Table */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Format Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">File Type</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Formats</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Max Size</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Video</td>
                  <td className="py-3 px-4 text-foreground">MP4, WebM</td>
                  <td className="py-3 px-4 text-foreground">50MB</td>
                  <td className="py-3 px-4 text-foreground">2-60 sec</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Image</td>
                  <td className="py-3 px-4 text-foreground">PNG, JPG, WebP</td>
                  <td className="py-3 px-4 text-foreground">10MB</td>
                  <td className="py-3 px-4 text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Audio</td>
                  <td className="py-3 px-4 text-foreground">MP3, WAV, M4A</td>
                  <td className="py-3 px-4 text-foreground">20MB</td>
                  <td className="py-3 px-4 text-foreground">2-60 sec</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Common Issues */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Common Issues & Solutions</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground mb-2">Motion looks unnatural</h3>
              <p className="text-sm text-muted-foreground">
                Try using a reference video with clearer, more pronounced movements. Ensure the character image has a similar pose or body proportion to the video subject.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground mb-2">Lip sync is off-timing</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your audio has clear speech without overlapping sounds. The video should have good face visibility throughout. Try the Pro quality setting for better results.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground mb-2">Generation takes too long</h3>
              <p className="text-sm text-muted-foreground">
                Processing time depends on video length and quality setting. Standard quality is faster. Try shorter clips (under 15 seconds) for quicker results.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-medium text-foreground mb-2">Upload failed</h3>
              <p className="text-sm text-muted-foreground">
                Check that your file format is supported and file size is within limits. Try compressing large files or converting to a supported format.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Wand2 className="w-5 h-5" />
            Start Creating Motion
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default MotionGuide;
