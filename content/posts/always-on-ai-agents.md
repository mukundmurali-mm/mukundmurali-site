---
title: "Always-On AI Agents: From the Agent Loop to a Digital Colleague"
datePublished: "2026-11-01"
slug: "always-on-ai-agents"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
tags:
  - "AI Agents"
  - "Agentic AI"
  - "AI Infrastructure"
  - "Technical Product Management"
  - "LLM"
excerpt: "The agent loop is powerful but ephemeral — close your laptop and it's gone. Always-on agents keep that loop and wrap it in durable infrastructure the model never sees: a server-side runtime, a sandboxed cloud computer, persistent memory, and event triggers. Here's how I've come to think about the architecture that turns a terminal tool into a colleague you text."
---

# Always-On AI Agents: From the Agent Loop to a Digital Colleague

*TL;DR:*
- *The agent loop (a model calling tools in a loop) is powerful but ephemeral. Close your laptop and it's gone.*
- *Always-on agents keep that same loop and wrap it in durable infrastructure the model never sees: a server-side runtime, a sandboxed cloud computer, persistent memory, and event triggers.*
- *That shift turns a terminal tool into something closer to a colleague you text, one that works while you sleep and surfaces only when it needs you.*
- *The honest counterweight: measured studies (DORA 2025, METR July 2025) show today's AI can feel faster while hurting delivery stability. The infrastructure is the bet that reliability, not raw capability, closes that gap.*

One thing to be clear about before you read on: I haven't shipped an always-on agent platform at a company. What follows is how I've come to think about the architecture after reading the engineering writing from the teams building these systems and tracing their claims back to primary sources. Treat this as me reasoning out loud, not a product retrospective.

## The loop that dies when you close your laptop

The core primitive is almost embarrassingly simple. Simon Willison compressed it to a phrase that Anthropic itself now cites: an LLM autonomously using tools in a loop. The model thinks, calls a tool, reads the result, thinks again. The intellectual root goes back to the ReAct paper in 2022, which showed that interleaving reasoning traces with actions beats either one alone. Anthropic's *Building effective agents* drew the line that still matters most: workflows run models on predefined paths, while agents let the model dynamically direct its own tool use.

Here's the thing that defines the whole problem. That loop runs on your machine, in your session, in your context window. It's brilliant, and it's dead the moment you walk away. It doesn't remember yesterday, can't be woken by an incoming email, has no computer of its own. It's a terminal tool, and you are its life support.

Always-on agents keep the exact same loop. What changes is everything around it. You wrap the loop in durable infrastructure the model never sees: a server-side runtime, the agent's own cloud computer, persistent memory, event triggers. Now it stops behaving like a command you run and starts behaving like a colleague you message. Everything below is the plumbing that makes that true.

## Four eras (my framing, not a standard)

I find it useful to tell this as four eras. It isn't a published taxonomy, just my narrative device for a real progression, so read it as opinion with real waypoints underneath.

| Era | What you did | What the agent had |
|---|---|---|
| 1. Copy-paste | Paste code into a chat window, paste the answer back | A chat box. No tools, no files. |
| 2. Terminal coding agents | Let the agent edit files and run shell commands locally | A loop plus tools, scoped to your terminal |
| 3. Parallel-agent apps | Run several agents at once, approve each action | A UI, parallelism, human-in-the-loop on every step |
| 4. Ambient / always-on | Text it like a coworker; it runs in the background | Its own computer, memory, event triggers, skills |

ChatGPT in 2022 anchors era one. Claude Code and Cursor's agent mode anchor era two. Era four maps onto a named, sourced concept: *ambient agents*, which Harrison Chase at LangChain coined in January 2025. Most agents today are chat agents (human in the loop, one message at a time), while ambient agents are triggered by events (an email, a Slack message, a webhook), run in the background, and surface to a person only when they need input. The companion UX is the "agent inbox," where you review a queue of drafted actions instead of babysitting every step.

## What actually changed in the models

Infrastructure didn't arrive first. The models got good enough at a specific set of things to make the infrastructure worth building.

Long-horizon instruction following improved to the point that an agent can hold a multi-step goal across dozens of tool calls without losing the plot. Sub-agent handoff became reliable enough that an orchestrator can spin off a worker, let it burn through an expensive subtask, and take back only the result. Tool calls got dependable, which is the difference between a demo and a system. Computer use arrived: in October 2024 Anthropic shipped a Claude that can operate a GUI like a person. File-based memory became a first-class pattern, with agents writing notes to a persistent store and reading them back later. And agents started learning skills by watching, capturing a procedure once and replaying it.

Stacked together, these are the preconditions for leaving an agent running unattended and trusting it to pick up where it left off.

## Why the interface got simpler, not harder

The counterintuitive part: as the systems got more capable, the interface got simpler. You don't configure an always-on agent so much as text it, the way you'd message a coworker: "Can you look into why the staging deploy is flaky and open a PR if you find it?" You can steer mid-task, dropping a new message in while it's working so it adjusts, instead of forcing you to kill the run and start over.

One pattern I'd flag carefully is auto-review: a second model checks the first model's work or its proposed commands. Some teams claim this beats human approval fatigue, since a person clicking "approve" for the two-hundredth time stops reading. That's a real effect worth naming, but "auto-review beats humans" is a vendor claim, not a proven result. The security literature is explicit that a model policing its own context is not a complete defense. So: promising layer, unproven as a replacement. Keep a human on anything irreversible.

## Architecture: thin client, thick server

The mental model that made the rest click for me: the client is thin, the server is thick, and almost nothing lives on the device in front of you.

![Always-on agent architecture: triggers feed a router that dedupes events and decides whether to interrupt you, an event queue drives the agent loop running server-side inside a durable workflow, with a sandboxed cloud computer (snapshot/pause/wake microVM), a state database and layered memory — and a single send_to_user tool rendering back to thin mobile, Slack and email clients](https://mukundmurali-mm.github.io/hashnode-blogs/always-on-agents-diagram.png)

Triggers come in from the outside world: an email, a webhook, a scheduled timer, a human message. They hit a router whose job is to dedupe near-identical events and decide whether this is worth interrupting you over or whether it can be batched. (The exact dedup and prioritization mechanics are implementation-specific; what's grounded is the ambient-agent idea that most events get handled quietly and only some surface to a person.) Events feed an event queue, the queue feeds the loop, and the agent's state lives in a database, not in volatile memory.

The agent gets its own computer: a sandboxed cloud environment it can treat as a real machine. Firecracker is AWS's open-source microVM monitor, built for serverless, and per its NSDI 2020 paper it boots to application code in under roughly 125 milliseconds with under about 5 MB of memory overhead per microVM. That snapshot/pause/resume capability is exactly what lets an agent's environment sleep and wake cheaply. A whole category of providers builds on this pattern: E2B runs each sandbox as a Firecracker microVM with pause/resume that preserves both filesystem and memory, Modal uses gVisor containers with snapshots, Daytona offers containers and VMs with snapshots. I'd present microVM isolation as the dominant pattern, with those providers as examples, not as "all agents use Firecracker." Some don't.

The design decision I find most elegant: the agent loop lives on the server, not inside the VM. The VM is disposable. If it crashes or you need to rebuild it, the durable state outside survives and the work continues.

Then there's durable execution, the part my infra brain loves most. If an agent is on step 3 of a multi-step task and the process crashes, a plain job queue typically re-delivers the message and replays the whole thing from step 1, unless you've built your own checkpointing. Durable execution resumes at step 3. Temporal is the canonical implementation: it persists workflow state and execution history so a crash, restart, or infra failure picks up exactly where it stopped, and you write code as if failure doesn't happen. For an agent making expensive, non-idempotent calls like payments, emails, or model invocations, "don't replay steps 1 and 2" is both a cost argument and a correctness argument. Temporal is one engine among several (Restate, Inngest, DBOS, Step Functions all do versions of this), so read it as the leading example, not a universal requirement. And your own messages get priority: when you text the agent, that interrupts; a routine webhook waits its turn.

## Harness design: the thin layer that matters

The harness is the code wrapped around the model. Get it wrong and a capable model looks dumb. A few lessons I've internalized from the teams writing about this:

**One channel crosses server to client.** Rather than a sprawl of ways for the server-side agent to talk back to your screen, you can funnel everything through a single rich render channel, call it a `send_to_user` pattern. That's a specific design choice some teams make, not a named standard, but the idea of one well-defined channel back to the human is clean.

**Dynamic tool discovery.** You don't stuff every tool's full schema into context. You keep the tool *names* in context and load the schema on demand when the agent decides to use one. This maps directly to MCP, the Model Context Protocol, Anthropic's open standard from November 2024 for connecting models to tools and data through a uniform interface. It's the "USB-C port for AI" that lets an agent reach an arbitrary SaaS without a bespoke integration.

**The escalation ladder.** An engineering heuristic, not a law, but a sensible one: try conversation history first, then an MCP server or API, then web search, then a browser, then full desktop control, and only then ask the human. Each rung up costs more in latency, money, and risk. Computer use sits near the bottom because Anthropic itself cautions it's still error-prone and less reliable than API calls. When you do read a web page, read the accessibility tree first; structured text is cheaper and less brittle than screenshots and pixel clicks.

**Orchestrator plus sub-agents gives you "infinite context."** I put that in quotes because it's marketing, but the technique is real: a lean orchestrator holds the plan while sub-agents do the token-heavy work and report back only conclusions.

**Small lessons that compound.** Don't mutate the available tools mid-turn; it breaks the model's assumptions about what it just saw. For a hot pattern like running a shell repeatedly, give it a dedicated tool rather than making the agent improvise. And write error messages for the agent the way you'd write them for a human: a clear, actionable message gets a better retry than a raw stack trace.

## Context engineering: the cache is the economics

If durable execution is the correctness backbone, prompt caching is the economic one. Caching a long static prefix (your system prompt plus all your tool definitions) means every subsequent request reuses it instead of re-paying for those tokens. Per Anthropic's own prompt-caching docs, cache reads cost a fraction of base input tokens (Anthropic describes up to around 90% cheaper on cache hits, with a meaningful latency reduction too), with 5-minute and 1-hour TTL options and a documented pre-warming pattern so the prefix is hot before the user arrives. I'm citing those figures as Anthropic's stated numbers, not an independent measurement.

Caching is prefix-based and order-sensitive, and that constraint drives the discipline. Keep the system prompt and tools static and in a fixed order. Pre-warm the cache. Treat a cache miss as a bug to investigate; a silent miss means you're paying full freight. Manus's field notes put it bluntly: KV-cache hit rate is the single most important metric for a production agent.

The broader discipline is context engineering, which Anthropic frames as treating context as a finite resource. The moves that follow:

- **Write long outputs to files.** Don't hold a giant artifact in context; put it in a file and keep a reference.
- **Compaction.** When history gets long, summarize it while preserving decisions and open bugs, then continue. It's lossy on purpose; the skill is choosing what to keep.
- **Memory layers.** Core facts that rarely change, dated work logs, a scratchpad for the current task, and retrievable files loaded just in time. Anthropic's memory tool operationalizes this as a file-based store under `/memories` that persists across sessions.

## Safety: treat the outside world as hostile data

Everything above expands what an agent can touch, which expands what can go wrong. The safety stack I'd insist on:

A model reviews shell commands before they run. That's a real defense-in-depth layer, but one layer, not a complete answer on its own. The single most important idea: untrusted inputs are data, not instructions. An incoming email, a webhook payload, a web page, a PR comment: none of it should be treated as a command to the agent, because the model cannot reliably tell trusted instructions from attacker text when both are just tokens in one context. Prompt injection is the number one risk in the OWASP Top 10 for LLM Applications (LLM01:2025) for exactly this reason.

Simon Willison's "lethal trifecta" names the danger condition precisely: access to private data, plus exposure to untrusted content, plus the ability to exfiltrate. Remove any one leg and the attack fails. The GitHub, GitLab, and Atlassian MCP exploits in 2025 are concrete proof this is exploitable in production. So: a human confirms anything irreversible, and secrets stay out of context entirely. The agent should act through capability limits it can't talk its way around, not through a password it's been handed and politely asked not to misuse.

## The training flywheel

There are two loops here. The inner loop is operational: an agent fails, you turn that failure into an eval, you fix the harness or prompt, you ship. The outer loop is model-shaped and slower: the failures you collect become training data, and the next model generation is better at what used to break.

The principle that falls out of this is the one I keep coming back to: build for the next model, not this one. Some teams phrase it as "delete the product." Anthropic's harness-design writing supports the grounded version: when a new model lands, strip away the scaffolding that's no longer load-bearing and add new pieces that reach for greater capability. A lot of today's harness is compensating for model weaknesses that won't exist in six months.

## The honest counterweight

I'd be selling you something if I said always-on infrastructure automatically makes you faster. The measured evidence says otherwise.

DORA's 2025 report found AI adoption is near-universal: 90% of surveyed technology professionals use AI at work, and over 80% say it increased their productivity. But the report frames AI as an amplifier, not a free lunch. It's associated with higher delivery throughput *and* higher delivery instability. An earlier DORA special report estimated that every 25% increase in AI adoption was associated with roughly 1.5% lower delivery throughput and about 7.2% lower delivery stability, attributed to larger, faster, harder-to-review change batches. Somewhere between 30% and 39% of developers report little-to-no trust in AI-generated code. The verification tax is real.

METR's July 2025 randomized controlled trial is the sharper number. Sixteen experienced open-source developers across 246 real tasks were given early-2025 AI tools. The tools increased completion time by 19%; the developers got *slower*. The twist: those same developers forecast a 24% speedup beforehand, and even after the fact still believed AI had sped them up by about 20%. The perception-reality gap is the headline, and METR has since cautioned the specific figure reflects early-2025 tooling.

I don't read these as a reason to dismiss always-on agents. I read them as the reason the infrastructure matters. Durable workflows, persistent memory, evals, model-reviewed actions: the whole stack is a bet that reliability and verifiability, not raw model horsepower, are what close the gap these studies expose.

## The new primitives

Step back and a pattern shows up that's bigger than any one product. Durable workflows, sandboxes, memory, skills, payments, identity, evals, observability: this list is converging into a standard agentic layer, visible across the market. LangChain's Managed Deep Agents ships almost exactly that list as managed infrastructure so teams stop rebuilding the same plumbing every agent needs. AWS Bedrock AgentCore describes the enterprise version of the same checklist: approved models and tools, short-lived workload identity, isolated runtime and memory, automated evaluation, telemetry, cost attribution. When multiple vendors independently converge on the same primitive list, that's the strongest evidence the stack is real.

My thesis, and I'll own that it's a prediction rather than a measurement, is that this becomes the server-plus-database-plus-CRUD of this decade. In 2005 every serious product grew a web server, a database, and CRUD operations because that was the ambient assumption of how software got built. Every product will grow one, not because it's fashionable but because the primitives are becoming table stakes.

I'll end where I started. I haven't built this. I've studied how it's being built, traced the claims to their sources, and tried to separate the durable primitives from the one-company design choices dressed up as universal fact. The agent loop is the easy part. Turning it into a colleague is an infrastructure problem, and infrastructure problems are the ones I find most worth thinking carefully about.
