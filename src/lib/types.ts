export type PriceHistory = {
  date: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  priceHistory: PriceHistory[];
  imageId: string;
};
