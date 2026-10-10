import type { Category } from '@/types';
import { images } from './images';

export const categories: Category[] = [
  { id: 'rice', name: 'Rice Dishes', description: 'Smoky jollof, fried rice & more', image: images.jollof, emoji: '🍛' },
  { id: 'soups', name: 'Soups & Swallow', description: 'Rich, slow-cooked native soups', image: images.soupBowl, emoji: '🥘' },
  { id: 'grills', name: 'Grills & BBQ', description: 'Fire-grilled, perfectly spiced', image: images.skewers, emoji: '🔥' },
  { id: 'mains', name: 'Signature Mains', description: "Monica's house specials", image: images.steak, emoji: '🍽️' },
  { id: 'sides', name: 'Sides & Small Chops', description: 'Perfect little extras', image: images.smallChops, emoji: '🍢' },
  { id: 'drinks', name: 'Drinks', description: 'Chilled, fresh & homemade', image: images.redDrink, emoji: '🥤' },
  { id: 'desserts', name: 'Desserts', description: 'Sweet endings', image: images.chocolateCake, emoji: '🍰' },
];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
