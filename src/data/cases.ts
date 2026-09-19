export interface CaseImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface CaseStudy {
  name: string;
  slug: string;
  industry: string;
  summary: string;
  description: string;
  situation: string;
  goal: string;
  features: string[];
  preview: CaseImage;
  screenshots: CaseImage[];
  featureImage?: CaseImage;
  websiteUrl?: `https://${string}`;
  isDemo: boolean;
  logo?: CaseImage;
  testimonial?: { quote: string; name?: string; role?: string };
  featured?: boolean;
  order?: number;
}

const entries: CaseStudy[] = [
  {
    name: 'Hansen Haustechnik',
    slug: 'hansen-haustechnik',
    industry: 'SHK / Haustechnik',
    summary: 'Website für einen regionalen SHK-Betrieb – mit klaren Leistungen, starken Referenzen und einem direkten Weg zur Anfrage.',
    description: 'Für dieses Demoprojekt wurde ein moderner Webauftritt für einen regionalen Haustechnikbetrieb entwickelt. Im Mittelpunkt stehen Badsanierung und Haustechnik, eine verständliche Leistungsstruktur und klare Wege zur Kontaktaufnahme.',
    situation: 'Viele Handwerksbetriebe bieten hochwertige Arbeit, präsentieren ihre Leistungen online aber nur unübersichtlich oder veraltet. Interessenten müssen sich Informationen zusammensuchen und wissen nicht sofort, wie sie eine Anfrage stellen können.',
    goal: 'Ein Auftritt, der die wichtigsten Leistungen sofort verständlich macht, Vertrauen durch Projekte und Bilder aufbaut und Interessenten gezielt zur Kontaktaufnahme führt.',
    features: [
      'Übersichtliche Darstellung der Leistungen rund um Bad und Haustechnik',
      'Mobil optimierte Gestaltung für Smartphone, Tablet und Desktop',
      'Referenzprojekte als fester Bestandteil der Seitenstruktur',
      'Klare Kontaktmöglichkeiten mit direktem Einstieg zur Projektanfrage',
      'Lokale Ausrichtung auf einen regionalen Handwerksbetrieb',
      'Suchmaschinenfreundliche Grundstruktur mit verständlichen Überschriften',
    ],
    preview: {
      src: '/images/cases/hansen-haustechnik/desktop.webp',
      alt: 'Desktop-Entwurf für Hansen Haustechnik mit Leistungsübersicht und großem Badmotiv',
      width: 1200,
      height: 800,
    },
    screenshots: [
      {
        src: '/images/cases/hansen-haustechnik/mobile.webp',
        alt: 'Mobile Ansicht des Hansen-Entwurfs mit Badplanung, Anfrage-Button und Haustechnik-Leistungen',
        width: 600,
        height: 1260,
        caption: 'Smartphone-Ansicht: Leistungen und Anfrage gut erreichbar.',
      },

    ],
    featureImage: {
      src: '/images/cases/hansen-haustechnik/tablet.webp',
      alt: 'Kompakte Ansicht des Hansen-Entwurfs mit nebeneinander angeordneten Leistungen für Bad und Haustechnik',
      width: 840,
      height: 1008,
      caption: 'Kompakte Ansicht: klare Gliederung auch auf kleineren Bildschirmen.',
    },
    isDemo: true,
    featured: true,
    order: 10,
  },
  {
    name: 'Elektro Brandt',
    slug: 'elektro-brandt',
    industry: 'Elektrohandwerk',
    summary: 'Website-Konzept für einen Elektrobetrieb mit direkter Orientierung zu Leistungen, Notdienst und Anfrage.',
    description: 'Dieses Demoprojekt zeigt einen klar gegliederten Auftritt für einen regionalen Elektrobetrieb. Die Gestaltung setzt auf eine helle, technische Bildsprache und führt schnell zu den passenden Kontaktwegen.',
    situation: 'Elektroleistungen sind oft erklärungsbedürftig. Wer schnell Hilfe oder einen festen Ansprechpartner sucht, braucht eine Website mit klaren Themen und gut sichtbaren Kontaktmöglichkeiten.',
    goal: 'Ein übersichtlicher Auftritt, der Leistungen verständlich bündelt, wichtige Kontaktwege hervorhebt und auf allen Geräten verlässlich funktioniert.',
    features: ['Leistungen für Privat- und Gewerbekunden', 'Direkte Kontaktwege für Anfragen und Notdienst', 'Kompakte Leistungsübersicht mit klarer Navigation', 'Mobil optimierte Seitenstruktur'],
    preview: { src: '/images/cases/elektro-brandt/desktop.svg', alt: 'Desktop-Entwurf für Elektro Brandt mit blauem Hero-Bereich und Leistungsübersicht', width: 1200, height: 800 },
    screenshots: [],
    isDemo: true,
    featured: true,
    order: 20,
  },
  {
    name: 'Praxis am Park',
    slug: 'praxis-am-park',
    industry: 'Physiotherapie',
    summary: 'Website-Konzept für eine Physiotherapiepraxis mit ruhiger Bildsprache, Leistungsüberblick und Terminweg.',
    description: 'Dieses Demoprojekt zeigt, wie eine Praxis ihre Behandlungsschwerpunkte und den Weg zur Terminvereinbarung verständlich darstellen kann. Die Gestaltung bleibt freundlich, reduziert und gut lesbar.',
    situation: 'Neue Patientinnen und Patienten möchten schnell wissen, ob eine Praxis zu ihrem Anliegen passt und wie sie einen Termin vereinbaren können.',
    goal: 'Eine vertrauensvolle, leicht zugängliche Website, die Leistungen, Praxisalltag und Kontakt klar zusammenführt.',
    features: ['Behandlungsschwerpunkte klar strukturiert', 'Ruhige, zugängliche Gestaltung', 'Sichtbare Termin- und Kontaktwege', 'Gut lesbare Inhalte auf kleinen Bildschirmen'],
    preview: { src: '/images/cases/praxis-am-park/desktop.svg', alt: 'Desktop-Entwurf für Praxis am Park mit heller Bildfläche und Terminbereich', width: 1200, height: 800 },
    screenshots: [],
    isDemo: true,
    featured: true,
    order: 30,
  },
];

// Fail the build rather than silently overwrite a route when a slug is duplicated.
const slugs = new Set<string>();
for (const entry of entries) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || slugs.has(entry.slug)) {
    throw new Error(`Ungültiger oder doppelter Case-Slug: ${entry.slug}`);
  }
  slugs.add(entry.slug);
}

export const cases = [...entries].sort((a, b) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  || a.name.localeCompare(b.name, 'de'),
);

export const featuredCases = cases.filter((project) => project.featured);
