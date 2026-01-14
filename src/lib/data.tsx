import type { Product } from '@/lib/types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tomate',
    category: 'Verduras',
    imageId: 'tomatoes',
    priceHistory: [
      { date: fourDaysAgo.toISOString(), price: 2900 },
      { date: threeDaysAgo.toISOString(), price: 3050 },
      { date: twoDaysAgo.toISOString(), price: 3000 },
      { date: yesterday.toISOString(), price: 3200 },
      { date: today.toISOString(), price: 3100 },
    ],
  },
  {
    id: '2',
    name: 'Papa',
    category: 'Verduras',
    imageId: 'potatoes',
    priceHistory: [
      { date: fourDaysAgo.toISOString(), price: 1600 },
      { date: threeDaysAgo.toISOString(), price: 1550 },
      { date: twoDaysAgo.toISOString(), price: 1500 },
      { date: yesterday.toISOString(), price: 1450 },
      { date: today.toISOString(), price: 1550 },
    ],
  },
  {
    id: '3',
    name: 'Manzana',
    category: 'Frutas',
    imageId: 'apples',
    priceHistory: [
      { date: fourDaysAgo.toISOString(), price: 3900 },
      { date: threeDaysAgo.toISOString(), price: 3950 },
      { date: twoDaysAgo.toISOString(), price: 4000 },
      { date: yesterday.toISOString(), price: 4100 },
      { date: today.toISOString(), price: 4200 },
    ],
  },
  {
    id: '4',
    name: 'Lechuga',
    category: 'Verduras',
    imageId: 'lettuce',
    priceHistory: [
      { date: fourDaysAgo.toISOString(), price: 1250 },
      { date: threeDaysAgo.toISOString(), price: 1250 },
      { date: twoDaysAgo.toISOString(), price: 1200 },
      { date: yesterday.toISOString(), price: 1200 },
      { date: today.toISOString(), price: 1100 },
    ],
  },
  {
    id: '5',
    name: 'Cebolla',
    category: 'Verduras',
    imageId: 'onions',
    priceHistory: [
      { date: fourDaysAgo.toISOString(), price: 850 },
      { date: threeDaysAgo.toISOString(), price: 880 },
      { date: twoDaysAgo.toISOString(), price: 900 },
      { date: yesterday.toISOString(), price: 950 },
      { date: today.toISOString(), price: 950 },
    ],
  },
  {
    id: '6',
    name: 'Uva',
    category: 'Frutas',
    imageId: 'grapes',
    priceHistory: [
      { date: fourDaysAgo.toISOString(), price: 2600 },
      { date: threeDaysAgo.toISOString(), price: 2550 },
      { date: twoDaysAgo.toISOString(), price: 2500 },
      { date: yesterday.toISOString(), price: 2800 },
      { date: today.toISOString(), price: 2750 },
    ],
  },
];
