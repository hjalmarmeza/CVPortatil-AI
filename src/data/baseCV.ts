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
  summary: "Líder con más de 18 años de experiencia en el sector Telco, experto en escalabilidad, rentabilidad y transformación digital. Experiencia comprobada en la gestión de infraestructuras, migración de más de 20M+ de clientes y optimización de rentabilidad. Enfoque estratégico centrado en la experiencia del cliente y adopción de Inteligencia Artificial.",
  experience: [
    {
      title: "Gestor de Negocio Familiar & Consultor IA",
      company: "Emprendimiento & Advisory",
      period: "2021 — Actualidad",
      location: "España / Remoto",
      description: [
        "Dirección y administración integral de un negocio familiar, liderando las operaciones diarias, rentabilidad y estrategias de fidelización de clientes.",
        "Inmersión intensiva en tecnologías de vanguardia, logrando más de 50 certificaciones globales (IA, Cloud, CX, Agile).",
        "Implementación estratégica de herramientas de IA Generativa (Gemini, Claude, ChatGPT) aplicadas a la rentabilidad y eficiencia de procesos operativos."
      ]
    },
    {
      title: "Supervisor de Operaciones",
      company: "Telefónica",
      period: "2021 — 2021",
      location: "Lima, Perú",
      description: [
        "Dirección de 48 gestores de Call Center con foco en cumplimiento de SLAs y excelencia en atención masiva.",
        "Supervisión de logística de instalaciones fijas y gestión estratégica de cobranzas corporativas.",
        "Optimización de KPIs críticos elevando la productividad del personal mediante sesiones de coaching."
      ]
    },
    {
      title: "Supervisor de Control de Calidad",
      company: "Telefónica",
      period: "2017 — 2021",
      location: "Lima, Perú",
      description: [
        "Ejecución de pruebas técnicas y estabilización de sistemas para garantizar la migración masiva y exitosa de más de 20 MILLONES de clientes.",
        "Identificación proactiva de incidencias y testing exhaustivo, asegurando que la nueva plataforma igualara y superara las funciones del sistema anterior.",
        "Mitigación de riesgos y gestión de la fase 'Marcha Blanca', certificando la estabilidad operativa de productos fijos y móviles previo a la liberación masiva."
      ]
    },
    {
      title: "Supervisor Regional (Norte, Centro y Oriente)",
      company: "Telefónica",
      period: "2009 — 2017",
      location: "Lima, Perú",
      description: [
        "Dirección estratégica de 52 Centros de Atención gestionando ~160.000 clientes mensuales.",
        "Ahorro de 110.000 € liderando el proyecto de remodelación y modernización integral de tiendas de atención y venta.",
        "Reducción del 15% en la carga de atención física presencial mediante virtualización estratégica."
      ]
    }
  ],
  education: [
    {
      degree: "Grado en Administración",
      institution: "Universidad César Vallejo",
      period: "2011 — 2014"
    },
    {
      degree: "Liderazgo en la Era Digital",
      institution: "Tecnológico de Monterrey",
      period: "2026"
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
