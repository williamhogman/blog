---
title: Installing Meteor on ArchLinux
description: Guide on how to manually install Meteor on ArchLinux
date: 2012-04-11
layout: layouts/post.njk
---
EDIT June 5th: Someone pointed out to me in the comments that Meteor has been packaged and is available on the AUR under the name meteorjs. As always when downloading software from the AUR look at the PKGBUILD file and make sure that it is not doing anything malicious.

[Meteor](http://meteor.com/) is this new amazing JavaScript web platform. Unfortunately their installer only supports Debian and RedHat. So if you are running ArchLinux, for example you need to install it manually.

Lets download the .deb file

    $ wget http://d3sqy0vbqsdhku.cloudfront.net/meteor_0.3.2-1_amd64.deb

Since .deb files are just tarballs you can go ahead a decompress it manually and copy everything to its place. If you are lazy (like me) you can just install dpkg from AUR and then install meteor like this.

    $ dpkg --force-depends -i meteor_0.3.2-1_amd64.deb

It will warn you about missing dependencies because you don’t have the dpkg packages. The packages are pretty common so you probably already have them so just ignore that warning.

Go ahead and verify that it works:

    $ meteor create test123 $ cd test123 $ meteor $ $BROWSER [http://localhost:3000/](http://localhost:3000/)

*Originally published at [blog.whn.se](http://blog.whn.se/post/20900428947/installing-meteor-on-archlinux).*
