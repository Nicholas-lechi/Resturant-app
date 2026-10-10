# Monica's Kitchen — Restaurant Website & Dashboard (Prototype)

A clickable prototype of the full ordering system: a customer website and an owner dashboard.
All data is generated (no database, no real payments). Everything is saved in the browser, so
an order placed on the website shows up in the dashboard immediately.

## Run it

```bash
yarn install
yarn dev
```

Then open http://localhost:5173

| Command        | What it does                     |
| -------------- | -------------------------------- |
| `yarn dev`     | Start the dev server             |
| `yarn build`   | Type-check and build for production (`dist/`) |
| `yarn preview` | Preview the production build     |

Requires Node.js 18+ (20+ recommended).

## Dashboard login

- URL: http://localhost:5173/dashboard
- Email: `admin@monicaskitchen.com`
- Password: `monica123`

(There is also a "Fill demo login" button on the login page.)

## Website pages

| Route            | Page |
| ---------------- | ---- |
| `/`              | Home: hero, categories, featured dishes, catering banner, how it works, about, reviews |
| `/menu`          | Full menu with search, category filter and sorting |
| `/menu/:slug`    | Single dish: sizes, quantity, ingredients, spice level, related dishes |
| `/cart`          | Pack (cart) page; there is also a slide-out pack drawer |
| `/checkout`      | Details, delivery or pickup, fake card payment with processing animation |
| `/order/:id`     | Order confirmation + live status tracking |
| `/track`         | Look up an order by number |

## Dashboard pages

| Route                   | Page |
| ----------------------- | ---- |
| `/dashboard`            | Overview: live kitchen counts, revenue, orders, charts, recent orders, top dishes |
| `/dashboard/orders`     | Filter by status, order details drawer, accept → preparing → out for delivery → delivered, cancel & refund |
| `/dashboard/products`   | Add / edit / delete dishes with photo upload, sold-out switch, table & grid views |
| `/dashboard/payments`   | Received / refunded / failed, payout card, chart, transactions, CSV export |
| `/dashboard/customers`  | Customer list, lifetime spend, order history |
| `/dashboard/settings`   | Profile, open/closed switch, delivery fee, notifications, reset demo data |

## Best way to present the demo

1. Open the **website** in one browser tab and the **dashboard** in a second tab.
2. On the website, add a few dishes to the pack and check out (use **Fill demo details**).
3. Switch to the dashboard tab: a "New order" alert pops up with a sound, and the order is at the top of Orders.
4. Click **Accept**, then move it to **Out for delivery**. Go back to the website order page and the status has updated.
5. In Products, switch a dish to sold out, or add a new dish with a photo, and refresh the menu to see it live.
6. Before the meeting, use **Settings → Reset demo data** to start clean.

## Where to change things

- Restaurant name, phone, WhatsApp, address, hours, demo login: `src/config/site.ts`
- Dishes: `src/data/products.ts`
- Food photos (placeholder Unsplash images): `src/data/images.ts`
- Colours and fonts: `src/index.css` (the `@theme` block)

## Deploying

- **Vercel:** import the folder; `vercel.json` handles page refreshes.
- **Netlify:** build command `yarn build`, publish folder `dist`; `public/_redirects` handles refreshes.

## Tech

React 19, Vite, TypeScript, Tailwind CSS v4, React Router, Zustand (state + localStorage),
Framer Motion, Recharts, lucide-react icons, Sonner toasts.
# Resturant-app
