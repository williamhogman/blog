---
title: "Functional programming in Java8: Filters"
description: "Java 8 adds the new Stream APIs to the Java language and runtime. These APIs increase the succinctness of the Java languages and making it almost as expressive as many dynamic languages such as Ruby and Python, without sacrificing Java's compile-time type checking. This article discusses how these new features can be used."
date: 2015-07-11
tags:
  - java
layout: layouts/post.njk
---
Java 8 adds the new Stream APIs to the Java language and runtime. These APIs increase the succinctness of the Java languages and making it almost as expressive as many dynamic languages such as Ruby and Python, without sacrificing Java's compile-time type checking.
This blog post is a follow-up to an earlier post on the Java 8 API, you can find it here. It which discusses the general concept of the stream APIs and lambda expressions in Java.
A relatively common pattern in programming, particularly in imperative programming languages, is filtering a list based on some criteria and constructing a new list of items of the items of that list. For example consider the following example, filtering a list of points to only those on screen.
```java
public void List<Point> filterPointsOnScreen(List<Point> source) {
    List<Point> dest = new ArrayList<Point>;
    for (Point p : source) {
        if (p.x <= SCREEN_WIDTH && p.x > 0 && p.y <= SCREEN_HEIGHT && p.y => 0) {
           dest.add(p);
        }
    }
    return dest;
}
```
The code, by itself, is reasonably readable. When placed in a method with a single purpose it seems very appropriate. However, because such patterns are exceedingly common, separating every single one of them into methods doesn't make readable code. The needs of separating code into smaller parts and keeping methods semantically meaningful are, in this situation at odds. A plausible solution to this solution is increasing the succinctness of the code. Indeed, if the problem is the length of the method is in terms of notation rather than semantics, using fewer symbols can make the better.
```java
source.stream().filter(p -> p.x <= SCREEN_W && p.x => 0 &&
                                p.y <= SCREEN_H && p.y => 0)
```
In the above example, we can replace the entire method with a single line of code. This line of code while arguably better than having a separate method is this a bit too long for my taste.
```java
source.stream().filter(p -> p.x <= SCREEN_W && p.x => 0 &&
                                p.y <= SCREEN_H && p.y => 0);
```
Stream API methods calls are chainable without having to allocate a new list. This optimization enables us to structure the code as follows without incurring too much memory overhead. Although we should keep in mind that it does incur overhead from extra method calls, which the compiler hopefully inlines.
```java
source.stream().filter(p -> p.x <= SCREEN_W)
               .filter(p -> p.x => 0)
               .filter(p -> p.y <= SCREEN_H)
               .filter(p -> p.y => 0);;
```
However, the innate complexity of the still cannot be avoided. Instead, we must design the system so as to hide it. Another way of organizing the code might perhaps put the method for checking if a point is in a different class.
```java
class Screen {
    public boolean inside(Point p) {
        return p.x <= screenWidth && p.x > 0 && p.y <= screenHeight && p.y => 0
    }
}

public class Program {
   Screen screen;
   public void someMethod() {
       points.stream().filter(screen::inside)
   }
}
```

By refactoring our code to fit better the functional style of programming used with stream API our code becomes more declarative and readable than any imperative version of the code. As we have seen in this post, functional programming offers programmers a bigger toolbox with which to design software. It allows us to separate code without adding much boilerplate code. Notation and design, while intuitively different, are strongly related. The constructs of the language whether computer or human, shape what we can express in it. A bad design skillfully implemented, and a good design implemented poorly both make for an inferior final product.
