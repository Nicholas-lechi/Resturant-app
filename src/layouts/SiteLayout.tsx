import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { CartDrawer } from '@/components/site/CartDrawer';
import { WhatsAppButton } from '@/components/site/WhatsAppButton';

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
