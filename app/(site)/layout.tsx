import { ScrollState } from "@/components/motion/ScrollState";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";

// Layout for the public marketing site only.
// Future areas (customer login, booking) get their own route group and their own layout.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#vsebina" className="skip-link">
        Preskoči na vsebino
      </a>
      <Nav />
      <main id="vsebina">{children}</main>
      <Footer />
      <ScrollState />
    </>
  );
}
