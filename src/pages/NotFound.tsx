import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, MessageSquare, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const suggestedLinks = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 with nose emoji */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring",
            stiffness: 200 
          }}
          className="mb-6"
        >
          <span className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            4👃🏿4
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          Oops! This page wahala no small 😅
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          The page <code className="px-1.5 py-0.5 rounded bg-muted text-sm">{location.pathname}</code> doesn't exist.
          <br />
          Even Hanchi's nose can't find it!
        </motion.p>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {suggestedLinks.map((link, index) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link to={link.path}>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 hover:bg-primary/10 hover:border-primary"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/chat">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Chatting with Hanchi
            </Button>
          </Link>
        </motion.div>

        {/* Fun Nigerian touch */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          "Na so e be sometimes. No wahala, we go find am!" 🇳🇬
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
