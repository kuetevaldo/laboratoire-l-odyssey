"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Baby,
  Check,
  Droplets,
  HeartPulse,
  Microscope,
  Search,
  ShieldCheck,
  Stethoscope,
  Waves,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export interface ExamCategory {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: typeof Microscope;
  items: string[];
  popular?: boolean;
}

export const ORIGINAL_EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: "analyses-medicales",
    title: "Analyses Médicales",
    badge: "Biologie clinique",
    description: "Analyses biologiques approfondies pour le dépistage, le diagnostic et le suivi thérapeutique de vos pathologies.",
    icon: Microscope,
    popular: true,
    items: [
      "Allergologie",
      "Biochimie spécialisée",
      "Hématologie",
      "Endocrinologie",
      "Microbiologie médicale",
      "Virologie médicale",
      "Biochimie et hématologie",
      "Bilans infectieux et hormonaux",
    ],
  },
  {
    id: "bilans-sante",
    title: "Bilans de Santé",
    badge: "Prévention & Suivi",
    description: "Des bilans biologiques complets pour surveiller l'état général de votre organisme et anticiper d'éventuels déséquilibres.",
    icon: HeartPulse,
    popular: true,
    items: [
      "Bilan infectieux",
      "Bilan diabétique",
      "Bilan cardio-vasculaire",
      "Bilan hépatique",
      "Bilan rénal",
      "Bilan hormonal",
    ],
  },
  {
    id: "bilans-specialises",
    title: "Bilans Spécialisés",
    badge: "Cycles de vie & Génétique",
    description: "Des explorations adaptées aux moments déterminants de votre vie personnelle, sportive et familiale.",
    icon: ShieldCheck,
    items: [
      "Bilan prénatal",
      "Bilan prénuptial",
      "Bilan sportif",
      "Bilan familial",
      "Biologie de la reproduction",
      "Cytogénétique",
    ],
  },
  {
    id: "biologie-reproduction",
    title: "Biologie de la Reproduction",
    badge: "Fertilité & Maternité",
    description: "Accompagnement rigoureux et confidentiel de la santé reproductive féminine et masculine.",
    icon: Baby,
    popular: true,
    items: [
      "Bilan hormonal",
      "Spermogramme",
      "Bilan prénatal et prénuptial",
      "Examens de fertilité",
    ],
  },
  {
    id: "analyses-eaux",
    title: "Analyses des Eaux",
    badge: "Hygiène & Environnement",
    description: "Contrôles bactériologiques et sanitaires rigoureux pour garantir la conformité et la potabilité de vos eaux.",
    icon: Droplets,
    items: [
      "Contrôle microbiologique",
      "Analyse sanitaire",
      "Contrôle qualité",
      "Diagnostic environnemental",
    ],
  },
  {
    id: "echographie",
    title: "Échographie Médicale",
    badge: "Imagerie non invasive",
    description: "Examens d'imagerie médicale réalisés avec soin et discrétion dans le respect de votre confort.",
    icon: Waves,
    items: [
      "Orientation selon votre prescription",
      "Accueil sur rendez-vous",
      "Accompagnement avant l’examen",
      "Compte rendu remis au patient",
    ],
  },
  {
    id: "consultation",
    title: "Consultation Médicale",
    badge: "Orientation & Écoute",
    description: "Un entretien approfondi avec nos praticiens pour analyser vos symptômes et interpréter vos résultats.",
    icon: Stethoscope,
    items: [
      "Entretien médical",
      "Orientation diagnostique",
      "Lecture et explication des résultats",
      "Conseils de suivi",
    ],
  },
];

const FILTER_TABS = [
  { id: "all", label: "Tous les examens" },
  { id: "analyses-medicales", label: "Analyses Médicales" },
  { id: "bilans-sante", label: "Bilans de Santé" },
  { id: "bilans-specialises", label: "Bilans Spécialisés" },
  { id: "biologie-reproduction", label: "Reproduction" },
  { id: "analyses-eaux", label: "Analyses des Eaux" },
  { id: "echographie", label: "Échographie" },
  { id: "consultation", label: "Consultation" },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function ServicesCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const searchInputId = useId();

  const filteredCategories = useMemo(() => {
    const query = normalizeText(searchQuery);

    return ORIGINAL_EXAM_CATEGORIES.filter((category) => {
      // Category tab filter
      if (activeTab !== "all" && category.id !== activeTab) {
        return false;
      }

      // Search query filter
      if (!query) return true;

      const titleMatches = normalizeText(category.title).includes(query);
      const descMatches = normalizeText(category.description).includes(query);
      const badgeMatches = normalizeText(category.badge).includes(query);
      const itemsMatches = category.items.some((item) =>
        normalizeText(item).includes(query)
      );

      return titleMatches || descMatches || badgeMatches || itemsMatches;
    });
  }, [searchQuery, activeTab]);

  const totalExamsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <section className="catalog-section" id="exam-catalog" aria-label="Catalogue détaillé des examens">
      <div className="container">
        <div className="catalog-header reveal">
          <p className="eyebrow">
            <span /> Catalogue complet des examens
          </p>
          <h2>Des analyses fiables et exhaustives pour votre santé</h2>
          <p className="catalog-lead">
            Retrouvez l’ensemble des analyses de biologie médicale, bilans de santé, examens spécialisés et analyses environnementales réalisés par le Laboratoire L’Odyssey.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="catalog-controls reveal">
          <div className="catalog-search-wrapper">
            <label htmlFor={searchInputId} className="visually-hidden">
              Rechercher un examen ou une analyse médicale
            </label>
            <Search className="catalog-search-icon" aria-hidden="true" size={20} />
            <input
              id={searchInputId}
              type="search"
              className="catalog-search-input"
              placeholder="Rechercher un examen (ex: Allergologie, Diabète, Spermogramme, Eau, Hémato...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-describedby="search-count"
            />
            {searchQuery && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Effacer la recherche"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="catalog-filter-tabs" role="tablist" aria-label="Filtrer par catégorie">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`catalog-filter-pill ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="catalog-meta" id="search-count" aria-live="polite">
            <span>
              <strong>{filteredCategories.length}</strong> catégorie{filteredCategories.length > 1 ? "s" : ""} •{" "}
              <strong>{totalExamsCount}</strong> examen{totalExamsCount > 1 ? "s" : ""} et prestation{totalExamsCount > 1 ? "s" : ""} listé{totalExamsCount > 1 ? "s" : ""}
            </span>
            {(searchQuery || activeTab !== "all") && (
              <button
                type="button"
                className="catalog-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredCategories.length > 0 ? (
          <div className="catalog-grid">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const whatsappMessage = encodeURIComponent(
                `Bonjour Laboratoire L'Odyssey, je souhaite des renseignements sur le service : ${category.title} (${category.items.slice(0, 3).join(", ")}...).`
              );
              const whatsappLink = `https://wa.me/237695956541?text=${whatsappMessage}`;

              return (
                <article className="catalog-card reveal" key={category.id}>
                  <div className="catalog-card-header">
                    <div className="catalog-card-icon-box">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <div className="catalog-card-headings">
                      <span className="catalog-card-badge">{category.badge}</span>
                      <h3 className="catalog-card-title">{category.title}</h3>
                    </div>
                  </div>

                  <p className="catalog-card-description">{category.description}</p>

                  <div className="catalog-card-divider" />

                  <h4 className="catalog-card-subtitle">Examens et spécialités inclus :</h4>
                  <ul className="catalog-card-items">
                    {category.items.map((item) => {
                      const isMatch =
                        searchQuery &&
                        normalizeText(item).includes(normalizeText(searchQuery));
                      return (
                        <li
                          key={item}
                          className={`catalog-card-item ${isMatch ? "item-highlight" : ""}`}
                        >
                          <Check size={14} className="catalog-check-icon" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="catalog-card-actions">
                    <Link
                      href="/#appointment"
                      className="catalog-action-btn appointment-btn"
                    >
                      Prendre RDV <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="catalog-action-btn whatsapp-btn"
                      aria-label={`Renseignement WhatsApp pour ${category.title} (nouvel onglet)`}
                    >
                      <WhatsAppIcon className="catalog-action-whatsapp-icon" />
                      <span>Infos</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="catalog-empty reveal">
            <Activity size={44} className="catalog-empty-icon" aria-hidden="true" />
            <h3>Aucun examen ne correspond à votre recherche</h3>
            <p>
              Nous n’avons pas trouvé de résultat pour « <strong>{searchQuery}</strong> ». Notre équipe peut vous orienter directement si vous cherchez un examen spécifique ou une prescription particulière.
            </p>
            <div className="catalog-empty-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
              >
                Afficher tous les examens
              </button>
              <a
                href={`https://wa.me/237695956541?text=${encodeURIComponent(
                  `Bonjour Laboratoire L'Odyssey, je recherche l'examen suivant : ${searchQuery}. Pouvez-vous me renseigner ?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <WhatsAppIcon style={{ width: 18, height: 18, fill: "#fff", marginRight: 8 }} />
                Demander sur WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesCatalog;
