import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🦆❓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Duck Not Found</h1>
        <p className="text-gray-500 mb-8">
          This duck seems to have wandered off. Check the URL or go back home.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
