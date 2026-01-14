'use client';

import { useEffect, useState } from 'react';
import type { NewsArticle } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { generateMarketNews } from '@/ai/flows/generate-market-news-flow';
import { Skeleton } from './ui/skeleton';

export function MarketNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const result = await generateMarketNews({ query: 'Últimas noticias sobre agricultura y precios de productos en Mendoza y Argentina' });
        setNews(result.articles);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar las noticias. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const renderSkeletons = () => (
    Array.from({ length: 2 }).map((_, index) => (
      <Card key={`skeleton-${index}`} className="bg-gray-900/50 border-green-800 text-green-400">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-3/4 bg-gray-700" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2 bg-gray-700" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-5/6 bg-gray-700" />
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-headline text-green-300 border-b border-green-800 pb-2">
        Últimas Noticias del Mercado (Generado por IA)
      </h2>
      {loading ? (
         <div className="grid gap-6">{renderSkeletons()}</div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : news.length === 0 ? (
        <p className="text-muted-foreground">No hay noticias disponibles en este momento.</p>
      ) : (
        <div className="grid gap-6">
          {news.map((article) => (
            <Card key={article.id} className="bg-gray-900/50 border-green-800 text-green-400">
              <CardHeader>
                <CardTitle className="text-2xl text-green-300">{article.title}</CardTitle>
                <CardDescription className="text-green-600">
                  {format(new Date(article.date), "d 'de' MMMM, yyyy", { locale: es })} - Por {article.source}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-p:text-green-400 prose-headings:text-green-300">
                  <div
                    className="text-green-400/90 space-y-4"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
