'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { NewsArticle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const newsSchema = z.object({
  title: z.string().min(1, 'El título es requerido.'),
  source: z.string().min(1, 'La fuente es requerida.'),
  summary: z.string().min(1, 'El resumen es requerido.'),
  content: z.string().min(1, 'El contenido es requerido.'),
});

type NewsFormData = z.infer<typeof newsSchema>;

type ManageNewsProps = {
  news: NewsArticle[];
  onAddNews: (article: Omit<NewsArticle, 'id' | 'date'>) => void;
  onDeleteNews: (articleId: string) => void;
};

export function ManageNews({ news, onAddNews, onDeleteNews }: ManageNewsProps) {
  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      source: '',
      summary: '',
      content: '',
    },
  });

  const onSubmit = (data: NewsFormData) => {
    onAddNews(data);
    form.reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Noticia</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Aumenta el precio de la papa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Diario Local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumen</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Un breve resumen de la noticia..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido Completo (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Escribe el contenido completo aquí. Puedes usar Markdown." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                Publicar Noticia
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Noticias Publicadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {news.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay noticias publicadas.</p>
            ) : (
              news.map(article => (
                <Card key={article.id} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-start">
                      {article.title}
                      <Button variant="ghost" size="icon" onClick={() => onDeleteNews(article.id)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(article.date), "d 'de' MMMM, yyyy", { locale: es })} - {article.source}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{article.summary}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
