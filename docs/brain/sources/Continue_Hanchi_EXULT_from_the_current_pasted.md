Continue Hanchi/EXULT from the current repository state. Do not recreate the app.

The previous agent completed:
- Supabase client migration
- OpenAI/Replicate provider migration
- Nigerian skill selection and knowledge retrieval
- Admin stats and moderation wiring
- JWT token usage in useChat
- JWT verification configuration for AI functions
- Anthropic multimodal conversion and stream normalization
- Latest-message-only image attachment
- Removal of lovable-tagger from vite.config.ts

Do not assume these changes are deployed or working until verified.

Next tasks, in order:

1. Run the project build and lint. Fix only errors caused by the current migration work.
2. Inspect every Supabase Edge Function caller and confirm authenticated calls send the current Supabase access token.
3. Test the chat Edge Function with a real authenticated session. Send one real prompt and confirm:
   - The response streams correctly.
   - A conversation row exists.
   - User and assistant message rows exist.
   - RLS remains enabled.
4. Test `/admin` using the existing admin account:
   themyoungtimes2024@gmail.com
   Verify stats, announcements, blocked users, flagged users, and admin visibility of conversations/messages/documents.
5. Test image generation end to end. If the OpenAI fallback model is invalid, replace it with a currently supported external image model/provider without reintroducing Lovable AI.
6. Test process-media, transcription, translation, and TTS functions with their existing frontend callers.
7. Add a safe profile auto-creation trigger for new auth users using a Supabase migration. Follow the project’s schema conventions and include required grants.
8. Design and implement durable Supabase Storage uploads only after checking the current document/message contracts. Do not remove base64 support until URL persistence is verified.
9. Review ai-router.ts for provider-specific failures:
   - Anthropic image format
   - Anthropic streaming format
   - JSON response handling
   - Google compatibility
   - missing-provider fallback behavior
10. Update docs/HANCI_MIGRATION_STATUS.md and append to docs/CHANGELOG_AGENTIC.md with only verified facts.
11. Stop and report:
   - exact files changed
   - exact tests run
   - exact live flows verified
   - remaining blockers
   - whether the project is safe to deploy

Never reintroduce Lovable AI, Lovable Cloud, preview-auth storage, hardcoded credentials, disabled RLS, or fake AI responses. Do not claim completion without live authenticated verification.
what else do we need to finish i already ran # PERSONAL AI CONTEXT EXPORT — HIGH-SIGNAL MEMORY + HISTORICAL CONTEXT

You are extracting my information from exported conversation history for use in a personal AI system called HANCI.

The objective is NOT to create a giant summary.

The objective is to create a structured knowledge base with TWO fundamentally different levels:

1. HIGH-SIGNAL CONTEXT
   Information HANCI should normally use when reasoning about me.

2. CONTEXT_ROT
   Older, non-essential, one-off, historical, or highly specific information that may still be useful in rare cases, but should NOT normally be retrieved.

The distinction between these two layers is critical.

---

CORE PRINCIPLE

More information is NOT automatically better.

HANCI must normally operate from the smallest relevant amount of high-quality context.

Do not dump the entire historical archive into normal context.

However, do NOT erase useful historical details simply because they are not important enough for normal context.

Instead:

HIGH-SIGNAL information → normal retrieval

LOW-SIGNAL / HISTORICAL information → CONTEXT_ROT archive

HANCI may search CONTEXT_ROT only when:

- the normal knowledge base cannot answer something
- a historical detail is explicitly requested
- a date/time reconstruction is needed
- the user asks about something that happened previously
- a project history appears incomplete
- there is a contradiction that may be resolved by examining older records
- a person/project/company cannot be confidently identified from current context
- the system needs source evidence for an older claim

CONTEXT_ROT must NEVER automatically override current high-signal information.

Current confirmed information always has higher priority unless explicitly marked otherwise.

---

1. DO NOT INVENT

Never invent:

- facts
- dates
- timestamps
- people
- names
- relationships
- locations
- projects
- decisions
- events
- preferences
- goals
- achievements
- skills
- motivations
- opinions

If uncertain:

UNCERTAIN

If inferred:

INFERENCE

If explicitly stated:

FACT

If the source is ambiguous:

AMBIGUOUS

Never silently convert inference into fact.

---

2. DATES AND TIMES ARE IMPORTANT

This export must preserve historical chronology.

Whenever a source contains a date or timestamp, preserve it.

Use:

YYYY-MM-DD

or:

YYYY-MM-DD HH:MM

If timezone is explicitly known, preserve it.

If only a relative time is given:

"yesterday"
"last week"
"a few months ago"

DO NOT invent the exact date.

Instead store:

RELATIVE_DATE:
"yesterday"

SOURCE_DATE:
[date of the surrounding message if available]

If both an absolute date and a time exist, preserve both.

Examples:

2026-08-10 15:58

2026-08-16 07:04

Do NOT remove timestamps merely because the event is not important enough for normal memory.

Historical events may belong in CONTEXT_ROT while retaining their original date/time.

---

3. HISTORICAL EVENTS MUST REMAIN SEARCHABLE

If something happened on a specific date, preserve it as a historical event even if it is not durable memory.

Example:

2026-08-16 12:21
Joshua sent a campaign script to VicNovos.

This may be:

CONTEXT_ROT

but it must still exist.

The purpose is that HANCI can later answer:

"What happened on August 16?"

or:

"When did VicNovos send that script?"

without needing the entire raw transcript.

---

4. DO NOT OVER-MIGRATE INTO HIGH-SIGNAL MEMORY

Information should enter HIGH-SIGNAL CONTEXT only if it is likely to improve future assistance.

Examples:

- durable identity
- communication preferences
- stable goals
- important people
- important projects
- important business relationships
- standing decisions
- recurring workflows
- recurring habits
- reusable lessons
- persistent technical preferences
- current project architecture

Examples that should usually go into CONTEXT_ROT instead:

- one-off meals
- individual daily events
- temporary frustrations
- old project states
- individual WhatsApp messages
- temporary plans
- one-time research
- old prices
- old schedules
- short-lived blockers
- random conversation
- obsolete ideas
- temporary emotional states
- individual timestamps that matter only historically

Do NOT delete those details if they can still be useful.

Move them to CONTEXT_ROT.

---

5. CURRENT INFORMATION HAS PRIORITY

When the same fact appears multiple times:

Determine the newest reliable state.

Use:

CURRENT
SUPERSEDED
OUTDATED
CONTRADICTORY
NEEDS VERIFICATION

Do NOT erase the historical version.

Instead preserve:

CURRENT RECORD

and

HISTORICAL RECORD

Example:

CURRENT:
Business name = Figure

HISTORICAL:
2026-07:
Business operated as Compound Dev

STATUS:
SUPERSEDED

This allows HANCI to understand both current identity and history.

---

6. SOURCE TRACKING

Every important extracted item should preserve its source.

Possible source types:

- ChatGPT
- Claude
- WhatsApp
- User statement
- Uploaded file
- Web research
- Project document
- Other AI

For important records include:

SOURCE:
SOURCE_TYPE:
SOURCE_DATE:
EVENT_DATE:
ORIGINAL_REFERENCE:

When possible preserve the original conversation/file name.

Do not invent source references.

---

7. PEOPLE

For important people:

Person: [Name / identifier]

- Who they are
- Relationship to me
- Relevant history
- Important conversations
- Current relationship/status
- Projects connected to them
- Commitments
- Preferences
- Facts
- Inferences
- Uncertain information
- Historical events

Do not automatically put every person into permanent memory.

People who appear only once may remain in CONTEXT_ROT.

---

8. PROJECTS

For every meaningful project:

Project: [Name]

- Purpose
- What I am building / doing
- Origin
- Current state
- Historical states
- People involved
- Company involved
- Decisions
- Requirements
- Technical details
- Business details
- Completed work
- Failed work
- Abandoned work
- Current blockers
- Current next steps
- Relevant dates
- Important conversations
- Current status
- Facts
- Inferences
- Contradictions
- Outdated information

Preserve meaningful historical project events even when they are old.

---

9. COMPANIES / ORGANISATIONS

For each meaningful company, school, organisation, community or business:

[Name]

- Type
- Relationship to me
- People connected
- Projects connected
- Important facts
- Historical context
- Current status
- Important dates
- Outdated information

---

10. DECISIONS

Record meaningful decisions separately.

Decision: [Title]

- Decision date
- Decision
- Context
- Alternatives considered
- Reasoning
- Evidence
- Current status
- Superseded by
- Historical status
- Source

IMPORTANT:

A decision is not automatically current.

Track its lifecycle.

Use:

CURRENT
SUPERSEDED
REVERSED
ABANDONED
UNCERTAIN

Do not delete previous decisions.

---

11. EVENTS / TIMELINE

Create a chronological historical index.

This is essential.

For meaningful dated events:

Event: [short title]

- Date:
- Time:
- Person:
- Project:
- Company:
- What happened:
- Why it mattered:
- Outcome:
- Source:
- Signal level:

Signal levels:

HIGH
MEDIUM
LOW

HIGH:
likely useful for future reasoning

MEDIUM:
useful in project/history context

LOW:
historical detail; usually CONTEXT_ROT

Example:

Event: VicNovos campaign update

- Date: 2026-08-27
- Time: 19:05
- Person: VicNovos
- Project: VicNovos funnel
- What happened: Client supplied updated consultation number.
- Why it mattered: Funnel contact information changed.
- Outcome: Number should be updated.
- Source: WhatsApp export
- Signal level: HIGH

---

12. DAILY LIFE

Do not turn every day into permanent memory.

Instead create two layers.

High-Signal Daily Patterns

Only recurring patterns or useful long-term information.

Historical Daily Events

Individual dated events go into CONTEXT_ROT unless they reveal a durable pattern.

Preserve date/time when available.

Example:

CONTEXT_ROT EVENT

2026-08-26 19:57
Joshua reported low solar battery, bought data, and planned to attend lesson the next day.

This should NOT become permanent personality knowledge simply because it happened.

But it remains searchable historical context.

---

13. KNOWLEDGE

Extract reusable knowledge and lessons.

For each:

Knowledge: [Topic]

- Lesson
- Source
- Date discovered
- Why it matters
- How it can be reused
- Whether this is still current

Separate:

FACT
LESSON
INFERENCE

---

14. IDENTITY / USER CONTEXT

Create the high-signal identity profile.

Include:

Identity

- Name
- Age only when clearly verified
- Location only when appropriate
- Education
- Career
- Current situation

Personality

Only evidence-supported traits.

Separate:

Explicitly stated

from

Behavioural inference

Communication

Include:

- language
- tone
- message style
- preferred response style
- what frustrates me
- what makes responses useful
- formatting preferences
- how much detail I prefer

Interests

Recurring interests only.

Goals

Current
Medium-term
Long-term

Values

Only supported values.

Recurring patterns

Only patterns that appear repeatedly.

Strengths

Evidence-supported only.

Difficulties

Only useful and appropriate recurring patterns.

---

15. CONTEXT_ROT

This is a REQUIRED section.

CONTEXT_ROT is NOT deleted information.

It is an intentionally lower-priority historical archive.

It contains:

- non-essential personal information
- old daily events
- one-off conversations
- temporary plans
- historical project states
- old relationship context
- old client communications
- obsolete decisions
- outdated research
- one-time preferences
- historical timestamps
- low-signal personal details
- other information that could occasionally be useful

Every CONTEXT_ROT item should preserve:

- Date
- Time if available
- Topic
- Person
- Project if relevant
- What happened
- Source
- Why it is low priority
- Search keywords / entities

IMPORTANT:

CONTEXT_ROT must NOT normally be injected into prompts.

It is a retrieval fallback.

Think:

Normal memory = RAM

CONTEXT_ROT = archive

The archive exists so information is not lost, but it is not constantly occupying the working context.

---

16. CONTEXT_ROT RETRIEVAL RULES

HANCI may search CONTEXT_ROT when:

1. Normal memory returns no answer.
2. The user explicitly asks for historical information.
3. The user asks about a specific date/time.
4. A project timeline is incomplete.
5. A person or event cannot be confidently identified.
6. Current information conflicts with historical information.
7. The user says something like:
   "I know I told you this before."
8. The system needs to verify an old decision.
9. The system needs to reconstruct how a decision evolved.

When retrieved:

LABEL IT:

[Historical Context]

Do not silently treat it as current.

---

17. CONTRADICTIONS

Create:

CONTRADICTIONS / NEEDS VERIFICATION

Use:

| Topic | Earlier record | Later record | Date(s) | Status | What needs verification |
|---|---|---|---|---|---|

Never resolve a contradiction simply by choosing whichever statement appeared last.

Consider:

- reliability of source
- explicit correction
- date
- whether the later statement superseded the earlier one

---

18. PROJECT-SPECIFIC VS GLOBAL CONTEXT

Do not turn project details into global memory.

Example:

VicNovos WhatsApp number

→ VicNovos project

not:

→ Joshua identity

Example:

Mr Joseph school requirements

→ School Management System project

not:

→ Global memory

Global knowledge should only contain the underlying durable fact if it genuinely matters.

---

19. RAW EXPORT PRESERVATION

If the original source contains information that cannot safely be structured without losing important context:

record the source reference and preserve the raw source separately.

Do NOT rewrite uncertain information into false certainty.

The structured knowledge base is a derived index, not a replacement for the original archive.

---

20. SENSITIVE INFORMATION

Do not migrate sensitive information unnecessarily.

Exclude or place outside normal retrieval:

- passwords
- API keys
- authentication credentials
- financial account credentials
- private security information
- sensitive medical information
- highly sensitive personal information
- private information about other people
- information that would create unnecessary risk if surfaced automatically

If historical sensitivity matters but the detail does not need to be preserved:

mark it:

[REDACTED — SENSITIVE]

Do not invent a replacement.

---

21. SECOND-PASS QUALITY CHECK

After the first extraction, perform a second pass.

Check:

1. duplicates
2. timestamps
3. dates
4. source attribution
5. project ownership
6. people identity
7. contradictions
8. superseded decisions
9. outdated information
10. accidental assumptions
11. information that should be CONTEXT_ROT rather than high-signal
12. information that should NOT be migrated
13. important historical events that have dates but were accidentally removed
14. important decisions that were flattened without preserving their history

---

22. FINAL STRUCTURE

Output in this order:

A. HIGH-SIGNAL KNOWLEDGE

PEOPLE
PROJECTS
COMPANIES / ORGANISATIONS
DECISIONS
IMPORTANT CONVERSATIONS
KNOWLEDGE
IDENTITY / USER CONTEXT
CURRENT STATUS

B. HISTORICAL TIMELINE

Chronological list of meaningful dated events.

Preserve exact times whenever available.

C. CONTEXT_ROT

Lower-priority searchable historical context.

Preserve dates and times.

D. CONTRADICTIONS / NEEDS VERIFICATION

Full table.

E. DO NOT MIGRATE

Information that should be excluded entirely.

F. DATA QUALITY

For each category:

HIGH / MEDIUM / LOW

Explain why.

G. MISSING INFORMATION

Questions another AI would need to ask me.

---

FINAL RULE

The objective is:

HIGH SIGNAL WITHOUT INFORMATION LOSS.

Do NOT solve context rot by deleting history.

Do NOT solve context rot by dumping history into every prompt.

Instead:

CURRENT HIGH-SIGNAL CONTEXT
→ used normally

PROJECT CONTEXT
→ used when working on that project

CONTEXT_ROT
→ searched only when necessary

RAW SOURCE
→ preserved for traceability

This system must preserve historical dates and times even for low-priority information.

A future AI should be able to answer both:

"What matters about Joshua?"

and:

"What exactly happened on August 16 at 12:21 PM?"

without treating those two questions as requiring the same amount of context.

Accuracy > completeness.

Signal > volume.

Current truth > obsolete truth.

But obsolete information should remain retrievable when history matters. is there still a need to run this new prompt i have already ran that one it has started but it hit its limit before it could continue what if instead of using obsidian we vibe code it i have this AI hanci AI its an existing lovable project i have already uploaded the chat export from claude and u i was thinking i tell it to import that and create a brain it should have connectors plugin skills unlimted chat uploaded and docuement preview basically u and the preminum version of u but free it should have all those things with diffrent AI models they all decide and debate before one makes a decision and the UI/UX should be a copy paste version of urs but with a bit of claudes there too it should have all ur plugins all ur features plus all of claudes i know its a big project but its better than setting up obsidian and also based on what u know about me i am on a level 2 on the AI scale i barely use agents skills or connectors or automation or terrimals or stuff like chat gpt codex open claw claude code and a bunch of other stuff i also want to break off from lovbale too so we will start with this and later in  a few months we will build a lovable version this should save us time never expreince context rot answer as best as u can and is private so it will have all the context about me inbuilt we will use free APi keys and a bunch of other stuff the stuff above the stuff in the text files is inofrmation of what i want ignore stuff like write export prompts or am doing a saturday induction no focus on the features describe of what i said i want what i talked about and list them also check the code for where we are now and lets make hanchi AI  that both frontend and backend wise check for what u have implemented for what u havenot First: what your life plan actually says

Your real system is not “do everything every day.”

It is:

1. JAMB 2027 — main priority

Your current direction is:

 English

 Mathematics

 Physics

 Chemistry

 roughly 220+ target

 Computer Science at UNIABUJA

And you specifically need to rebuild old knowledge rather than pretending you remember everything.

Immediate JAMB work: Chemical Combinations, reorganising J&E notes, actual topic study, practice questions, and eventually timed tests.

2. Figure — second strategic priority

Figure is the business you're trying to turn into a real thing.

Its work includes:

 website

 portfolio

 CV

 GitHub

 brand kit

 shirt concept/brand visual

 social media

 case studies/proof

 client acquisition

And since your Figure chat hit a snag and today's Lovable credits are gone, today is not a wasted Figure day. You can do Figure work that costs zero Lovable credits: copy, brand kit, GitHub, portfolio text, case-study structure, content ideas, asset organisation, planning the next build.

3. Paid project work

Pope Technologies/Emmanuel is a live client relationship. The contract is now signed and you told me he sent ₦2,000 for data.

Image Makers' school-management system is another real client obligation.

Those sit above random personal projects.

4. Growth

This is where IBM, reading, events, scholarship research, vocabulary and similar things belong.

Not all every day.

5. Maintenance

Sleep, church, Bible, chores, exercise, food, actual free time.

That stuff isn't “extra.”

One correction about IBM

I looked for a connection between IBM AI Fundamentals and Dan Martell, Anointed Cleatus, Simon Squibb and Elon Musk.

I don't see evidence in the Notion material that the IBM course itself is based on those people.

Your content influences are a different thing:

Dan Martell → Anointed Cleatus → Simon Squibb → Elon Musk

That's your rough order of how much of their content you consume.

So keep those people in a weekly clarity/learning block, but don't pretend IBM is part of their curriculum.

IBM = technical learning.

Dan/Anointed/Simon/Elon = ideas, business, career, thinking.

The new calendar model

I don't want 18 separate calendars anymore.

Use five:

JAMB
Figure / Client Work
Habits / Faith / Home
Fitness
Life / Fun / Events

And there are only three types of time:

Fixed

Things that actually happen at a certain time.

Focus window

“Do this sometime during the morning/afternoon.”

Free

Deliberately unplanned.

That's the part the previous calendar got wrong.

Fixed schedule

J&E

Monday: 4–6pm
Tuesday: 4–6pm
Friday: 4–6pm
Saturday: 8–11am

Your normal preparation/travel buffer is roughly 90 minutes before the lesson, but it stays a buffer, not another mandatory appointment.

Church

Tuesday = must

Thursday = optional/backup

I won't invent the church service times when we haven't established them.

Sleep

Target:

9:00–9:30pm

Wake target:

around 5:00am

But this is a target, not a punishment system.

Your daily minimum

This is what I want you to do even when the day goes sideways.

Morning

After waking:

Prayer → Bible aloud → Open Heaven → verse → word → normal chores

Then, while doing chores, you can listen to a podcast/NotebookLM audio.

You don't need a two-hour spiritual ceremony.

Academic

One proper JAMB block

Even if the day becomes chaotic, that's the academic minimum.

Work

One proper Figure/client block

Even if Lovable is unavailable.

Personal

20–30 minutes of reading

Fun

TV is allowed.

Actually, I want TV on the calendar.

You don't need to “earn the right to exist” by working for 11 hours first.

You can finish your core work, then watch Heartstopper and enjoy it.

And yes, we can use TV as part of the habit system

You asked whether there's something you can do with wanting to watch a series.

Yes:

JAMB → reading → TV

Not:

work until exhausted → guilt about TV → watch TV anyway → sleep late.

Make TV deliberate.

For example:

7:30–8:45pm = TV / relax

Then:

8:45–9:15pm = wind down

That's much healthier than having the PC open with TV playing indefinitely.

And you can watch Heartstopper.

It doesn't make your day unproductive.

YOUR NEXT TWO WEEKS

We're looking at October 1–14, 2026.

I'm deliberately giving you one main mission per day, not six.

DateMain thingSecondaryThu Oct 1JAMB: set up the real study system + Chemical CombinationsIBM 30 minFri Oct 2JAMB: Maths foundations/practiceJ&E 4–6pm; Figure GitHub/CVSat Oct 3JAMB: English practice + J&E 8–11amIBM 30 min; sweep outsideSun Oct 4Weekly review + JAMB catch-upForeign scholarship research only; reading; TVMon Oct 5Figure: work around the Lovable snag — brand kit/portfolioJAMB; J&E 4–6pm; workoutTue Oct 6JAMB: MathsJ&E 4–6pm; churchWed Oct 7JAMB: PhysicsIBM 30 min; event search; workoutThu Oct 8Figure: portfolio + case-study/proof workJAMB; optional church; scholarship researchFri Oct 9JAMB: mixed practiceJ&E 4–6pm; Figure/client blockSat Oct 10JAMB: mini test + reviewJ&E 8–11am; IBM 30 min; workoutSun Oct 11Weekly reviewreading; room/parlour reset; TVMon Oct 12JAMB: ChemistryJ&E 4–6pm; Figure blockTue Oct 13JAMB: Maths/PhysicsJ&E 4–6pm; churchWed Oct 14JAMB: mini test + identify weak areasIBM 30 min; weekly review; workout

That's enough.

Notice what I didn't do:

I didn't schedule all 20 Lovable projects.

I didn't schedule a language.

I didn't schedule scholarship applications that you can't currently do.

I didn't schedule social media every day.

I didn't put every household action at 7:13am.

I didn't give you six hours of “productivity” before you're allowed to watch TV.

Faith + words for those two weeks

Because you're right: the system failed if you're not actually getting these.

Week 1 — October 1–7

Words

Deliberate — done intentionally.

Nuance — a small but important difference.

Tangible — something real/clear enough to observe.

Use each word in a real sentence during the week.

Week 2 — October 8–14

Words

Discernment — the ability to judge between options carefully.

Resilient — able to recover after difficulty.

Reciprocity — mutual exchange; both sides contribute.

And your Bible verse should be a daily calendar item, not some vague goal called “faith.”

A simple rotation:

Oct 1: Proverbs 16:3
Oct 2: James 1:5
Oct 3: Colossians 3:23
Oct 4: Psalm 119:105
Oct 5: Matthew 6:34
Oct 6: Galatians 6:9
Oct 7: Proverbs 21:5

Oct 8: Romans 12:2
Oct 9: Psalm 90:12
Oct 10: Proverbs 4:25
Oct 11: Isaiah 41:10
Oct 12: Ecclesiastes 3:1
Oct 13: 1 Corinthians 10:31
Oct 14: Philippians 3:13–14

You don't need a giant Bible-study session every morning.

Read it aloud, think about it, move on.

Fitness

I'm changing the framing here.

I'm not making your calendar about “lose belly fat.”

You've told me the belly is bothering you, but the useful calendar target is health, strength and movement, not constantly measuring whether your stomach looks different.

Use:

Mon Oct 5 — workout
Wed Oct 7 — workout
Sat Oct 10 — workout

Then:

Mon Oct 12 — workout
Wed Oct 14 — workout

Your existing strength work can stay based around the deadlift, overhead press, bent-row and farmer carry. A short jumping-jack section can be added as movement/cardio.

Keep it reasonable.

Scholarship plan

This is important because you're thinking about leaving Nigeria, but you currently can't submit applications from the setup you have.

So don't put:

“Apply for scholarship”

on October 4.

Put:

“Learn how foreign undergraduate scholarships actually work.”

Oct 4 — 30–45 min

Research:

 who accepts Nigerian qualifications,

 who accepts NECO/GCE,

 who requires current secondary-school enrolment,

 who requires school nomination,

 which scholarships cover full costs,

 which are partial.

Oct 8 — 30–45 min

Build a small shortlist.

Oct 11 — 30 min

Check the shortlist against your actual academic pathway.

That's productive work even without submitting an application.

And remember the distinction we already established:

“Some scholarship programmes won't accept your pathway” ≠ “foreign scholarships are impossible for you.”

When Lovable credits are finished

This needs to become an actual rule.

Lovable available:

Build.

Lovable unavailable:

Switch task.

Don't sit there thinking:

“Well, today's development is over.”

Possible no-credit Figure work:

portfolio copy
GitHub
CV
brand kit
case studies
client screenshots
content
offer structure
research
project documentation
requirements
UI planning

That way, the credit system stops controlling your whole day.