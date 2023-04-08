---
title: "Making your LLM run Python code with `llm-chain-tools` in Rust"
date: 2023-04-08
description: |
  Unleash the power of your LLM to run Python code using llm-chain-tools in Rust! Learn how to create a custom Python tool that allows your language model to perform accurate mathematical operations and more. Dive into the step-by-step guide and explore the endless possibilities with this powerful combination. Proceed with caution, as with great power comes great responsibility!
---

In today's world, Large Language Models (LLMs) have become an essential part of various applications, from chatbots and virtual assistants to complex data processing tasks. However, despite their impressive capabilities, LLMs can sometimes struggle with specific tasks like mathematical computations. In this blog post, we will walk you through the creation of a tool that invokes Python code based on the model output, allowing your LLM to perform mathematical operations more accurately.

The Python language seems like a good fit because most people already have it installed and its syntax is simple and doesn't use too many tokens, which makes it easy for the LLM to write.

Crafting prompts for tools is difficult since essentially we want the LLM to understand our tool invocation language. Luckily the `llm-chain` project can help us with that as it provides for the generation of prompts for making LLM's use tools.

Let's get started by creating a rust project with the following command:

```bash
cargo new --bin my-llm-calculator
```

Now in `main.rs` we can add the following:

```rust
use llm_chain::Parameters;
use llm_chain_tools::create_tool_prompt_segment;
use llm_chain_tools::tools::BashTool;
use llm_chain_tools::ToolCollection;
use std::boxed::Box;

fn main() {
    let tool_collection = ToolCollection::new(vec![Box::new(BashTool::new())]);
    let prompt =
        create_tool_prompt_segment(&tool_collection, "Please perform the following task: {}");
    println!(
        "{}",
        prompt.format(&Parameters::new_with_text(
            "Find the file GOAL.txt and tell me its content."
        ))
    );
}
```

This example creates a `ToolCollection` making sure to include `BashTool` which is a built-in tool for allowing the model to run bash commands -- very dangerous, and we're about to do the very same thing for Python!

The output of the above program is as follows:

```txt
You are now entering command only mode. You may only respond with YAML. You provided with tools that you can invoke by naming the tool you wish to invoke along with it's input.

To invoke a tool write YAML like this, do not include output:
command: Command
input:
  <INPUT IN YAML>


The following are your tools:
- name: BashTool
  description: A tool that executes a bash command.
  description_context: Use this to execute local commands to solve your goals
  input_format:
    cmd: The command to execute in the bash shell.


Please perform the following task: Find the file GOAL.txt and tell me its content.
```

That makes sense now we want to create a similar tool for Python code. Let's get straight to it.

**Define the PythonTool structure**: First, we need to define the structure of our PythonTool. In this case, our tool will be a struct that contains no additional data.

```rust
pub struct PythonTool {}
```

**Create a constructor**: Implement a constructor for the PythonTool.

```rust
impl PythonTool {
    pub fn new() -> Self {
        PythonTool {}
    }
}
```

**Define input and output structs**: Create two structs to represent the input and output for the PythonTool. The input struct will contain the Python code to execute, while the output struct will store the result, stderr, and stdout of the executed code.

```rust
#[derive(Serialize, Deserialize)]
pub struct PythonToolInput {
    code: String,
}

#[derive(Serialize, Deserialize)]
pub struct PythonToolOutput {
    result: String,
    stderr: String,
}
```

**Implement the Describe trait**: Implement the Describe trait for the input and output structs to provide descriptions for each field.

```rust
impl Describe for PythonToolInput {
    fn describe() -> Format {
        vec![("code", "The Python code to execute.").into()].into()
    }
}

impl Describe for PythonToolOutput {
    fn describe() -> Format {
        vec![
            ("result", "The result of the executed Python code.").into(),
            ("stderr", "The stderr output of the Python code execution.").into(),
        ]
        .into()
    }
}
```

**Implement the invoke_typed method**: Implement the `invoke_typed` method for the PythonTool, which will execute the provided Python code using the `Command` struct from the `std::process` module.

```rust
impl PythonTool {
    fn invoke_typed(&self, input: &PythonToolInput) -> Result<PythonToolOutput, String> {
        let output = Command::new("python")
            .arg("-c")
            .arg(&input.code)
            .output()
            .map_err(|_e| "failed to execute process")?;
        Ok(PythonToolOutput {
            result: String::from_utf8(output.stdout).unwrap(),
            stderr: String::from_utf8(output.stderr).unwrap(),
            stdout: String::from_utf8(output.stdout).unwrap(),
        })
    }
}
```

**Implement the invoke_typed method**: Implement the invoke_typed method for the PythonTool, which will execute the provided Python code using the Command struct from the `std::process` module.

```rust
impl PythonTool {
    fn invoke_typed(&self, input: &PythonToolInput) -> Result<PythonToolOutput, String> {
        let output = Command::new("python")
            .arg("-c")
            .arg(&input.code)
            .output()
            .map_err(|_e| "failed to execute process")?;
        Ok(PythonToolOutput {
            result: String::from_utf8(output.stdout).unwrap(),
            stderr: String::from_utf8(output.stderr).unwrap(),
            stdout: String::from_utf8(output.stdout).unwrap(),
        })
    }
}
```

**Implement the Tool trait**: Implement the Tool trait for the PythonTool, including the `gen_invoke_function!()` macro and the description() method. The `gen_invoke_function` macro handles serialization and deserialization while Description outputs our tool description.

```rust
impl Tool for PythonTool {
    gen_invoke_function!();
    fn description(&self) -> ToolDescription {
        ToolDescription::new(
            "PythonTool",
            "A tool that executes Python code.",
            "Python may be used anything from a calculator to a general programming language",
            PythonToolInput::describe(),
            PythonToolOutput::describe(),
        )
    }
}
```

Now let's see what kind of prompt we get with the Python tool. To do this we adapt our initial example to use the Python tool.

```rust
use llm_chain::Parameters;
use llm_chain_tools::create_tool_prompt_segment;
use llm_chain_tools::tools::BashTool;
use llm_chain_tools::ToolCollection;
use std::boxed::Box;

fn main() {
    let tool_collection = ToolCollection::new(vec![Box::new(BashTool::new())]);
    let prompt =
        create_tool_prompt_segment(&tool_collection, "Use python to: {}");
    println!(
        "{}",
        prompt.format(&Parameters::new_with_text(
            "Calculate the result of 10 + 15"
        ))
    );
}
```

```
You are now entering command-only mode. You may only respond with YAML. You are provided with tools that you can invoke by naming the tool you wish to invoke along with it's input.

To invoke a tool write YAML like this, do not include output:
command: Command
input:
  <INPUT IN YAML>


The following are your tools:
- name: BashTool
  description: A tool that executes a bash command.
  description_context: Use this to execute local commands to solve your goals
  input_format:
    cmd: The command to execute in the bash shell.


Use python to: Calculate the result of 10 + 15
```

Now let's get the LLM to run some code on our computer. This we can do like this.

```rs
use llm_chain::{traits::StepExt, Parameters};
use llm_chain_openai::chatgpt::{Executor, Model, Role, Step};
use llm_chain_tools::create_tool_prompt_segment;
use llm_chain_tools::tools::{BashTool, PythonTool};
use llm_chain_tools::ToolCollection;
use std::boxed::Box;
// A simple example generating a prompt with some tools.

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let tool_collection = ToolCollection::new(vec![Box::new(PythonTool::new())]);
    let template = create_tool_prompt_segment(&tool_collection, "Use python to: {}");
    let prompt = template.format(&Parameters::new_with_text(
        "Calculate the result of 10 + 15",
    ));

    let exec = Executor::new_default();
    let chain = Step::new(
        Model::ChatGPT3_5Turbo,
        [
            (
                Role::System,
                "You are an automated agent for performing tasks. Your output must always be YAML.",
            ),
            (Role::User, &prompt),
        ],
    )
    .to_chain();
    let res = chain.run(Parameters::new(), exec).await.unwrap();
    let message_text = res.choices.first().unwrap().message.content.clone();
    println!("{}", &message_text);
    match tool_collection.process_chat_input(&message_text) {
        Ok(output) => println!("{}", output),
        Err(e) => println!("Error: {}", e),
    }
}
```

In this example, we are using ChatGPT3.5 to perform the task, so there is some additional boilerplate around getting that model setup. So, straight after creating our tool-enabled prompt, we go ahead and create a chat prompt. With ChatGPT, we need to create a prompt suitable for it which starts with a System message before having the User (i.e., us) asking the assistant for something -- in this case, our complicated tool-use prompt. We run our model and print the first output from the ChatGPT model.

Finally, we invoke our tool using the `process_chat_input` function. Note that this will let ChatGPT run arbitrary Python code on our computer, which is, of course, extremely dangerous, but also extremely fun.

This results in first of all the ChatGPT model generating a bit of YAML:

```yaml
command: PythonTool
input:
  code: |
    x = 10
    y = 15
    result = x + y
    print(result)
```

This YAML thankfully has the correct format, which means that the tool system will be able to handle it. This invokes Python and gives back the result as YAML.

```yaml
result: |
  25
stderr: ""
```

And as expected, our output is 25. Now, this is a trivial example, and this could be used to create any kind of program. You could just as well ask it to play a prank on you or even create a self-replicating program. The sky is the limit.

And with that, we have let out our model in the real world -- consequences be damned. I would love to learn more about what you are building with it.
