import type { Product } from '@/lib/types';
import { Apple, Grape } from 'lucide-react';
import React from 'react';

// Custom icons for ones not in lucide-react
const TomatoIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-3.3 2.5A4 4 0 0 0 5.3 8c0 2.2 1.8 4 4 4h5.4a4 4 0 0 0 3.3-6.5A4 4 0 0 0 12 2z"/><path d="M12 14c-2.2 0-4 1.8-4 4v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2c0-2.2-1.8-4-4-4z"/></svg>
);
const PotatoIcon = (props: { className?: string }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.3 10.7a3.5 3.5 0 1 1-5.1-4.8 3.5 3.5 0 0 1 5.1 4.8z"/><path d="m11.4 11.4-.5 2.1-2.1.5-3.3 3.3a2 2 0 0 0 2.8 2.8l3.3-3.3.5-2.1 2.1-.5 2.5-2.5a6.5 6.5 0 1 0-9.2-9.2L2.4 9.1a2 2 0 0 0 2.8 2.8l2.9-2.9"/></svg>
);
const LettuceIcon = (props: { className?: string }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 7.5Z"/><path d="M4 14v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
);
const OnionIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a8 8 0 0 0-3 15.2V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5.8A8 8 0 0 0 13 2z"></path><path d="M13 2c0 1.33.67 2 2 2s2-.67 2-2"></path></svg>
);


const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tomate',
    category: 'Verduras',
    icon: TomatoIcon,
    imageId: 'tomatoes',
    priceHistory: [
      { date: twoDaysAgo.toISOString(), price: 3000 },
      { date: yesterday.toISOString(), price: 3200 },
      { date: today.toISOString(), price: 3100 },
    ],
  },
  {
    id: '2',
    name: 'Papa',
    category: 'Verduras',
    icon: PotatoIcon,
    imageId: 'potatoes',
    priceHistory: [
      { date: twoDaysAgo.toISOString(), price: 1500 },
      { date: yesterday.toISOString(), price: 1450 },
      { date: today.toISOString(), price: 1550 },
    ],
  },
  {
    id: '3',
    name: 'Manzana',
    category: 'Frutas',
    icon: Apple,
    imageId: 'apples',
    priceHistory: [
      { date: twoDaysAgo.toISOString(), price: 4000 },
      { date: yesterday.toISOString(), price: 4100 },
      { date: today.toISOString(), price: 4200 },
    ],
  },
  {
    id: '4',
    name: 'Lechuga',
    category: 'Verduras',
    icon: LettuceIcon,
    imageId: 'lettuce',
    priceHistory: [
      { date: twoDaysAgo.toISOString(), price: 1200 },
      { date: yesterday.toISOString(), price: 1200 },
      { date: today.toISOString(), price: 1100 },
    ],
  },
  {
    id: '5',
    name: 'Cebolla',
    category: 'Verduras',
    icon: OnionIcon,
    imageId: 'onions',
    priceHistory: [
      { date: twoDaysAgo.toISOString(), price: 900 },
      { date: yesterday.toISOString(), price: 950 },
      { date: today.toISOString(), price: 950 },
    ],
  },
  {
    id: '6',
    name: 'Uva',
    category: 'Frutas',
    icon: Grape,
    imageId: 'grapes',
    priceHistory: [
      { date: twoDaysAgo.toISOString(), price: 2500 },
      { date: yesterday.toISOString(), price: 2800 },
      { date: today.toISOString(), price: 2750 },
    ],
  },
];
