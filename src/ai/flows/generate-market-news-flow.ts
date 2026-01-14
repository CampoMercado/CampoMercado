'use server';
/**
 * @fileOverview Generates market news by processing an RSS feed.
 * 
 * - generateMarketNews - A function that generates news articles from an RSS feed.
 * - MarketNewsOutput - The return type for the generateMarketNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsArticleSchema = z.object({
  id: z.string().describe('A unique identifier for the article'),
  title: z.string().describe('The headline of the news article.'),
  date: z.string().describe('The publication date of the news article in ISO 8601 format.'),
  source: z.string().describe('The original source of the news (e.g., a newspaper or website). Should be "TodoAgro".'),
  content: z.string().describe('The full content of the news article, summarized by the AI, in Spanish and in Markdown format.'),
});

export type MarketNewsOutput = z.infer<typeof MarketNewsOutputSchema>;
const MarketNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});

export async function generateMarketNews(): Promise<MarketNewsOutput> {
  return generateMarketNewsFlow();
}

const newsGenerationPrompt = ai.definePrompt({
  name: 'newsGenerationPrompt',
  output: { schema: MarketNewsOutputSchema },
  prompt: `You are an expert agricultural market news analyst. Your tone is professional, objective, and clear.
Your task is to read the content from the provided RSS feed URL, select the 3 most relevant and recent articles for the agricultural sector in Argentina, and generate a valid JSON response summarizing them.

RSS Feed URL: https://www.todoagro.com.ar/noticias/feed/

For each of the 3 selected articles, you must provide a professional and detailed summary in Spanish. The summary must be formatted in clean Markdown.

Follow these instructions for each summary:
- The summary must be well-structured and easy to read.
- Use Markdown bold syntax ('**texto**') to highlight key entities, dates, locations, or important figures (e.g., **INTA Famaillá**, **28 de mayo**, **'Diseño y Ejecución de Obras de Cosecha de Agua'**). Do not use any other Markdown features like headers or lists.
- Ensure the output is clean and does not contain any strange characters or unrendered Markdown syntax.

Your final output must be ONLY the JSON object that conforms to the schema.
`,
});

const generateMarketNewsFlow = ai.defineFlow(
  {
    name: 'generateMarketNewsFlow',
    outputSchema: MarketNewsOutputSchema,
  },
  async () => {
    const { output } = await newsGenerationPrompt();
    if (!output) {
      // In case of a null response from the AI, return an empty array to prevent crashing.
      return { articles: [] };
    }
    return output;
  }
);
