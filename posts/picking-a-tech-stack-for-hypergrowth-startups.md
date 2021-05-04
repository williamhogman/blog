---
title: "Picking a Tech Stack - Part 1 identifying the must-have criteria"
date: 2021-03-22
layout: layouts/post.njk
description: "One of the first things that you have to do when embarking on a new project is choosing the set of technologies - the tech stack - that you will be using. This article discusses the principles to keep in mind when making this critical decision."
---
One of the first things that you have to do when embarking on a new
project is choosing the set of technologies - the tech stack - that you
will be using.

There are many ways of going about this and it seems everyone has their
own approach. At its eseence it is the circumstances that decide the
tech-stack, however this doesn\'t mean that there are solutions that are
more or less appropriate. At the same time, we must acknowledge the
limited impact of the choice of tech stacks, many startups succeed
despite of a poor choice of tech stacks and very few fail because of a
poor choice of tech stacks.

To properly evaluate possible tech stacks we must first determine the
criteria. A simple division of our criteria is dividing into properties
which the tech stack must have and ones which we think are advantageous.
In this division we must be careful to only consider as musts criterias
which are truly deal breakers, during the initial phase of the project.
Twitter was famously written in Ruby and they were able to scale it for
a long time before having to switch to a more performant platform. This,
of course, is not to say that there aren\'t must-criteria which are
present on day one, a video chat product may have low-latency as its
primary selling point, in which case the choice of tech stacks must
accommodate this. One must criteria that always exists however is that
the initial team must be proficient or have a clear road to proficinecy
with a given technology, choosing only technologies where this is the
case, obvious as it may seem, is a challenge for many teams.

To proceed we must create a list of must criteria that we then can match
tech-stacks against. A good starting point for such a list can be found below,
but you will need to extend it to fit your particular needs.

-   Latency
    -   Do we need to guarantee responses within 25 ms (exclusive of
        network latency) 99% of the time.
    -   Is 250 ms network latency in some locations unacceptable
        latency?
        -   Yes, but only for the website: Use a static website host
            with a global CDN (e.g. Cloudflare or Netlify)
        -   Yes, for the application itself: Low latency is a required property of your tech-stack.
-   Capacity
    -   Is your total data size greater than 1 TB?
        -   Yes, but only because of user uploads: Use S3 or a similar
            service to store uploads.
        -   Yes: Your tech-stack must be able to accomodate large amounts of data.
-   Throughput
    -   Does your application need to perform more than 100 tasks per
        second?
        -   Yes: Your tech-stack must be able to handle large amounts of work.
-   Deployability
    -   Is your application deployed in a non-standard way (on prem/airgapped networks)?
        - Yes: Special care needs to be taken that your application can be deployed
    -   Do you envision using technologies that have non-standard
        licences?
        -   Yes: Ensure that the way you're deployment model is consistent and affordable given the licence
    -   From the perspective of user privacy and related regulation, do you envision processing user data in non standard way?
        -   Yes: Read the section on deployability.
-   Proficiency
    -   Do you know the technology already?
        -   No and it is unclear how I will learn it: Avoid the
            technology, perhaps introducing it a later point once you
            know it.
        -   No, but it is easy to learn adapt to: Ensure there is a way to proficinecy for the technology.
-   Other: If you have any specific requirements that don\'t fit within
    the framework list them here.

It might well be the case that you didn't end up with any
must-criteria using the questions above. This is normal and good
even we must keep from imagining and predicting requirements that
aren't actually there for the initial phase of the company. Indeed this should
be our focus.

Now with our list of must-criteria in hand we are able to start considering how to score different technologies against our questions.
