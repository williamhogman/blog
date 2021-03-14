---
title: Bower.js and the Future of Client-side Modularity
description: Twitter recently released Bower, a dependency manager for client-side JavaScript. This article discusses how Bower compares to other dependency managers and how this release affects the client-side JavaScript space as a whole.
date: 2012-08-06
layout: layouts/post.njk
---
Twitter recently released Bower, a dependency manager for client-side JavaScript. This article discusses how Bower compares to other dependency managers and how this release affects the client-side JavaScript space as a whole.
Bower's design seems focused on simplicity and indeed in a true Less is More fashion the application simply downloads and builds the code into a components folder. Using bower requires no configuration at all and packages can be install simply using the install command.

```
$ bower install jquery
bower cloning git://github.com/components/jquery.git
bower cached git://github.com/components/jquery.git
bower fetching jquery
bower checking out jquery#1.8.1
bower copying
```
The output style is like most node.js CLIs in that it is very terse. While I personally prefer longer messages the output shows all information relevant to the task at hand.

The above example clearly illustrates the simplicity of Bower. However, this simplicity comes at a price, a lack of configuration options. The ability to configure names of folders and files is absolutely crucial for both development and deployment. Therefore, integrating bower into an existing project seems both tedious and error-prone. Similar trade-offs are made consistently across the entire application, for example Bower only supports a flat dependency tree.

These trade-offs makes it possible to have a very simple package structure. A package can be created simply by adding a file by the name component.json to the root of the source code repository. The package may then optionally be given a name using the bowerregister_ command, no authentication required. Because of the ease by which a library can be packaged and the reputation commanded by twitter, many authors will feel compelled to add their libraries. This could potentially lead to a viral rate of adoption. It is therefore possible that bower may one day become the de facto standard for client-side JavaScript modules. At present however, Bower seems very unpolished and is lacking in many areas. If enough work is put into Bower it might actually take off. This because it doesn't enter the client-side JavaScript modules debate which would severely limit its user-base. Personally, I have great hopes for Bower, but I will probably not use it for my next project.
