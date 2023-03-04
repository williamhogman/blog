---
title: Caching headers for Microfrontends
description: Microfrontends or MFEs for short, have taken over the frontend development space. One problem that teams need to solve however is that of caching. This post shows you how to do it right.
date: 2023-03-04
---

With Microfrontends taking over the frontend development space, the opportunity for large numbers of developers to work together one one project is better than ever. Just as with Micro-services, there are downsides to Microfrontends. Teams using Microfrontends (MFEs) often suffer from performance issues stemming from their caching strategy. This post will show you how to do it right.

A Microfrontend is a part of a frontend application that is deployed and maintained separately, often times the a microfrontend is hosted by a different team than the one that built it. A Microfrontend is not a full application rather a part of one. Multiple microfrontends are used together to make a singe application.

Because MFEs are deployed separately there are multiple entrypoints, just as with a traditional Single Page Application (SPA), there is an initial entry point for the application - this is usually `index.html`. Unlike a single page application a MFE based application has additional entry points for each microfrontend that it embeds. These are equivalent to the initial `index.html` entry point except that JavaScript files to be loaded. This means that the entry points themselves cannot be cached and instead must freshly loaded in order to get the most up to date version of the application. When using webpack federation, the entry points are often called `remoteEntry.js`.

The resources imported by the MFEs themselves however can be cached the same way we are used to with traditional front-end applications. Basically the current best practice is to bundle resources in such a way that a hash is embedded into the filename of all the other resources,
like this, `my-file.[hash].js`. This ensures that if the content of the file ever changes, the hash changes automatically, this ensures, that by changing the URL, the user will get the most up to date version of the file.

With this in place, our cache strategy should be as follows:

For resources that aren't entryPoints, we set the cache header like this:

```text
Cache-Control: public, max-age=604800, immutable
```

This ensures that the file is cached both in CDNs and proxies as well as locally, and is pretty uncontroversial as far as caching goes. For the entry points, such as `remoteEntry.js` and `index.js`, on the other hand, things get a bit more complicated. One option is to set a strict header such as:

```text
Cache-Control: public, no-cache
```

This means that the client and any server in between may store the contents but the contents must be revalidated each time, ensuring that the most up to date version of the file is what the user gets. This is usually fine for a traditional page where index.html is the only place where we need to revalidate the contents. However in a MFE architecture this might be a bit too expensive. A simple option might be to use `stale-while-revalidate` instead which doesn't guarantee that the user gets the most up-to-date version of the file until they actually refresh the page. This works well because the user usually refreshes the page if they encounter a problem with the application.

```text
Cache-Control: public, stale-while-revalidate=3600, stale-if-error=36000
```

In this case we combine `stale-while-revalidate` which gives us the desirable behaviour of downloading changes in the background. As an extra bonus, we add `stale-if-error` to the header, which allows an older version to be used if the file hosting server encounters an error. If your users reload your application often we might also want to add a `max-age` parameter to cache these resources for a short amount of time to ensure that reloads are quick.

Simple as that we get acceptable performance for microfrontend applications. That said to get proper, native-like performance you should consider using service workers to explicitly control caching and offline behaviour of your application, but that would require a whole lot more work to get in place. Hopefully this simple solution will help you avoid having to worry about more complicated solutions.
