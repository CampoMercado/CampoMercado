'use client';

import { useEffect, useState } from 'react';
import type { NewsArticle } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { generateMarketNews } from '@/ai/flows/generate-market-news-flow';
import { Skeleton } from './ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from './ui/scroll-area';

export function MarketNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const result = await generateMarketNews();
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
      <div key={`skeleton-${index}`} className="space-y-2">
        <Skeleton className="h-6 w-3/4 bg-gray-700" />
        <Skeleton className="h-4 w-1/2 bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-5/6 bg-gray-700" />
      </div>
    ))
  );

  return (
     <div className="space-y-4">
      <h2 className="text-xl font-headline text-green-300 border-b border-green-800 pb-2">
        Noticias del Agro
      </h2>
      <ScrollArea className="h-[600px] pr-4">
        {loading ? (
          <div className="space-y-6">{renderSkeletons()}</div>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : news.length === 0 ? (
          <p className="text-muted-foreground">No hay noticias disponibles.</p>
        ) : (
          <div className="space-y-6">
            {news.map((article) => (
              <div key={article.id}>
                <h3 className="font-bold text-base text-green-300">{article.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {format(new Date(article.date), "d MMM, yyyy", { locale: es })}
                </p>
                <div className="prose prose-sm prose-invert prose-p:text-green-500 prose-strong:text-green-400">
                   <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
