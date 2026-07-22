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
  languages: { language: string; level: string }[];
  domainAreas: { title: string; skills: string[] }[];
  portfolio: { title: string; description: string; tags: string[] }[];
  baseCoverLetter: string;
}

export const defaultBaseCV: BaseCV = {
  name: "Hjalmar Meza Cortez",
  title: "Ejecutivo de Operaciones y Transformación Digital",
  summary: "Líder de Operaciones con 18 años de trayectoria en el sector Telecomunicaciones, especializado en la transformación digital de canales de atención masiva y la optimización de la Experiencia del Cliente (CX). Experto en orquestar equipos de alto rendimiento y liderar la transición de entornos físicos a digitales, logrando eficiencias operativas demostradas. Actualmente, fusiono mi sólido background corporativo con la implementación estratégica de Inteligencia Artificial Generativa y automatización de procesos para escalar la rentabilidad empresarial de manera ágil y estructurada.\n\nMI REGLA DE ORO:\n\"Lo que funciona, NO se toca; pero lo que puede optimizarse, lo transformo mediante flujos de trabajo autónomos y soluciones de IA que generan valor inmediato.\"",
  experience: [
    {
      title: "Gestor de Negocio Familiar & Consultor IA",
      company: "Emprendimiento & Advisory",
      period: "2021 — Actualidad",
      location: "España / Remoto",
      description: [
        "Dirección y administración integral de un negocio familiar, liderando las operaciones diarias, rentabilidad y estrategias de fidelización de clientes.",
        "En paralelo, inmersión intensiva en tecnologías de vanguardia, logrando más de 50 certificaciones globales (IA, Cloud, CX, Agile).",
        "Implementación estratégica de herramientas de IA Generativa (Gemini, Claude, ChatGPT) aplicadas a la rentabilidad y eficiencia de procesos operativos.",
        "Entorno Tecnológico: Google Workspace, Trello, Make.com, Herramientas de IA Generativa."
      ]
    },
    {
      title: "Supervisor de Operaciones",
      company: "Telefónica del Perú",
      period: "2021 — 2021",
      location: "Perú",
      description: [
        "Dirección de 48 gestores de Call Center con foco en cumplimiento de SLAs y excelencia en atención masiva.",
        "Supervisión de logística de instalaciones fijas y gestión estratégica de cobranzas corporativas.",
        "Optimización de KPIs críticos elevando la productividad del personal mediante sesiones de coaching.",
        "KPIs Gestionados: NPS, IRP (Resolución de Problemas), Churn Rate, ARPU.",
        "Entorno Tecnológico: Amdocs, ISC, SAP, Microsoft Teams."
      ]
    },
    {
      title: "Supervisor de Control de Calidad",
      company: "Telefónica del Perú",
      period: "2017 — 2021",
      location: "Perú",
      description: [
        "Ejecución de pruebas técnicas y estabilización de sistemas para garantizar la migración masiva y exitosa de más de 20 MILLONES de clientes.",
        "Identificación proactiva de incidencias y testing exhaustivo, asegurando que la nueva plataforma igualara y superara las funciones del sistema anterior.",
        "Mitigación de riesgos y gestión de la fase 'Marcha Blanca', certificando la estabilidad operativa de productos fijos y móviles previo a la liberación masiva."
      ]
    },
    {
      title: "Supervisor Regional (Norte, Centro y Oriente)",
      company: "Telefónica del Perú",
      period: "2009 — 2017",
      location: "Perú",
      description: [
        "Dirección estratégica de 52 Centros de Atención gestionando ~160.000 clientes mensuales.",
        "Ahorro de 110.000 € liderando el proyecto de remodelación y modernización integral de tiendas de atención y venta.",
        "Reducción del 15% en la carga de atención física presencial mediante virtualización estratégica.",
        "Métricas de Retail y Sucursales: Tráfico de Tienda (Footfall), Tasa de Convertibilidad, Venta Cruzada, TMO, TME, Tasa de Abandono, ARPU.",
        "Entorno Tecnológico: Qmatic, Bmatic (Flujo de Clientes), Amdocs, SAP, Microsoft Teams."
      ]
    }
  ],
  education: [
    {
      degree: "Grado en Administración",
      institution: "Universidad César Vallejo",
      period: "2011-2014"
    },
    {
      degree: "Liderazgo en la Era Digital",
      institution: "Tecnológico de Monterrey",
      period: "2026"
    },
    {
      degree: "Coaching Directivo",
      institution: "CENTRUM PUCP",
      period: ""
    },
    {
      degree: "Gestión del Logro",
      institution: "CENTRUM PUCP",
      period: ""
    }
  ],
  skills: [
    "GEMINI / CLAUDE",
    "AZURE AI",
    "MAKE.COM",
    "FIREBASE",
    "OCR / MLLM",
    "SERVERLESS",
    "AGILE MGMT",
    "CX STRATEGY"
  ],
  certifications: [
    "IA Generativa - Microsoft / LinkedIn",
    "Productividad IA - Microsoft / LinkedIn",
    "Azure AI Studio - Microsoft",
    "Liderazgo Digital - Tec. de Monterrey",
    "CX Strategy - LinkedIn",
    "Experto RGPD - LinkedIn (UE)",
    "Agile & Design Thinking - LinkedIn",
    "+50 Certificaciones Adicionales Vigentes en Gestión y Tecnología"
  ],
  languages: [
    { language: "Español", level: "Nativo" },
    { language: "Inglés", level: "Básico (A2)" }
  ],
  domainAreas: [
    { title: "Liderazgo Organizacional", skills: ["Liderazgo Transformador", "Dirección de Equipos", "Culturas de Alto Desempeño", "Resolución de Problemas", "Toma de Decisiones", "Conflictología"] },
    { title: "Transformación & IA", skills: ["Transformación Digital", "IA Generativa & Agentes", "Ingeniería de Prompts", "Ecosistemas Cloud (Azure)", "Análisis y Decisión Técnica", "Productividad de IA"] },
    { title: "Gestión de Operaciones", skills: ["Rentabilidad de Negocios", "Optimización de KPIs", "Mitigación de Riesgos", "Gestión de Proyectos", "Coordinación Logística", "Agilidad Estratégica"] },
    { title: "Desarrollo Comercial", skills: ["Estrategia Comercial", "Negociación", "Prospección de Ventas", "Marketing Digital", "Eficacia de Ventas", "Análisis de Tendencias"] },
    { title: "Experiencia del Cliente (CX)", skills: ["Diseño de CX", "Voice of Customer (VoC)", "Mapeo de Customer Journey", "Resolución en Primer Contacto (FCR)", "Satisfacción del Cliente (CSAT)"] }
  ],
  portfolio: [
    {
      title: "Desarrollo de Arquitectura de Software",
      description: "Desarrollo de una arquitectura de software diversificada con más de 25 proyectos integrales, incluyendo Sistemas de Telemetría, Motores de IA y la nueva división de Motion Comics Ministeriales.",
      tags: ["IA", "Software", "Telemetría"]
    }
  ],
  baseCoverLetter: `Estimado/a Director/a de Selección,

Es un placer presentar mi candidatura. Como Ejecutivo de Operaciones con más de 18 años de trayectoria comprobada en el sector Telecomunicaciones, me especializo en la transformación digital y optimización de la experiencia del cliente (CX) a gran escala.

Durante mi gestión en Telefónica del Perú, lideré la estabilización operativa para la migración de más de 20 millones de clientes, y dirigí estratégicamente 52 Centros de Atención, logrando ahorros significativos (110.000 €) mediante la virtualización y modernización de infraestructuras.

Mi enfoque combina el liderazgo transformador y la rentabilidad de negocios con la implementación avanzada de Inteligencia Artificial Generativa. Mi filosofía es clara: "Lo que funciona, NO se toca; pero lo que puede optimizarse, lo transformo mediante flujos de trabajo autónomos y soluciones de IA que generan valor inmediato". 

Estoy convencido de que mi perfil ejecutivo, sumado a mi ecosistema tecnológico (Azure AI, IA Generativa, Agile Mgmt), me permitirá aportar escalabilidad y eficiencia desde el primer día.

Agradezco de antemano el tiempo dedicado a revisar mi perfil.

Atentamente,
Hjalmar Meza Cortez`
};
