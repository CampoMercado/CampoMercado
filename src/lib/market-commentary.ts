// Este archivo contiene datos que se actualizan manualmente de forma semanal.

type MarketCommentary = {
  mostSold: string[];
  leastSold: string[];
};

export const marketCommentary: MarketCommentary = {
  mostSold: [
    'Papa (Spunta)',
    'Tomate (Redondo)',
    'Cebolla (Blanca)'
  ],
  leastSold: [
    'Uva (Malbec)',
    'Lechuga (Criolla)',
    'Manzana (Red Delicious)'
  ]
};
