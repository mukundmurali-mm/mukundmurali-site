---
title: "The 'System One Model' Is Not a Model — It's a Router"
datePublished: "2026-10-04"
slug: "system-one-model-is-not-a-model-its-a-router"
coverImage: "https://images.unsplash.com/photo-1549925245-f20a1bac6454?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600&fit=max"
cover: "https://images.unsplash.com/photo-1549925245-f20a1bac6454?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600&fit=max"
excerpt: "The most consequential decision in a modern AI product isn't which model you pick — it's whether, for each request, the system should think fast or think slow. The real artifact worth building is the router that decides per request."
tags: ["AI", "LLM", "Product", "Reasoning"]
---

Last month I watched a support bot spend what felt like an eternity — four or five seconds, an age in chat — before answering "what are your hours?" It produced a careful little internal monologue, weighed considerations, double-checked itself, and then told me the store opens at nine. The same bot, asked a genuinely hard question about overlapping return policies on a bundled order, fired back an instant, confident, and completely wrong answer.

That pair of failures has stuck with me because it inverts how most people think the problem works. We spend enormous energy arguing about *which model* to use. But this bot was over-thinking a trivial request and under-thinking a hard one, and no model swap fixes that. The thing it got wrong was not intelligence. It was *allocation* — how much deliberation to spend, and when.

I've spent most of my career on the infrastructure side of the house — networking, cloud infrastructure, the plumbing that makes systems predictable — and more recently building with agentic workflows and retrieval systems. From that vantage point, the single most consequential design decision in a modern AI product is almost never the model. It's this: for each incoming request, do you want the system to think fast or think slow? And most teams haven't even framed it as a decision yet.

## A borrowed metaphor, used honestly

The vocabulary everyone reaches for here is Daniel Kahneman's *Thinking, Fast and Slow*: **System 1** is fast, automatic, effortless, pattern-matched, always-on; **System 2** is slow, serial, effortful, deliberate. It's a wonderful frame, and before I lean on it I want to be honest about what it is and isn't.

Kahneman popularized the split, but he didn't coin it — in his own Nobel lecture he credits the "System 1 / System 2" labels to Stanovich and West (2000). More to the point, the field has since walked the literal version back. Jonathan Evans and Keith Stanovich moved to the more careful language of "Type 1 / Type 2 processing" precisely to stop people from imagining two tidy neurological boxes. Evans put it bluntly: "it is almost certainly wrong to think of System 1 as one system." Stanovich later split the deliberate side into an *algorithmic mind* (raw capacity) and a *reflective mind* (the disposition to actually engage it).

I belabor this because the AI industry adopted the metaphor in exactly the spirit it should be used: as a *design vocabulary*, not a claim about brain modules. When I say an LLM is "thinking slow," I don't mean it has grown a second cognitive system. I mean, operationally, something very concrete and very billable: it is spending more compute at inference time before it commits to an answer. That's the whole translation. Fast equals one forward pass. Slow equals deliberate, multi-step work before the final token. Hold onto that, because it's the part that shows up on your invoice.

## How the field picked this up

The framing entered mainstream deep learning through Yoshua Bengio's 2019 NeurIPS keynote, "From System 1 Deep Learning to System 2 Deep Learning." His mapping was explicit: System 1 is today's intuitive, fast, perception-driven networks; System 2 is the future — slow, logical, sequential, capable of reasoning, planning, and the kind of out-of-distribution generalization humans manage with language. He argued attention was a key ingredient for that "conscious," one-concept-at-a-time computation.

Yann LeCun took the same dichotomy and renamed it Mode-1 and Mode-2 in his 2022 position paper. Mode-1 is perception straight to action — fast, reactive, no simulation. Mode-2 runs a world-model forward, evaluates costs, and optimizes the action; he framed it as model-predictive control and defined reasoning as energy minimization rather than next-token prediction. The idea from that paper I keep coming back to is **amortization**: the results of expensive Mode-2 deliberation can be distilled back into cheap Mode-1 reflexes. Deliberate planning becomes a fast instinct with practice — which is exactly what happens to a human learning to drive, and, it turns out, a very practical pattern for products.

Then DeepMind and OpenAI shipped it. The Tree of Thoughts paper from Yao and colleagues even said the quiet part out loud in its conclusion: "the associative 'System 1' of LMs can be beneficially augmented by a 'System 2' based on searching a tree of possible paths." The metaphor had become an engineering roadmap.

## The toolkit, from cheap to expensive

If you line up the techniques of the last few years, they read as a steady march from fast to slow — from one forward pass toward structured deliberation. It's worth walking the ladder, because each rung buys more quality at more cost, and knowing the shape of that curve is the job.

**Chain-of-Thought** (Wei et al., 2022) was the first widely-cited "think step by step." Giving a model a few worked examples with intermediate reasoning sharply improved arithmetic and commonsense tasks — on GSM8K it more than doubled performance for the largest models. Two findings mattered for product people. First, CoT was an *emergent ability of scale*; below roughly 100B parameters it produced fluent-but-illogical chains and didn't help. Second, and prophetically, the authors noted it let a model "allocate additional computation to problems that require more reasoning steps." That's the earliest clear articulation of inference-time compute as a dial.

**ReAct** (Yao et al., 2022) interleaved reasoning traces with actions and observations — Thought, Action, Observation, repeat. This is the structural ancestor of every agent loop running in production today. Grounding the reasoning in a real tool, like a search API, measurably cut hallucination; in one failure analysis, pure CoT hallucinated 56% of the time, and grounded trajectories cut that dramatically. It bought +34% absolute success on ALFWorld and +10% on WebShop over baselines with just one or two examples.

**Tree of Thoughts** (2023) generalized the chain into a search tree, with the model evaluating its own partial states and backtracking. The headline is almost comical: on the Game of 24, GPT-4 with plain chain-of-thought solved 4% of problems; Tree of Thoughts solved 74%. But — and this is the part I wish more people quoted — the authors were candid that it "might not be necessary for many existing tasks GPT-4 already excels at" and "requires more resources than sampling methods." They built the knob *and* told you not to turn it for everything.

**Test-time-compute scaling** (Snell, Lee, Xu, and Kumar, 2024) is the research statement underneath all of this, and the one I'd hand to any PM who wants the mechanism in a sentence. Spending compute at inference can substitute for scaling parameters — up to a point. Choosing the strategy *per prompt based on difficulty* improved compute efficiency by about 4× over a best-of-N baseline. Under a FLOPs-matched comparison, a small model allocated extra test-time compute beat a model 14× its size on easy and medium problems. On the hardest problems, raw pretraining still won. The two are not one-for-one exchangeable. The single most useful line from that paper: the best strategy "critically varies depending on the difficulty of the prompt." Easy prompts want light revision; hard prompts justify parallel search.

**o1 and o3** turned all of this into a default product behavior. These are the first mass-market reasoning models that do the slow thinking by themselves, generating a long internal chain of thought before they answer. The benchmark jumps are real and large, which brings us to the numbers.

## The numbers, and what they actually cost

Here's what "think slow" buys on OpenAI's own reporting for o1:

| Benchmark | GPT-4o | o1 |
|---|---|---|
| AIME 2024 (pass@1) | 9.3% | **74.4%** |
| GPQA Diamond (pass@1) | 50.6% | **77.3%** |
| Codeforces (Elo / percentile) | 808 / 11th | **1,673 / 89th** |

A math competition score going from 9.3% to 74.4% on the same family of model, driven by letting it reason before answering, is the kind of jump that reorganizes a roadmap. o1 was also the first model to pass PhD-level human experts on GPQA Diamond. o3 pushed further: 96.7% on AIME 2024, 87.7% on GPQA Diamond, 71.7% on SWE-bench Verified, and famously 87.5% on ARC-AGI — the first model ever to cross the roughly 85% human threshold on that benchmark.

Now the other side of the ledger, which is the side I care about as a builder. That 87.5% on ARC-AGI came in high-compute mode at **roughly 172× the compute** of its low-compute setting; the ARC Prize team's figures put that in the thousands of dollars per task. The same model, same weights, spans about a 170× cost range purely based on how hard you let it think. Pricing makes it concrete: o1 runs **$15 per million input tokens and $60 per million output**, while o3-mini lands around **$1.1 input / $4.4 output** — on the order of 13× cheaper on output. o1-pro sits at $150 / $600. And you don't just pay for the final answer; reasoning models emit large volumes of hidden reasoning tokens that you are billed for and that your user waits on.

Google's Gemini report gives the cleanest demonstration of the dial itself. Expanding the "thinking budget" from 1,024 to 32,768 tokens lifted AIME 2025 accuracy from **65% to 88%** — on one model, same weights, just more room to deliberate. That is the product lever in its purest form: a slider between cost/latency and quality, with a measured response curve.

So the reframe I keep pushing on teams is this. System 1 versus System 2 is no longer a property of the model you picked. It's a *per-request budgeting decision*. You are not choosing a smart model once; you are deciding, thousands of times a second, how much deliberation to buy for *this* request.

## When slow thinking earns its keep — and when it's a tax

Both the research and the vendors converge on the same rule, and it's refreshingly boring: allocate by difficulty.

Spend the System-2 budget when the task has multiple dependent steps, simultaneous constraints to satisfy, math or code that has to actually check out, plan-then-execute structure, or multi-tool agentic work — anywhere a single forward pass is brittle. Snell's result says the hardest prompts justify the most search; Gemini's own guidance frames reasoning mode as a task-selection choice, not a universal upgrade.

Use the fast System-1 path for short summaries, rewrites, classification, extraction, routine chat, and anything high-volume or latency-sensitive. On that traffic, first-pass quality is usually already fine, and users feel the latency far more sharply than they'd feel the marginal quality gain. My support bot checking its own work before reciting store hours is the canonical anti-pattern: it paid full freight for deliberation on a question that needed none, and the four-second wait was pure negative value.

And here's the honesty beat I insist on including, because the hype skips it. Extra thinking is not a free accuracy guarantee. A long reasoning trace can be perfectly coherent and built on a false premise. A visible chain of thought is an *explanation*, not a *proof* — it can rationalize a wrong answer as fluently as a right one. The benchmarks prove it: o3's 25.2% on FrontierMath is a genuine leap, and it still means failing roughly three of every four research-grade problems. ARC's own creators pointed out that o3 still flubs spatial puzzles a child solves, and that crossing their threshold did not make it AGI. More compute buys you a better *distribution* of answers, not certainty. Treat it as a probabilistic lever, not a magic wand.

## The architecture: a router that decides per request

![A router inspects each incoming request and sends it down the fast System 1 path (one forward pass, low cost) or the slow System 2 path (chain-of-thought, tool use, extra inference-time compute) before returning a response](https://mukundmurali-mm.github.io/hashnode-blogs/system-one-router-diagram.png)

If the real decision is per-request allocation, then the real product artifact is the thing that makes that decision. I've come to think of it less as a model and more as an air-traffic controller — the phrase IBM Research uses for LLM routers, and it fits. Each query gets directed to the cheapest path likely to answer it well. IBM reports that routing can cut inference cost by *up to about 85%* simply by diverting easy queries to smaller, faster models. For anyone who has stared at an inference bill, that number alone justifies the engineering.

There are two router families, and they map cleanly onto the tradeoff you already understand from every other part of systems design:

- **Audition / non-predictive routers** actually run candidates and verify the output. More accurate, because they look before they commit — but they add the very cost and latency you were trying to avoid.
- **Predictive routers** decide *before* inference, from the query alone. Fast and cheap, but weaker on out-of-distribution requests they've never seen the shape of.

That's a caching-versus-recomputation tradeoff wearing new clothes, and it rewards the same instincts: predict when you can be confident, audition when the stakes or the uncertainty are high.

The frontier, which I'd treat as directional rather than settled, is "routing as reasoning." Instead of pinning each model at a fixed quality/cost point, newer routers model each one as a *quality-versus-thinking-budget curve* and jointly choose both the model and how large a thinking budget to grant it. The decision stops being "which model" and becomes "which model, at what depth." The vendors are already shipping the primitive: Gemini 2.5 Flash is explicitly a hybrid reasoning model with a controllable thinking budget "controlling the tradeoff between quality, cost, and latency," while the Flash-Lite tier is the fast, non-thinking path. The product decision is becoming a dial, not a dropdown.

And this is where LeCun's amortization idea pays off in production. When your System-2 path grinds through an expensive, hard query, don't throw the result away — cache it, distill it, fold it into a cheaper path. Recurring hard questions become fast lookups over time. Your slow system should be quietly teaching your fast one. The best routing architectures I've seen aren't static classifiers; they get cheaper as they learn which deliberations were worth it.

## What this changes about how I build

Three habits have come out of thinking this way, and I'd offer them to anyone building on top of these models.

First, instrument difficulty before you instrument models. If you can't estimate, even crudely, how hard an incoming request is, you have no basis for allocating deliberation and you'll either overpay on everything or underperform on the hard tail. The router is only as good as its difficulty signal.

Second, treat the thinking budget as a first-class product parameter with its own SLOs, the way I'd treat a timeout or a retry policy on any network call. "How long may this request think, and how much may it spend?" belongs in your config next to latency budgets — not buried as a model default you forgot you accepted.

Third, make slow thinking auditable, not just visible. A reasoning trace that's shown to a user is a feature; a reasoning trace that's logged, sampled, and checked against outcomes is an *engineering control*. The gap between those two is where quiet, expensive, confident wrongness lives.

The topic I set out to write about was called the "System One Model," and I spent a while trying to decide which single model deserved that title. That turned out to be the wrong question. There is no one model. The thing worth building — the real System One Model — is the router and the budget policy that decide, for each request, whether to answer in a fast reflex or to stop and think it through.

So here's the question I'd leave you with, the one I ask myself before shipping anything now: if you looked at a day of your product's traffic, how much of your reasoning spend went to requests that never needed it — and how many of your fast, confident wrong answers were hard questions you simply never slowed down for? Most teams can't answer that yet. The ones that can are about to build much better products than the rest of us.
