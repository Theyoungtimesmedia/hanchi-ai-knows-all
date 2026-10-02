import type { BrainSeedRecord } from "./types";

export const ME_PROFILE = {
  name: "Joshua",
  location: "Nigeria",
  communication: "Direct, practical Nigerian Standard English. Honest pushback is preferred over hype.",
  currentFocus: ["JAMB 2027", "Figure", "Paid client delivery"],
  education: {
    exam: "JAMB 2027",
    target: "Around 220+",
    subjects: "Use of English, Mathematics, Physics and Chemistry",
    university: "University of Abuja (UNIABUJA)",
    course: "Computer Science",
  },
  business: {
    name: "Figure",
    direction: "Website development first, then selective SEO, systems, automation and AI solutions.",
  },
  schedule: [
    "J&E: Monday, Tuesday and Friday, 4:00–6:00pm.",
    "J&E: Saturday, 8:00–11:00am.",
    "Prep and travel buffers begin roughly 90 minutes before lessons.",
    "Preferred sleep target is around 9:00–9:30pm, with a 5:00am wake target when realistic.",
  ],
  operatingRules: [
    "Keep plans flexible because family errands can interrupt the day.",
    "Protect free time and leave a substantial unassigned buffer.",
    "Missed work needs a recovery plan, not guilt or a ruined-week mindset.",
    "JAMB, Figure and client delivery outrank optional shiny tools.",
  ],
} as const;

export const BRAIN_SEED_RECORDS: BrainSeedRecord[] = [
  {
    title: "Core identity and communication",
    content: `${ME_PROFILE.name} is a curious Nigerian builder and creator who works with websites, web apps, design and AI-assisted development. Respond in ${ME_PROFILE.communication}`,
    domain: "Personal", record_type: "fact", status: "current", confidence_score: 0.98,
    source_name: "JoshuaClaudeHandoff2026-09-30.md", source_type: "personal_handoff",
    provenance: "Direct profile and communication rules in the supplied handoff.",
  },
  {
    title: "JAMB 2027 education priority",
    content: `Current education priority: ${ME_PROFILE.education.exam}; target ${ME_PROFILE.education.target}; subjects: ${ME_PROFILE.education.subjects}; intended direction: ${ME_PROFILE.education.university}, ${ME_PROFILE.education.course}. Rebuild foundations realistically rather than assuming old SS1/SS2 material is mastered. Chemical Combinations is an early Chemistry gap to address.`,
    domain: "Education", project: "JAMB 2027", record_type: "fact", status: "current", confidence_score: 0.98,
    source_name: "JoshuaClaudeHandoff2026-09-30.md", source_type: "personal_handoff",
    provenance: "Current strategic focus and study notes in the supplied handoff.",
  },
  {
    title: "Figure business direction",
    content: `${ME_PROFILE.business.name} is the current business-building direction. Start with website development and only present SEO, systems, automation or AI solutions as services when they are genuinely ready to sell. Prioritise proof, case studies, a coherent portfolio, CV, GitHub and a repeatable client workflow.`,
    domain: "Business", project: "Figure", record_type: "fact", status: "current", confidence_score: 0.97,
    source_name: "JoshuaClaudeHandoff2026-09-30.md", source_type: "personal_handoff",
    provenance: "Current business direction in the supplied handoff.",
  },
  {
    title: "J&E fixed schedule", content: ME_PROFILE.schedule.join(" "), domain: "Daily", record_type: "fact", status: "current", confidence_score: 0.96,
    source_name: "JoshuaClaudeHandoff2026-09-30.md", source_type: "personal_handoff",
    provenance: "Newer direct schedule update overrides older Notion entries.",
  },
  {
    title: "Planning and accountability rules", content: ME_PROFILE.operatingRules.join(" "), domain: "Daily", record_type: "decision", status: "current", confidence_score: 0.96,
    source_name: "JoshuaClaudeHandoff2026-09-30.md", source_type: "personal_handoff",
    provenance: "Operating priorities and flexible-planning rules in the supplied handoff.",
  },
];