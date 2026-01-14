'use client';

import { useState } from 'react';
import { Bot, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMarketAnalysisAction } from '@/app/admin/actions';
import type { Stall } from '@/lib/types';
import { cn } from '@/lib/utils';

// A simple markdown-to-HTML converter
const Markdown = ({ content }: { content: string }) => {
  const html = content
    .split('\n')
    .map(line => {
      if (line.startsWith('### ')) {
        return `<h3>${line.substring(4)}</h3>`;
      }
      if (line.startsWith('**')) {
         return `<p><strong>${line.replace(/\*\*/g, '')}</strong></p>`;
      }
       if (line.trim() === '') {
        return '<br />';
      }
      return `<p>${line}</p>`;
    })
    .join('');

  return <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
};


export function DeepAnalysis({ stalls }: { stalls: Stall[] }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await generateMarketAnalysisAction(stalls);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error(error);
      setAnalysis('Ocurrió un error al generar el análisis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-green-800 text-green-400">
      <CardHeader>
        <CardTitle className="text-green-300 flex items-center justify-between">
            <div className='flex items-center gap-2'>
                 <Bot />
                Análisis Profundo del Mercado (IA)
            </div>
            <Button onClick={handleGenerateAnalysis} disabled={isLoading} size="sm" variant="outline" className="text-green-300 border-green-600 hover:bg-green-900 hover:text-green-100">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                    </>
                ) : (
                    'Generar Análisis'
                )}
            </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-green-800 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-4" />
                <p className="text-green-300">La IA está analizando los datos del mercado...</p>
                <p className="text-sm text-green-600">Esto puede tomar hasta un minuto.</p>
            </div>
        )}
        {analysis && (
            <div className="p-4 border border-green-900 bg-black rounded-md text-green-300">
                 <article className="prose prose-sm max-w-none prose-p:text-green-400 prose-h3:text-green-200 prose-h3:font-headline prose-h3:border-b prose-h3:border-green-800 prose-strong:text-green-200">
                    {analysis.split('\n\n').map((paragraph, i) => {
                        const content = paragraph.split('\n').map((line, j) => {
                           if (line.startsWith('### ')) {
                                return <h3 key={j} className="font-headline text-xl mt-4 mb-2 pb-1 border-b border-green-700 text-green-200">{line.substring(4)}</h3>
                           }
                           if (line.trim().startsWith('* ')) {
                               return <li key={j} className="ml-4 list-disc">{line.substring(2)}</li>
                           }
                           return <span key={j}>{line}<br/></span>;
                        });
                        if (paragraph.trim().startsWith('* ')) {
                             return <ul key={i} className="mb-4">{content}</ul>
                        }
                        return <p key={i} className="mb-4">{content}</p>;
                    })}
                </article>
            </div>
        )}
        {!analysis && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-green-800 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mb-4" />
                <p className="text-green-300">Presiona "Generar Análisis" para obtener un informe detallado del mercado.</p>
                <p className="text-sm text-green-600">La IA procesará todos los datos históricos y actuales para encontrar tendencias y patrones.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
