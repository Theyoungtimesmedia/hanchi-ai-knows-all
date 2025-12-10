import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Prompts from "./pages/Prompts";
import Tools from "./pages/Tools";
import Help from "./pages/Help";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Discover from "./pages/Discover";

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/chat" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/prompts" element={<Prompts />} />
    <Route path="/tools" element={<Tools />} />
    <Route path="/help" element={<Help />} />
    <Route path="/about" element={<About />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/discover" element={<Discover />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
