---
title: "Web components - a short introduction"
date: 2022-06-13
layout: layouts/post.njk
description: |
---

Web components have experienced something of a second wind in recent years. The concept of building custom elements isn't new and was first tried in the early days of the web but was lost in the complexity of XML. A new attempt was made in the early 2010s work starting in standards bodies. In 2013 Google released Polymer, a framework for building web components that also polyfilled the web-components functionality where needed. Polymer didn't really reach mainstream adoption because it didn't really address issues that were relevant at that time, specifically databinding and improving the JavaScript using build-time tooling. People cared little for the benefits using what would one day be a built-in library. Now the pendulum is swinging back the other way, with browsers catching up with standards and most browsers being on an ever-green update model. The pendulum is now swing the other way, away from complicated build-time logic and towards simply using what the browser supports.

You could today at least in theory use web components without any kind of library. Let's give it a by making a custom element (a web component) that looks like `h1`.

```html
<!DOCTYPE html>
<script type="module">
  class HelloWorld extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = `<h1>Hello World</h1>`;
    }
  }
  customElements.define("hello-world", HelloWorld);
</script>
```

Now that's a nice component. Basically, we define a class extending HTMLElement, and in the constructor just after calling the super constructor we set the innerHTML of the element to `Hello World`. Not too bad right? - Well we forgot one of the main selling points with web components, isolation. By using a separate but related API called the Shadow DOM, we can isolate our component from the rest of the page, both when it comes to styling and optionally to the DOM APIs. Especially CSS tends to become such a large issue in most web projects that only very simple style rules are used or that all styles are set per element. To do that we need to do a few additions.

```js
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "closed" });
    shadow.innerHTML = `<h1>Hello World</h1>`;
  }
}
```

Ah much better, using the attachShadow method we create a shadow DOM in our element and then set the innerHTML. We have forgotten one thing though, our components will probably need to accept attributes to need be useful in practice. Let's add a `who` parameter to decide to whom we are saying hello to.

```html
<hello-world who="Alice"></hello-world>
```

```js
export class HelloWorld extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "closed" });
    shadow.innerHTML = `<h1>Hello ${this.getAttribute("who")}</h1>`;
  }
}
```

Amazing, we can now customize our components, but we forgot something. For a static page we are fine, but if the attribute `who` is changed a runtime nothing happens. If we run `document.getElementsByTagName("hello-world")[0].who = 'Bob'`, the text doesn't change from Alice to Bob. Our component isn't reactive by default, what a blast from the past. In the dark days before libraries like React this was something that we were used to, but obviously this isn't something that our example takes into account; let's fix that.

```js
export class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "closed" });
    render();
  }
  render() {
    this.shadow.innerHTML = `Hello ${this.getAttribute("who")}`;
  }
  static get observedAttributes() {
    return ["who"];
  }
  attributeChangedCallback() {
    this.render();
  }
}
```

Well unfortunately that added a whole bunch of complexity. First we look at our constructor, the only difference here is that we save a reference to the shadow DOM and that we call the method which we define afterwards. The new `render()` method contains the rendering logic that used to live in the constructor. So far we have almost exactly the same component as before, but in order to make it interactiove we must first we declare which attibutes are being watched, which is done in the static getter `observedAttributes`. Once this is done we can define the method `attributeChangedCallback` which is called every time one of the `observedAttribute`s are changed. In our event callback we simply call the render method we defined before.

That's what we arrived at, we didn't get automatic updates, but we did get components and we did get CSS isolation. Importantly we got it with no dependencies, no build tooling, just plain old (or well new) Javascript. An interesting throwback to the days when a text editor was all you really needed to page web pages.

One question lingers however, what if we allowed ourselves a few small dependencies, could we get to a point where the developer experience is as good as something like React. In the next post we will look into how good web components can be with just a bit of help from some libraries.
