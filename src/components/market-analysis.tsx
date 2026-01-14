'use client';

import { useState, useEffect } from 'react';
import type { Stall } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { generateMarketAnalysis } from '@/ai/flows/market-analysis-flow';
import { Loader2 } from 'lucide-react';

export function MarketAnalysis({ stalls }: { stalls: Stall[] }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await generateMarketAnalysis(stalls);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Error generating market analysis:', error);
      setAnalysis('Error al generar el análisis. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gray-900/50 border-green-800 text-green-400">
        <CardHeader>
          <CardTitle className="text-green-300">Análisis de Mercado por IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                'Generar Análisis Profesional del Mercado'
              )}
            </Button>
          </div>
          {isLoading && !analysis && (
             <div className="text-center text-muted-foreground">
                <p>La IA está analizando los datos del mercado...</p>
                <p>Esto puede tardar unos segundos.</p>
             </div>
          )}
          {analysis && (
            <div className="prose prose-invert prose-p:text-green-400 prose-headings:text-green-300 max-w-none">
                 <div
                    className="text-green-400/90 space-y-4"
                    dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}
                  />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
