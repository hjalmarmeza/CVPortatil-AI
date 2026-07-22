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
  summary: "Líder con más de 18 años de experiencia en el sector Telco, experto en escalabilidad, rentabilidad y transformación digital.",
  experience: [
    {
      title: "Gerente de Operaciones",
      company: "Telefónica",
      period: "2015 - Presente",
      location: "Madrid, España",
      description: [
        "Liderazgo de equipos multidisciplinarios.",
        "Implementación de estrategias de transformación digital.",
        "Optimización de costos operativos en un 20%."
      ]
    }
  ],
  education: [
    {
      degree: "MBA",
      institution: "Escuela de Negocios",
      period: "2010 - 2012"
    }
  ],
  skills: [
    "Liderazgo Exponencial",
    "Transformación Digital",
    "Gestión de Proyectos",
    "Inteligencia Artificial"
  ],
  certifications: [
    "Habilidades Humanas en la Era de IA - Microsoft",
    "Productividad con Agentes de IA - Microsoft",
    "Estrategia de IA Generativa - Microsoft"
  ]
};
