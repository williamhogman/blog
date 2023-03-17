---
title: Leveraging Langchain to iteratively apply Large Language Models to Evaluate Job Candidate CVs
description: |
  Explore the potential of Large Language Models (LLMs) in solving complex problems with this informative blog post. Understand how iteratively applying LLMs can be utilized in applications like evaluating job candidate suitability based on CVs, and learn the essential steps to effectively harness the power of these models. Delve into the world of LLMs and see how they can simplify the development process and provide innovative solutions to intricate challenges. Join us for an insightful discussion on the practical applications of LLMs.
date: 2023-03-17
---

Large Language Models (LLMs) have made incredible strides in recent years, opening up a world of possibilities for applications built on top of them. Large Language Models (LLMs) have made incredible strides in recent years, opening up a world of possibilities for applications built on top of them. These models, like GPT-3 and its successors, have been pre-trained on vast amounts of text data, enabling them to generate contextually relevant responses based on the input they receive. This ability to predict and generate text is the foundation of their usefulness in a wide range of applications, including chatbots, summarization, translation, and much more. By leveraging the power of LLMs, developers can create novel applications that previously required dedicated models, thus streamlining and simplifying the development process. The question is how to best ask, or prompt the model to give the best answer possible.

Another innovative way of using LLMs is iteratively applying them. This involves using the output of one instance of the model as the input for the next instance, essentially chaining multiple stages of processing to solve more complex tasks. This approach enables developers to break down a problem into smaller, more manageable steps, allowing LLMs to tackle challenges that may otherwise be too intricate for a single model invocation. In this blog post, we will demonstrate this approach by determining a job candidate's suitability for a role based on their CV. Our solution follows a three-step process:

1. **Extracting Text from CVs**: First, we extract the text from the candidate's submitted CV, which could be in any format.
2. **Summarizing the Content of the CV**: Next, we apply the LLM to summarize the content of the CV, condensing the information into a more manageable form.
3. **Evaluating Suitability for the Role**: Finally, we apply the LLM to the summary and the expected role, asking for a suitability rating.

## Extracting Text from CVs

To extract the text we need to use an external library, in this case: `unstructured`, which we can install like this:

```bash
pip install "unstructured[local-inference]"
```

The first step in our three-step process is to extract the text content from the submitted CV, which could be in any format (e.g., PDF, DOCX, or TXT). To achieve this, we will build the `extract_content_from_cv(path)` function. This function takes the path to a CV file as its input and returns the extracted text content as a string.

```python
from unstructured.partition.auto import partition
def extract_content_from_cv(path):
    """Extracts the content from a CV and returns a string of the content"""
    extract = partition(filename=path)
    extract_str = "\n\n".join([str(i) for i in extract])
    return extract_str
```

In this function, we use the partition function from the `unstructured.partition.auto` package to extract the text content from the CV file. The partition function reads the file, detects its format, and extracts the content accordingly. After the extraction, we join the individual sections of the extracted content using newline characters, creating a single string that represents the entire content of the CV.

## Summarizing the Content of the CV:

The second step in our process is to apply a Large Language Model (LLM) to summarize the content of the CV. To achieve this, we define a prompt that will instruct the LLM to generate a summary based on the input CV text. At this point, we need to install `langchain`.

```bash
pip install langchain
```

Now we can start coding up the prompt.

```python
# A prompt used to summarize a CV
summary_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(
            prompt=PromptTemplate(
                template="You are a helpful assistant that summarizes CVs for job applicants. You are currently working on a {role} role ",
                input_variables=["role"],
            )
        ),
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                template="Please summarize this CV for me. \n\n {cv} \n\n",
                input_variables=["cv"],
            )
        ),
    ]
)
```

In this code snippet, we create a ChatPromptTemplate object that contains two message templates:

1. `SystemMessagePromptTemplate`: This template sets the context for the LLM by informing it that its role is to summarize CVs for job applicants, specifically for a given job role. The `input_variables` parameter is set to `["role"]`, which means that the job role will be provided as input when calling the LLM.
2. `HumanMessagePromptTemplate`: This template provides the actual CV content to the LLM and requests the summary. It uses the template parameter with a string that includes the CV content, enclosed within newline characters to separate it from the instruction. The input_variables parameter is set to `["cv"]`, which means that the CV content will be provided as input when calling the LLM.

By providing a well-structured prompt, we instruct the LLM to generate a concise summary of the candidate's CV, which will be used in the next step of our process: evaluating the candidate's suitability for the desired role.

## Evaluating Suitability for the Role

The third and final step in our process is to apply the LLM to the summary generated in the previous step, along with the desired role, to determine the candidate's suitability for the position. We achieve this by defining another prompt that instructs the LLM to evaluate the summary and provide a rating on a scale of 1 to 5.

```python
# A prompt used to determine the suitability of a CV
relevance_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(
            prompt=PromptTemplate(
                template="You are a helpful assistant tasked with judging the suitablity of CVs for job applicants. You are currently working on a {role} role",
                input_variables=["role"],
            )
        ),
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                template="Please evaluate the below profile and indicate their `Suitability` for this role on a scale of 1-5 and write down your reasoning. \n\n {summary} \n\n",
                input_variables=["summary"],
            )
        ),
    ]
)
```

Similar to the previous prompt, we create a `ChatPromptTemplate` object containing two message templates:

1. `SystemMessagePromptTemplate`: This template sets the context for the LLM by informing it that its task is to judge the suitability of CVs for job applicants based on a given job role. The `input_variables` parameter is set to `["role"]`, which indicates that the job role will be provided as input when calling the LLM.
2. `HumanMessagePromptTemplate`: This template provides the summary generated in the previous step to the LLM and requests an evaluation, including a suitability rating on a scale of 1 to 5 and the reasoning for the rating. The template parameter contains a string with the summary, enclosed within newline characters to separate it from the instruction. The `input_variables` parameter is set to `["summary"]`, which means that the summary will be provided as input when calling the LLM.

By providing this prompt, we instruct the LLM to evaluate the candidate's CV summary and generate a suitability rating, along with an explanation for the rating. This helps us to determine whether the candidate is a good fit for the desired role.

Now with all the parts in place, it is time to tie it together.

## Tying it all together

Now that we have created the prompts for summarizing CVs and evaluating candidate suitability, we need to tie everything together by executing these prompts sequentially. We use the `SequentialChain` from the `langchain.chains` package to accomplish this.

```python
# Combine the two prompts into a single chain
combined_chain = SequentialChain(
    chains=[
        LLMChain(llm=chat, prompt=summary_prompt, output_key="summary"),
        LLMChain(llm=llm, prompt=relevance_prompt),
    ],
    input_variables=["role", "cv"],
    verbose=False,
)
```

In this code snippet, we create a `SequentialChain` object that combines two `LLMChain` objects, each responsible for one of the prompts we created earlier. The first `LLMChain` is responsible for summarizing the CV, while the second `LLMChain` evaluates the candidate's suitability for the role. The `output_key="summary"` parameter in the first `LLMChain` is used to store the summary generated by the LLM, which will be passed as input to the second `LLMChain`. The `input_variables=["role", "cv"]` parameter ensures that both the role and the CV content are provided as input when calling the sequential chain.

Next, we define a function `determine_suitability(cv_text, role)` that takes the CV text and the desired role as input and runs the combined_chain to obtain the suitability evaluation.

```python
def determine_suitability(cv_text, role):
    """Determines the suitability of a CV for a role"""
    res = combined_chain.run(
        role=role,
        cv=cv_text,
    )
    return res

```

By invoking the `determine_suitability` function with the extracted CV text and the desired role, we run the sequential chain that first summarizes the CV and then evaluates the candidate's suitability for the role. This function returns the suitability rating along with the reasoning provided by the LLM, which can be used to make informed decisions about the candidate's fit for the position.

Now that we have defined all the required components of our solution, let's create a wrapper function and a main routine to showcase how the entire process works with a real CV file.

```python
def determine_suitabilty_for_cv_file(file, role):
    """Determines the suitability of a CV for a role"""
    cv_text = extract_content_from_cv(file)
    return determine_suitability(cv_text, role)
```

In this code snippet, we define a function `determine_suitabilty_for_cv_file(file, role)` that takes a file path and the desired role as input. This function first calls the `extract_content_from_cv` function to extract the text content from the CV file. Then, it passes the extracted text and the desired role to the `determine_suitability` function, which we defined earlier. The function returns the suitability rating and the reasoning provided by the LLM.

Finally, we create the main routine to showcase the solution:

```python
if __name__ == "__main__":
    # Grab the path from the command line
    if len(sys.argv) < 2:
        print("Please provide a path to a CV")
        exit(1)
    path = sys.argv[1]
    # Determine the suitability of the CV
    for title in [
        "Data Scientist",
        "Data Engineer",
        "Data Analyst",
        "Software Engineer",
        "Gardener",
        "Cook at McDonalds",
    ]:
        print(f"===== {title} =====")
        res = determine_suitabilty_for_cv_file(path, title)
        print(res)
        print()
```

In this section of the code, we first check if the user has provided a path to a CV file as a command line argument. If not, the program prints an error message and exits. Otherwise, it proceeds to evaluate the CV's suitability for a list of predefined job titles. For each job title, the `determine_suitabilty_for_cv_file` function is called with the file path and the job title as input. The function returns the suitability rating and reasoning, which are then printed to the console. This allows users to quickly see how well the CV fits each of the predefined job roles.

In conclusion, we have demonstrated how to build a comprehensive solution for evaluating the suitability of a candidate's CV for different job roles using Large Language Models (LLMs). By combining text extraction, CV summarization, and candidate evaluation, we can efficiently and effectively assess a candidate's fit for a specific role based on their CV. This solution opens up new opportunities to explore and experiment with the prompts used to instruct the LLMs. Tweaking the prompt phrasing, providing more context, or altering the format of the request may lead to even more accurate and nuanced evaluations. This flexibility allows developers to tailor the LLM's responses to their specific needs, thereby enhancing the decision-making process in candidate selection.

This solution also highlights the power of leveraging Large Language Models in real-world applications with relatively little code. With just a few lines, we can create a practical tool for assessing CVs in various job roles, showcasing the efficiency and versatility of LLMs. Furthermore, the adaptability of LLMs allows for the rapid development and deployment of similar solutions across a wide range of industries, paving the way for innovative applications and new business opportunities. Of course, this solution isn't ready for prime time but there is certainly a path to creating something useful.

Thank you, dear reader, for taking the time to explore the fascinating world of Large Language Models and their applications with us. We hope you found this journey both informative and inspiring. I encourage you to continue experimenting with LLMs, and we look forward to witnessing the incredible innovations that you'll undoubtedly contribute to this ever-evolving landscape. Until next time, happy coding, and may your AI-powered adventures be filled with discovery and success!
