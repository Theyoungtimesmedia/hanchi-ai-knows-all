import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NosyTypoDetectorProps {
  inputText: string;
  onCorrection?: (corrected: string) => void;
  onTypoDetected?: () => void;
  onTypoCleared?: () => void;
}

const TYPO_DICTIONARY: Record<string, string> = {
  "teh": "the",
  "hte": "the",
  "thier": "their",
  "recieve": "receive",
  "definately": "definitely",
  "occured": "occurred",
  "seperate": "separate",
  "occurence": "occurrence",
  "necesary": "necessary",
  "accomodate": "accommodate",
  "acheive": "achieve",
  "apparantly": "apparently",
  "calender": "calendar",
  "collegue": "colleague",
  "comming": "coming",
  "diffrent": "different",
  "enviroment": "environment",
  "explaination": "explanation",
  "goverment": "government",
  "happend": "happened",
  "immediatly": "immediately",
  "independant": "independent",
  "knowlege": "knowledge",
  "libary": "library",
  "mispell": "misspell",
  "neccessary": "necessary",
  "occassion": "occasion",
  "poeple": "people",
  "prefered": "preferred",
  "questionaire": "questionnaire",
  "recomend": "recommend",
  "refered": "referred",
  "religous": "religious",
  "remeber": "remember",
  "restaraunt": "restaurant",
  "rythm": "rhythm",
  "succesful": "successful",
  "suprise": "surprise",
  "tommorow": "tomorrow",
  "untill": "until",
  "wierd": "weird",
  "writting": "writing",
  // Nigerian-common
  "managment": "management",
  "enterpreneur": "entrepreneur",
  "bussiness": "business",
  "proffessional": "professional",
  "addres": "address",
  "wich": "which",
  "becuase": "because",
  "beacause": "because",
  "abt": "about",
  "pls": "please",
  "shld": "should",
  "wld": "would",
  "cld": "could",
};

interface TypoMatch {
  original: string;
  correction: string;
  position: number;
}

export const NosyTypoDetector = ({
  inputText,
  onCorrection,
  onTypoDetected,
  onTypoCleared,
}: NosyTypoDetectorProps) => {
  const [currentTypo, setCurrentTypo] = useState<TypoMatch | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDetected = useRef<string>("");

  useEffect(() => {
    if (!inputText.trim()) {
      setCurrentTypo(null);
      setDismissed(false);
      onTypoCleared?.();
      return;
    }

    const words = inputText.split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase();

    // Only check complete words (check second-to-last if user is still typing)
    const wordToCheck = words.length > 1 ? words[words.length - 2]?.toLowerCase() : null;

    if (wordToCheck && TYPO_DICTIONARY[wordToCheck] && wordToCheck !== lastDetected.current) {
      lastDetected.current = wordToCheck;
      setDismissed(false);
      setCurrentTypo({
        original: wordToCheck,
        correction: TYPO_DICTIONARY[wordToCheck],
        position: words.length - 2,
      });
      onTypoDetected?.();

      // Auto-dismiss after 6s
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => {
        setCurrentTypo(null);
        onTypoCleared?.();
      }, 6000);
    }

    // Double space check
    if (inputText.includes("  ") && !dismissed) {
      // Don't override word typos with double space
      if (!currentTypo) {
        // handled silently
      }
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [inputText]);

  const handleApply = () => {
    if (!currentTypo || !onCorrection) return;
    const words = inputText.split(/\s+/);
    words[currentTypo.position] = currentTypo.correction;
    onCorrection(words.join(" "));
    setCurrentTypo(null);
    onTypoCleared?.();
  };

  const handleDismiss = () => {
    setCurrentTypo(null);
    setDismissed(true);
    onTypoCleared?.();
  };

  return (
    <AnimatePresence>
      {currentTypo && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.85 }}
          transition={{ type: "spring", damping: 18 }}
          className="absolute bottom-full right-0 mb-2 z-20"
        >
          <div className="bg-card border border-border/60 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm max-w-[220px]">
            <p className="text-[11px] text-foreground mb-1.5">
              Did you mean <span className="font-bold text-primary">"{currentTypo.correction}"</span>? 👀
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={handleApply}
                className="text-[10px] px-2 py-0.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Fix it
              </button>
              <button
                onClick={handleDismiss}
                className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Nah
              </button>
            </div>
          </div>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-card border-r border-b border-border/60 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
