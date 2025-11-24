import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Trophy, Target } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
}

interface PracticeModeProps {
  examType: "WAEC" | "JAMB" | "NECO";
  subject?: string;
  userId: string;
}

export function PracticeMode({ examType, subject, userId }: PracticeModeProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, [examType, subject]);

  const loadQuestions = async () => {
    try {
      let query = supabase
        .from("study_materials")
        .select("*")
        .eq("exam_type", examType)
        .limit(10);

      if (subject) {
        query = query.eq("subject", subject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuestions((data || []).map(q => ({
        ...q,
        options: q.options as Record<string, string>
      })));
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);

    const isCorrect = answer === questions[currentIndex].correct_answer;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);

    // Update user progress
    try {
      const question = questions[currentIndex];
      await supabase.rpc("upsert_user_progress", {
        p_user_id: userId,
        p_exam_type: examType,
        p_subject: question.subject,
        p_topic: question.topic,
        p_is_correct: isCorrect,
      });

      // Award XP
      const xpGained = isCorrect ? 10 : 5;
      await supabase.rpc("award_xp", {
        p_user_id: userId,
        p_xp_amount: xpGained,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      toast({
        title: "Practice Complete!",
        description: `You scored ${score.correct + (selectedAnswer === questions[currentIndex].correct_answer ? 1 : 0)}/${questions.length}`,
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No questions available for this selection.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{examType}</Badge>
          <Badge variant="outline">{currentQuestion.subject}</Badge>
          <Badge variant="outline" className="capitalize">{currentQuestion.difficulty}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{currentIndex + 1}/{questions.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>{score.correct}/{score.total}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <Button
              key={key}
              variant={
                selectedAnswer === key
                  ? key === currentQuestion.correct_answer
                    ? "default"
                    : "destructive"
                  : showExplanation && key === currentQuestion.correct_answer
                  ? "default"
                  : "outline"
              }
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => !showExplanation && handleAnswer(key)}
              disabled={showExplanation}
            >
              <span className="font-semibold mr-2">{key}.</span>
              {value}
            </Button>
          ))}

          {showExplanation && (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              <p className="font-semibold mb-2">Explanation:</p>
              <p className="text-sm">{currentQuestion.explanation}</p>
              <Button onClick={handleNext} className="mt-4 w-full">
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Practice"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
