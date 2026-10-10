export const siteConfig = {
  name: "Monica's Kitchen",
  shortName: 'Monica',
  tagline: 'Home-cooked flavour, delivered hot.',
  description:
    'Authentic home-style dishes, smoky grills, rich soups and chilled drinks — cooked fresh daily and delivered straight to your door.',
  currency: 'USD',
  deliveryFee: 3.5,
  freeDeliveryThreshold: 50,
  estimatedDelivery: '35–50 min',
  phone: '+234 800 000 0000',
  whatsapp: '2348000000000',
  email: 'hello@monicaskitchen.com',
  address: '12 Placeholder Avenue, Port Harcourt, Rivers State',
  openingHours: [
    { days: 'Mon – Fri', hours: '9:00 AM – 10:00 PM' },
    { days: 'Sat – Sun', hours: '10:00 AM – 11:00 PM' },
  ],
  socials: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
  },
  demoAdmin: {
    name: 'Monica',
    email: 'admin@monicaskitchen.com',
    password: 'monica123',
  },
} as const;

export const whatsappLink = (message = "Hello Monica's Kitchen! I'd like to make an enquiry.") =>
  `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
