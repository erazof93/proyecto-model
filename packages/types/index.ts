// ============================================================================
// @proyecto-model/types - Tipos y enums compartidos entre client, admin y utils
// ============================================================================

// --- Enums ------------------------------------------------------------------

export enum Gender {
  WOMAN = "WOMAN",
  MAN = "MAN",
  TRANSGENDER = "TRANSGENDER",
}

export enum Role {
  ADMIN = "admin",
  MODEL = "model",
  CUSTOMER = "customer",
}

export enum ModelStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  ARCHIVED = "ARCHIVED",
}

export type InteractionType = "WHATSAPP_CLICK" | "INSTAGRAM_CLICK" | "PROFILE_VIEW";

export type ModelInteraction = {
  id: string;
  model_id: string;
  interaction_type: InteractionType;
  created_at: string;
};

export enum FeaturedStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum FeaturedType {
  TOP = "TOP",
  BANNER = "BANNER",
}

// --- Entidades ------------------------------------------------------------

export type User = {
  id: string;
  email?: string;
  username: string;
  role: Role;
  created_at: string;
};

export type Model = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  slug: string;
  age: number;
  gender: Gender;
  bio?: string;
  avatar_url?: string;
  city?: string;
  services?: string[];
  height?: number;
  weight?: number;
  clothing_size?: string;
  languages?: string[];
  cities_travel?: string[];
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
  is_verified: boolean;
  status: ModelStatus;
  is_featured: boolean;
  featured_expires_at?: string;
  created_at: string;
  updated_at: string;
};

export type FeaturedListing = {
  id: string;
  model_id: string;
  type: FeaturedType;
  price: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: FeaturedStatus;
  is_pinned: boolean;
  order_index: number;
  payment_id?: string;
  created_by_admin_id?: string;
  approved_at?: string;
  created_at: string;
};

export type ModelPhoto = {
  id: string;
  model_id: string;
  cloudinary_url: string;
  cloudinary_id: string;
  is_primary: boolean;
  is_verified: boolean;
  order_index: number;
  created_at: string;
};

export type Review = {
  id: string;
  model_id: string;
  customer_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  created_at: string;
};

/** Review con el username de la clienta ya resuelto (join), para listados de dashboard. */
export type ReviewWithCustomer = Review & { customer_username?: string };

export type ReviewStats = {
  total: number;
  avgRating: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type Checklist = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  model_id: string;
  featured_listing_id: string;
  amount: number;
  currency: "PEN" | "USD";
  payment_status: "PENDING" | "VERIFIED" | "FAILED";
  verified_at?: string;
  admin_notes?: string;
  created_at: string;
};
