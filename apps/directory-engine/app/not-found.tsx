import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-gray-600">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Go back home
      </Link>
    </div>
  );
}
