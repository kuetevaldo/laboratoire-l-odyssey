import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackHome({ href = "/", label = "Retour à l’accueil" }: { href?: string; label?: string }) {
  return <Link href={href} className="back-home" aria-label={label}><ArrowLeft /></Link>;
}
