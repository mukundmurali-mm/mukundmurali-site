---
title: "How I Reached My Always-On Agents From Outside My Home Network"
datePublished: "2026-11-22"
slug: "reaching-always-on-agents-with-tailscale"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
excerpt: "My agents run on a Mac mini at home and my router lets nothing in. A Telegram bot got me part of the way. Tailscale got me the rest, and reading how it works is what made it click."
tags:
  - "Tailscale"
  - "AI Agents"
  - "Networking"
  - "Self-Hosting"
  - "WireGuard"
---

# How I reached my always-on agents from outside my home network

> **TL;DR**
> - My agents run on a Mac mini behind a router that lets nothing in from outside. A Telegram bot reached Hermes, but nothing else.
> - Tailscale puts my phone and Mac on a private, encrypted network. Setup was two apps and one login, with nothing opened on the router.
> - It works because a central server only swaps public keys. The traffic itself goes device to device, encrypted with keys that never leave those devices.
> - A private network is only as private as its members: anything that can reach Pi Pocket can steer it.

A Grok bot is simply there when I pick up my phone. I'd been testing OpenMauseBot as a chief of staff partly to see how the two compare, and the difference that bothered me most had nothing to do with how smart either one was. Mine ran on a Mac mini at home, and the moment I walked out of the house I couldn't reach it.

That Mac mini runs three agents: Hermes, OpenMauseBot and Pi Pocket. Hermes is my general assistant, with access to my files, terminal and email. OpenMauseBot is the chief of staff I'm testing. Pi Pocket is a web app for driving a coding agent from a browser. At my desk all three work well enough. Away from home they sit behind my router, which lets nothing in from outside, and I wanted to keep it that way. Pi Pocket in particular can run commands on the Mac as me, so opening a port to the internet for it was never going to happen.

## The first workaround: a Telegram bot

In mid-November I connected Hermes to Telegram so I could talk to it from my iPhone. I set it up from the Hermes desktop app, and the bot only answers my own Telegram account, which matters for something that can run commands on my Mac.

It also solved the networking problem without me thinking about it. A bot doesn't need a connection into your home network. Hermes on the Mac polls out to Telegram, and Telegram carries the messages between my phone and the machine. Nothing is exposed, and my phone needed no extra app. For quick questions it worked well, and Hermes can send the results of scheduled jobs to the same chat.

Then I started running into the edges.

- I asked whether I could call it. You can't. Telegram bots can't take voice or video calls, so the closest thing is a voice note.
- It only answers while the Mac is on, awake and online. When the connection drops, the gateway log fills with lines like "Telegram network error, reconnecting in 10s".
- It only ever reaches Hermes. Pi Pocket is a web app, and a Telegram chat can't open it.
- Every message passes through Telegram's servers, and bot chats aren't end-to-end encrypted. That's fine for questions about the weather, less so for an agent that can run commands on my computer.

What I wanted was the real thing: my phone talking to my Mac as if I were sitting next to it.

![Before and after: a chat window in the middle, or a private tunnel straight to the Mac.](/images/tailscale/01-telegram-vs-tailscale.svg)

## Then Tailscale

I went looking for a better way. The usual options all give something up: port forwarding opens a hole in the firewall, and a public tunnel hands out a link anyone can try. Then I kept running into the same answer: blogs and tutorials about reaching agents from outside your network securely kept suggesting Tailscale. I installed it for my agents, my phone could reach my Mac a few minutes later, and I had no idea why it worked. That bothered me enough to go and read how it works.

This post is what I learned, in the order that finally made it make sense to me. Nearly all of it comes from Tailscale's own write-up, [How Tailscale works](https://tailscale.com/blog/how-tailscale-works), which I'd recommend reading in full.

## Layer one: WireGuard

Tailscale starts from WireGuard, an open source VPN protocol that makes small, fast, encrypted tunnels between two machines.

Most VPNs, WireGuard ones included, use a hub and spoke layout. Every device connects to one central server, which passes traffic along. It's simple, but the hub becomes a bottleneck, and if it's far from both ends your traffic takes a detour for no reason. Tailscale's post gives the example of someone in New York reaching a server in New York by way of a head office in San Francisco.

WireGuard's tunnels are light enough that you can skip the hub and build them between every pair of devices. That layout is a mesh, and it means my phone talks directly to my Mac.

![Hub and spoke sends everything through one point. A mesh connects devices directly.](/images/tailscale/02-hub-vs-mesh.svg)

The catch is that a mesh is a lot of bookkeeping. Every device needs the public key and current address of every other device, and those change whenever a phone moves between wifi and mobile data. Doing that by hand for even ten devices means ninety tunnel configurations. The rest of Tailscale exists to take that work away.

## Layer two: a coordination server that only holds keys

Each device generates its own key pair when it joins. The private key stays on the device and never leaves it. The public key goes to a coordination server, along with a note on where the device can currently be found. The device then downloads the public keys and addresses of the other devices in my account and configures WireGuard with them.

This is the part that made me stop worrying. The coordination server is hub and spoke, but it carries almost no traffic. It's a drop box for public keys and policy. My actual data goes straight between my phone and my Mac, encrypted with keys that only those two devices hold. Tailscale's servers can't read it.

![Keys go through the coordination server. My traffic never does.](/images/tailscale/03-control-vs-data-plane.svg)

It also explains how login works. Tailscale doesn't run its own password system. It hands sign-in to an identity provider you already use, such as Google or Microsoft, so there is no separate VPN account to look after. Installing the app and signing in is what creates the drop box for my devices. That's why the setup took two apps and one login.

## Layer three: getting through the router

So far the story assumed every device was reachable. Mine isn't. A router doing NAT lets the devices behind it start connections out, but not strangers start connections in. My Mac is behind my home router and my phone is on a mobile network behind another one. Neither has an open port.

Tailscale uses techniques based on the STUN and ICE standards to get the two devices to connect anyway, without anyone touching a firewall. The details are in a separate post on NAT traversal that I haven't fully absorbed yet. The practical result is that I never configured port forwarding, and nothing on my router had to change.

When I ran `tailscale status` on the Mac, my phone was listed as a direct connection. That is the good outcome, with no middleman in the path.

There is a fallback for when direct fails, because some networks block UDP or are strict enough that nothing gets through. Tailscale runs relay servers called DERP. Traffic still travels encrypted, with keys the relay never sees, so a DERP server can only pass along bytes it cannot read. I haven't needed one yet.

![Both devices sit behind NAT. Tailscale tries a direct path first and falls back to a relay.](/images/tailscale/04-nat-traversal-and-derp.svg)

## Layer four: who is allowed to talk to what

This was the part I cared about most, given what Pi Pocket can do. The coordination server only gives a device the public keys of the devices that are supposed to reach it. Everyone else on the internet can't even attempt a connection, because their packets can't be decrypted without the right key. To a stranger, my Mac doesn't exist.

![A device without the right key can't even start a connection.](/images/tailscale/05-who-can-reach-what.svg)

On top of that, you can write access rules, and each device enforces them itself on incoming traffic. If there is no rule allowing a connection, it is dropped. I haven't written any rules yet, since my tailnet only holds my own devices, but I now know where to start if I ever add someone else.

One warning from my own setup, not from Tailscale's post: a private network is only as private as its members. Anything that can reach Pi Pocket can steer it, so I don't share my tailnet, and I picked Tailscale over a public tunnel for that reason.

## What I actually ran

Setup was short. On the Mac:

```bash
brew install --cask tailscale   # then open the app and sign in
tailscale status                # lists my devices once the phone has joined
```

On the phone I installed the Tailscale app, signed in to the same account and switched the VPN on. Then I started Pi Pocket in one of its two Tailscale modes:

```bash
cd ~/pi-pocket
npm start -- --access tailscale         # plain http on the tailnet address
npm start -- --access tailscale-serve   # https at the machine's tailnet name
```

Plain http worked straight away, and the tailnet encrypts it anyway. The https mode needs two extra things: MagicDNS and HTTPS certificates turned on in the Tailscale admin console, and your user set as the operator with `sudo tailscale set --operator=$USER`. It also failed for me at first, for a dull reason. My copy of Pi Pocket was too old to have that mode at all, and it took me a while to stop blaming Tailscale.

The remaining problem is restarts. If the Mac reboots while I'm away, the apps only come back if the disk is unlocked and a user is logged in, and FileVault gets in the way of both. That deserves its own post.

## What I took away

I started out wanting my agents reachable from my phone, and I ended up understanding a decent chunk of how modern networking gets around NAT. The design is clever in a practical way. A central server handles identity and keys, and it never touches the traffic. The traffic itself goes device to device, and every device decides for itself what it will accept.

If you run anything at home that you'd like to reach from outside, the first two devices take about two minutes, as Tailscale says in its own post. I'd add one thing it doesn't: check what your app does before you decide who gets onto the network.

*Source: [How Tailscale works](https://tailscale.com/blog/how-tailscale-works), Tailscale. Explanations above are my own summary; the Tailscale post has the diagrams and the full detail.*
