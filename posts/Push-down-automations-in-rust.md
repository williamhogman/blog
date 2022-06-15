---
title: "Push-down automatons in Rust"
date: 2021-05-13
layout: layouts/post.njk
description: |
  Push-down automatons, essentially finite state machines with a
  Stack, are in adddition to being theoretically interesting useful
  for a number of tasks, such as ensuring that parenthesises are balanced in a string
---

Push-down automatons are a formal model for representing limited
computation. They are similar to finite state machines, but add a
stack which is manipulated by the machine. In a traditional finite
state machine the current state, and the input signal decide the
next state that the machine advances to.

In a push down automaton things get more complicated, our transitions
include can either push, pop or do nothing with the stack, and when
considering wheter to apply a transition, in addition to the current
state, and input signal we may also take into account the value at the
top of the stack.

Limited models of computation are interesting not only because it
allows us to better manage state complexity than full-blown
turing-complete languages, they also have parallels in the world of
parsing. In fact a regular expression has, atleast in theory, a
matching finite state machine. What regular expressions [famously](https://stackoverflow.com/a/1732454)
cannot do is parse HTML. In a strict regular expression environment we
cannot express with any sort of nesting. When we add a stack, as is
the case with push-down automatons, we suddenly can.

At this point regular expressions and finite state machines are nearly ubiquitous in modern
programming languages. So in order to experiment with them we need
either a library or to do it ourselves. Unfortunately doing in many
languages, the type system is too limited to support a general type
safe implementation, and in the languages that do support it
generalizing then leads to poor performance. There is one mainstream
language that is an exception to this and that is Rust. So lets try
building it in Rust and if we can manage to properly model everything with its type system.

From the mathematical definition of a push-down automaton we know
that there are three different alphabets (essentially enums) involved, one for the
values on the stack, one for the state of the machine itself and for
the inputs. Of these, the stack seems the easiest to lets define what
we can do with it.

```rust
enum StackOp<StackAlphabet> {
    Pop,
    Push(StackAlphabet),
}
```

Recall, that we could do two things with the stack, popping
(removing the top element) and pushing (adding a new top
element). These fit neatly into a rust enum with the Push type, taking
a value from the stack alphabet.

Rust doesn't have a dedicated `Stack` data type because `vecs`
(implemented as a continous, resizable array list) already implement
`push` and `pop`. For our purposes it would be helpful to encapsulate
the logic of the stack somehow, so that we can work more easily with
our StackOp type.

```rust
#[repr(transparent)]
#[derive(Clone, Debug)]
struct PDAStack<StackAlphabet: Clone> {
    vec: Vec<StackAlphabet>,
}
impl <StackAlphabet: Clone> Default for PDAStack<StackAlphabet> {
    fn default() -> PDAStack<StackAlphabet>{
       PDAStack { vec: vec![] }
    }
}
impl <StackAlphabet: Clone> PDAStack<StackAlphabet> {
    pub fn apply(&mut self, s: Option<StackOp<StackAlphabet>>) {
      match s {
           None => {},
           Some(StackOp::Pop) => { self.vec.pop(); },
           Some(StackOp::Push(x)) => { self.vec.push(x) }
      };
    }
    pub fn peek(&self) -> Option<StackAlphabet> {
       self.vec.last().map(|x| x.clone())
    }
}
```

In the above code we implement a new struct `PDAStack` short for push
down automaton stack, which implements the logic for handling our
stack ops as well as a peek operation, getting the value at the top of
the stack. It is interesting to note the `repr(transparent)`
attributes which ask the compiler to guarantee that the struct is
optimized away. Rust usually optimizes the memory layout for
single-member structs into that of it's member, essentially making the
struct disappear. This means our stack abstraction is zero-cost, it
doesn't affect CPU or memory use at all.

Now with the stack operations defined we can try to define a type to
represent the destination side of a transition. When a push-down
automaton receives input it both change the internal state (like an
FSM) and manipulate the stack. Lets represent this a rust struct

```rust
struct Dest<State, StackAlphabet>(Option<State>, Option<StackOp<StackAlphabet>>);
```

We don't need to define a `StateOp` because the state is either
unchaned or it is changed to a particular value, in Rust we can simply
model this using the `Option` type. Likewise, if we don't want to
touch the stack we also model that as an option.

Now with the destination out of the way we need to come up with the
source side of the rule. The source side is what is used to come up
with the destination side of a transition, in a push-down automaton
it is defined as the current state, the value at the top of the stack
and the input received. In our version of the push down automaton the
stack may be empty so we model the stack value using an option.

```rust
struct Source<State, StackAlphabet, InputAlphabet>(State, Option<StackAlphabet>, InputAlphabet);
```

Now with all the types defined we can finally define a `trait` (think
`interface` but better), to represent Push-down automatons.

```rust
trait PDA {
    type State: Default + Clone;
    type InputAlphabet: Clone;
    type StackAlphabet: Clone;
    fn advance(source: Source<Self::State, Self::StackAlphabet, Self::InputAlphabet>) -> Dest<Self::State, Self::StackAlphabet>;
}
```

First we define, three assoicated types one for the stack alphabet,
one for the input alphabet and one for the state alphabet. We then ask
that these associated types all implment `Default` and `Clone`, that
is to say we want them have a default value (e.g. 0 for numbers and
false for booleans) and we want them to be clone-able, that is we to
be able to copy their memory to create a new instance of them.

One thing that is important to note here is that we don't actually
define any operations for instances of `PDA`s just a function that
should be defined for the structure.

Having now defined the interface contracts for push-down automatons time has come to
actually implement logic for running a push-down automaton.

```rust
struct PDARunner<T: PDA> {
    state: T::State,
    stack: Vec<T::StackAlphabet>,
}
impl <T: PDA> Default for PDARunner<T> {
    fn default() -> PDARunner<T> {
      PDARunner {
           state: Default::default(),
           stack: Default::default(),
      }
    }
}
```

We don't need anything other than a state containing members of the stack alphabet. Usually in Rust you
use derive to automatically implment default, but in this case because
we don't demand that the type parameter `T` also implmeents
default, derive fails, even though a trivial implementation of Default
exists.

The structure of the PDARunner wasn't all that hard but the
implemation of the PDA itself is however a bit more involved.

```rust
impl <T:PDA> PDARunner<T> {
    fn update_state(&mut self, state: Option<T::State>) {
       if let Some(state) = state {
           self.state = state
       }
    }
    fn advance(&mut self, inp: T::InputAlphabet) {
       let source = Source::<T::State, T::StackAlphabet, T::InputAlphabet>(self.state.clone(), self.stack.peek(), inp);
       let Dest(state, stack) = T::advance(source);
       self.update_state(state);
       self.stack.apply(stack);
    }
    pub fn run<X: IntoIterator<Item=V>, V: Into<T::InputAlphabet>>(input: X) -> Self {
       let mut s = Self::new();
       for i in input.into_iter() {
            s.advance(i.into())
       }
       s
    }
}
```

That's a bit more code than we're used of seeing but lets go through
it step by step. First we have a helper method `update_state` which
updates the state using the passed in option, if it exists.

Then we have advance which is the core of what the push-down
automaton needs to do. First it creates the source value from the top
value of the stack, the input signal and the current state. Then it
calls the advance function of the particular `PDA` that is associated
with this runner. We get the result of the advance function and change
the state if it needs changing, using our helper. The stack operation
received is simply passed in to our stack implementation. With that
the core logic for the push-down automaton is done.

Finally, on to our last function, the run function. It simply takes an
iterable of things that can be turned into members of our input
alphabet and advances the machine based on those.

Now to make the API more convienent we can add an alias within the PDA
trait itself so we don't need to know that the `PDARunner` actually
exists, to do this we can add the following function to the PDA trait.

```rust
trait PDA
    fn run<T: IntoIterator<Item=V>, V: Into<Self::InputAlphabet>>(input: T) -> PDARunner<Self> where Self: Sized {
        PDARunner::<Self>::run(input)
    }
```

Again this is mostly a repeat of the run function defined in the
PDARunner, but we need to add a sized type constraint to keep the rust
compiler happy.

And that's it. We can now use our code to solve a problem with a push
down automaton. The problem that I'd like to solve is determining
wheter or not a string containing gparenthesises is balanced or not. For instance, the
string `(hello (world))` is balanced while, `(hello (world)` is not.

To solve this problem we need a push down automaton where the inputs
are left parens, right parens and other characters. The category
_other_ _characters_ eists simply to allow us to ignore irrelevant
characters. When we find a left parenthesises we push to the stack and
when we find a right parenthesises we pop from the stack. Because we
are only considering one type of parenthesises we only need a single
type of data on the stack. Finally to keep track of when errors occur
we need an OK state and a an error state.

The transitions will then look like this:

- If we are in the error state, we ignore all everything and stay in
  the error state. This is what is said to be a terminal state.
- If we receive an _other_ _character_ input we ignore it nothing
  changes. It is as if the input was never received at all, we might call it a no-op.
- If we are stil in the OK state, receiving a left parenthesises, we
  push a parenthesis marker to the stack.
- If we are in the OK state, have a parenthesis marker on the top of
  the stack, and receive a right parenthes, we pop a value from the
  stack.
- If we are in the OK state, the stack is empty and we receive a
  right parenthesises, we should go to the error state.

Now when if we pass in a string of characters to our push-down
automaton, we know that it's parenthesises are balanced if and only
if the stack is empty and the state is OK.

To not pollute the rest of our file we can do it in
its own module, using the `mod` syntax. In a production environment it
is usually use another file, but inner modules makes it easy for us to
do it all in one go.

```rust
mod balanced_parens {
    use super::{Source, Dest, PDA, StackOp};

    #[derive(Debug, Clone)]
    pub enum Stack {
       Parens
    }
    #[derive(Clone, Debug)]
    pub enum State {
       Ok,
       Error,
    }
    impl Default for State {
       fn default() -> State {
            State::Ok
       }
    }
    #[derive(Clone, Debug)]
    pub enum Input {
       Other,
       LeftParens,
       RightParens
    }
    impl From<char> for Input {
       fn from(c: char) -> Input {
            match c {
               '(' => Self::LeftParens,
               ')' => Self::RightParens,
               _ => Self::Other,
            }
      }
    }
    #[derive(Debug)]
    pub struct BalancedParensPDA;
    impl PDA for BalancedParensPDA {
       type State = State;
       type InputAlphabet = Input;
       type StackAlphabet = Stack;
       fn advance(src: Source<Self::State, Self::StackAlphabet, Self::InputAlphabet>) -> Dest<Self::State, Self::StackAlphabet> {
            match src {
               Source(State::Error, _, _) => Dest(None, None),
               Source(_, _, Input::Other) => Dest(None, None),
               Source(State::Ok, _, Input::LeftParens) => Dest(None, Some(StackOp::Push(Stack::Parens))),
               Source(State::Ok, Some(Stack::Parens), Input::RightParens) => Dest(None, Some(StackOp::Pop)),
               Source(State::Ok, _, Input::RightParens) => Dest(Some(State::Error), None),
            }
       }
    }

}

```

First we declare the enums `Stack`, `State` and `Input` according to
the specifications above, making sure to make the default state
`OK`. Then we declare conversion from chracters into our input value
type, making `(` and `)` to their corresponding input values, while
all other values are mapped to `Other`. Then we declare our push down
automaton itself with an empty struct and a implementation of the PDA
trait. In the trait we set our associated types to the enums declared
just before and then declare the advance method based on the rules
from earlier.

We can now declare a main function outside them like this:

```rust
fn main() {
    let machine = BalancedParensPDA::run("()".chars());
    println!("{:?}", machine);
}
```

This results in the following output:

```rust
PDARunner { state: Ok, stack: PDAStack { vec: [] } }
```

The state is OK and the stack is empty, which means the parenthesis
are balanced and our push down automaton works as intended.

Now the question remains, this was a lot of code and a ton of types is
this a good way of determining if a string has its parenthesies
balanced? Probably not, Rust as a language is not Haskell or even
Scala - while Rust is certainly is able to express things with it's
type system that Java developers can only dream about, abstractions in
Rust sometimes results in code that is difficult to understand and
this is natural because not only does it have to deal with what
different generics but also the Rust memory model, which itself is
encoded into the typesystem. With that said of course, there are
abstractions which make sense, especially when you are smaller in
scope, a function with one our two type parameters is so problem, a
couple of traits, or a struct with two or three paramters are also
fine. When going beyond that consider doing things at runtime, Rust is
already plenty fast and that often leaves rooms to do things at
runtime. In fact, by not abstracting over the problem we can implement
balancing parenthesis like this.

```rust
fn balanced(data: &str) -> bool {
    data.chars().map(|x| match x {
		'(' => 1,
		')' => -1,
		_ => 0
    }).fold(0, |acc, x| {
		if acc < 0 {
			acc
		} else {
			acc + x
		}
    }) == 0
}
```

And this is where I will leave you today, we have built a useful
abstraction in Rust, shown how it works with a toy example, and shown
how the example might just be easier with no abstraction at
all. Hopefully you have learned something about useful abstractions in
Rust and perhaps even given some thought to when and when not to use them.
