---
title: Using GPT3.5 to summarize financial reports for your favorite stocks
description: Discover how to create a time-saving solution for staying informed about your favorite stocks using unstructured.io, langchain, GPT-3.5, Python and some clever prompt engineering. Learn how to combine these technologies to effortlessly summarize lengthy investor documents, allowing you to quickly grasp key takeaways without investing too much time.

date: 2023-03-26
---

As an occasional stock market investor, I have an interest in keeping an eye on the companies I invest in, like many of us, I often struggle to find the time to read through detailed investor documents like quarterly reports. It's a common problem we face when trying to stay informed about the companies we care about.

Luckily, technology can lend a hand. By leveraging unstructured.io, langchain, and GPT-3.5, we can create a practical tool to help summarize those lengthy investor documents. This way, we can quickly understand the key takeaways without investing too much time. In this blog post, we'll explore how to combine these technologies to create a time-saving solution for staying up-to-date with your favorite stocks.

Let's start with the first problem, these documents are usually PDFs making it hard to read the contents of the file in our programs. Fortunately, `Unstructured.io` is a library that solves this problem for us. The library simplifies the process of extracting information from PDFs and other document formats. By converting messy and unstructured data into a more manageable form. For our purpose, it is crucial as it allows us to extract data from the original PDFs.

After extracting the text will be using GPT-3.5 through the Langchain library. GPT-3.5 is OpenAI's large-scale language model, famous for its exceptional natural language understanding and generation capabilities. GPT-3.5 will be what is actually creating the summary, but Langchain on the other hand will handle the logic around summarizing the text.

Let's get coding.
First things first let's get our dependencies downloaded

```bash
pip install langchain llamaindex 'unstructured[local-inference]'
```

Our first task is to load our documents from PDFs to do this we use `llama_index`'s wrapper around the unstructured.io library.

```python
from llama_index import download_loader
UnstructuredReader = download_loader("UnstructuredReader")

loader = UnstructuredReader()
documents = loader.load_data(file=Path('PDX-2022-Year-end.pdf'))
documents = [d.to_langchain_format() for d in documents]
```

In this section, we load the PDF in this case `PDX-2022-Year-end.pdf`. It gets turned into a list, containing the textual representation of our PDF. We finally transform the document to langchain format so we can use it with langchain.

LLMs cannot process an infinite amount of data a the same time so we need to use a text-token splitter. Specifically, any instruction for the model, as well as the document and the output of the model need to share, in the case of GPT3.5, 4097 tokens, with each token representing roughly 2 characters. We now need to split our document into smaller parts so that each part can be processed by an LLM.

```python
from langchain.text_splitter import TokenTextSplitter
text_splitter = TokenTextSplitter(chunk_size=4097-1024)
documents = text_splitter.split_documents(documents)
```

Now, this code will split our single document into multiple documents each 3073 tokens or shorter, ensuring that they fit into our LLM's context.

We can now move on to setting up the prompts that will help GPT-3.5 summarize the document effectively. Crafting well-defined prompts is essential to ensure that the generated summaries are accurate and meaningful. Here's the first prompt that will be applied to each of the documents:

```python
from langchain.prompts.chat import (ChatPromptTemplate,
                                    HumanMessagePromptTemplate,
                                    SystemMessagePromptTemplate)
# A prompt used to summarize a Year-End report
map_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(
            prompt=PromptTemplate(
                template="You are an investment analyst tasked with summarizing the Year-End report for your boss, who expects a concise summary with what has happened in the company. He doesn't want to see legal boilerplate",
                input_variables=[],
            )
        ),
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                template="Please provide lists of the Opportunities, KPIs, General Events, and other relevant items. Make sure to capture the numbers. If there is nothing relevant in this section, you can say 'None'. \n\n {text} \n\n",
                input_variables=["text"],
            )
        ),
    ]
)
```

This prompt sets the stage for GPT-3.5 by framing the task at hand: summarizing a Year-End report for a busy boss who needs a concise overview of the company's performance. It specifically asks for Opportunities, KPIs, General Events, and other relevant items, emphasizing the importance of capturing numerical data.

By providing such a prompt, we're giving GPT-3.5 clear instructions and context, which allows the AI to generate a focused summary. It's important to mention that if there's nothing relevant in a particular section, GPT-3.5 can simply respond with 'None', helping the LLM find a way out if the page doesn't make sense.

Remember that the initial prompt we defined will be applied to each partition of the document. This means that we'll end up with several separate summaries, but what we really want is a single, cohesive summary. To achieve this, we'll define a second prompt called the reducer prompt.

```python
# A prompt used to combine separate summaries into one cohesive summary
reduce_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(
            prompt=PromptTemplate(
                template="You are an investment analyst tasked with summarizing the Year-End report for your boss, who expects a concise summary with what has happened in the company. He doesn't want to see legal boilerplate",
                input_variables=[],
            )
        ),
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                template="Combine the summaries that your colleagues have provided into one combined document. \n\n {text} \n\n Make lists of  Opportunities, KPIs, General Events, and other relevant items. Make sure to capture the numbers.",
                input_variables=["text"],
            )
        ),
    ]
)
```

This reducer prompt is designed to guide GPT-3.5 in merging the separate summaries generated for each partition of the document into one comprehensive, well-organized summary. It reiterates the task of creating a concise Year-End report summary and emphasizes the importance of listing Opportunities, KPIs, General Events, and other pertinent details, along with capturing the numbers.

By using the reducer prompt, we ensure that the final output is a streamlined, easy-to-understand summary, effectively merging the insights from the various partitions of the document.

Now to actually execute our prompts over the inputs we do the following. Which applies the prompts in a map-reduce fashion. With map being applied to each document and reduce used to combine them.

```python
from langchain.chat_models import ChatOpenAI
chat = ChatOpenAI()
chain = load_summarize_chain(chat, chain_type="map_reduce", verbose=False, map_prompt=map_prompt, combine_prompt=reduce_prompt)
res = chain.run(documents)
print(res)
```

The first line creates the ChatGPT client.
The second line initializes the summarization chain by calling the load_summarize_chain function. This function takes several arguments:

- `chat`: The ChatGPT client used
- `chain_type`: In this case, we're using a "map_reduce" chain type, which is a two-step process involving the map prompt and the reduce prompt.
- `map_prompt`: This is the prompt we defined earlier to summarize each partition of the document.
- `combine_prompt`: This is the reducer prompt we defined earlier to merge the separate summaries into one cohesive summary.

With the summarization chain loaded, we're now ready to apply it to our documents.

The second line of the code snippet calls the run method on the chain object, passing in the documents as an argument. This line initiates the summarization process by applying the map prompt to each partition of the document and then using the reduce prompt to combine the resulting summaries into a single, unified summary.

Finally we print the result, which will be something like that:

```txt
Opportunities:
- The company's focus on live games and increasing the cadence of downloadable content could lead to stronger recurring revenue.
- The release of new games from the company's pipeline could provide opportunities for growth in revenue and cash flow.
- Increase revenue by investing in game development and development support.
- Opportunity to acquire additional licenses, brands and similar rights to expand the company's offerings.
- There is potential for continued growth and revenue from the company's major customer, as well as opportunities for expansion into new geographical areas or product categories.
- Expansion into new markets, especially in Asia.
- Development and release of new games to further diversify their product portfolio.

KPIs:
- Revenues for the full year amounted to MSEK 2,972.9, an increase of 45% compared to the same period last year.
- Gross profit for the full year was MSEK 1,110.3.
- Operating profit for the full year was MSEK 887.1.
- Cash flow from operating activities for the fourth quarter amounted to MSEK 244.5.
- Goodwill amounted to MSEK 22.4.
- The company had a total current assets of SEK 506,599, a total equity of SEK 2,292,377, and a total comprehensive income of SEK 729,489.
- Group revenue for 2022 is SEK 580,010 compared to SEK 390,515 in 2021, showing a significant increase in revenue.
- Prepaid revenue amounted to SEK 264.2 at the end of the period.
- Group revenue for a single customer amounted to MSEK 412.8 and MSEK 1,240.6 for the quarter and 12-month period respectively.
- Paradox Interactive owns the World of Darkness brand catalogue, which contributes to the company’s overall value.

General Events:
- The release of Victoria, developed by Paradox Development Studio, and other new downloadable content and ports for various games.
- The Board proposal for a dividend of SEK per share.
- Strong financial performance in terms of revenue and profit throughout the year.
- The parent company houses the publishing business, which buys development services from external and wholly owned development studios, and pays royalties to these where applicable.
- Paradox Interactive is listed on Nasdaq First North Premier Growth Market.
- The company's game portfolio includes popular franchises such as Stellaris, Europa Universalis, and Cities: Skylines.
- The group revenue for the year was divided into major product categories.

Other relevant items:
- Paradox Interactive is expanding its core and preparing to release new games from its pipeline.
- Amortisations of licenses, brands, and similar rights amounted to MSEK 22.6 for the year.
- The company strives for a healthy profit margin, stable operating cash flow, and strong growth.
- Other income amounted to MSEK 56.6, and other expenses amounted to MSEK 17.7, primarily consisting of exchange rate effects on the group's cash and cash equivalents, operating receivables, and operating liabilities during the quarter.
- Right-of-use assets for offices amounted to MSEK 136.1.
- The company's short-term financial instruments valued at accrued acquisition value essentially correspond to its fair value as the discounting effect is not significant.
- There were no related party transactions.
- The financial calendar includes an annual report, interim reports for each quarter, and an annual general meeting.
- Additional information about the company can be found on the corporate website or by contacting the company by email or post.
```

That's fantastic, but you might feel that the summarized text is still a bit lengthy. No worries! We have another trick up our sleeve: applying the LLM (Large Language Model) one more time to further refine the output. In this case, we'll generate investment advice based on the summary.

Here's how we'll set up the investment advice generator:

```python
# We now need to create some investment advice based on the summary
investment_advice_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(
            prompt=PromptTemplate(
                template="You are an investment analyst tasked with summarizing the Year-End report for your boss, who expects a concise summary with what has happened in the company. He doesn't want to see legal boilerplate",
                input_variables=[],
            )
        ),
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                template="Based on the summary, create recomendations for investors by applying the facts include \n\n {text} \n\n. How should investors react to this information?",
                input_variables=["text"],
            )
        )
    ]
)
```

The `investment_advice_prompt` is designed to guide GPT-3.5 in generating investment recommendations based on the summarized information. It asks the AI to consider the facts provided in the summary (`{text}`) and suggest how investors should react to this information.

After defining the investment advice prompt, we create a new `LLMChain` instance, passing in the `chat` object representing our conversation with GPT-3.5 and the `investment_advice_prompt`. This chain will be responsible for generating the investment advice.

Finally, we call the `run` method on the `chain` object, passing in the text of the summary (`res`) as an argument. The result, stored in the `reco` variable, is a concise and actionable set of investment recommendations based on the insights derived from the original Year-End reports.

Running it gives us output looking something like this:

```txt
Based on the information provided, investors could react to this information in the following ways:

1. Potential for growth: The company's focus on live games and increasing the cadence of downloadable content, along with the release of new games, presents growth opportunities for investors.

2. Healthy financial performance: With strong performance in terms of revenue and profit throughout the year and a good profit margin, stable operating cash flow and strong growth, the company appears to be financially stable.

3. Geographic expansion: With potential opportunities for expansion into new geographical areas in Asia, investors may want to consider the potential benefits of geographic expansion.

4. Diversification: The development and release of new games could help in further diversifying the product portfolio, and investment in game development and development support could provide opportunities to increase revenue. Therefore, investors may want to consider the company's diversification strategies and how that may relate to the potential growth of their investment.

5. Major customers: The company's major customer has continued to provide income, which indicates a reliable revenue stream.

6. Acquisitions: The opportunity to acquire additional licenses, brands, and similar rights to expand the company's offerings presents another opportunity for growth.

Overall, it appears that there are several opportunities for investors to consider when evaluating the potential growth of their investment in Paradox Interactive. However, investors should also consider the risks and challenges associated with the video game market, especially given the rapidly changing technological landscape. Investors should carefully evaluate these factors and consider their investment goals and risk tolerance before making any investment decision.
```

Indeed, the results are quite impressive! With the help of unstructured.io, langchain, and GPT-3.5, we've created a tool that generates summaries and investment advice that closely resemble what you would expect from a professional analyst. This powerful combination of technologies has transformed the way you stay informed about your favorite stocks, making the process more efficient and less time-consuming.

As you continue to explore the potential of these cutting-edge technologies, you'll discover even more ways to leverage their capabilities to enhance your investment strategies and decision-making. The future is here, and it's incredibly exciting! Stay ahead of the game, save valuable time, and make well-informed decisions with the help of this innovative, time-saving solution.

Happy coding, and until next time!
