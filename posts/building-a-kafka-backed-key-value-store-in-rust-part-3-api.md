---
title: "Building a Kafka based key-value store in Rust - Part 3: API"
date: 2021-05-15
layout: layouts/post.njk
description: |
  The third part in the series implementing a kafka based key-value
  store in Rust. In this part we implement the API itself.
---

In the previous installment of this series we implemented the core of a key-value stored backed by Kafka and sled. Today we will finish the API for it. If you haven't read it already I suggest you go read [part 2 of the series](posts/building-a-kafka-backed-key-value-store-in-rust-part-2-implementation).

For an API let's use GRPC, there are many options, of course, but GRPC is is a good compromise between performance and flexibilty, perhaps at the cost of some complexity. GRPC is based on Protobuf and HTTP/2, both binary protocols with good serialization performance. To use GRPC in Rust we have to install some dependencies.

- `tonic` - which implements the GRPC server (and clients)
- `prost` - which generates rust code from `.proto` files
- `tonic-health` - implements the GRPC healthcheck service useful for exposing a standardized healthcheck for use with kubernetes.

Now with that out of the way we need to specify our GRPC service using a the protobuf IDL. Let's place the file in `proto/kvs2.proto`

```
syntax = "proto3";
package kvs2;

service Kvs2 {
  rpc MultiGet(MultiGetRequest) returns (MultiGetReply);
  rpc Get(GetRequest) returns (GetReply);
  rpc Set(SetRequest) returns (SetReply);
}

message SetRequest {
  bytes key = 1;
  bytes value = 2;
}

enum SetStatus {
  PUBLISHED = 0;
}

message SetReply {
  SetStatus status = 1;
}

message GetRequest {
  bytes key = 1;
}

enum ReadStatus {
  OK = 0;
  NOT_FOUND  = 1;
}

message GetReply {
  ReadStatus status = 1;
  bytes data = 2;
}

message MultiGetRequest {
  repeated bytes keys = 1;
}

message MultiGetResponsePart {
  bytes key = 1;
  ReadStatus status = 2;
  bytes data = 3;
}

message MultiGetReply {
  repeated MultiGetResponsePart parts = 1;
}
```

This defines exactly the same API as we discussed in the first part of the series. Now for this to work we need to do a couple of thing. First, we need to add a `build.rs` file, this file also known as a build script is used by to enable code generation. The below snippet ensures that code is generated based on the protobuf file we specified earlier.

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("proto/kvs2.proto")?;
    Ok(())
}
```

Pretty self-explanatory, if you ask me, but perhaps most impressively we're still only using the Cargo build chain to compile - no extra executables needed.

Now we can create a new file `rpc.rs` to implement our API.

```rust
use crate::config::Config;
use crate::service::{Error, Service};
use futures::FutureExt;
use kvs2::kvs2_server::{Kvs2, Kvs2Server};
use kvs2::{
    GetReply, GetRequest, MultiGetReply, MultiGetRequest, MultiGetResponsePart, ReadStatus,
    SetReply, SetRequest, SetStatus,
};
use std::time::Duration;
use tonic::{transport::Server, Request, Response, Status};

pub mod kvs2 {
    tonic::include_proto!("kvs2");
}
```

Most important in this snippet is the `include_proto` which brings the protobuf-generated code into scope. We can the implement the service itself.

```rust
struct Kvs2Impl {
    svc: Service,
}

fn err_to_status(err: Error) -> Status {
    match err {
        Error::KafkaError { source: _ } => Status::unavailable("Kafka error"),
        Error::SledError { source: _ } => Status::unavailable("Sled error"),
    }
}

#[tonic::async_trait]
impl Kvs2 for Kvs2Impl {
    async fn get(&self, request: Request<GetRequest>) -> Result<Response<GetReply>, Status> {
        self.svc
            .get(&request.get_ref().key)
            .await
            .map_err(err_to_status)
            .map(|res| match res {
                Some(x) => GetReply {
                    status: ReadStatus::Ok.into(),
                    data: x.to_vec(),
                },
                None => GetReply {
                    status: ReadStatus::NotFound.into(),
                    data: (&[0u8; 0]).to_vec(),
                },
            })
            .map(|x| Response::new(x))
    }
    async fn set(&self, request: Request<SetRequest>) -> Result<Response<SetReply>, Status> {
        self.svc
            .insert_globally(&request.get_ref().key, &request.get_ref().value)
            .await
            .map_err(err_to_status)
            .map(|_| SetReply {
                status: SetStatus::Published.into(),
            })
            .map(|x| Response::new(x))
    }
    async fn multi_get(
        &self,
        request: Request<MultiGetRequest>,
    ) -> Result<Response<MultiGetReply>, Status> {
        let keys = &request.get_ref().keys;
        self.svc
            .get_many(keys)
            .await
            .map_err(err_to_status)
            .map(|x| {
                x.iter()
                    .enumerate()
                    .map(|(i, y)| match y {
                        Some(data) => MultiGetResponsePart {
                            key: keys[i].to_vec(),
                            data: data.to_vec(),
                            status: ReadStatus::Ok.into(),
                        },
                        None => MultiGetResponsePart {
                            key: keys[i].to_vec(),
                            data: (&[0u8; 0].to_vec()).to_vec(),
                            status: ReadStatus::NotFound.into(),
                        },
                    })
                    .collect::<Vec<MultiGetResponsePart>>()
            })
            .map(|parts| MultiGetReply { parts })
            .map(|x| Response::new(x))
    }
}
```

The service is then simply translating between Protobuf and our internal service struct. We can then create a serve function like this:

```rust

pub async fn serve(_config: &Config, svc: Service) -> Result<(), Box<dyn std::error::Error>> {
    let svc = Kvs2Impl { svc };
    let addr = "0.0.0.0:50051".parse()?;

    let (mut health_reporter, health_service) = tonic_health::server::health_reporter();
    health_reporter.set_serving::<Kvs2Server<Kvs2Impl>>().await;
    health_reporter
        .set_service_status("", tonic_health::ServingStatus::Serving)
        .await;

    Server::builder()
        .timeout(Duration::from_secs(5))
        .add_service(health_service)
        .add_service(Kvs2Server::new(svc))
        .serve_with_shutdown(addr, tokio::signal::ctrl_c().map(|_| ()))
        .await?;
    Ok(())
}
```

Which creates a GRPC server, on the standard port containing a healthcheck and a Kvs2Server. Which will keep on servering until it receives a SIGTERM or the equivalent.

We can now set up our main.rs to create both Kafka consumers as well as our GRPC endpoints.

```rust
mod config;
mod consumer;
mod producer;
mod rpc;
mod service;
mod storage;

#[tokio::main(worker_threads = 4)]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = config::load()?;
    let prod = producer::Producer::new(&config)?;
    let svc = service::Service::new(prod, &config).await?;
    let consumer = consumer::Consumer::new(&config, svc.clone())?;

    let cons_handle = tokio::spawn(async move {
        consumer.run().await;
    });
    let svc_rpc = svc.clone();
    let serve_handle = tokio::spawn(async move {
        rpc::serve(&config, svc_rpc).await.unwrap_or(());
    });

    let (a, b) = tokio::join!(cons_handle, serve_handle);
    a?;
    b?;

    svc.prepare_for_shutdown().await?;

    Ok(())
}
```

Done! And there you have it that's how you create a Kafka backed key-value store that is also accessible via GRPC. I hope you enjoyed this series
