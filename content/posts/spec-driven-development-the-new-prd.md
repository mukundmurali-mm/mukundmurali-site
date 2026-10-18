---
title: "Spec-Driven Development: The PRD Grows Up"
datePublished: "2026-10-18"
slug: "spec-driven-development-the-new-prd"
coverImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1600&q=80"
cover: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1600&q=80"
tags:
  - "AI"
  - "Product Management"
  - "Software Engineering"
  - "Developer Experience"
excerpt: "When an AI agent is the one reading your requirements, the prose PRD stops being a plan and starts being a liability — spec-driven development is what replaces it."
---

# Spec-Driven Development: The PRD Grows Up

**TL;DR** — The classic Product Requirements Document was written for humans who would fill in the gaps with judgment. AI coding agents don't fill gaps; they guess, confidently, and ship the guess. Spec-driven development (SDD) answers that by turning requirements into a precise, versioned, executable artifact that both people and agents act on — intent → spec → plan → tasks → code, with human review gates between each step. Tools like GitHub's Spec Kit, Amazon's Kiro, and Tessl are the first serious attempts at it. It's real and useful, mostly in existing codebases and for well-understood problems. It is also over-sold: the heavyweight versions can generate more documentation than anyone will ever read, and the one careful randomized study we have found experienced developers were *slower* with AI, not faster. Here's how I've come to think about it.

---

I've spent most of my career close to systems where ambiguity is expensive — infrastructure, networking, the kind of work where a vague requirement becomes a 2 a.m. page six months later. So I have a reflexive suspicion of any document whose main job is to *sound* complete. The traditional PRD is often exactly that document. And I've been digging into spec-driven development for a while now because it's the first thing in a decade that genuinely changes what a requirement is *for*.

Let me be honest up front about what this post is and isn't. I'm not here to sell you a methodology or tell you I rolled this out across some org and tripled velocity. I haven't. What I have done is work hands-on with these tools on real repositories, read the people who are thinking most carefully about them, and form a practitioner's opinion. Take it as that.

## The PRD was always a lossy format — agents just exposed it

Think about what a PRD actually does. A product manager writes several pages of prose describing what should be built, why, for whom, and roughly how it should behave. Then an engineer reads it. The magic — and it *is* magic, we just stopped noticing — is everything that happens in the engineer's head between reading and building. They reconcile contradictions. They notice the PRD never said what happens when the payment succeeds but the email fails. They apply three years of context about how this particular system breaks. They ask you a question in standup that reveals you hadn't actually decided something.

The PRD was never the specification. The engineer's judgment was. The document was a prompt for a very expensive, very good inference engine sitting across the desk.

Now swap that engine out. When the primary reader of your requirements is Claude Code or Cursor or GitHub Copilot's agent mode, the gaps don't get filled with judgment — they get filled with a plausible guess drawn from a few billion lines of other people's code. Birgitta Böckeler at Thoughtworks put the failure mode precisely: leave a detail to the AI and the outcome "can be as variable as AI decides to introduce a persistence layer with a database versus AI does not decide to do that." The ambiguity you used to resolve in conversation now gets resolved silently, at generation time, in a direction you didn't choose.

Andrej Karpathy named the extreme version of this in early 2025: *vibe coding*, where you "fully give in to the vibes" and "forget that the code even exists." He was explicit that it's for throwaway weekend projects. The problem is that vibe coding's convenience is seductive, and plenty of teams backed into doing it for software that very much is not a throwaway weekend project. Spec-driven development is, in large part, the industry's correction to that overcorrection.

## What SDD actually is

Here is the cleanest definition, from GitHub's own Spec Kit material: instead of coding first and writing docs later, "you start with a spec. This is a contract for how your code should behave and becomes the source of truth your tools and AI agents use to generate, test, and validate code."

The GitHub team frames the deeper shift as a "power inversion." For decades, code was the source of truth and specs were "scaffolding we built and then discarded." SDD flips it: "code serves specifications." The spec isn't a guide for implementation anymore — it's the source that *generates* implementation.

That's the ambition. In practice there's a spectrum, and the most useful map I've found is Böckeler's three levels:

- **Spec-first** — you write a spec, it drives the initial AI work, then it's effectively thrown away. This is what almost everyone actually does today, including people using tools that claim more.
- **Spec-anchored** — the spec persists as the living document for a feature as it evolves and gets maintained.
- **Spec-as-source** — humans maintain *only* the spec; all code is generated, marked as generated, and never hand-edited — the way almost nobody edits compiler-produced assembly. No current tool reliably delivers this.

Keep that spectrum in mind, because most of the hype talks about spec-as-source while most of the real usage is plain spec-first. The gap between those two is where disappointment lives.

## Classic PRD vs. a spec-driven spec

What changes concretely when a PRD becomes a spec? This table is the mental model I keep coming back to.

| Dimension | Classic PRD | Spec-driven spec |
|---|---|---|
| Primary reader | A human engineer who fills gaps with judgment | A human *and* an AI agent that fills gaps with a guess |
| Form | Prose, narrative, "should" statements | Structured, testable criteria (often EARS notation), explicit acceptance tests |
| Where it lives | Confluence / Notion / a Google Doc | In the repo, next to the code, in version control |
| Lifecycle | Written once, drifts, quietly abandoned | Versioned, diffed in PRs, re-read on every agent run |
| Ambiguity | Resolved later, in conversation | Resolved up front, or the agent resolves it for you |
| Output | A plan humans execute | An artifact that generates a plan, tasks, and code |
| Success check | "Did we build roughly the right thing?" | "Does the implementation satisfy the spec's criteria?" |

The single most underrated row there is *where it lives*. A spec in the repo is diffable. It shows up in a pull request. You can review a change to intended behavior the same way you review a change to code. That one property — requirements under version control, next to the thing they describe — is more of the value than any particular tool's clever workflow.

## The workflow, and why the gates matter

The shape is consistent across the serious tools: **intent → spec → plan → tasks → code**, with a human checkpoint between stages.

![The spec-driven development pipeline: intent to spec to plan to tasks to code, with a human review gate between each stage — contrasted against the old prose PRD that skipped straight from intent to code](https://mukundmurali-mm.github.io/hashnode-blogs/sdd-diagram.png)

GitHub's **Spec Kit** (open-sourced in late 2025, MIT-licensed, driven by a `specify` CLI that plugs into Claude Code, Copilot, Gemini CLI, Cursor, and others) runs an explicit pipeline: a project *constitution* holding non-negotiable principles, then `specify`, `clarify`, `plan`, `tasks`, and `implement`, with optional `analyze` and checklist gates in between. The `clarify` step is the interesting one — it forces the ambiguity conversation to happen before code exists, which is exactly the conversation the old PRD let you skip.

Amazon's **Kiro** — announced in July 2025, generally available since May 2026 — bakes the same idea into an IDE. It has a *Vibe Mode* for exploration and a *Spec Mode* that structurally refuses to generate implementation until a spec exists, producing three files: `requirements.md`, `design.md`, and `tasks.md`. Its acceptance criteria use EARS notation, which is worth knowing about.

EARS — Easy Approach to Requirements Syntax — came out of Rolls-Royce in 2009, where engineers were analyzing airworthiness regulations for a jet engine control system. The pattern is rigid on purpose: *WHILE \<precondition\>, WHEN \<trigger\>, the \<system\> SHALL \<response\>.* It's since been picked up by Airbus, NASA, Intel, and others. I find it telling that the requirements notation now powering AI spec tools was forged in a domain where a missed edge case kills people. Precision wasn't a nice-to-have there. The bet SDD makes is that precision is becoming a nice-to-have-turned-necessity for the rest of us, because our new implementer takes every word literally and invents the rest.

Then there's **Tessl**, Guy Podjarny's startup (he founded Snyk), which has raised $125M at a $500M-plus valuation to chase the far end of the spectrum. Tessl's framing of the core problem is the sharpest I've read: code "couples what the app does with how it does it," which is why software is so expensive to change. LLMs, for the first time, let you separate the *what* from the *how* — keep the spec, regenerate the code. Their specs can carry a `@generate` directive and stamp the output `// GENERATED FROM SPEC - DO NOT EDIT`. That's genuine spec-as-source, and it's also still in closed beta, which tells you how hard the honest version of this is.

The gates are the part I'd refuse to give up. The whole value proposition collapses if a human isn't reviewing the spec before the plan, and the plan before the tasks. Without those checkpoints you haven't built spec-driven development — you've built vibe coding with extra Markdown.

## What the data actually says

This is where I want to be careful, because the space is thick with numbers that don't survive contact with their primary source.

The **2025 DORA report** (Google's, ~5,000 practitioners) is the most solid read on adoption. AI adoption sits at **90%**, up 14 points year over year. The median developer spends about **two hours a day** working with AI. Over **80%** say it improved their productivity. But — and DORA is admirably blunt about this — AI is still *negatively* related to software delivery stability, and about 30% of developers trust it "a little" or "not at all." DORA's throughline is that "AI amplifies" whatever's already there: good teams get better, dysfunctional teams get more dysfunctional, faster. That matches my experience exactly. SDD is one of the practices that determines which direction the amplification runs.

The counterweight everyone should sit with is the **METR randomized trial** from July 2025. Sixteen experienced open-source developers, working on repositories they knew deeply, did 246 real tasks with and without AI tools. They predicted AI would make them 24% faster. Afterward, they *felt* about 20% faster. Measured, they were **19% slower**. The gap between perceived and actual speedup is the finding that should keep every PM honest. It's a narrow study on early-2025 tooling, and the authors say so — it is not a verdict on AI coding in general. But it's the best-designed evidence we have, and it points the opposite way from the marketing.

A few numbers I deliberately won't repeat as fact, because I couldn't verify them to a solid primary source:

- Claims that Spec Kit compresses spec production "from 12 hours to 15 minutes" trace to a preprint that itself calls the figure preliminary and not independently validated.
- Claims that human-refined specs cut AI code errors "by up to 50%" come from the same thin, early literature.
- The "AI writes up to 50% of our code" executive soundbite is a secondhand paraphrase; the more careful version from Satya Nadella is around 30%.

If you see these in a vendor deck, treat them as hopes, not measurements.

## Where SDD earns its keep — and where it doesn't

After working with these tools, this is the table I'd actually tape to a wall.

| SDD tends to help when... | SDD tends to hurt when... |
|---|---|
| You're working in an existing (brownfield) codebase the agent can anchor to | You're exploring and genuinely don't know what you want yet |
| The problem is well-understood and the hard part is precise execution | The problem is novel and the hard part is figuring out the problem |
| Multiple agents or people need one shared source of truth | One person is making a quick, local, throwaway change |
| The behavior has real edge cases worth pinning down (payments, auth, data) | A one-line fix gets inflated into a dozen "user stories" |
| Experienced engineers drive and review the specs | You expect the spec to replace judgment rather than encode it |
| You want behavior changes to show up as reviewable diffs | Nobody will actually read the generated spec before approving it |

That right-hand column is not hypothetical. Thoughtworks' Technology Radar put spec-driven development and Spec Kit in **Assess**, not Adopt, and the language is pointed: the workflows "remain elaborate and opinionated," some "generate lengthy spec files that are hard to review," and "we may be relearning a bitter lesson — that handcrafting detailed rules for AI ultimately doesn't scale." Böckeler watched Kiro turn a small bug fix into multiple user stories, and named the review problem exactly: wading through a stack of generated Markdown can be *worse* than just reviewing the code. On Hacker News you'll find the same complaint in saltier form — specs that generate "12+ tasks with 4+ sub-tasks each," and a comparison to Tony Stark building a robot in a cave when "just screw this bolt on" would have done the job.

And then there's the quiet rebellion among some of the sharpest practitioners. Peter Steinberger wrote a widely-shared piece titled "Just Talk To It," about abandoning formal spec-driven workflows in favor of direct conversation with a capable agent. Simon Willison, who endorsed it, has written that AI made him *procrastinate* on key design decisions — that when he didn't yet know what he wanted, the AI was "somewhere between unhelpful and harmful." That resonates. The spec is only as good as the thinking behind it, and no amount of EARS syntax substitutes for knowing what you're building.

## What this means if you're a PM

Here's the part that actually changes my job, and probably yours.

The requirements work moves *earlier* and gets *harder*. The old PRD let me defer decisions into the build phase, where an engineer would surface them. The spec doesn't allow that — every ambiguity I leave is an ambiguity an agent resolves without me. Böckeler's observation is that agentic development is "forcing teams to really look at the requirements and the intended outcome for the user before starting to build." That's not a tooling nicety. It's a discipline the prose PRD let us avoid, and SDD takes the escape hatch away.

My review surface changes too. Less reviewing of finished code dumps, more reviewing of specs and tightly-scoped task diffs at defined checkpoints. The skill I'm investing in isn't prompt-whispering; it's writing acceptance criteria precise enough that a literal-minded, tireless, slightly-overconfident implementer can't misread them — and recognizing when a problem is too fuzzy to spec yet and needs a conversation first.

Martin Fowler thinks the shift could be "as significant as the transition from assembly to high-level languages," and that a good business analyst who learns these tools "could be as effective as a programmer." I think he's directionally right and the timeline is longer than the excitement suggests. The roles of PM, analyst, and engineer are blurring at the spec. The person who can hold product intent and technical precision in the same document at the same time becomes unusually valuable.

## My honest take

Spec-driven development is not something you win by adopting a tool. It's the natural consequence of a simple fact: when a machine reads your requirements, vagueness stops being forgivable. The PRD didn't fail. It was always a lossy format that worked because a human decompressed it. We replaced the human decompressor with one that doesn't ask clarifying questions unless you force it to, and SDD is the forcing function.

So I'd use it — deliberately, not religiously. In brownfield codebases, on well-understood problems, with experienced people driving and real review gates, it's a clear improvement over narrating vibes into a chat window. For genuine exploration, for throwaway work, for the early fog where you don't yet know the shape of the thing — skip the ceremony and just talk to it, then write the spec once you've learned what you're actually building.

The spec, as John Ferguson Smart put it, "isn't a promise the agent makes, it's a test it has to pass." That's the mindset shift worth keeping. Not "write more documentation." Write the smallest artifact that pins down the behavior you care about, put it in the repo, make the agent earn its way past it, and review it like you mean it. The PRD didn't die. It grew up and moved in with the code.

*I've written this from hands-on experimentation and a close read of the people building and critiquing these tools — not from shipping SDD at scale inside any one company. If your experience differs, I want to hear it.*
