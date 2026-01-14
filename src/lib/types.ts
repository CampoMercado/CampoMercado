export type PriceHistory = {
  date: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  variety: string;
  priceHistory: PriceHistory[];
};

export type Stall = {
  id: string;
  name: string;
  number: number;
  products: Product[];
};

export type TickerProduct = Product & { stallName: string, stallNumber: number };

export type NewsArticle = {
  id: string;
  title: string;
  date: string;
  source: string;
  summary: string;
  content: string;
};
