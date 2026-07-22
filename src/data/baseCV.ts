export interface BaseCV {
  name: string;
  title: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    period: string;
    location: string;
    description: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
  skills: string[];
  certifications: string[];
}

export const defaultBaseCV: BaseCV = {
  name: "Hjalmar Meza Cortez",
  title: "Ejecutivo de Operaciones y Transformación Digital",
  summary: "Líder con más de 18 años de experiencia en el sector Telco, experto en escalabilidad, rentabilidad y transformación digital. Experiencia comprobada en la gestión de infraestructuras (52 tiendas), migración de más de 20M+ de clientes y optimización de rentabilidad (ahorros sostenidos en modernización). Enfoque estratégico centrado en la experiencia del cliente y adopción de Inteligencia Artificial.",
  experience: [
    {
      title: "Gerente de Operaciones / Transformación",
      company: "Sector Telco (Ej. Telefónica)",
      period: "2006 - Presente",
      location: "España / Latam",
      description: [
        "Liderazgo de estrategias de transformación digital y experiencia del cliente (CX).",
        "Migración y escalabilidad de más de 20M+ de clientes a nuevas plataformas.",
        "Gestión operativa de 52 tiendas, logrando optimizar la rentabilidad y ahorrando 110K € en procesos de modernización.",
        "Implementación de cultura de alto rendimiento e integración de IA Generativa en flujos de trabajo."
      ]
    }
  ],
  education: [
    {
      degree: "Programa de Liderazgo y Transformación",
      institution: "Tecnológico de Monterrey / CENTRUM",
      period: "2015"
    }
  ],
  skills: [
    "Liderazgo Exponencial",
    "Transformación Digital",
    "Experiencia del Cliente (CX)",
    "Inteligencia Artificial Generativa",
    "Gestión de Proyectos Ágiles",
    "Gestión del Cambio",
    "Optimización de Rentabilidad"
  ],
  certifications: [
    "Habilidades Humanas en la Era de IA - Microsoft",
    "Productividad con Agentes de IA - Microsoft",
    "Estrategia de IA Generativa - Microsoft",
    "Liderazgo en la Era Digital - Tec. de Monterrey",
    "NPS y Lealtad del Cliente - Telefónica",
    "Experto en RGPD (UE) - LinkedIn"
  ]
};
