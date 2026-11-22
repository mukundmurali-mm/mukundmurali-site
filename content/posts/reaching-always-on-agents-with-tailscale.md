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

I have a Mac mini at home running agents that are meant to stay on. Away from home, with only my phone, I couldn't get to them. The agents were working fine. I just couldn't reach them.

I run OpenMauseBot and Pi Pocket on that Mac, and the whole point of both is that they keep going when I'm not at the keyboard. At my desk that works well. Away from home, the machine was behind my router, which lets nothing in from outside, and I wanted to keep it that way. Pi Pocket in particular is a web app that can run commands on the Mac as me, so opening a port to the internet for it was never going to happen.

## The workaround: a Telegram bot

What I did instead was set up a Telegram bot as a gateway to my Hermes agent. It's a neat trick, and it works for a simple reason: a bot doesn't need anyone to connect to your home network. The machine at home reaches out to Telegram, and Telegram carries messages between my phone and the machine. Nothing is exposed, and my phone didn't need anything installed beyond Telegram, which was already there.

For quick questions and small tasks, it was good enough for a while.

But a chat window is a narrow way to reach an agent. I wanted the real interface, with my phone talking to my Mac as if I were sitting next to it.

![Telegram bot gateway compared with a direct Tailscale tunnel](/images/tailscale/01-telegram-vs-tailscale.svg)
*Before and after: a chat window in the middle, or a private tunnel straight to the Mac.*

## Then Tailscale

I went looking for a better way and found Tailscale online. I installed it for my agents, my phone could reach my Mac a few minutes later, and I had no idea why it worked. That bothered me enough to go and read how it works.

This post is what I learned, in the order that finally made it make sense to me. Nearly all of it comes from Tailscale's own write-up, [How Tailscale works](https://tailscale.com/blog/how-tailscale-works), which I'd recommend reading in full.

## The problem with reaching a computer at home

Your home computer has no fixed public address. It sits behind a router doing NAT, which is why outsiders can't start a connection to it. The usual fixes all give something up. Port forwarding opens a hole in your firewall. A public tunnel hands out a link anyone can try. A traditional VPN means a central server that everything flows through.

That last model is called hub and spoke. Every device connects to one hub and the hub passes traffic along. It's simple, but it has two costs. The hub is a bottleneck, and if it's far from both ends your traffic takes a detour for no reason. Tailscale's post gives the example of someone in New York reaching a server in New York by way of a head office in San Francisco.

## Layer one: WireGuard

Tailscale starts from WireGuard, an open source VPN protocol that makes small, fast, encrypted tunnels between two machines. The tunnels are light enough that you can build them between every pair of devices instead of routing everything through a hub. That layout is a mesh, and it means my phone talks directly to my Mac.

![Hub and spoke network compared with a mesh network](/images/tailscale/02-hub-vs-mesh.svg)
*Hub and spoke sends everything through one point. A mesh connects devices directly.*

The catch is that a mesh is a lot of bookkeeping. Every device needs the public key and current address of every other device, and those change whenever a phone moves between wifi and mobile data. Doing that by hand for even ten devices means ninety tunnel configurations. The rest of Tailscale exists to take that work away.

## Layer two: a coordination server that only holds keys

Each device generates its own key pair when it joins. The private key stays on the device and never leaves it. The public key goes to a coordination server, along with a note on where the device can currently be found. The device then downloads the public keys and addresses of the other devices in my account and configures WireGuard with them.

This is the part that made me stop worrying. The coordination server is hub and spoke, but it carries almost no traffic. It's a drop box for public keys and policy. My actual data goes straight between my phone and my Mac, encrypted with keys that only those two devices hold. Tailscale's servers can't read it.

![Control plane exchanges keys while the data plane carries encrypted traffic](/images/tailscale/03-control-vs-data-plane.svg)
*Keys go through the coordination server. My traffic never does.*

It also explains how login works. Tailscale doesn't run its own password system. It hands sign-in to an identity provider you already use, such as Google or Microsoft, so there is no separate VPN account to look after. Installing the app and signing in is what creates the drop box for my devices. That's why the setup took two apps and one login.

## Layer three: getting through the router

So far the story assumed every device was reachable. Mine isn't. My Mac is behind my home router and my phone is on a mobile network behind another one. Neither has an open port.

Tailscale uses techniques based on the STUN and ICE standards to get the two devices to connect anyway, without anyone touching a firewall. The details are in a separate post on NAT traversal that I haven't fully absorbed yet. The practical result is that I never configured port forwarding, and nothing on my router had to change.

When I ran `tailscale status` on the Mac, my phone was listed as a direct connection. That is the good outcome, with no middleman in the path.

There is a fallback for when direct fails, because some networks block UDP or are strict enough that nothing gets through. Tailscale runs relay servers called DERP. Traffic still travels encrypted, with keys the relay never sees, so a DERP server can only pass along bytes it cannot read. I haven't needed one yet.

![A direct connection through NAT with a relay as fallback](/images/tailscale/04-nat-traversal-and-derp.svg)
*Both devices sit behind NAT. Tailscale tries a direct path first and falls back to a relay.*

## Layer four: who is allowed to talk to what

This was the part I cared about most, given what Pi Pocket can do. The coordination server only gives a device the public keys of the devices that are supposed to reach it. Everyone else on the internet can't even attempt a connection, because their packets can't be decrypted without the right key. To a stranger, my Mac doesn't exist.

![Only devices with the right key can reach the Mac](/images/tailscale/05-who-can-reach-what.svg)
*A device without the right key can't even start a connection.*

On top of that, you can write access rules, and each device enforces them itself on incoming traffic. If there is no rule allowing a connection, it is dropped. I haven't written any rules yet, since my tailnet only holds my own devices, but I now know where to start if I ever add someone else.

One warning from my own setup, not from Tailscale's post: a private network is only as private as its members. Anything that can reach Pi Pocket can steer it, so I don't share my tailnet, and I picked Tailscale over a public tunnel for that reason.

## What this looks like for my two agents

Setup was short. I installed Tailscale on the Mac and on the phone, signed in to the same account on both, and switched the phone's VPN on. Pi Pocket then gave me a choice of addressing. Plain http on the tailnet address worked straight away, and the tailnet encrypts it anyway. An https address through `tailscale serve` needed a newer version of Pi Pocket than the one I had, which cost me some time before I found out my copy was simply too old.


The remaining problem is restarts. If the Mac reboots while I'm away, the apps only come back if the disk is unlocked and a user is logged in, and FileVault gets in the way of both. That deserves its own post.

## What I took away

I started out wanting my agents reachable from my phone, and I ended up understanding a decent chunk of how modern networking gets around NAT. The design is clever in a practical way. A central server handles identity and keys, and it never touches the traffic. The traffic itself goes device to device, and every device decides for itself what it will accept.

If you run anything at home that you'd like to reach from outside, the first two devices take about two minutes, as Tailscale says in its own post. I'd add one thing it doesn't: check what your app does before you decide who gets onto the network.

*Source: [How Tailscale works](https://tailscale.com/blog/how-tailscale-works), Tailscale. Explanations above are my own summary; the Tailscale post has the diagrams and the full detail.*
