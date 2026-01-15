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

export type Sale = {
    quantity: number;
    salePrice: number;
    date: string;
    status: 'Pagado' | 'Pendiente';
};

export type InventoryItem = {
  id: string;
  produceId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  status: string;
  sales?: Sale[];
}

export type InventoryItemWithProduct = InventoryItem & {
  produce?: AggregatedProduct;
}

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

export type InventorySummaryData = {
  // Inventory Metrics
  currentStockValue: number;
  currentInvestedCapital: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  // Sales Metrics
  totalRevenue: number;
  accountsReceivable: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossProfitMargin: number;
  // Location Metrics
  stockByLocation: {
    name: string;
    quantity: number;
    value: number;
  }[];
  // Sales History
  recentSales: (Sale & { productName: string })[];
};
