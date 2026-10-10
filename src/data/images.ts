/**
 * Placeholder photography from Unsplash.
 * Replace these with Monica's real food photos for the production build.
 * If any link fails to load, <SmartImage /> shows a styled fallback instead.
 */
const unsplash = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const images = {
  heroSpread: unsplash('photo-1504674900247-0877df9cc836', 1600),
  diningRoom: unsplash('photo-1414235077428-338989a2e8c0', 1600),
  kitchen: unsplash('photo-1555396273-367ea4eb4db5', 1600),
  chef: unsplash('photo-1577219491135-ce391730fb2c', 1200),
  jollof: unsplash('photo-1563379091339-03b21ab4a4f8'),
  friedRice: unsplash('photo-1512058564366-18510be2db19'),
  coconutRice: unsplash('photo-1603133872878-684f208fb84b'),
  stew: unsplash('photo-1585937421612-70a008356fbe'),
  soupBowl: unsplash('photo-1547592180-85f173990554'),
  soupRich: unsplash('photo-1476718406336-bb5a9690ee2a'),
  skewers: unsplash('photo-1555939594-58d7cb561ad1'),
  fish: unsplash('photo-1519708227418-c8fd9a32b7a2'),
  wings: unsplash('photo-1626082927389-6cd097cdc6ec'),
  roastChicken: unsplash('photo-1598514983318-2f64f8f4796c'),
  steak: unsplash('photo-1600891964092-4316c288032e'),
  burger: unsplash('photo-1568901346375-23c9450c58cd'),
  pasta: unsplash('photo-1621996346565-e3dbc646d9a9'),
  plateBowl: unsplash('photo-1540189549336-e6e99c3679fe'),
  smallChops: unsplash('photo-1601050690597-df0568f70950'),
  veggieBowl: unsplash('photo-1512621776951-a57141f2eefd'),
  fries: unsplash('photo-1573080496219-bb080dd4f877'),
  redDrink: unsplash('photo-1544145945-f90425340c7e'),
  cocktail: unsplash('photo-1513558161293-cdaf765ed2fd'),
  orangeJuice: unsplash('photo-1600271886742-f049cd451bba'),
  water: unsplash('photo-1548839140-29a749e1cf4d'),
  chocolateCake: unsplash('photo-1578985545062-69928b1d9587'),
  donuts: unsplash('photo-1551024601-bec78aea704b'),
  parfait: unsplash('photo-1488477181946-6428a0291777'),
};

export const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffead4,fdf8ee,ffd0a8`;
