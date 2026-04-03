import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Prompts = lazy(() => import("./pages/Prompts"));
const Help = lazy(() => import("./pages/Help"));
const Discover = lazy(() => import("./pages/Discover"));
const CustomGPT = lazy(() => import("./pages/CustomGPT"));
const Projects = lazy(() => import("./pages/Projects"));
const Apps = lazy(() => import("./pages/Apps"));
const StickerStudio = lazy(() => import("./pages/StickerStudio"));
const SharedChat = lazy(() => import("./pages/SharedChat"));
const Collections = lazy(() => import("./pages/Collections"));
const Admin = lazy(() => import("./pages/Admin"));

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Index />} />
      <Route path="/index" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/prompts" element={<Prompts />} />
      <Route path="/help" element={<Help />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/custom-gpt" element={<CustomGPT />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/apps" element={<Apps />} />
      <Route path="/sticker-studio" element={<StickerStudio />} />
      <Route path="/shared" element={<SharedChat />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default App;
