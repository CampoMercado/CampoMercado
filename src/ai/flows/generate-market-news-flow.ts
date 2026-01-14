'use server';
/**
 * @fileOverview Generates market news by searching the web.
 * 
 * - generateMarketNews - A function that generates news articles.
 * - MarketNewsInput - The input type for the generateMarketNews function.
 * - MarketNewsOutput - The return type for the generateMarketNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { search } from '@genkit-ai/google-genai';


const NewsArticleSchema = z.object({
  id: z.string().describe('A unique identifier for the article'),
  title: z.string().describe('The headline of the news article.'),
  date: z.string().describe('The publication date of the news article in ISO 8601 format.'),
  source: z.string().describe('The original source of the news (e.g., a newspaper or website).'),
  content: z.string().describe('The full content of the news article, summarized by the AI, in Spanish and in Markdown format.'),
});

export type MarketNewsInput = z.infer<typeof MarketNewsInputSchema>;
const MarketNewsInputSchema = z.object({
  query: z.string().describe('The search query for agricultural news.'),
});

export type MarketNewsOutput = z.infer<typeof MarketNewsOutputSchema>;
const MarketNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});


export async function generateMarketNews(input: MarketNewsInput): Promise<MarketNewsOutput> {
  return generateMarketNewsFlow(input);
}

const newsGenerationPrompt = ai.definePrompt({
  name: 'newsGenerationPrompt',
  tools: [search],
  input: { schema: MarketNewsInputSchema },
  output: { schema: MarketNewsOutputSchema },
  prompt: `You are an expert agricultural market analyst.
Your task is to analyze the latest news based on the user's query and generate a valid JSON response.
You MUST use the provided search tool to gather real-time, up-to-date information from the web.

Based on the search results for the query '{{query}}', synthesize the information into 2-3 news articles.
For each article, you must provide:
- A unique ID.
- A title.
- The publication date (use the real date of the article, formatted as ISO 8601).
- The source (the URL of the original article).
- A detailed summary of the content in Spanish and Markdown format.

Your final output must be ONLY the JSON object that conforms to the schema.
`,
});

const generateMarketNewsFlow = ai.defineFlow(
  {
    name: 'generateMarketNewsFlow',
    inputSchema: MarketNewsInputSchema,
    outputSchema: MarketNewsOutputSchema,
  },
  async (input) => {
    const { output } = await newsGenerationPrompt(input);
    if (!output) {
      // In case of a null response from the AI, return an empty array to prevent crashing.
      return { articles: [] };
    }
    return output;
  }
);
