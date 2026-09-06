import { Gender, ModelStatus, type Model, type Review } from "@proyecto-model/types";

export const mockModels: Model[] = [
  {
    id: "1",
    user_id: "u1",
    username: "sofia.martinez",
    name: "Sofia Martínez",
    slug: "sofia-martinez",
    age: 24,
    gender: Gender.WOMAN,
    bio: "Modelo profesional con experiencia en activaciones de marca y sesiones fotográficas. Disponible para trabajos en Lima y alrededores.",
    city: "Lima",
    services: ["Activación marca", "Sesión fotos", "Modelaje eventos"],
    languages: ["Español", "Inglés", "Francés"],
    cities_travel: ["Lima", "Callao"],
    is_verified: true,
    status: ModelStatus.ACTIVE,
    is_featured: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "2",
    user_id: "u2",
    username: "maria.garcia",
    name: "María García",
    slug: "maria-garcia",
    age: 22,
    gender: Gender.WOMAN,
    bio: "Especialista en sesiones de fotos y contenido para redes sociales.",
    city: "Callao",
    services: ["Sesión fotos"],
    is_verified: true,
    status: ModelStatus.PENDING,
    is_featured: true,
    created_at: "2024-01-02",
    updated_at: "2024-01-02",
  },
  {
    id: "3",
    user_id: "u3",
    username: "valentina.rojas",
    name: "Valentina Rojas",
    slug: "valentina-rojas",
    age: 26,
    gender: Gender.WOMAN,
    bio: "Modelo de eventos con más de 5 años de experiencia.",
    city: "Lima",
    services: ["Modelaje eventos"],
    is_verified: true,
    status: ModelStatus.ACTIVE,
    is_featured: true,
    created_at: "2024-01-03",
    updated_at: "2024-01-03",
  },
  {
    id: "4",
    user_id: "u4",
    username: "catalina.diaz",
    name: "Catalina Díaz",
    slug: "catalina-diaz",
    age: 25,
    gender: Gender.WOMAN,
    bio: "Fotografía comercial y editorial.",
    city: "Lima",
    services: ["Fotografía"],
    is_verified: true,
    status: ModelStatus.ACTIVE,
    is_featured: false,
    created_at: "2024-01-04",
    updated_at: "2024-01-04",
  },
  {
    id: "5",
    user_id: "u5",
    username: "alejandra.torres",
    name: "Alejandra Torres",
    slug: "alejandra-torres",
    age: 23,
    gender: Gender.WOMAN,
    bio: "Activaciones de marca en Lima y Callao.",
    city: "Callao",
    services: ["Activación marca"],
    is_verified: true,
    status: ModelStatus.ACTIVE,
    is_featured: false,
    created_at: "2024-01-05",
    updated_at: "2024-01-05",
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    model_id: "1",
    customer_id: "c1",
    rating: 5,
    comment: "Excelente profesional, muy puntual y profesional en la sesión de fotos.",
    created_at: "2024-06-01",
  },
];

export function getModelBySlug(slug: string): Model | undefined {
  return mockModels.find((m) => m.slug === slug);
}

export function getReviewsForModel(modelId: string): Review[] {
  return mockReviews.filter((r) => r.model_id === modelId);
}

export const cities = ["Lima", "Callao"] as const;
export const serviceOptions = [
  "Activación marca",
  "Sesión fotos",
  "Modelaje eventos",
  "Fotografía",
] as const;
