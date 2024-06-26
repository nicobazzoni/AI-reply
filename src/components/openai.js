// openai.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const analyzeArticle = async (content) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Summarize the following article: ${content}`,
    max_tokens: 150,
  });
  return response.data.choices[0].text.trim();
};

export const generateOpinion = async (title) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Write an opinion piece on: ${title}`,
    max_tokens: 300,
  });
  return response.data.choices[0].text.trim();
};