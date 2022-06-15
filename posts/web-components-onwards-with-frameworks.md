---
title: "Web components - Using the Lit library"
date: 2022-06-14
layout: layouts/post.njk
description: |
  In my last post about Web components we looked using webcomponents without using any libraries. In this part see how far we can get by using Lit, a framework or more accurately a library for building web components.
---

Web components, while a nice addition a great addition to the web platform, don't really offer the best developer experience. The reasons for this are completely defensible, it is dangerous because the API has to fit the general case, it cannot be specialized to a specific case but has to work as well for applications designed today as ten years in the future. In fact the APIs provided are based the expectations for what web apps needeed to do in the early 2010s.

This means it might be appropriate to use libraries and frameworks to help us work with web components. One such library is Lit, a replacement to the now deprecated Polymer which was to original web component library back in the day when web components relied fully on Polyfills. In fact Lit, by not focusing on Polyfills and compatibility can focus on a convienent API for web components. Let's see just how convienient it can get.

```js
import { html, LitElement } from "lit";

class HelloLit extends LitElement {
  render() {
    return html`<h1>Hello World</h1>`;
  }
}
customElements.define("hello-lit", HelloLit);
// We can now use the <hello-lit> element
```

The main point of contact with Lit is the abstract class `LitElement` which we use instead of `HTMLElement` which we would normally use with web components. Thanks to it all we need to define is a `render()` method returning some HTML. Its not enough to just return HTML instead we have to use a template literal with the html tag which we import from Lit. The template literal is used to make updating the DOM more efficient and works in a way similar to React, but without needing a compilation step.

Another benefit with Lit is that the library itself can help you handle changing properties being sent to your component.

```js
export class HelloLit extends LitElement {
  @property()
  who: string = "world";
  render() {
    return html`<h1>Hello ${this.who}!</h1>`;
  }
}
```

That's it, we are able to handle changing attribute with just a single annotation `@property()`. Changing the attribute will trigger the render method which returns a virtual representation of the HTML to be renderered with Lit being responsible for modiyfing the DOM to match, almost like in React.

To show the possibilities with Lit let's make one more element. Let's implement `<blink>` the blink element is a non standard element that was popular in the early days of the web, it simply made text blink (by hiding and then showing the content). The element was removed, and with good reason, it makes hard to read the text. For our implementation we will also use DOM manipulation instead of CSS, even though CSS is a much better option, because we want to show this interacts with Lit in a meaningful way.

```js
import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("our-blink")
class Blink extends LitElement {
  @state()
  visible = false;
  connectedCallback() {
    super.connectedCallback();
    this.#timerInterval = setInterval(() => {
      this.visible = !this.visible;
    }, 1000);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.#timerInterval);
  }
  render() {
    if (this.visible) {
      return html`<slot></slot>`;
    } else {
      return html`<div></div>`;
    }
  }
}
// <our-blink>Hello world</our-blink>
```

The first thing to notice is that we have started using decorators, which because they are not suppported in the browsers yet, means we have to use a compiler such as Typescript or Babel which both implement decorators. The `@customElement(name)` decorator handles registration in the custom elements registry. While the state makes the class property rerender the component when it changes. We then override connectedCallback and disconnectedCallback making sure to call the Lit's implementation using the super call. The callbacks themselves are part of the web components native API and they are unaffected by Lit. When connected (mounted into the document) we start a timer, which toggles the `visible` state back and forth. When disconnected (removed from the document) we clear our timer. In the render method, we render a Slot element when visible is true and an empty div when visible is false. The slot element is part of the native APIs and is used to bring contents from the content of the tag into the component itself. The content of our blink tag can be styled completely independetly of the blink-tag itself so that's another area where web components enable isolation.
