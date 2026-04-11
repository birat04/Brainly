import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-3 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you are looking for does not exist or was moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
