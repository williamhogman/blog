---
title: "Building a Kafka based key-value store in Rust - Part 2: Implementation"
date: 2021-05-10
layout: layouts/post.njk
description: |
  The second part in the series implmeneting a kafka based key-value
  store in Rust. In this part we finally start writing code and
  implement the logic for storage as well as Kafka.
---

In the previous installment of this series we came up with a design
for a key-value stored backed by Kafka and sled. This time it is time
to start coding. Let's start with the storage module, because it is at
the core of what we're trying to build. If you haven't read it already
I suggest you go read [part 1 of the series](posts/building-a-kafka-backed-key-value-store-in-rust-part-1-the-design), as it contains the context
you need to understand the why of this service.

```rust
#[derive(Clone)]
pub struct Storage {
    db: sled::Db,
    kvs: sled::Tree,
}
```

For our purposes we implement the storage moduleas a struct consisting
of the Sled database itself and a subtree, which is its own
separate keyspace, which is great if you're building more complicated
applications. The database itself has a default subtree that you can use
directly, but creating a dedicated subtree for storing our keys and
values seems like a worthwhile investment in future
extensibility. Finally it is worth noting that we are deriving Clone
for our struct, this doesn't mean that cloning the storage module
would clone the entire database, rather Sled itself is thread safe and
sharing it between threads is no problem at all. Now lets look at how
we instantiate the storage and setup sled itself.

```rust
impl Storage {
    pub fn new() -> Result<Storage, sled::Error> {
        let db = sled::Config::default()
            .path("/tmp/key-value-store")
            .open()?;
        let s = Storage {
            db: db.clone(),
            kvs: db.open_tree("data")?,
        };
        Ok(s)
    }
}
```

This code, I think, shows how ergonomic a well designed API in Rust
can be. Using the config struct we decide on a path for the database
and we then open it. Then we open the subtree itself which is named
"data". All the error handling is done using Rust's `?` or `try`
operator, which causes the function to return the error in the result
value it operates on. In Go, each `?` would have been repalced by
three lines of boilerplate, which makes this a huge boon to
readability.

```rust
impl Storage {
    pub fn get(&self, key: &[u8]) -> Result<Option<sled::IVec>, sled::Error> {
        self.kvs.get(key)
    }
    pub fn insert(&self, key: &[u8], data: &[u8]) -> Result<(), sled::Error> {
        self.kvs.insert(key, data).map(|_| ())
    }
}
```

Now lets implement the basic get and set operations
operations. Getting is the simpler of the two operations and we
essentially just forward the call to the underlying subtree. For
inserts sled returns the previous value at the key if such a value
exists. We have no need for this so we use map to transform our
result, discarding the returned value and replacing it with `()`, the
empty tuple. In Rust the empty tuple is a zero-size value, which means
that the compiler will under some circumstances optimize away the
value entirely. Now that we completed the storage layer lets move on
to the service layer.

```rust
#[derive(Debug, Snafu)]
pub enum Error {
    #[snafu(context(false))]
    SledError { source: sled::Error },
}

#[derive(Clone)]
pub struct Service {
    storage: Storage,
}
```

For the service layer we define two types an Error type and a type for
our service layer. For the error type we use a library called Snafu to
quickly create our own error type which wraps the underlying errors
that might occur in our application. For now the only errors our
application might encounter are Sled errors. We only a single error
type wrapping it is not neccessary, but as soon as we run into other
errors we will be glad that we did.

A nice pattern to use with custom error types is defining a type alias
for Results of your error type. For instance the Rust standard library
does this for IO like this.

```rust
pub type Result<T> = result::Result<T, Error>;
```

This is very useful because it reduces the
boilerplate in your code because everytime you write a Result type
signature you now just have to include the Ok type and not the
error. Ordinarily it is best practice to avoid potentially confusing type
aliases, but this is an idiom of the language so we will make an exception.

```rust
type Result<T> = std::result::Result<T, Error>;
```

Now let's implement the operations on the service layer.

```rust
impl Service {
    pub async fn new() -> Result<Service> {
        Ok(Service {
            storage: Storage::new()?,
        })
    }

    pub async fn get(&self, key: &[u8]) -> Result<Option<sled::IVec>> {
        Ok(self.storage.get(key)?)
    }

    pub async fn insert(&self, key: &[u8], data: &[u8]) -> Result<()> {
        self.storage.insert(key, data)?;
        Ok(())
    }
}
```

The implementation for the service layer is very simple we just
forward calls to the storage layer. One thing worth noting here is how
the how the `?`, try operator is able to translate between the sled
errors returned by the storage layer and our errors returned by the
service layer. The Snafu library creates conversions method between
our Error type and all of its consitutent inner errors, in our case
just `sled::Error`. The try operator then uses this conversion
implicitly and the errors are transformed just like that.

Now with the service and storage layers done we're are ready to start
working on the interfaces interacting with our service and storage
layers. Lets start with Kafka since it will be the easiest.

The first thing to consider when using Kafka is what kafka library we
want to use. There are two crates with kafka clients available,
[`kafka`](https://docs.rs/kafka) and
[`rdkafka`](https://docs.rs/rdkafka). The difference between the two
is that `kafka` is a pure rust implementation of the Kafka protocol
while `rdkafka` is a wrapper around the C library `librdkafka`. Both
libraries are of excellent quality and would both be great choices for
a depenendcy. `kafka` has the advantage of being pure rust and not
needing to manage any dependencies outside the rust ecosystem, while
`rdkafka` has the advantage of relying on the first party,
battle-tested library that is `librdkafka`. For this project I went
with `rdkafka` because the risk of the C-interop seems marginally
smaller than the risk of a complete protocol implementation.

```rust
pub struct Consumer {
    consumer: StreamConsumer,
    svc: Service,
}

impl Consumer {
    pub fn new(config: &Config, service: Service) -> KafkaResult<Consumer> {
        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", "kvs")
            .set("bootstrap.servers", "hostname-for-your-kafka")
            .set("auto.offset.reset", "earliest")
            .set("enable.partition.eof", "false")
            .set("session.timeout.ms", "6000")
            .set("enable.auto.commit", "true")
            .create()?;
        consumer.subscribe(&vec!["kvs-topic"])?;
        Ok(Consumer {
            consumer,
            svc: service,
        })
    }
}
```

We use `rdkafka`s StreamConsumer to provide an easy to use model for
consuming data from it. The `Consumer` needs a service instance to
make changes to and a consumer to get them from. Now lets see how can
use these components to consume messages. To do this lets add another method.

```rust
impl Consumer {
    pub async fn run(&self) {
        let mut stream = self.consumer.stream();
        while let Some(r) = stream.next().await {
            if let Err(e) = r {
                eprintln!("Kafka error: {}", e);
                continue;
            }
            let m = r.unwrap();
            if m.key().is_none() {
                continue;
            }
            let k = m.key().unwrap();
            let p = m.payload().unwrap_or(&[0u8; 0]);

            if let Err(e) = self.svc.insert(k, p).await {
                println!("Error writing key {:?} {:}", k, e)
            }
        }
    }
}
```

That looks like a lot of code but it isn't really doing all that much,
first we call stream on our consumer to treat it as an async stream
and then we use a while let loop to consume the stream as it
arrives. When stream.next() produces a None value the while loop will
terminate and our method return.

After getting the value from Kafka we receive a result, `r` which we
first check for errors. If we get an error from kafka we print it
and then use continue to poll the next value from the stream. If it is
not an error we have received a kafka message which, among other
things consists of a key and a payload. The key is what we will use as
the key and the payload we will use as our value. If the key is not
set we cannot do anything about it and have to skip it. If the payload
is empty we treat it as an empty binary string. Now with our key and
value as binary strings we can finally pass them on to our service
object and await it's completion. If the operation fails we print the
error to the terminal.

That's all there is to consuing messages from Kafka in Rust. We will
now read our entire kafka topic, inserting data into our key
value store based on the payloads and keys of the Kafka messages. Next
time we will look at implementing the read side of the service,
discussing what RPC framework to use and implementing it as well as
introducing a main function and configuration.
