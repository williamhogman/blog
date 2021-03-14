---
title: Writing good React components
description: This article looks at best-practices for writing React components
date: 2013-12-10
layout: layouts/post.njk
---

The folks at Facebook and Instagram recently came out with a library for building web UIs, called React. React is centered around the concept of a component. A component incapsulates some state, divided into mutable and immutable variables which the component uses. This internal state is used for rendering the component into the DOM. A component can render either plain-old HTML elements or and this is often the case, other React components. This article deals with how best to write these components.

The idea of dividing software into smaller parts or components is hardly new - It is the essance of good software. The same principles that apply to software in general apply to building React components. That doesn't mean that writing good React components is just about applying general rules. The web offers a unique set of challenges, which React offers interesting solutions to. First and foremost among these solutions is the what is called the Mock DOM. Rather than having user code interface with the DOM in a direct fashion, as is the case with most DOM manipulation libraries. You build a model of how you want the DOM end up like. React then inserts this model into the DOM. This is very useful for updates because React simply compares the model or mock DOM against the actual DOM, and then only updates based on the difference between the two states.

This solution to the eternal problem of keeping the DOM and underlying data in sync offers excellent performance. However, it comes with a drawback, it limits the way we deal with state. React has two kinds of mutable state, specific top-down variables called props and the more generic state. Props are invariably handed down from a component's parent and cannot be changed in any way from within the component itself. State on the other hand, is created within the component itself. State, unlike props, can be changed from within a component. The general consensus in the software engineering world today is to avoid mutable state, and this is the first principle of good React component design. Avoid placing state inside components if at all possible. This applies specifically to the generic state object that every React component has. The following example presents two implementations of a content that is visible depending on a value.

```js
var DOM = React.DOM;

var Box1 = React.createClass({
    show: function() {
        this.setState({show: true})
    },
    hide: function() {
        this.setState({show: false});
    },
    render: function() {
        if(this.state.show) {
            return (<div>
                        <h3>{this.props.title}</h3>
                        <div>{this.content.text}</div>
                   </div>);
        } else {
            return (<div><h3>{this.props.title}</h3></div>)
        }
    }
});

var Box2 = React.createClass({
    render: function() {
        if(this.props.show) {
            return (<div>
                        <h3>{this.props.title}</h3>
                        <div>{this.content.text}</div>
                   </div>);
        } else {
            return (<div><h3>{this.props.title}</h3></div>)
        }
    }
});
```
Rather than having visibility being managed by state and methods, we opt instead make the component state-less. The component, when given the necessary props, renders the correct markup. While the other implementation also has the correct behaviour, it adds additional complexity. Once you have large components this becomes a much bigger problem.
Just like state, props can also become a problem in a larger project. It is hard to remember what types and if a certain property is required or not. First of all, just as with other classes, React components need to be descriped in human language, the intent, the input, and the output need to be documented. My second suggestion is using the PropTypes feature which is built into React. PropTypes allow for a succinct way of writing assertions about types. Any code checking types manually would be both repetitive and outside what most people would consider best practices for JavaScript.

```javascript
var Box2 = React.createClass({

    propTypes: {
       title: React.PropTypes.string.isRequired,
       text: React.PropTypes.string.isRequired,
       show: React.PropTypes.bool.isRequired
    }
    // [...]
});
```

Looking at the example, we see that by specifying these the types, and their cardinality (required being 1 and not required being 0..1). This makes it harder to pass broken data into the component. This results in a component that is robust and less prone to bugs. When specifying the propTypes make sure to specify them as strict as possible, especially when it comes to the required setting. It is much harder to make property required after the fact. If you wait, you might not always be entirely sure about how the component is used. Don't waste your time, write strict PropTypes from the start. It is worth it.

In addition to documenting props and avoiding state, we also need to consider where to make the divisions between components. There are a few principles that you need to adhere to. Firstly, if logic is repeated, it should obviously be shared as a component. A button, for example, is a great candidate for a component. In the absence of obvious duplication, we need to look at the conceptual model of the domain in question. By asking the question, what are the obvious divisions in your model? If you can find artifacts such as pen and paper forms used in the business, try to figure out how the information is structured in these. If you are, for example, building an app showing an invoice on screen. It would make sense to make the header section, containing names, addresses and other meta data, into a component. As always, knowledge of the domain is required to know what concepts are related and which are separate.

In summary, React offers great tools to structure your user interface, it makes it easy to manage the complexity that you always get in a big project. React, unlike most other libraries, allows you not only to split up your code into smaller parts. It also makes it reusable. This article is in no way a complete guide to writing React components. It is just a few tricks that I've gathered from using React in practice over a few months. If you have any suggestions or feedback, please leave a comment below.
