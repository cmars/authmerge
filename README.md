# Authmerge

Authorization for Automerge-based applications.

## Background

[Automerge](https://automerge.org) is a library supporting "local-first" applications. "Local-first" is a refreshing alternative to traditional centralized applications, promising an unprecedented level of user autonomy. The big idea with Automerge is that an application running on a user's device (a user agent) synchronizes and merges content with other users directly rather than depending on a centralized SaaS.

Such autonomy brings with it its own set of unique challenges. In a centralized service, authorization and policy (who can do what, to which content) is easier to implement and reason about; the server either commits a transaction, or it doesn't. Centralized authorization policies are what keep users from editing someone else's comment on a forum.

Even this most basic example raises some interesting questions! A moderator of a centralized forum like HN or Reddit is reasonably allowed to flag or delete a user's comment. Sometimes a moderator's decision to do so is generally recognized as a good thing, but sometimes it is controversial. For other services, such policy is less clear. A certain struggling microblog service might remove content without a clear declaration of who should be allowed to do so, and under what circumstances. Such a service might start injecting ads into content for free users when the money starts to run out.

In a local-first world, everyone gets to decide their own application's "reality". In such applications, what does authorization even mean? That's what Authmerge seeks to find out.

## What is decentralized authorization?

### What is trust and how is it established?

For a group of collaborators working on a shared document, there is generally an unspoken agreement to cooperate nicely. Anyone who doesn't, would probably have their vandalism reverted and left out of a new document share. In such a scenario, policy is implict and effected using the tools available to the group: revert to last save, reshare as a new doc excluding the vandal.

Those actions are lot of trouble though, wasting everyone's time and attention, and breaking the flow of group collaboration.

A policy around such actions becomes necessary when there is less guaranteed trust in the group. A group of colleagues with a shared interest in building something have a high degree of mutual trust. A random from the internet has a lower degree of trust. Scaling trust requires answering this question: how to include new members to a group while maintaining that level of mutual trust?

Such questions might be answered with a group policy. For a widely-shared document application a conservative policy might be:

- Someone might vouch for a New Participant (to be one, ask one, etc.) on a working document.
- New Participants can comment to ask questions and suggest changes to become Active Participants
- Active Participants might be given write privileges to some or all of the document to become Members
- Members might be given privileges to become Policy Deciders

This is Nothing New and you can see similar patterns of progressive trust-building in centralized applications like Wikipedia or BB-style forums.

What's potentially interesting and groundbreaking is defining such policy for local-first applications.

# Related technologies

## Public-key encryption

The OpenPGP web-of-trust is as an example of bootstrapping trust through policy -- users vouching for users to be who they say they are. If everyone had a public-key identity, public key attestation of application content changes would be quite powerful. In some communities, it might make sense to augment application changes with such attestation. It should be optional though; any application that depends entirely upon public key identities digs a significant technical moat around itself.

Persistent public key identities force key management responsibilities onto the users, and might distort social expectations of privacy in casual applications.

Ultimately, public key identities solve authentication, not authorization. So they're an interesting add-on, but not a substitute for a policy system like authmerge.

# Alternative technologies

Authmerge is designed for applications in which application content is open and pseudonymous, and a broad spectrum of trust may exist among its users.

## Zero-knowledge proofs

Privacy and key-management problems with persistent public keys might be mitigated with zero-knowledge attestations (ZK-SNARKs, etc). Policies might be evaluated in a zero-knowledge computation, such that a proof of policy authorization is distributed.

In a local-first application, zero-knowledge policy attestations might be useful for anonymous changes to a document. One interesting use case would be anonymous voting or surveys, where you need strong user identification and attestation to guard against "ballot stuffing", while keeping responses anonymous.

## Smart contracts

One must consider where a blockchain is most appropriate: for bootstrapping trust among parties which have little to no incentive to cooperate, and lots of incentives to defect. Not every decentralized application needs trust-less cooperation and global distributed consensus.

A local-first application might provide something interesting "to sign" into a block transaction though. One might even regard an automerge document and its change history as a side chain.

# Building

On NixOS, use `nix-shell` to install development dependencies. On others, install NodeJS and OPA >= 0.45.0.

    npm ci
    npm run compile
    npm test

# TODOs

TODO: a more serious example application using authmerge
TODO: rust port
TODO: policy-enforcing rendezvous server (probably rust)
