---
title: "Building Nibblify: What I Learned Turning Long Tutorials Into Bite-Sized Daily Episodes"
datePublished: 2026-09-30
slug: building-nibblify
coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
tags: ["Learning", "Product", "AI", "Python", "SideProject"]
---

A while back I shared Nibblify here when it was barely an idea — a sketch of a thing I wished existed. Since then I actually built it, shipped a desktop version, threw away one of my core assumptions, and learned a fair bit about where the hard parts really live. This is the honest follow-up: what I built, what I got wrong, and what the whole exercise taught me about finishing anything long.

Consider this the "so what happened with that?" post. If you read the early idea and thought *sure, everyone says that* — fair. Ideas are cheap. Here's the part that wasn't.

## The problem I couldn't stop noticing

I have a graveyard of half-watched tutorials. A four-hour FastAPI deep-dive, paused at minute 38. A systems-design lecture I "started." A conference talk I bookmarked with genuine intent and never reopened. I call it the eternal pause: you stop a long video somewhere in the middle, and the tab quietly becomes a monument to the person you meant to become.

It turns out this isn't a me problem. It's the defining failure mode of self-directed learning.

The data is blunt. Free massive open online courses complete at **5–15%**, and that number has barely moved in over a decade. The foundational study — Reich and Ruipérez-Valiente in *Science*, 565 MIT and Harvard courses, 12.67 million registrations across 2014–2018 — found completion rates that simply did not improve even as the platforms got better. A 2024 replication in *Open Praxis* landed in the same 5–15% band. When learners are asked why they quit, the top reasons are lack of time (38%) and lost motivation (25%), and roughly **half of all dropouts happen in the first two weeks**.

Here's the part that reframed the whole project for me: the content is usually excellent. The instructors are great. The bottleneck isn't quality — it's **format**. Cohort-based courses with a fixed timeline complete at 40–70%. One-on-one tutoring hits 70–90%. Micro-learning units under two hours clear 80%. Same learner, same material, radically different outcomes, purely because the format added accountability and shrank the unit of progress.

That's the entire thesis of Nibblify in one sentence: **you don't need better tutorials, you need a smaller commitment and a reason to come back tomorrow.**

![Nibblify episode list — a long video broken into bite-sized episodes](https://raw.githubusercontent.com/mukundmurali-mm/nibblify/master/screenshots/episode-list.png)

## What Nibblify actually does now

You paste a YouTube URL. Nibblify pulls the transcript, and instead of chopping it into arbitrary ten-minute slices, it reads the whole thing and splits it into **logical episodes** — each one a complete concept with a beginning and an end, a podcast-style title, and a two-to-three-sentence summary of what you're about to learn. Ten to thirty minutes each, but the length always follows the content, not a stopwatch.

Then you watch one a day. The built-in player starts and stops at the episode's exact boundaries and layers its own progress bar on top of the video. You mark the episode done, the app tracks your progress across the whole library, and tomorrow you come back for episode two. That's the loop. A four-hour tutorial stops being a four-hour cliff and becomes twelve manageable steps.

Since the first idea post, it's grown a few things I'm genuinely happy with: a **timestamped notes panel** (jot a thought at the current second, jump back to it later), a scrubbable **episode timeline**, light/dark/system theming, and — the big one — it's now packaged as a **desktop app** with a one-command installer, not just something you run out of a dev folder. All your data stays local in a small SQLite file; nothing leaves your machine except the transcript fetch and the model call.

The architecture is deliberately boring, which I now consider a compliment.

![Nibblify architecture: from YouTube URL to daily episodes](https://mukundmurali-mm.github.io/hashnode-blogs/building-nibblify-diagram.svg)

## The stack, and why each piece is dull on purpose

The backend is **FastAPI** with **SQLite via SQLAlchemy** — three models: Video, Chunk (an episode), and Note. Transcripts come from `youtube-transcript-api`, trying English first and falling back to any available language, with title and thumbnail from YouTube's oEmbed endpoint. The frontend is **React, Vite, and Tailwind**, and the whole thing is wrapped in an **Electron** shell for the desktop build.

None of that is exciting, and that's the point. On a solo project, every "interesting" technology choice is a future evening spent debugging instead of building. I spent my novelty budget in exactly one place: the part that decides where episodes begin and end. Everything else I picked because I could stop thinking about it.

## The thing I got wrong: I thought the split was the easy part

My original mental model was embarrassingly naive. *Take the transcript, cut it every fifteen minutes, done.* Fixed chunks. It felt obviously correct until I watched the result.

Fixed chunks are terrible. They guillotine a sentence mid-explanation. Episode three ends right before the payoff and episode four opens with a conclusion to something you can't remember. The whole promise — that each episode is a self-contained, satisfying unit — collapses the moment you slice by the clock instead of by meaning.

So the real work became: **find the logical seams.** Where does one topic actually end and the next begin? That's not a string operation. That's comprehension. The instruction I give the model is explicit about this — episodes should be roughly 10–30 minutes, but *always follow content logic over time targets*, cover one complete concept, and come with a real title and summary. The times are secondary. The coherence is the product.

Getting a model to do this reliably surfaced three lessons I keep relearning.

## Lesson one: models lie about JSON, so don't trust the envelope

I ask for a clean JSON object. Sometimes I get one. Sometimes I get JSON wrapped in a markdown code fence. Sometimes there's a cheerful sentence of preamble — "Here are the episodes you requested!" — that quietly breaks `json.loads`.

The fix isn't a better prompt; it's refusing to trust the output. My parser tries a strict parse first, then hunts for the outermost `{...}`, then falls back to finding the outermost `[...]`, and only gives up after all three fail. It's not elegant. It's defensive, and defensive is what ships. Any time you put an LLM in the middle of a pipeline, assume the format contract is a suggestion and build the guardrail yourself.

There's a second, sneakier version of this: the model reliably drifts on the *final* timestamp — it'll end the last episode a few seconds short of the actual video length. So I stopped trusting it there too and just force the last episode's end time to the true duration. Small thing, but "watch the whole thing" only works if the last episode actually reaches the end.

## Lesson two: transcripts are messier than the demo

The happy path — English captions, cleanly returned — is maybe 70% of real videos. The other 30% is where the user-facing quality lives. Captions disabled entirely. Auto-generated captions in a language I didn't expect. Videos where the transcript exists but under a language code I wasn't asking for.

So the transcript layer tries English variants first, then falls back to whatever the video actually has, and turns the two common failures — disabled transcripts, no transcript found — into plain-English errors instead of a stack trace. And because some lectures are genuinely enormous, I truncate the transcript at 150k characters before it goes to the model. Not glamorous. But the difference between a tool people trust and one they abandon is almost entirely in how it behaves when the input is ugly.

## Lesson three: the pivot I didn't expect — off Claude, onto a pluggable brain

Here's the honest one, and the reason I keep saying "verify before you write about your own project": the intelligence engine today is **not** what I originally built.

The first version leaned on the Claude Code CLI to do the transcript analysis — no API key to manage, and it was sitting right there on my machine. Convenient for me, on my laptop. But the moment I wanted other people to actually run Nibblify, that convenience became a wall: it assumed a specific tool installed a specific way, it wasn't portable, and it tied a general-purpose learning tool to one very particular local setup.

So I ripped it out and replaced it with a **provider abstraction** — one clean interface, two backends behind it. The default is **DeepSeek** over its OpenAI-compatible API (cheap, fast, bring-your-own-key). The alternative is **local Ollama**, for people who want the whole thing to run offline on their own machine with zero data leaving the building. You pick your provider in a settings screen; the rest of the app doesn't know or care which one answered.

That migration taught me more than any feature did. The comfortable choice for the builder — *what's easiest for me right now* — is very often the wrong choice for the user. Portability, "bring your own key," and an offline option weren't features I planned. They fell out of taking distribution seriously. And it's a good reminder that your own docs lie too: parts of my README still cheerfully described the old Claude-CLI approach long after the code had moved on. Docs drift is real, even on a project of one.

![Nibblify in light theme](https://raw.githubusercontent.com/mukundmurali-mm/nibblify/master/screenshots/light-mode.png)

## The bug that taught me to respect the iframe

One more war story, because it's the kind of thing that looks trivial and isn't. I had two separate player components — an inline one and a fullscreen "cinema" one. Toggling fullscreen swapped between them. Which meant the YouTube iframe got torn down and rebuilt every single time. Which meant the video restarted from the beginning of the episode the instant you went fullscreen. Infuriating, and exactly the moment a learner is most engaged.

The fix was to stop remounting: one `EpisodePlayer`, one iframe instance, and fullscreen just swaps CSS classes on the wrapper around it. The iframe never dies, so playback position survives. It's a two-component-into-one refactor that reads as a footnote in the commit log, but it's the difference between a player people tolerate and one they forget is there. The best UX work is usually invisible — you only notice its absence.

There's a related honest limitation I document rather than hide: the auto-stop uses YouTube's embed `start`/`end` parameters plus my own progress layer, so you have to use the in-app fullscreen, not YouTube's native fullscreen button, or the progress tracking detaches. I'd rather tell you that up front than have you discover it and assume the app is broken.

![Nibblify dark mode](https://raw.githubusercontent.com/mukundmurali-mm/nibblify/master/screenshots/dark-mode.png)

## Putting on the product hat

Strip away the code and this is a retention problem wearing an engineering costume. If I were building this as a product rather than a personal tool, the questions I'd actually care about are:

- **Does the format change behavior?** The whole bet is that episodes plus a daily cadence beat a single long video. The metric that proves or kills it is the share of added videos that reach 100% completion — measured against that grim 5–15% industry baseline.
- **Does it build a habit?** Day-2 and day-7 return rates are the real signal. Auto-stop and one-a-day only matter if people come back tomorrow. A tool you use once is a demo, not a habit.
- **How deep is engagement?** Notes created per episode is my proxy for "actually learning" versus "passively playing." Someone taking timestamped notes is a fundamentally different user than someone letting it run in a background tab.

I don't have a large-N answer to those yet — that's the honest state of it. But knowing *which* numbers would settle the argument is most of the battle, and it's the part I think engineers-turned-builders most often skip. It's easy to measure whether the code runs. It's harder, and far more useful, to decide up front what would prove the idea was worth building.

## What I'd tell myself before starting

Three things. **First, the hard part is never where you think it is** — I budgeted my effort for the video player and lost my weekends to episode boundaries and messy JSON. **Second, build for distribution embarrassingly early**; the Claude-CLI-to-provider-abstraction pivot would have been a shrug on day one and was a real refactor on day thirty. **Third, format eats content for breakfast** — the most leverage in learning tools isn't better material, it's a smaller unit of commitment and a reason to return.

Nibblify is open and runnable today: paste a URL, get your episodes, watch one tomorrow. If you've got a four-hour tutorial rotting in a browser tab right now, that's the honest test.

So here's the question I keep turning over, and I'd genuinely like your take: for adult, self-directed learning, how much of what we call a "motivation problem" is really just a **format problem** we've never bothered to fix? Because if it's mostly format — and a decade of flat completion data suggests it is — then the interesting work isn't making more content. It's making the content we already have finishable.
