import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-7xl">🍽️</p>
      <h1 className="mt-6 text-5xl font-bold">Plate not found</h1>
      <p className="mt-4 max-w-md text-ink-600">
        The page you're looking for has been eaten — or never existed. Let's get you back to the good stuff.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-outline">Go home</Link>
        <Link to="/menu" className="btn-primary">Browse menu</Link>
      </div>
    </section>
  );
}
