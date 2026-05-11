import { lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const FreeVideo = lazy(() => import("./pages/FreeVideo"));
const VideoModel = lazy(() => import("./pages/VideoModel"));
const ImageModel = lazy(() => import("./pages/ImageModel"));
const MotionControl = lazy(() => import("./pages/MotionControl"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatDashboard = lazy(() => import("./pages/ChatDashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const DesktopDownload = lazy(() => import("./pages/DesktopDownload"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VideoGuide = lazy(() => import("./pages/guides/VideoGuide"));
const ImageGuide = lazy(() => import("./pages/guides/ImageGuide"));
const MotionGuide = lazy(() => import("./pages/guides/MotionGuide"));
const UGCGuide = lazy(() => import("./pages/guides/UGCGuide"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Documentation = lazy(() => import("./pages/Documentation"));
const ApiReference = lazy(() => import("./pages/ApiReference"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const Blog = lazy(() => import("./pages/Blog"));
const FutureAIVideoGeneration = lazy(() => import("./pages/blog/FutureAIVideoGeneration"));
const AIVideoPromptTips = lazy(() => import("./pages/blog/AIVideoPromptTips"));
const MotionControlAnimation = lazy(() => import("./pages/blog/MotionControlAnimation"));
const CreatorsSocialMedia = lazy(() => import("./pages/blog/CreatorsSocialMedia"));
const AIImageModels = lazy(() => import("./pages/blog/AIImageModels"));
const CommercialAIContent = lazy(() => import("./pages/blog/CommercialAIContent"));
const TikTokCallback = lazy(() => import("./pages/TikTokCallback"));
const TikTokConnect = lazy(() => import("./pages/TikTokConnect"));
const AIInfluencerInfo = lazy(() => import("./pages/AIInfluencerInfo"));
const UGCMarketing = lazy(() => import("./pages/UGCMarketing"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-background" aria-label="Loading page" />
);

const page = (element: ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={page(<Index />)} />
            <Route path="/free-video" element={page(<FreeVideo />)} />
            <Route path="/video-model" element={page(<VideoModel />)} />
            <Route path="/image-model" element={page(<ImageModel />)} />
            <Route path="/ai-influencer" element={page(<AIInfluencerInfo />)} />
            <Route path="/ugc-marketing" element={page(<UGCMarketing />)} />
            <Route path="/motion-control" element={page(<MotionControl />)} />
            
            <Route path="/auth" element={page(<Auth />)} />
            <Route path="/dashboard" element={page(<ChatDashboard />)} />
            <Route path="/dashboard/*" element={page(<ChatDashboard />)} />
            <Route path="/dashboard/tools" element={page(<Dashboard />)} />
            <Route path="/settings" element={page(<Settings />)} />
            <Route path="/pricing" element={page(<Pricing />)} />
            <Route path="/download" element={page(<DesktopDownload />)} />
            <Route path="/payment-success" element={page(<PaymentSuccess />)} />
            <Route path="/guide/video" element={page(<VideoGuide />)} />
            <Route path="/guide/image" element={page(<ImageGuide />)} />
            <Route path="/guide/motion" element={page(<MotionGuide />)} />
            <Route path="/guide/ugc" element={page(<UGCGuide />)} />
            <Route path="/about" element={page(<About />)} />
            <Route path="/careers" element={page(<Careers />)} />
            <Route path="/privacy" element={page(<Privacy />)} />
            <Route path="/terms" element={page(<Terms />)} />
            <Route path="/documentation" element={page(<Documentation />)} />
            <Route path="/api" element={page(<ApiReference />)} />
            <Route path="/tutorials" element={page(<Tutorials />)} />
            <Route path="/blog" element={page(<Blog />)} />
            <Route path="/blog/future-ai-video" element={page(<FutureAIVideoGeneration />)} />
            <Route path="/blog/ai-video-prompts" element={page(<AIVideoPromptTips />)} />
            <Route path="/blog/motion-control-animation" element={page(<MotionControlAnimation />)} />
            <Route path="/blog/creators-social-media" element={page(<CreatorsSocialMedia />)} />
            <Route path="/blog/ai-image-models" element={page(<AIImageModels />)} />
            <Route path="/blog/commercial-ai-content" element={page(<CommercialAIContent />)} />
            <Route path="/tiktok/connect" element={page(<TikTokConnect />)} />
            <Route path="/tiktok/callback" element={page(<TikTokCallback />)} />
            <Route path="/tiktok/callback/" element={page(<TikTokCallback />)} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={page(<NotFound />)} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
