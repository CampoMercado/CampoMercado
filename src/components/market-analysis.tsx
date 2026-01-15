'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Stall } from '@/lib/types';
import { generateMarketAnalysis } from '@/ai/flows/market-analysis-flow';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function MarketAnalysis({ stalls }: { stalls: Stall[] }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const result = await generateMarketAnalysis(stalls);
        setAnalysis(result.analysis);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('No se pudo generar el análisis del mercado. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [stalls]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-headline text-green-300 border-b border-green-800 pb-2">
        Análisis de Mercado (Generado por IA)
      </h2>
      <Card className="bg-gray-900/50 border-green-800 text-green-400">
        <CardHeader>
          <CardTitle className="text-2xl text-green-300">Informe Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-4 w-5/6 bg-gray-700" />
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-4 w-4/6 bg-gray-700" />
            </div>
          ) : error ? (
             <p className="text-danger">{error}</p>
          ) : (
            <div className="prose prose-invert prose-p:text-green-400 prose-headings:text-green-200 prose-headings:font-headline prose-strong:text-green-300">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
