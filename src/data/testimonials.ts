import type { Testimonial } from '@/types';
import { avatar } from './images';

export const testimonials: Testimonial[] = [
  {
    id: 't1', name: 'Adaeze O.', role: 'Regular customer', avatar: avatar('Adaeze'), rating: 5,
    quote: "Monica's jollof is the real deal — smoky, rich and it always arrives hot. It's become our family's Friday tradition.",
  },
  {
    id: 't2', name: 'James W.', role: 'Ordered 30+ times', avatar: avatar('James'), rating: 5,
    quote: 'The suya platter and chapman combo is unbeatable. Ordering online is so easy and the delivery is always on time.',
  },
  {
    id: 't3', name: 'Grace A.', role: 'Event planner', avatar: avatar('Grace'), rating: 5,
    quote: 'I ordered party packs for a 40-guest event and every single tray was gone. Guests still ask me where the food came from.',
  },
  {
    id: 't4', name: 'Emeka N.', role: 'Office lunch orders', avatar: avatar('Emeka'), rating: 4,
    quote: 'Our team orders lunch every week. Generous portions, clean packaging and the banga soup tastes like home.',
  },
];
