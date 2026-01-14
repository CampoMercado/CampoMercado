import type { Stall } from '@/lib/types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

export const mockStalls: Stall[] = [
  {
    id: 'puesto-1',
    name: 'Hermanos Rodriguez',
    number: 14,
    products: [
      {
        id: '1-1',
        name: 'Tomate',
        variety: 'Redondo',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 3100 },
          { date: threeDaysAgo.toISOString(), price: 3150 },
          { date: twoDaysAgo.toISOString(), price: 3100 },
          { date: yesterday.toISOString(), price: 3300 },
          { date: today.toISOString(), price: 3200 },
        ],
      },
      {
        id: '1-2',
        name: 'Papa',
        variety: 'Spunta',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 1650 },
          { date: threeDaysAgo.toISOString(), price: 1600 },
          { date: twoDaysAgo.toISOString(), price: 1550 },
          { date: yesterday.toISOString(), price: 1500 },
          { date: today.toISOString(), price: 1600 },
        ],
      },
      {
        id: '1-3',
        name: 'Manzana',
        variety: 'Red Delicious',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 4000 },
          { date: threeDaysAgo.toISOString(), price: 4050 },
          { date: twoDaysAgo.toISOString(), price: 4100 },
          { date: yesterday.toISOString(), price: 4200 },
          { date: today.toISOString(), price: 4300 },
        ],
      },
    ],
  },
  {
    id: 'puesto-2',
    name: 'Verdulería Don Pepe',
    number: 22,
    products: [
      {
        id: '2-1',
        name: 'Tomate',
        variety: 'Perita',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 2900 },
          { date: threeDaysAgo.toISOString(), price: 3050 },
          { date: twoDaysAgo.toISOString(), price: 3000 },
          { date: yesterday.toISOString(), price: 3200 },
          { date: today.toISOString(), price: 3100 },
        ],
      },
      {
        id: '2-2',
        name: 'Lechuga',
        variety: 'Criolla',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 1250 },
          { date: threeDaysAgo.toISOString(), price: 1250 },
          { date: twoDaysAgo.toISOString(), price: 1200 },
          { date: yesterday.toISOString(), price: 1200 },
          { date: today.toISOString(), price: 1100 },
        ],
      },
      {
        id: '2-3',
        name: 'Cebolla',
        variety: 'Morada',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 950 },
          { date: threeDaysAgo.toISOString(), price: 980 },
          { date: twoDaysAgo.toISOString(), price: 1000 },
          { date: yesterday.toISOString(), price: 1050 },
          { date: today.toISOString(), price: 1050 },
        ],
      },
    ],
  },
  {
    id: 'puesto-3',
    name: 'El Cosechero Feliz',
    number: 5,
    products: [
      {
        id: '3-1',
        name: 'Papa',
        variety: 'Andina',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 1800 },
          { date: threeDaysAgo.toISOString(), price: 1750 },
          { date: twoDaysAgo.toISOString(), price: 1700 },
          { date: yesterday.toISOString(), price: 1650 },
          { date: today.toISOString(), price: 1750 },
        ],
      },
      {
        id: '3-2',
        name: 'Uva',
        variety: 'Malbec',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 2600 },
          { date: threeDaysAgo.toISOString(), price: 2550 },
          { date: twoDaysAgo.toISOString(), price: 2500 },
          { date: yesterday.toISOString(), price: 2800 },
          { date: today.toISOString(), price: 2750 },
        ],
      },
       {
        id: '3-3',
        name: 'Cebolla',
        variety: 'Blanca',
        priceHistory: [
          { date: fourDaysAgo.toISOString(), price: 850 },
          { date: threeDaysAgo.toISOString(), price: 880 },
          { date: twoDaysAgo.toISOString(), price: 900 },
          { date: yesterday.toISOString(), price: 950 },
          { date: today.toISOString(), price: 950 },
        ],
      },
    ],
  },
];
