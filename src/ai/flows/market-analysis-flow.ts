'use server';
/**
 * @fileOverview A market analysis AI agent.
 *
 * - generateMarketAnalysis - A function that handles the market analysis process.
 * - MarketAnalysisInput - The input type for the generateMarketAnalysis function.
 * - MarketAnalysisOutput - The return type for the generateMarketAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Stall } from '@/lib/types';

const MarketAnalysisInputSchema = z.object({
  stalls: z.any().describe('An array of stall objects, including their products and price histories.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;

const MarketAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed, professional market analysis report in Markdown format.'),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;


export async function generateMarketAnalysis(stalls: Stall[]): Promise<MarketAnalysisOutput> {
  // We need to pass a plain object to the flow, not a custom class instance.
  const plainStalls = JSON.parse(JSON.stringify(stalls));
  return marketAnalysisFlow({ stalls: plainStalls });
}

const prompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `You are a professional market analyst for the agricultural sector, specializing in the Cuyo region of Argentina.
Your task is to generate a deep, insightful, and professional market analysis report based on the provided data of produce prices from different stalls.

The report should be in Spanish and formatted in Markdown.

Here is the data:
{{{json stringify=stalls}}}

Your analysis MUST include the following sections:

### Resumen Ejecutivo
A brief, high-level summary of the current market state. Mention overall trends (e.g., general price increase/decrease) and any standout observations.

### Análisis de Tendencias por Producto
For at least 3-4 key products, analyze their price evolution. Identify which products are showing significant upward or downward trends. Use the historical data to back up your claims.

### Volatilidad y Oportunidades
Identify products with the highest and lowest price volatility. Discuss the price spread (difference between min and max price) for key items. A large spread might indicate arbitrage opportunities or inconsistencies in the market.

### Patrones Estacionales (Análisis Hipotético)
Based on the dates in the price history, speculate on any potential seasonal patterns. For example, if you see price spikes, consider if they correlate with public holidays in Argentina (e.g., Christmas, Easter, national holidays). Frame this section as a hypothesis, as the data is limited. For example: "Se observa un pico en el precio del tomate alrededor de la segunda semana de Diciembre, lo que podría estar relacionado con la demanda para las fiestas de fin de año."

### Conclusión y Perspectivas
Provide a concluding thought on the market's health and what sellers and buyers should watch for in the coming days.

Your tone should be professional, objective, and data-driven. Use financial and economic terminology where appropriate.
`,
});

const marketAnalysisFlow = ai.defineFlow(
  {
    name: 'marketAnalysisFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
