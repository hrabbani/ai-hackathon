import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-foreground/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-foreground hover:text-foreground/80">
              Home
            </Link>
            <Link href="/mindmap" className="ml-4 text-foreground hover:text-foreground/80">
              Mindmap
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 