import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Prompts from "./pages/Prompts";
import NotFound from "./pages/NotFound";

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/chat" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/prompts" element={<Prompts />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
