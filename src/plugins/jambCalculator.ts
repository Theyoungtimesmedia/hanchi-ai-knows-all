import { Plugin } from "@/utils/pluginSystem";

export const jambCalculatorPlugin: Plugin = {
  id: 'jamb-calculator',
  name: 'JAMB Score Predictor',
  description: 'Calculate aggregate score and predict admission chances',
  icon: '🎓',
  category: 'education',
  enabled: true,
  execute: async (params: { 
    jambScore: number; 
    postUtmeScore?: number; 
    oLevelGrade: 'A' | 'B' | 'C' | 'D' | 'E';
    institution: string;
  }) => {
    const { jambScore, postUtmeScore = 0, oLevelGrade, institution } = params;

    // Mock calculation - in production, use real admission data
    const oLevelScores: Record<string, number> = {
      'A': 10, 'B': 8, 'C': 6, 'D': 4, 'E': 2
    };

    const oLevelPoints = oLevelScores[oLevelGrade] || 0;
    const aggregateScore = (jambScore * 0.5) + (postUtmeScore * 0.3) + (oLevelPoints * 2);

    let admissionChance = 'Low';
    if (aggregateScore >= 70) admissionChance = 'Very High';
    else if (aggregateScore >= 60) admissionChance = 'High';
    else if (aggregateScore >= 50) admissionChance = 'Moderate';

    return {
      success: true,
      data: {
        jambScore,
        postUtmeScore,
        oLevelPoints,
        aggregateScore: aggregateScore.toFixed(2),
        admissionChance,
        institution,
      },
      message: `Your aggregate score is ${aggregateScore.toFixed(2)}. Admission chance: ${admissionChance}`,
    };
  },
};
