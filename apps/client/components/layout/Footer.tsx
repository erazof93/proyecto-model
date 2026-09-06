import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark py-6 text-center text-sm text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-center sm:gap-3">
        <span>&copy; {new Date().getFullYear()} Marketplace Modelos</span>
        <span className="hidden sm:inline">|</span>
        <Link href="/terminos" className="hover:text-white">
          Términos
        </Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/privacidad" className="hover:text-white">
          Privacidad
        </Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/contacto" className="hover:text-white">
          Contacto
        </Link>
      </div>
    </footer>
  );
}
