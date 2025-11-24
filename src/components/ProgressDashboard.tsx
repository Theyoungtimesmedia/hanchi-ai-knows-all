import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Zap, Target, Award, TrendingUp } from "lucide-react";

interface Stats {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
  achievements: string[];
}

interface ProgressDashboardProps {
  userId: string;
}

export function ProgressDashboard({ userId }: ProgressDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (!data) {
        // Create initial stats
        const { data: newStats, error: createError } = await supabase
          .from("user_stats")
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        setStats({
          ...newStats,
          badges: newStats.badges as string[],
          achievements: newStats.achievements as string[]
        });
      } else {
        setStats({
          ...data,
          badges: data.badges as string[],
          achievements: data.achievements as string[]
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="text-center p-8">Loading stats...</div>;
  }

  const xpForNextLevel = stats.level * 100;
  const xpProgress = (stats.total_xp % 100) / xpForNextLevel * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" />
            Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.level}</div>
          <Progress value={xpProgress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.total_xp % 100} / {xpForNextLevel} XP
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.current_streak}</div>
          <p className="text-xs text-muted-foreground mt-2">
            days in a row
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Total XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total_xp}</div>
          <p className="text-xs text-muted-foreground mt-2">
            experience points
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="w-4 h-4 text-gold" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.achievements.length}</div>
          <p className="text-xs text-muted-foreground mt-2">
            unlocked badges
          </p>
        </CardContent>
      </Card>

      {stats.badges.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.badges.slice(0, 10).map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  🏆 {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
