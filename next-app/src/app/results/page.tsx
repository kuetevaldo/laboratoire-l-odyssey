import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { BackHome } from "@/components/BackHome";
import { PatientAccessForm } from "@/components/PatientAccessForm";

export const metadata: Metadata = { title: "Mes résultats", description: "Consultez et téléchargez vos résultats grâce à votre accès patient sécurisé.", alternates: { canonical: "/results" } };

export default function ResultsPage() {
  return <><BackHome /><main className="results"><div className="container results-wrapper"><section className="results-content reveal"><p className="eyebrow"><span /> Espace patient sécurisé</p><h1>Retrouvez vos résultats en quelques secondes.</h1><p>Votre numéro patient et votre code confidentiel vous sont remis par le laboratoire lorsque votre dossier est créé.</p><ol className="results-steps"><li><span>1</span><div><strong>Munissez-vous de vos accès</strong><br />Utilisez les informations reçues au laboratoire.</div></li><li><span>2</span><div><strong>Identifiez-vous</strong><br />Saisissez votre numéro patient et votre code.</div></li><li><span>3</span><div><strong>Consultez votre document</strong><br />Ouvrez ou téléchargez le fichier PDF disponible.</div></li></ol><p className="results-security"><LockKeyhole /><span>Vos documents sont transmis par une connexion chiffrée et ne sont jamais publics.</span></p></section><PatientAccessForm /></div></main></>;
}
