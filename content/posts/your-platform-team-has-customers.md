---
title: "Your Platform Team Has Customers: Treating Internal Infrastructure as a Product"
datePublished: "2026-10-02"
slug: "your-platform-team-has-customers"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
excerpt: "An internal developer platform lives or dies on product discipline, not technical merit. The developers who use it are customers — and they will route around anything that is harder than the workaround."
tags:
  - "Platform Engineering"
  - "DevOps"
  - "Terraform"
  - "Developer Experience"
  - "Product Management"
---

# Your Platform Team Has Customers: Treating Internal Infrastructure as a Product

A capability ships with good intent. There's a launch channel, a demo, maybe an internal talk. A few months later teams start bypassing it. Exceptions multiply. Support load creeps up. And the platform team — the one that built something genuinely clever — quietly becomes a ticket queue. Microsoft's architecture team described that arc almost exactly in a 2025 write-up, and if you've worked anywhere near infrastructure you've watched it happen in real time.

I came up through networking and cloud infrastructure, most of it in and around OCI, before moving into AI product leadership. That path left me with a bias I'll own up front: I stopped believing that the quality of the platform predicts its adoption. The best-engineered internal system I've seen struggle did so for the dullest reason imaginable — nobody could find it, nobody trusted it, and the DIY path was shorter. The worst-engineered one that *won* did so because it saved a developer twenty minutes on the thing they did ten times a day.

Here's the thesis I want to defend: **an internal developer platform is a product, and the developers who use it are its customers.** It wins or loses on product discipline — knowing your users, cutting friction, measuring adoption — not on technical merit. The Terraform modules and golden paths your team ships *are* the product. Treat them like one, or watch people route around them.

> **TL;DR**
> - "Build it and they will come" is still the single most common adoption strategy (36.9% of orgs) and it does not work.
> - Platforms can actively hurt you: DORA 2024 found a **~8% throughput decrease** among platform users, worst when mandated across the whole lifecycle.
> - Shadow IT is a signal, not a crime. 60% of orgs built software outside IT oversight last year. Nobody builds a workaround for a problem they don't have.
> - Measure like a product (activation, time-to-first-success, voluntary adoption, DevEx/SPACE) — not ticket volume or features shipped.
> - Golden paths beat gates. Mandates relocate the cost; they don't remove it.
> - Terraform modules are the concrete example: reusable modules die on the shelf unless they're discoverable, documented, versioned, and genuinely easier than DIY.

---

## "Build it and they will come" is a budget line, not a strategy

Start with the uncomfortable data. Humanitec's State of Platform Engineering survey found that the most common approach to driving adoption is to not drive it at all: **36.9% of organizations take a "build it and they will come" posture**, versus 25.1% who run actual platform advocacy and roughly 17% who simply mandate usage. The report's own language is blunt — "'build it and they will come' is not a viable strategy for driving platform adoption."

Thoughtworks reached the same conclusion years earlier when it put platform engineering product teams in the *Adopt* ring of its Technology Radar, and warned that "'build it and they will come' might end up as a wasted effort." Their framing stuck with me: platform teams, they wrote, "aren't special in this regard. They're just another product team, albeit one focused on internal platform customers." Platforms built in a vacuum — without a clearly defined customer — fail.

If passive hope were merely neutral, you could tolerate it. It isn't. The 2024 DORA report is the strongest cautionary data point I know of. Even though **89% of respondents use an internal developer platform**, DORA measured an **~8% decrease in throughput** and reduced delivery stability among platform users — "particularly when mandated for the entire application lifecycle." Their conclusion wasn't that platforms are bad. It was that platforms need "user-centricity, developer independence, and a product-oriented approach" to pay off. A platform is not automatically good. Build the wrong one, or push the right one the wrong way, and you can measurably slow your organization down.

The deeper problem is that most adoption is coerced, not chosen. Humanitec's Vol. 3 found **35.80% of orgs drive adoption through "extrinsic push"** — usage is often mandated — while only **28.40% see "intrinsic pull,"** where developers genuinely find the platform valuable on its own merits. Extrinsic push is a low-maturity signal. It's the organizational equivalent of propping a door open with a chair: it works until someone moves the chair.

And adoption stagnation is predictable. Teams that never assign product ownership consistently find that adoption flatlines about six months after launch, because the initial feature set covers the easy cases while the hard cases — the ones developers actually hit — never get addressed. That's not an engineering failure. It's the absence of a product function.

---

## Know your users, or they'll build their own

internaldeveloperplatform.org puts it as plainly as I'd want to: "Developers are therefore the internal customers of platform teams," and successful teams "treat their platform as a product and build it based on user research, maintaining and continuously improving it." Camille Fournier — who co-authored O'Reilly's *Platform Engineering* and ran platform at Two Sigma — frames the core challenge as understanding how customers *actually* use the product, and warns against the reflex of copying another company's tools (Google's, usually) without the ecosystem and culture that made them work.

So who are your customers? They are not one persona. Spotify is the clearest public example here: they maintain **seven distinct golden paths** — backend, client, data engineering, data science, machine learning, web, and audio — precisely because "many squads [have] very different needs." A single opinionated path that serves backend services beautifully is a dead end for a data science team. Persona-awareness isn't a nice-to-have bolted onto the platform; it's baked into the golden-path idea itself.

The friction that pushes developers to roll their own is rarely a missing capability. DevEx research finds that the highest-friction interactions are interface problems, not capability gaps: the tools exist, but the documentation is scattered, the onboarding path is unclear, and the first attempt to do anything new requires a ticket to the ops team. That last clause is the killer. The moment "do a new thing" means "wait on a human," you've taught your customer that the official path is the slow path.

Which brings me to shadow IT, and the single most useful reframe in all of this. Retool's 2026 Build vs. Buy report (817 respondents) found that **60% built software outside IT oversight in the past year**, a quarter did so frequently, and **35% had replaced at least one SaaS tool with something homegrown.** The instinct is to treat that as a governance failure to stamp out. The better read, from the same analysis: "A map of your shadow tools is a map of where your real systems are failing… Nobody builds a workaround for a problem they don't have."

Think about the economics for a second, because they're rational. People don't build shadow tools for fun. They build them because the official system has a gap they hit every day, and the cost of living with that gap exceeds the friction of building around it. Banning shadow IT doesn't stop it — it drives it underground. Workers aren't bypassing the platform to be difficult; they're bypassing friction to do their jobs. If you're a platform owner, your shadow-IT inventory is the most honest backlog you'll ever get. It's your customers telling you, with their own weekends, exactly where you're losing.

![The Bypass Loop vs. the Product Loop: how product discipline turns a platform developers route around into one they choose](https://mukundmurali-mm.github.io/hashnode-blogs/your-platform-team-has-customers-diagram.png)

---

## Measure adoption like a product, not a help desk

If the developers are customers, then the metrics that matter are product metrics. The trap is measuring the things that are easy to count instead of the things that indicate value.

The two frameworks worth internalizing are SPACE and DevEx. SPACE's defining insight is that productivity "cannot be reduced to a single dimension (or metric!)" — it spans Satisfaction & well-being, Performance, Activity, Communication & collaboration, and Efficiency & flow. Any single-number view of a platform's success is gameable and usually wrong. DevEx gives you the "what to measure" model: three dimensions — feedback loops, cognitive load, and flow state — paired with North Star KPIs, and an insistence on combining *perceptual* data (surveys) with *workflow* data (system telemetry). DevEx also debunks a comfortable misconception: that developer experience is primarily about tools. Human factors matter just as much.

The business case for taking this seriously isn't soft. The DevEx paper cites a 2020 McKinsey finding that companies with better developer work environments achieved **4–5x greater revenue growth** than competitors (McKinsey 2020, via Noda et al. 2023), and notes Gartner's report that **78% of organizations have a formal DevEx initiative** established or planned. DORA's own data runs in the same direction: internal documentation quality showed roughly a **13x impact** on organizational performance, and user-centricity correlated with around a **40% increase** in organizational performance (both originating in the 2023 report and restated since).

So what do you actually track? The platform community keeps converging on the same set: time to provision a service, time for a new hire to submit their first production change, golden-path adoption rate, and platform NPS — with a practitioner target of a new service going from zero to production in under four hours. Notice what's missing: ticket volume. The failure signature of a platform team is becoming a ticket queue, so the fix is to measure time-from-request-to-fulfillment and make *that* a platform OKR — flow and self-service, not throughput of a queue you shouldn't want to exist.

Here's the honest part. Most teams can't do this yet. Humanitec found **42.50% of orgs have only ad hoc, inconsistent feedback mechanisms**, and just **10.42%** have fully integrated, data-driven measurement. That gap is the single biggest reason platforms can't be managed like products: you can't run a product on vibes and a launch date.

### Table B — Vanity metrics vs. product metrics

| Vanity metric (avoid as a goal) | Why it misleads | Product metric (use instead) |
|---|---|---|
| Ticket volume handled | Rewards being a queue; hides self-service failure | Time-from-request-to-fulfillment; % self-service |
| Number of platform features shipped | "Boil-the-ocean"; features ≠ value | Golden-path adoption rate (voluntary) |
| Lines of IaC / modules published | Shelfware risk; unused modules | Module reuse / instantiation count; on-path vs off-path |
| Raw deployment count | Single-dimension; gameable (SPACE caution) | SPACE blend across ≥2 dimensions; DevEx KPIs |
| "Platform is live" | Launch ≠ adoption | Time-to-first-success; new-hire time-to-first-prod-deploy |
| Headcount using it (mandated) | Coerced usage masks dissatisfaction | Platform NPS + qualitative; retention / drift rate |

*Sources: SPACE 2021; DevEx 2023; HLD Handbook 2026; Khomutov 2026; Microsoft/Azure 2025.*

---

## Golden paths, not gates

This is where I've changed my mind the most over the years. I used to think the job of an infrastructure team was to enforce the right thing. It isn't. The job is to make the right thing the easiest thing, and then let people choose it.

Optionality turns out to be a design requirement, not a kindness. The CNCF Platforms white paper lists "optional and composable" as a core attribute. Spotify states it directly: "If you are an adventurer you can of course leave the Golden Path and do your own thing, but then you will not have the same support." Netflix's "paved road" is the canonical version of this — it "is not mandated; it is made far better than the alternatives so teams choose it voluntarily." A golden path is the recommended, platform-team-supported way, and deviations are allowed — the team that deviates simply carries the support cost itself.

Even Gartner, not an organization prone to romanticizing developer autonomy, lands on enablement: a platform should "identify, support and encourage good practices — and not be prescriptive," offer a user-friendly paved road, be modular, and be "product-managed and focus on features that meet the needs of the many, rather than the few."

The reason mandates fail is subtle and worth sitting with: a mandate doesn't remove the cost of a bad platform, it relocates it. "A platform people use reluctantly costs more than no platform at all: you pay both for the infrastructure and for the workaround the teams will build anyway." You thought you were buying compliance. You bought resentment plus a shadow system. And the success test for a paved road isn't compliance at all — it's whether the team *chose* the path freely. If they did, the path works. If they didn't, you built internal bureaucracy with a nice portal. As one practitioner put it, adoption rate matters more than any technical metric.

None of this means abandoning guardrails. The teams doing this well draw the enforcement line at **data classification, not individual tools** — public data flows freely, sensitive data triggers a short mandatory check — treating guardrails as a green light for safe work rather than a red light on everything. And they keep a sanctioned escape hatch: an explicit deviation process (an RFC or review) that feeds the improvement *back into the path*. Deviation becomes a product-discovery mechanism instead of a crack in the wall.

### Table A — Mandate (gate) vs. paved road (enablement)

| Dimension | Mandate / Gate | Paved Road / Golden Path |
|---|---|---|
| Developer choice | Required; no sanctioned alternative | Optional — the easiest path, not the only one |
| How adoption is won | "Extrinsic push," enforcement, policy | "Intrinsic pull" — genuinely better than DIY |
| Cost of deviation | Escalation / exception bureaucracy | Deviator carries their own support cost |
| Where control lives | Application layer (unenforceable) | Infrastructure layer (scales) |
| Typical outcome | Resentment, malicious compliance, shadow IT | Voluntary adoption, less fragmentation |
| DORA signal | Throughput / stability dip when mandated lifecycle-wide | Productivity gain when user-centered + self-service |
| Success metric | % compliance | % *voluntary* adoption, drift rate |
| Failure mode | Platform-as-kingdom / ticket queue | Golden path unmaintained → decays to a wiki |

*Sources: DORA 2024; Humanitec Vol. 3 2024; Gartner; Khomutov 2026; Spotify 2020; CIO Grid 2025; HLD Handbook 2026.*

---

## The concrete case: Terraform modules are a product

Let me ground all of this in the artifact I know best, because abstractions about "product thinking" dissolve the moment you touch real infrastructure code. A reusable Terraform module is as close as platform engineering gets to a shippable product unit. And here's the thing — HashiCorp's own guidance already reads like a product spec. It just doesn't advertise itself that way.

Start with discoverability. HashiCorp's framing is literally "modules as a product": publishing to a registry "will version your module, generate documentation, and more," making modules "easily consumed." The private registry is described as "a searchable, filterable way to manage your modules" that lets consumers browse and search for what fits their use case. That is a product catalog by another name. A module nobody can find is shelfware, no matter how elegant its HCL.

Versioning is non-negotiable, and it's a trust mechanism, not a bookkeeping one. Modules "must follow semantic versioning"; the recommended practice is to tag releases, pin versions in production, and use the pessimistic constraint operator (`~> 5.0.0`) so consumers get patches but never surprise breaking changes. HashiCorp names the real stakes directly: a breaking change in a nested external module "can affect the parent module with no changes to the parent's calling code or version, thereby breaking the calling code's trust." *Breaking the calling code's trust.* That's product language. Backward compatibility and clear deprecation are commitments to your customers, not engineering niceties you get to skip under deadline.

Documentation and ownership ship *with* the module or they don't exist. The guidance: include a `README.md` at minimum, publish a change log each version, assign each module an owner, and review changes via pull request before release. If you've ever inherited an unowned module with no changelog, you know it's indistinguishable from dead code — you can't safely touch it, so you fork it, and now there are two.

Then the product test that matters most: is the module *genuinely easier than DIY*? HashiCorp's own MVP guidance is refreshingly disciplined about scope. Modules should "reduce deployment time, enforce security standards, and remove configuration duplication." Aim the first few versions at minimum-viable-product standards. Expose only the most commonly needed inputs. Target roughly 80% of cases, not every edge case. That is exactly the restraint a good PM imposes — ship the thing that serves the many, resist the pile of options that serves the few. The adoption failure mode I've watched most often is the over-parameterized module with forty variables that's technically more flexible than writing your own HCL and practically harder to use. Flexibility you have to read a wiki to operate is not a feature.

Finally, keep modules alive with a contribution model. HashiCorp recommends allowing pull requests on all module repositories, which "fosters a code community within the organization, keeps module content relevant… and helps maintain the registry's effectiveness in the long term." That maps directly onto CNCF's highest "participatory" adoption maturity — the state most orgs never reach. And this is the mechanism that closes the loop back to golden paths: Terraform modules are explicitly a golden-path delivery vehicle. HashiCorp's no-code modules let platform teams define golden-path modules that developers instantiate "without writing any Terraform configuration." The paved road, made of HCL someone else maintains.

Every property on that list — discoverable, documented, versioned, owned, scoped to the common case, open to contribution — is a product property. None of it is about writing cleverer Terraform. It's about treating the module as something a customer has to find, trust, and prefer over doing it themselves.

---

## Go ask your three heaviest users what they bypassed last week

If there's one move I'd push any platform owner to make, it's this: find your three heaviest users and ask them what they worked around in the last week. Not what they want in the roadmap — what they already *built around you*. That conversation will tell you more than a quarter of planning, because every workaround is a customer voting with their time against the path you shipped.

The whole discipline compresses to a single reframe. Your developers are not your subordinates and they're not a captive audience. They're your customers, and if your platform doesn't solve their problem they'll route around it — quietly, rationally, and permanently. The platforms that win don't win because the engineering is better. They win because someone treated the Terraform modules and golden paths as a product with customers worth understanding, measured adoption instead of activity, and made the right path the easy one.

Build it and they will come is a budget line. Making it genuinely easier than the workaround is the strategy. Pick the second one.

---

## Sources

- DORA / Google Cloud, 2024 Accelerate State of DevOps Report — https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report ; infographic https://dora.dev/research/2024/2024-DORA-Report-Infographic.pdf
- Humanitec, State of Platform Engineering Vol. 2 (2023) — https://humanitec.com/whitepapers/state-of-platform-engineering-report-volume-2
- Humanitec, State of Platform Engineering Vol. 3 (2024) — https://5890440.fs1.hubspotusercontent-eu1.net/hubfs/5890440/State%20of%20Platform%20Engineering%20Volume%203/State%20of%20Platform%20Engineering%20Report%20Volume%203.pdf
- Thoughtworks Technology Radar, "Platform engineering product teams" (2021) — https://www.thoughtworks.com/radar/techniques/platform-engineering-product-teams
- Microsoft, "Golden Paths Are a Product. Treat Them Like One." (2025) — https://techcommunity.microsoft.com/blog/azurearchitectureblog/golden-paths-are-a-product-treat-them-like-one-/4533707
- internaldeveloperplatform.org — https://internaldeveloperplatform.org/what-is-an-internal-developer-platform
- Camille Fournier, InfoQ (2020) — https://www.infoq.com/news/2020/08/fournier-internal-platform
- Spotify Engineering, golden paths (2020) — https://engineering.atspotify.com/2020/08/17/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem
- Retool 2026 Build vs. Buy, via Logic Square — https://logic-square.com/logic-square-com-insights-hidden-cost-of-shadow-it
- CIO Grid, shadow IT practitioner Q&A (2025) — https://ciogrid.com/qa/tame-shadow-it-in-the-enterprise-enable-speed-without-hidden-risk
- Forsgren et al., *The SPACE of Developer Productivity*, ACM (2021) — https://dl.acm.org/doi/10.1145/3454122.3454124
- Noda, Storey, Forsgren, Greiler, *DevEx: What Actually Drives Productivity*, ACM Queue (2023) — https://queue.acm.org/detail.cfm?id=3595878
- HLD Handbook, Platform Engineering (2026) — https://hld.handbook.academy/curriculum/reliability-and-operations/platform-engineering/
- Gartner, Platform Engineering — https://gartner.com/en/infrastructure-and-it-operations-leaders/topics/platform-engineering
- Khomutov, "Golden Path as Product" (2026) — https://axyi.ru/en/golden-path-as-product-tvp/
- HashiCorp, Publishing Modules — https://developer.hashicorp.com/terraform/language/modules/develop/publish
- HashiCorp, Module creation recommended pattern — https://developer.hashicorp.com/terraform/tutorials/modules/pattern-module-creation
- HashiCorp, Well-Architected Framework (modules) — https://docs.hashicorp.com/well-architected-framework/define-and-automate-processes/define/modules
- resumelens.org, Platform engineering analysis (2025) — https://resumelens.org/blog/devops/platform-engineering-and-internal-developer-platforms
