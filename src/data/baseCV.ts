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
    "Liderazgo en la Era Digital - Tec. de Monterrey",
    "Certificado profesional Microsoft Azure AI Essentials - Microsoft",
    "Desarrolla tus habilidades de productividad con IA generativa - Microsoft",
    "Habilidades humanas en la era de la IA - Microsoft",
    "Domina el marketing digital - LinkedIn",
    "Amplía tus competencias tecnológicas como líder para la transformación digital - LinkedIn",
    "Transformación sostenible para líderes - LinkedIn",
    "Especialización en atención al cliente - LinkedIn",
    "GDPR: Reglamento europeo de protección de datos - LinkedIn",
    "Transformación digital: Equipos online, Liderazgo e Implementación - LinkedIn",
    "Análisis de información: Detectar patrones y tendencias - LinkedIn",
    "Design Thinking: Herramientas y técnicas - LinkedIn",
    "Desarrolla el pensamiento creativo, innovación y creatividad del equipo - LinkedIn",
    "Mejora la comunicación y atención plena en el ámbito empresarial - LinkedIn",
    "Gestión de tiempo y productividad - LinkedIn",
    "Inteligencia emocional y Liderazgo colaborativo - LinkedIn",
    "Estrategias de sostenibilidad - LinkedIn",
    "Agilidad estratégica y Pensamiento estratégico - LinkedIn",
    "IA generativa para impulsar la solución creativa de problemas y gestión de proyectos - LinkedIn",
    "Desarrolla aptitudes para la IA en tu organización como líder - LinkedIn",
    "Creación de cultura de alto rendimiento - LinkedIn",
    "Uso de agentes de IA para potenciar la creatividad y productividad - LinkedIn",
    "Vanguardia de la innovación en IA y empoderamiento de equipos - LinkedIn",
    "Toma de decisiones bajo estrés y resolución de problemas con pensamiento crítico - LinkedIn",
    "Liderazgo y trabajo en equipo - LinkedIn",
    "Storytelling para el liderazgo y Liderazgo creativo - LinkedIn",
    "Retos y oportunidades de la IA para el liderazgo - LinkedIn",
    "Mejora tu productividad con ChatGPT - LinkedIn",
    "IA generativa para profesionales de ventas - LinkedIn",
    "Fundamentos de la negociación - LinkedIn",
    "Refuerza tu toma de decisiones con IA Generativa - LinkedIn",
    "Inteligencia artificial para startups - LinkedIn",
    "Prompt Engineering: IA generativa - LinkedIn",
    "Técnicas avanzadas de resolución de conflictos - LinkedIn"
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
      title: "Logística y Entregas Rápidas",
      description: "Arquitecturas de comercio digital y reservas (Alacena). Ecosistemas alojados en Firebase gestionando reglas de horarios nocturnos en tiempo real, integrados nativamente.",
      tags: ["Comercio Digital", "Bases NoSQL"]
    },
    {
      title: "Sistemas de Gestión Comercial",
      description: "Planificación de recursos de bases de datos serverless (Kopilot) y gestión del sector de restaurantes (Restaurante360). Consolidación de inventarios y atención.",
      tags: ["Puntos de Venta", "Planificación"]
    },
    {
      title: "Telemetría y Operaciones Geo",
      description: "Sistemas Web Progresivos de radares geolocalizados para control y prevención comunitaria (Alerta Vecinal, ChrisLocation), emitiendo alertas de emergencia al instante.",
      tags: ["Mapas Digitales", "Tiempo Real"]
    },
    {
      title: "Minería de Datos y Autopilotos",
      description: "Agentes de extracción empresarial y OCR (OptiCompra, Scripto), y sistemas autónomos Text-to-Image para el despliegue de contenido de Marketing en redes (Linkedinmatic V2).",
      tags: ["Minería Web", "Reconocimiento Óptico"]
    },
    {
      title: "Ingeniería de Emisión & Cloud",
      description: "Implementación de estaciones de radio 24/7 de alta disponibilidad (MusiChris Live Station, GeoRadio, Musichris App) sobre infraestructura de bajos recursos, mediante arquitectura de transmisión optimizada y auditorías perimetrales (WiFiSentinel).",
      tags: ["Infraestructura", "Broadcast"]
    },
    {
      title: "Tecnología de Salud e Inclusión",
      description: "Prevención mediante algoritmos predictivos (MoodWeather), interfaces inclusivas (CHART_LESS) y controles de nutrición médica (Mediclock, AlliMentate).",
      tags: ["Salud Integral", "Inclusión Digital"]
    },
    {
      title: "Interfaces de Teleoperación",
      description: "Integración de sistemas de reconocimiento gestual a manos libres (HandRacer) y controladores virtuales asíncronos (Allivision, MediPresenter) para teleoperación física.",
      tags: ["Sensores Ópticos", "Mandos a Distancia"]
    },
    {
      title: "Asesoría de Modas Computarizada",
      description: "Modelos predictivos de geometría facial y asesoría visual de indumentaria mediante probadores sintéticos (FaceCut, Style TARA) procesados analíticamente con el motor MLLM.",
      tags: ["Generación Gráfica", "Análisis Predictivo"]
    },
    {
      title: "Procesadores Lingüísticos",
      description: "Arquitecturas de interacción avanzadas conectadas a hojas de cálculo. Asistentes estructurales de redacción y comprensión semántica profunda (SELAH, Biblia-Cool, Lírica Celestial).",
      tags: ["Razonamiento Lógico", "Asistencia Cognitiva"]
    },
    {
      title: "Automatización de Contenido & IA",
      description: "Motores de procesamiento multimedia, audio inmersivo y despliegue autónomo (MusiChris Atmos, Studio, SOUL, Shorts Engine). Orquestación desatendida mediante Inteligencia Artificial para la creación masiva de activos digitales y control de flujos en tiempo real.",
      tags: ["Producción Digital", "Workflows IA"]
    },
    {
      title: "Ingeniería de Voz y Comunicaciones",
      description: "Interfaces de traducción fluida en tiempo real y baja latencia (Talk.Me) orquestadas junto a sistemas de dictado asincrónico para automatizar mapas mentales y resúmenes de gestión directiva (VoxMind AI).",
      tags: ["Voice-to-Action", "Conversación IA"]
    },
    {
      title: "Experiencias Narrativas con IA",
      description: "Aplicaciones de bienestar y entretenimiento familiar generadas dinamicamente. Cuentos inmersivos narrados por voz en portugues, disenados para entrenar el oido al idioma y aprender de forma natural. Traduccion interactiva palabra por palabra (Jardin de Historias), sobre arquitectura serverless con proxy Cloudflare.",
      tags: ["Inmersion Linguistica", "Aprendizaje Activo"]
    },
    {
      title: "Agentes Inteligentes de Monitoreo",
      description: "Estructuración de bots asíncronos para detección de oportunidades en Real Estate y Finanzas (Vigilante AI). Soluciones integradas para la supervisión proactiva y alertamiento en tiempo real.",
      tags: ["Automatización Proactiva", "Ecosistemas IA"]
    },
    {
      title: "Sistemas de Mando & Telemetría",
      description: "Arquitecturas conversacionales de ultra-rápida acción para el control ejecutivo y monitoreo corporativo en tiempo real (Sentry Mezabot). Orquestación serverless conectada a LLMs (Gemini) y canalizaciones Cloud desde la palma de la mano.",
      tags: ["Interfaces IA", "Control Remoto"]
    },
    {
      title: "Producción Cloud Ministerial & IA",
      description: "Arquitecturas de alta densidad espiritual para la transformación de temáticas contemporáneas en reflexiones bíblicas (MusiChris Themes, Devocional) y la generación autónoma de contenido ministerial de alto impacto (MusiChris Breath). Orquestación integral en la nube.",
      tags: ["Cloud Ministerial", "IA Profética"]
    },
    {
      title: "Motion Comic Autónomo & IA Ministerial",
      description: "Motor de generación de cómics en movimiento con narrativa bíblica (MusiChris Comic). Pipeline automatizado de imagen, texto y audio con filtros de integridad ministerial.",
      tags: ["IA Generativa", "Narrativa Digital"]
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
