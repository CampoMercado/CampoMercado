export type PriceHistory = {
  date: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  variety: string;
  category: string;
  weightPerCrate: number;
  priceHistory: PriceHistory[];
};

export type Produce = {
  id: string;
  name: string;
  variety?: string;
  category: string;
  weightPerCrate: number;
};

export type Price = {
  id: string;
  produceId: string;
  price: number;
  date: string;
};

export type AggregatedProduct = Produce & {
  priceHistory: { date: string; price: number }[];
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
  content: string;
};

export type UserProfile = {
    id: string;
    fullName: string;
    email: string;
}
