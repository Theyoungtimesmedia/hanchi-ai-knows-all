import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PracticeMode } from "@/components/PracticeMode";
import { TaskManager } from "@/components/TaskManager";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { ArrowLeft, BookOpen, CheckSquare, Trophy } from "lucide-react";

export default function Study() {
  const [user, setUser] = useState<User | null>(null);
  const [examType, setExamType] = useState<"WAEC" | "JAMB" | "NECO">("JAMB");
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Study Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice for WAEC, JAMB, and NECO exams
          </p>
        </div>

        <Tabs defaultValue="practice" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Exam & Subject</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Select value={examType} onValueChange={(value: any) => setExamType(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JAMB">JAMB</SelectItem>
                    <SelectItem value="WAEC">WAEC</SelectItem>
                    <SelectItem value="NECO">NECO</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <PracticeMode
              examType={examType}
              subject={subject === "all" ? undefined : subject}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager userId={user.id} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressDashboard userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
