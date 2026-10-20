import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink px-5 text-white">
      <div className="text-center">
        <Logo className="mx-auto h-7 w-auto" />
        <h1 className="t-headline mt-10">Te strani ni.</h1>
        <p className="t-lead mt-4 text-white/70">Mogoče smo jo oprali.</p>
        <Link href="/" className="btn btn-primary mt-9">
          Na začetek
        </Link>
      </div>
    </main>
  );
}
