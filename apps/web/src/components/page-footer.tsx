import Link from "next/link";

export function PageFooter() {
  return (
    <footer className="relative z-10 px-6 py-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-zinc-500">
          &copy; 2026 ROTA. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
