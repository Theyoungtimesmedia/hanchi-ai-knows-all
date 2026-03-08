import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Prompts from "./pages/Prompts";
import Help from "./pages/Help";
import Discover from "./pages/Discover";
import CustomGPT from "./pages/CustomGPT";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Apps from "./pages/Apps";
import StickerStudio from "./pages/StickerStudio";
import SharedChat from "./pages/SharedChat";
import Collections from "./pages/Collections";

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/chat" element={<Index />} />
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
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
