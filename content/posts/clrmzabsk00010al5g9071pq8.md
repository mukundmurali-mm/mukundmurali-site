---
title: "Prompt Engineering 101 - Getting Started"
datePublished: 2024-01-21T04:08:13.364Z
cuid: clrmzabsk00010al5g9071pq8
slug: prompt-engineering-101-getting-started
tags: llm, chatgpt, promptengineering, bard

---

# Introduction

We already know what ChatGPT or Google's Bard is and how it helps us. In a nutshell, we give an input to these AI models and it gives us an corresponding output. This output can be relatively correct or incorrect to some instances. This depends upon the input we give and this is called the prompt.

The process of creating an efficient prompt is called as prompt engineering.

We will see what are the different types of Prompt Engineering techniques that we can leverage.

# Prompt Principles

There are 2 principles which we need to take into consideration while working on it.

1. Write clear and specific instructions.
    
    * Using Delimiters : Prompting is just like asking a person something, we need to be clear and specific in what we want. In Prompt Engineering we are going to specify this with the help of delimiters (""", \`\`\`, &lt; &gt;, &lt;tag&gt;&lt;/tag&gt;) which are basically used to separate the section inside prompt. Delimiters are also used to prevent any kind of prompt injection.
        
    * Ask for a structured output.
        
    * Check if conditions are met.
        
    * Few short prompting, by giving few examples.
        
2. Give the model time to think.
    
    * Specify the set of steps to complete a task.
        
    * Instruct the model to work out its own solution before rushing to conclusion.
        

# Hallucination

At times there will be scenario where the AI model will give incorrect answers but it never knows that its a wrong answer and the model assumes that this is the correct answer for the prompt given. This is often referred to as Hallucinations in AI.

# Iterative Process

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1705809795649/23e03b75-197b-494e-92f5-4e31ff0956a7.png align="center")

* Give the idea as prompt.
    

* Understand the output that is generated from that prompt.
    
* Analyze if the desired output is generated or not.
    
* Make the necessary changes in the prompt and re-input it as new prompt.
    

# Summarizing Text

Summarizing text prompt is generally used to brief a large set of text in few words to give its complete context. We can summarize a text with respect to specific context as well which later can be used as a email's body. for example: if you get a summary of a overall shipping operation then you can summarize the data with specific key values like the dates mentioned in it.

# Inferring learning

Its a task where the model takes the input text and analyze it by extracting label and values using prompt engineering.

## Sentiment Analysis

Sentiment analysis is a type of Inferring where you can take a text and understand on what level of emotion that text was written. This is generally used in product review analysis.

### Zero-Shot Learning

In short, Zero-shot learning algorithm is getting an output without giving any example of labelled data to the prompt.

### Expanding

This is right opposite to what summarize text does, you give a set of instructions or steps to the AI model and the model will generate a large set of text for it. Generally used in generating email messages.

# Chatbot

The most exciting use case of the LLM model is to use it to build a customer chatbot and make it act as a customer service agent to answer the questions of user input.

This is achieved with the help of a helper function which says the AI model to have a conversational interaction with the user to store the user inputs in its memory.

> Prompt engineering when used properly will help you extracting the best potential from LLM model and should be used in a responsible way which help in solving real time problems.