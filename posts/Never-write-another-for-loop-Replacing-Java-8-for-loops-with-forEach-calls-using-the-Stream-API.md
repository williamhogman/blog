---
title: "Never write another for-loop: Replacing Java 8 for-loops with forEach calls using the Stream API"
description: Java 8 and JDK 1.8 introduces a new functional programming concept called a stream to java
date: 2015-01-17
tags: second-tag
layout: layouts/post.njk
---
It is no secret that I'm not a huge fan of Java writing line after line of boilerplate code gets frustrating after a while and with a very conservative feature-set it is not exactly a language you pick up when coding for fun. Java 8 and JDK 1.8 introduces a new concept called a stream to java. Streams represent collections or more precisely things that represent a sequence of objects. The Stream API, combined with Lambda expressions, another feature of Java 8 allow for expressing typical for-each loops in terse and functional way.
Consider the following for loop in:
```java
public void someLoop(List<Thing> things) {
    for(Thing t : things) {
        System.out.println(t);
    }
}
```
This is some pretty standard code iterating and printing a list of things, but a lot of it could be considered boilerplate. Thing is repeated twice and the body of the method is simply a call to the println method. This is a typical situation where Java results in a lot of boilerplate code. There should be an easier way and with Java 8 there is.
```java
public void someLoop(List<Thing> things) {
    Stream<Thing> stream = things.stream();
    stream.forEach((Thing t) -> System.out.println(t));
}
```
In the above example, we used a lambda expression, that is a function, taking a single thing and printing it out, returning nothing. This cleans up the code somewhat, but we can do better. Java 8 is able to guess types for lambda expressions. So we can simply replace (Thing t) with (t). With that we made our expression even simpler, but the method is still just using a single method, and Java provides for an even better way of doing.
```java
public void someLoop(List<Thing> things) {
       things.stream().forEach(System.out::println);
}
```

That's it! By using method references, referring here to the println method of System.out, we can make our code even concise.
As I mentioned earlier I sometimes feel frustrated with Java, at least before I started reading up on the Java 8 APIs, I considered Java 8 to be an also-ran in the functional programming space. Sure, it doesn't exactly bring anything new to the table, but it adds a much-needed feature to a very popular language.
