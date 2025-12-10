import { motion } from "framer-motion";
import { 
  Sparkles, 
  Mail, 
  MessageSquare, 
  BookOpen, 
  Calculator, 
  Languages, 
  Search, 
  Lightbulb,
  FileText,
  Code,
  Image,
  Music,
  Briefcase,
  GraduationCap
} from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: "Surprise Me",
    prompt: "Tell me something interesting about Nigeria that most people don't know",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Write Email",
    prompt: "Help me write a professional email for ",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: "WhatsApp Draft",
    prompt: "Help me draft a WhatsApp message to ",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "Study Help",
    prompt: "Explain this topic for my WAEC/JAMB exam: ",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Calculator className="w-5 h-5" />,
    label: "Solve Math",
    prompt: "Solve this math problem step by step: ",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: <Languages className="w-5 h-5" />,
    label: "Translate",
    prompt: "Translate this to Hausa/Pidgin: ",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: <Code className="w-5 h-5" />,
    label: "Write Code",
    prompt: "Write code for ",
    color: "from-slate-500 to-gray-600"
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Write Essay",
    prompt: "Write an essay about ",
    color: "from-teal-500 to-green-500"
  },
  {
    icon: <Image className="w-5 h-5" />,
    label: "Create Image",
    prompt: "Generate an image of ",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    label: "CV/Resume",
    prompt: "Help me create a CV for a ",
    color: "from-amber-500 to-yellow-500"
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Assignment",
    prompt: "Help me with this assignment: ",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    label: "Brainstorm",
    prompt: "Give me creative ideas for ",
    color: "from-orange-500 to-amber-500"
  }
];

interface EnhancedQuickActionsProps {
  onActionClick: (prompt: string) => void;
}

export const EnhancedQuickActions = ({ onActionClick }: EnhancedQuickActionsProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          What can I help with? 👃🏿
        </h2>
        <p className="text-muted-foreground">
          Click any action below or type your own question
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onActionClick(action.prompt)}
            className="group relative overflow-hidden rounded-xl p-4 bg-card border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-center">{action.label}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Sample prompts section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Explain photosynthesis simply",
            "Write a birthday message in Pidgin",
            "Debug my Python code",
            "JAMB past questions on Physics"
          ].map((sample, i) => (
            <motion.button
              key={sample}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onActionClick(sample)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 border border-border transition-colors"
            >
              "{sample}"
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
