'use client';

import type { NewsArticle } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

type MarketNewsProps = {
  news: NewsArticle[];
};

export function MarketNews({ news }: MarketNewsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-headline text-green-300 border-b border-green-800 pb-2">
        Últimas Noticias del Mercado
      </h2>
      {news.length === 0 ? (
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
                  <p className="text-green-300 mb-4">{article.summary}</p>
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
