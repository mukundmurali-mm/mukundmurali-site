---
title: "Skills Used in AI Agents"
datePublished: 2026-09-25
slug: skills-used-in-ai-agents
coverImage: https://images.unsplash.com/photo-1769839271832-cfd7a1f6854f?fm=jpg&q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0
tags:
  - ai-agents
  - llm
  - machine-learning
  - software-architecture
  - developer-tools
---

# Skills Used in AI Agents

Everyone is building AI agents right now. Startups, enterprises, solo developers — if you work in software, you've either shipped one or you're being asked to. But after spending the last year and a half working with agentic systems — debugging them, experimenting with them, watching them fail in ways I didn't expect — I've come to a conclusion that I think too few people are talking about openly: **the difference between a demo agent and a production agent is not the model. It's the skills.**

Not "skills" in the vague, marketing sense. I mean the specific, layered capabilities an agent needs to reliably accomplish real work. Getting these right is an architecture problem, and it's one that most teams are learning the hard way.

## TL;DR

AI agents need three layers of skills — reasoning, planning, and tool use — but those alone aren't enough. The agents that actually work in production add a fourth layer: meta-skills like self-reflection, error recovery, and loop detection. The emerging best practice is to make skills composable and modular (the Agent → Skill → Tool hierarchy), load them progressively to save context budget, and invest heavily in memory systems. Context engineering — not prompt engineering — is what separates 30% task completion from 90%.

---

## The Three Layers of Agent Skills

A [comprehensive survey from January 2026](https://arxiv.org/abs/2601.01743) maps agent capabilities into three architectural layers. This taxonomy holds up well against what I've seen in practice.

### Layer 1: Reasoning and Deliberation

This is the foundation. Before an agent can do anything useful, it needs to think — and think well. That means chain-of-thought decomposition (breaking problems into steps), self-verification (checking its own reasoning before acting), and constraint-aware decision making (operating within budgets, latency limits, and safety rails).

Reasoning is what most people think of when they picture an AI agent. It's the LLM doing what LLMs do best: processing language, drawing inferences, and generating coherent plans. But reasoning alone is like having a brilliant strategist with no hands. You need the next layers.

### Layer 2: Planning and Control

Planning is where reasoning becomes actionable. An agent needs to decompose complex goals into subtasks, generate and evaluate alternative strategies, and build hierarchical plans that range from reactive quick-fixes to multi-step orchestrations.

The most interesting development here is memory-augmented planning — agents that use their past experience to inform current decisions. This isn't just "remembering what happened last time." It's about building a growing library of approaches that the agent can draw on, which starts to look a lot like how experienced engineers solve problems: by pattern-matching against things they've seen before.

### Layer 3: Tool Use and Environment Interaction

This is where the agent meets the real world. RAG (retrieval-augmented generation) for accessing external knowledge. Code execution in sandboxes. API calls to external services. Multimodal perception for processing images, audio, and structured data.

The data here tells a clear story about where agents are heading. [Analysis of 177,000 MCP tools](https://arxiv.org/html/2603.23802v1) shows that action tool usage — tools that actually modify environments, not just observe them — grew from 27% to 65% of total agent tool uses between November 2024 and February 2026. Agents are moving from reading the world to writing to it, and that shift carries real consequences for how we think about skills.

![AI Agent Skill Architecture — showing reasoning, planning, and tool use layers with meta-skills, memory stack, and context window](https://mukundmurali-mm.github.io/hashnode-blogs/skills-used-in-ai-agents-diagram.svg)

Here's the thing, though: **these three layers are necessary but not sufficient.** Every framework gives you reasoning, planning, and tool use. The agents that break in production break for a different reason entirely.

---

## The Meta-Skills Gap: Why Capable Agents Still Fail

This is the part I wish someone had written about before I learned it through painful debugging sessions.

[A synthesis paper from July 2026](https://arxiv.org/pdf/2607.05775) puts it bluntly: "Sub-skill competence does not reliably compose into end-to-end task success." An agent can parse tool schemas perfectly, plan correctly at each step, and still fail catastrophically at the task level. Why? Because of what the researchers call the "no-recovery bottleneck."

Here's how it works: once an agent commits to an incorrect intermediate state deep into a trajectory, most architectures cannot detect and roll back the error. A single early mistake propagates through the rest of the execution. The agent doesn't know it went wrong, so it keeps building on a faulty foundation. I've watched this happen in agent runs that look fine for 15 steps and then produce garbage on step 16 because step 3 was subtly wrong.

The fix isn't better reasoning or more tools. It's **meta-skills** — the agent's ability to monitor, evaluate, and correct itself.

[METR's analysis](https://arxiv.org/pdf/2607.05775) makes this concrete: the steady increase in agent capability over the past year is primarily attributable to improvements in reliability and error recovery, not to gains in raw reasoning or tool-use ability. Error recovery is the production skill.

### The Reflexion Pattern

The most effective architecture for self-correction decomposes the agent into three components, mirroring what psychologist Daniel Kahneman calls dual-process theory:

1. **Actor** — generates actions quickly (System 1, fast and intuitive)
2. **Evaluator** — assesses output quality using deterministic checks or LLM-based scoring
3. **Reflector** — analyzes failures and generates verbal feedback stored in episodic memory (System 2, slow and deliberate)

[Research on self-reflection](https://arxiv.org/html/2405.06682v3) confirms this works across all LLMs tested. Self-reflections that include rich information — instructions, explanations, and proposed solutions — consistently outperform minimal approaches like simple retry or keyword-based corrections.

As [Michael Schöffel puts it](https://mschoeffel.de/en/blog/ai-agents-03-self-reflection): "Self-reflection in agents is the architectural attempt to artificially force System 2 thinking." That framing has stuck with me. We're essentially building agents that can slow down and think carefully, rather than just react.

### The Meta-Skills That Matter

Beyond self-reflection, I've come to think of production meta-skills as a checklist:

- **Self-monitoring** — tracking the reasoning process in real-time to catch errors before they cascade
- **Self-evaluation** — assessing decision quality to prevent confidently wrong answers
- **Grounding** — anchoring reasoning in verifiable external data to prevent hallucination echo chambers
- **Loop detection** — identifying when the agent is stuck in repetitive behavior
- **Circuit breaking** — a pattern borrowed from microservices: temporarily locking failed tools and forcing a strategy change

That last one — circuit breaking — is particularly interesting. It's a direct import from distributed systems engineering into agent architecture. When a tool fails three times, don't keep calling it. Lock it, try a different approach, and come back later. Simple, effective, and rarely implemented.

---

## The Composability Revolution: Skills as Architecture

The most significant shift I've observed in 2026 is the move from monolithic agents to composable skill systems. This is where things get architecturally interesting.

### The Agent → Skill → Tool Hierarchy

[Microsoft's agent architecture](https://learn.microsoft.com/en-us/agents/architecture/search-tool-use-architectures) defines a clean three-tier composability model:

- **Agent** — orchestrates requests and makes high-level decisions
- **Skill** — a workflow loaded only when invoked; can combine deterministic scripts with LLM reasoning
- **Tool** — a specific function exposed via tool calling; opaque to the agent

The key insight is that second tier. Skills aren't just tools — they're workflows. A "code review" skill might combine static analysis tools, diff parsing, LLM-based reasoning about code quality, and structured output formatting. It's a composed capability, not a single function call.

### Progressive Skill Disclosure

Here's a practical finding that changed how I think about agent design: defining skills as markdown documentation and loading them only when needed reduces token costs by **up to 94%** compared to loading everything upfront.

This matters because of a problem [MLflow's best practices guide](https://mlflow.org/articles/ai-agent-tool-use-best-practices-for-practitioners) calls "tool sprawl" — loading every tool at once can consume **over 70% of the token budget** before the agent processes a single user message. You've burned most of your context window on tool definitions. Progressive disclosure — loading skill documentation only when the agent actually needs it — is the fix.

The SKILL.md format has emerged as a standard for this: structured markdown files that define capabilities, invocation conditions, and execution scripts. Multiple runtimes now support it, making skills portable across different agent frameworks.

### Compiling Knowledge into Skills

The [ANYTHING2SKILL framework](https://arxiv.org/pdf/2606.09316v3) from June 2026 represents a conceptual breakthrough. It compiles heterogeneous external knowledge — documentation, tutorials, API references, domain guides — into reusable, retrievable, executable skills. Combined with RAG, it achieves **98.85% and 94.10% success rates** on standard benchmarks, substantially outperforming RAG-only agents.

The insight is that RAG gives you *declarative* evidence ("here's what's relevant"), but agents need *procedural* guidance ("here's how to do it"). Skills bridge that gap. It's the difference between handing someone a reference manual and giving them a recipe.

---

## Memory: The Skill That Makes All Others Work

Memory deserves its own section because every other skill depends on it. Without memory, an agent is stateless — brilliant in the moment but incapable of learning or maintaining coherent behavior over time.

The evidence is striking. In the [Generative Agents experiment](https://arxiv.org/pdf/2603.07670) (Park et al.), removing reflection caused agent behavior to degenerate from coherent multi-day planning to repetitive, context-free responses within 48 simulated hours. The Voyager agent without its skill library was **15.3× slower** at reaching milestones. And in MemoryArena benchmarks, swapping active memory for a long-context-only baseline dropped task completion from **80%+ to approximately 45%** on multi-session tasks.

The 2026 best practice is a four-tier memory stack:

1. **Working memory** — what's currently in the context window
2. **Short-term memory** — session history and conversation thread
3. **Long-term memory** — vector databases (RAG), entity graphs, persistent knowledge
4. **Episodic memory** — run logs, reflections, and learned behaviors

Each tier serves a different purpose, and the interplay between them is what enables skills like memory-augmented planning and self-improvement over time.

---

## Framework Choices: Matching Skills to Architecture

Not all frameworks handle skills the same way. Here's what the [benchmarks show](https://remery.ai/blog/langchain-vs-crewai-vs-autogen-agent-frameworks):

| Framework | Success Rate | Avg Cost/Query | P95 Latency |
|-----------|-------------|-----------------|-------------|
| LangChain + LangGraph | 94% | $0.18 | 15.1s |
| CrewAI | 89% | $0.27 | 22.3s |
| AutoGen | 82% | $0.35 | 31.2s |

LangChain leads on raw performance with its graph-based orchestration and 500+ integrations. CrewAI's role-based approach — where each agent has a defined role, goal, and backstory — excels when you need multi-agent collaboration with clear division of labor. It now has over 100,000 certified developers.

AutoGen is worth noting mainly because it's now in maintenance mode. Microsoft recommends new projects use the Microsoft Agent Framework (MAF), their enterprise-ready successor with stable APIs and A2A/MCP interoperability.

On the protocol side, MCP (Model Context Protocol) has become the skill composability layer. [62% of new MCP servers are now AI-coauthored](https://arxiv.org/html/2603.23802v1), up from 6% in January 2025 — agents building the tools that agents use. The recursive nature of that trend is worth watching.

For sub-agent isolation — splitting complex tasks across specialized agents — MLflow reports reasoning quality improvements of **up to 90.2%** compared to single-agent designs. The trade-off is orchestration complexity, but the quality gains are hard to argue with.

---

## Context Engineering: The Unifying Discipline

I want to close with what I think is the most important concept tying all of this together.

Andrej Karpathy's framing has become canonical: "The LLM is a new kind of operating system, and the context window is its RAM." Context engineering — the discipline of designing everything that enters an LLM's context window — [can raise agent task-completion rates from approximately 30% to 90%](https://tutorials.technology/tutorials/context-engineering-ai-agents-2026.html) on the same underlying model. Same model, 3× better results, just by managing context well.

This has displaced prompt engineering as the central skill in applied AI work. The context window isn't just where the prompt goes. It's where the system instructions live, where memory is surfaced, where tool schemas are loaded, and where the current task state is tracked. Every skill I've described in this post — reasoning, planning, tool use, meta-skills, memory, composability — ultimately competes for space in that finite context window. Managing that space intelligently is the meta-skill above all meta-skills.

[86% of organizations](https://www.rivista.ai/wp-content/uploads/2025/12/1765969009604.pdf) now deploy AI coding agents in production, and 81% plan to tackle more complex use cases this year. The gap between ambition and execution will be closed by teams that understand the full skill stack — not just what an agent can do, but how its capabilities compose, recover from failure, and manage the finite resource of context.

---

## The Takeaway

If I could distill everything I've learned about agent skills into a single principle, it would be this: **invest in the skills that make other skills reliable, not just the skills that make agents capable.**

Start with reasoning and planning. Add tools. But then spend disproportionate time on meta-skills — self-reflection, error recovery, loop detection, circuit breaking. Build a real memory system, not just a long context window. Make skills composable and progressively loadable. And treat context engineering as the discipline that ties everything together.

The agents that work in production aren't the ones with the most tools or the largest context windows. They're the ones with deliberate, layered skill architectures — where every capability is designed to compose reliably with every other. That's the bar, and it's achievable today.

---

*Mukund Murali is a Technical PM with roots in infrastructure and networking, currently focused on AI product leadership. He writes about what he learns through exploring and experimenting with AI systems at [mukundmurali.in](https://mukundmurali.in).*
