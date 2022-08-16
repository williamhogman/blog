---
title: Deduplication with BTRFS
description: BTRFS is an alternative filesystem for Linux that provides copy-on-write support which enables deduplication.
date: 2012-08-06
layout: layouts/post.njk
---

Deduplication in software is self-descriptively enough functionality that enables software to avoid storing data more than once. In some cases, this might be easily accomplished in others such as file systems it is not that easy. But why would you even have duplicate files in a file system? Well, for good or bad we now have to deal with Docker and while Docker tries to avoid duplication by organizing its images into layers, this is often not enough. If one image is using one version of Debian and another is using a different version we need both copies. With more and more software delivered as docker images, this means that most machines store a whole bunch of distros on their drives. What often happens however is that these different distros share a whole bunch of files that often have the same content. Docker internally supports using BTRFS as a storage driver which allows docker to hand over the handling of its layers to BTRFS directly, and this will allow us to use BTRFS duplication to reduce storage requirements.

But first some theory: Symlinks are a simple solution to duplication, just symlink big file into two places and tada, disk space saved. HoweverWell yes and no - what if the two files are changed separately if one was just a symlink to the other then our changes would incorrectly propagate to the other file. Traditionally we would have to create copies, but with BTRFS, a modern file system based on Copy-On-Write semantics we can be smarter.

```
cp --reflink=auto foo.txt bar.txt
```

Using the above command we copy foo.txt into bar.txt, except we don't copy it. We record the fact that foo.txt and bar.txt refer to the same content and link to it. If foo.txt or bar.txt ever changes, the updated file needs to be separated from the original, by creating a copy. This is called Copy-On-Write and is an interesting feature but perhaps not the best option for data that changes often.

But what does this have to do with duplication? Well if we can go through our entire file system taking pairs of files with the same content, this would allow us to delete one of the copies and create a `reflink` from deleted file to the other one. This would probably save us a lot of disk space. Finding pairs of matching files, however, is easier said than done. We certainly can't compare the files in their entirety, we would need to use some kind of hash function to compare them. Second, we would create some kind of map between hashes and in what file that content is found. Fortunately, the trusty old hash map solves our problem. We simply stash a huge hashmap on disk containing every hash we know about along with the file path. Then if we ever find the file again we simply look in our hashmap and create a link to it.

This is not something that anybody who values their data would like to write themselves, but fortunately, there is software that solves this issue. Enter, [bees](https://github.com/Zygo/bees), bees is a daemon that you can run to deduplicate your filesystem. You simply install it decide on a size for your hash map and point it to your disk.

```
DB_SIZE=$((1024*1024*256)) # 256Mb in bytes
```

Next, we need to volume UUID to tell `bees` where it should perform deduplication. We get this using the `btrfs` command line tool.

```
btrfs filesystem show /
```

Finally, we're ready to go. We only need to start the service.

```
systemctl enable --now bees@YOURIDHERE
```

Pretty soon you will find your CPU running hot and your disk usage trending downwards. The work of duplication is quite intensive but the `bees` software is configured with a high niceness value so it shouldn't affect the system responsiveness too much. In a more serious environment, we can use bees' built-in load target to avoid eating up all the CPU, just to be safe.

In my case the full scan took a few hours but when it was done disk usage was reduced by 40%. Mainly thanks to fixing duplication resulting from various copies of docker images. Which I think is pretty cool. Does this mean that deduplication is a good approach? Only in very limited cases is it a good fit; if data only changes seldomly; if we are unable to implement deduplication in software, then possibly it can be a good fit. However, in most cases, storage is cheap and elastic and deduplication won't be worth the time. But who knows? - maybe you dear reader can find a cool new use case where deduplication makes sense.
