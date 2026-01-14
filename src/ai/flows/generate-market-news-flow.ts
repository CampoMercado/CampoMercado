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

// Mock search tool. In a real application, this would use a real search API.
const searchWeb = ai.defineTool(
  {
    name: 'searchWeb',
    description: 'Searches the web for a given query and returns relevant articles.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          snippet: z.string(),
        })
      ),
    }),
  },
  async ({ query }) => {
    console.log(`[WebSearch Tool] Searching for: ${query}`);
    // These are mock results and do not reflect real-time web search.
    return {
      results: [
        {
          title: "El precio del tomate en Mendoza se mantiene estable a pesar de la inflación",
          url: "https://www.example.com/noticia-tomate-mendoza",
          snippet: "A pesar de la inflación, el precio del tomate en Mendoza se ha mantenido estable durante el último mes. Productores locales atribuyen esto a una buena cosecha y a la competencia en el mercado.",
        },
        {
          title: "Preocupación en el sector vitivinícola por las heladas tardías",
          url: "https://www.example.com/noticia-heladas-vinos",
          snippet: "Las heladas tardías en la región de Cuyo han generado preocupación entre los productores de vino. Se estima que la producción de Malbec podría verse afectada en un 15%.",
        },
        {
          title: "Aumenta la exportación de peras y manzanas argentinas a Brasil",
          url: "https://www.example.com/noticia-exportacion-frutas",
          snippet: "Las exportaciones de peras y manzanas desde Argentina hacia Brasil han experimentado un aumento del 10% en el último trimestre, impulsadas por un tipo de cambio favorable y una fuerte demanda.",
        },
      ],
    };
  }
);


const NewsArticleSchema = z.object({
  id: z.string().describe('A unique identifier for the article'),
  title: z.string().describe('The headline of the news article.'),
  date: z.string().describe('The publication date of the news article in ISO 8601 format.'),
  source: z.string().describe('The original source of the news (e.g., a newspaper or website).'),
  content: z.string().describe('The full content of the news article, summarized by the AI, in Spanish and in Markdown format.'),
});

const MarketNewsInputSchema = z.object({
  query: z.string().describe('The search query for agricultural news.'),
});
export type MarketNewsInput = z.infer<typeof MarketNewsInputSchema>;

const MarketNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type MarketNewsOutput = z.infer<typeof MarketNewsOutputSchema>;


export async function generateMarketNews(input: MarketNewsInput): Promise<MarketNewsOutput> {
  return generateMarketNewsFlow(input);
}

const newsGenerationPrompt = ai.definePrompt({
  name: 'newsGenerationPrompt',
  tools: [searchWeb],
  prompt: `You are an expert agricultural market analyst.
Your task is to analyze the latest news based on the user's query and generate a valid JSON response.
You MUST use the searchWeb tool to gather information.

Based on the search results, synthesize the information into 2-3 news articles.
For each article, you must provide:
- A unique ID.
- A title.
- The publication date (today's date in ISO 8601 format).
- The source (the URL of the original article).
- A detailed summary of the content in Spanish and Markdown format.

Your final output must be ONLY the JSON object that conforms to the following schema.
{{outputJson}}
`,
  output: {
    schema: MarketNewsOutputSchema,
  },
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
