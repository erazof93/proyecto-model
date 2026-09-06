# 🚀 SETUP - Monorepo Proyecto Model (pnpm workspaces)

**Estructura:** 1 repo GitHub con apps (client, admin) + packages (types, utils, config, styles)  
**Package Manager:** pnpm 8+  
**Local Dev:** Docker Compose + Supabase

---

## 📋 REQUISITOS PREVIOS

- **Node.js 18+** (verificar: `node -v`)
- **pnpm 8+** (instalar: `npm install -g pnpm@8`)
- **Docker & Docker Compose** (para Supabase local)
- **Git** (para versionamiento)
- **VS Code** (recomendado + TypeScript extension)

---

## 🏗️ PASO 1: Crear monorepo en GitHub

```bash
# Crear repo en GitHub:
# https://github.com/new
# Nombre: proyecto-model
# Description: Marketplace de modelos
# Private: Sí
# .gitignore: Node
# License: MIT

# Clonar en local
git clone https://github.com/tu-usuario/proyecto-model.git
cd proyecto-model
```

---

## 🌳 PASO 2: Crear estructura de carpetas

```bash
# Carpetas principales
mkdir -p apps/{client,admin,supabase}
mkdir -p packages/{types,utils,config,styles}
mkdir -p docs

# Carpetas dentro de apps
mkdir -p apps/client/{app,components,lib,hooks,styles,public}
mkdir -p apps/admin/{app,components,lib,hooks,styles,public}
mkdir -p apps/supabase/{migrations,functions,seeds}

# Carpetas dentro de packages
mkdir -p packages/types
mkdir -p packages/utils/{seo,validation,helpers}
mkdir -p packages/config
mkdir -p packages/styles
```

---

## 📦 PASO 3: Crear configuración de pnpm workspaces

### **3.1 Root `pnpm-workspace.yaml`**

Crear archivo: `pnpm-workspace.yaml` en raíz

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

### **3.2 Root `package.json`**

Crear archivo: `package.json` en raíz

```json
{
  "name": "proyecto-model",
  "version": "1.0.0",
  "private": true,
  "description": "Marketplace de modelos - Monorepo",
  "author": "Tu nombre",
  "license": "MIT",
  "scripts": {
    "dev": "pnpm --recursive run dev",
    "dev:client": "pnpm --filter @proyecto-model/client dev",
    "dev:admin": "pnpm --filter @proyecto-model/admin dev -- -p 3001",
    "dev:all": "pnpm dev:client & pnpm dev:admin",
    "build": "pnpm --recursive run build",
    "build:client": "pnpm --filter @proyecto-model/client build",
    "build:admin": "pnpm --filter @proyecto-model/admin build",
    "test": "pnpm --recursive run test",
    "test:watch": "pnpm --recursive run test:watch",
    "lint": "pnpm --recursive run lint",
    "format": "pnpm --recursive run format",
    "clean": "pnpm --recursive exec rm -rf .next dist node_modules",
    "install:all": "pnpm install"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "prettier": "^3.0.0",
    "eslint": "^8.50.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

## 🎯 PASO 4: Instalar dependencias globales

```bash
# Instalar pnpm globalmente
npm install -g pnpm@8

# Verificar instalación
pnpm --version
# Debe mostrar: 8.x.x

# Instalar todas las dependencias del monorepo
pnpm install
# pnpm lee pnpm-workspace.yaml y instala en todos workspaces
```

---

## 🌐 PASO 5: Crear app CLIENT

### **5.1 Inicializar Next.js en apps/client**

```bash
cd apps/client

# Crear Next.js proyecto
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --no-git \
  --no-app \
  --eslint

# Cuando pregunte opciones, responder:
# ✅ Use TypeScript? Yes
# ✅ ESLint? Yes
# ✅ Tailwind CSS? Yes
# ✅ Use `src/` directory? No
# ✅ Use App Router? Yes
# ✅ Use Turbopack? Yes
# ✅ Import alias? Yes (@/*)

cd ../..
```

### **5.2 Crear `apps/client/package.json`**

```json
{
  "name": "@proyecto-model/client",
  "version": "1.0.0",
  "private": true,
  "description": "Cliente web - Marketplace de modelos",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^15.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "zustand": "^4.4.0",
    "react-query": "^3.39.0",
    "next-cloudinary": "^5.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.47.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.294.0",
    "@proyecto-model/types": "workspace:*",
    "@proyecto-model/utils": "workspace:*",
    "@proyecto-model/config": "workspace:*",
    "@proyecto-model/styles": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "prettier": "^3.0.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^15.0.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

---

## 🛡️ PASO 6: Crear app ADMIN

### **6.1 Inicializar Next.js en apps/admin**

```bash
cd apps/admin

# Crear Next.js proyecto
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --no-git \
  --eslint

# Responder: Yes a todas las opciones (igual que client)

cd ../..
```

### **6.2 Crear `apps/admin/package.json`**

Mismo que client pero con nombre `@proyecto-model/admin`:

```json
{
  "name": "@proyecto-model/admin",
  "version": "1.0.0",
  "private": true,
  "description": "Admin panel - Marketplace de modelos",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^15.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "zustand": "^4.4.0",
    "react-query": "^3.39.0",
    "recharts": "^2.10.0",
    "@tanstack/react-table": "^8.13.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.47.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.294.0",
    "@proyecto-model/types": "workspace:*",
    "@proyecto-model/utils": "workspace:*",
    "@proyecto-model/config": "workspace:*",
    "@proyecto-model/styles": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "prettier": "^3.0.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^15.0.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

---

## 📦 PASO 7: Crear PACKAGES (código compartido)

### **7.1 `packages/types/package.json`**

```json
{
  "name": "@proyecto-model/types",
  "version": "1.0.0",
  "private": true,
  "description": "Types compartidos",
  "main": "index.ts",
  "exports": {
    ".": "./index.ts",
    "./supabase": "./supabase.ts"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### **7.2 `packages/types/index.ts`**

```typescript
// Enums
export enum Gender {
  WOMAN = 'WOMAN',
  MAN = 'MAN',
  TRANSGENDER = 'TRANSGENDER',
}

export enum Role {
  ADMIN = 'admin',
  MODEL = 'model',
  CUSTOMER = 'customer',
}

export enum FeaturedStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Types
export type User = {
  id: string
  email?: string
  username: string
  role: Role
  created_at: string
}

export type Model = {
  id: string
  user_id: string
  username: string
  name: string
  slug: string
  age: number
  gender: Gender
  bio?: string
  avatar_url?: string
  height?: number
  weight?: number
  clothing_size?: string
  languages?: string[]
  cities_travel?: string[]
  phone?: string
  whatsapp?: string
  instagram?: string
  tiktok?: string
  telegram?: string
  is_verified: boolean
  status: 'PENDING' | 'ACTIVE'
  is_featured: boolean
  featured_expires_at?: string
  created_at: string
  updated_at: string
}

export type FeaturedListing = {
  id: string
  model_id: string
  listing_type: 'TOP' | 'BANNER'
  price: number
  duration_days: number
  start_date: string
  end_date: string
  status: FeaturedStatus
  is_pinned: boolean
  payment_id?: string
  created_by_admin_id?: string
  approved_at?: string
  created_at: string
}

export type ModelPhoto = {
  id: string
  model_id: string
  cloudinary_url: string
  cloudinary_id: string
  is_primary: boolean
  is_verified: boolean
  order_index: number
  created_at: string
}

export type Checklist = {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export type Review = {
  id: string
  model_id: string
  customer_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  created_at: string
}

export type Transaction = {
  id: string
  model_id: string
  featured_listing_id: string
  amount: number
  currency: 'PEN' | 'USD'
  payment_status: 'PENDING' | 'VERIFIED' | 'FAILED'
  verified_at?: string
  admin_notes?: string
  created_at: string
}
```

---

### **7.3 `packages/utils/package.json`**

```json
{
  "name": "@proyecto-model/utils",
  "version": "1.0.0",
  "private": true,
  "description": "Utilities compartidas",
  "main": "index.ts",
  "exports": {
    "./seo": "./seo/index.ts",
    "./validation": "./validation/index.ts",
    "./helpers": "./helpers/index.ts"
  },
  "dependencies": {
    "@proyecto-model/types": "workspace:*",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### **7.4 `packages/utils/helpers/slug.ts`**

```typescript
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateUniqueSlug(text: string, id: string): string {
  const slug = generateSlug(text)
  return `${slug}-${id.substring(0, 8)}`
}
```

### **7.5 `packages/utils/seo/metadata.ts`**

```typescript
import { Model } from '@proyecto-model/types'

export function generateModelMetadata(model: Model) {
  const title = `${model.name} - Servicios profesionales`
  const description = `Contacta a ${model.name}. ${model.gender} verificada. ${model.bio?.substring(0, 50) || ''}`
  const imageUrl = model.avatar_url || '/placeholder-gray.svg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export function generateHomeMetadata() {
  return {
    title: 'Servicios profesionales a domicilio',
    description: 'Conecta con profesionales verificados para tus necesidades',
    openGraph: {
      title: 'Servicios profesionales a domicilio',
      description: 'Conecta con profesionales verificados',
      type: 'website',
    },
  }
}
```

### **7.6 `packages/utils/validation/profile.ts`**

```typescript
import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  age: z.number().min(18, 'Debes ser mayor de 18').max(100),
  height: z.number().optional(),
  weight: z.number().optional(),
  clothing_size: z.string().optional(),
  bio: z.string().max(500, 'Bio máximo 500 caracteres').optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  telegram: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
```

---

### **7.7 `packages/config/package.json`**

```json
{
  "name": "@proyecto-model/config",
  "version": "1.0.0",
  "private": true,
  "description": "Config compartida"
}
```

### **7.8 `packages/styles/package.json`**

```json
{
  "name": "@proyecto-model/styles",
  "version": "1.0.0",
  "private": true,
  "description": "Estilos compartidos"
}
```

---

## 🐳 PASO 8: Docker Compose para Supabase local

Crear archivo: `docker-compose.yml` en raíz del monorepo

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: proyecto_model_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - proyecto_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  supabase:
    image: supabase/supabase:latest
    container_name: proyecto_model_supabase
    ports:
      - "54321:54321"   # PostgreSQL
      - "8000:8000"     # API REST
      - "3000:3000"     # Supabase Studio (UI)
    environment:
      POSTGRES_PASSWORD: postgres
      JWT_SECRET: your-super-secret-jwt-key-change-me-in-production
      SITE_URL: http://localhost:3000
      API_EXTERNAL_URL: http://localhost:8000
      SUPABASE_URL: http://localhost:8000
      ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNDc3MzY2NywiZXhwIjoyMDI0MzkyMjY3fQ.rq2V2KqwFCJJC73vbKPjMQU-gUqXQZ5pcqJmHGX6nE0
      SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE0NzczNjY3LCJleHAiOjIwMjQzOTIyNjd9.ducMEmkIpplD9ZV5d6jOWMQjWHJl1qKU9F6cRb0p3mQ
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - supabase_data:/var/lib/supabase
    networks:
      - proyecto_network

volumes:
  postgres_data:
  supabase_data:

networks:
  proyecto_network:
    driver: bridge
```

---

## ⚙️ PASO 9: Variables de entorno

Crear archivo: `.env.local` en raíz

```env
# Supabase Local (desarrollo)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNDc3MzY2NywiZXhwIjoyMDI0MzkyMjY3fQ.rq2V2KqwFCJJC73vbKPjMQU-gUqXQZ5pcqJmHGX6nE0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE0NzczNjY3LCJleHAiOjIwMjQzOTIyNjd9.ducMEmkIpplD9ZV5d6jOWMQjWHJl1qKU9F6cRb0p3mQ

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_preset_name

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 PASO 10: Iniciar monorepo

```bash
# 1. Instalar dependencias de todo el monorepo
pnpm install

# 2. Iniciar Supabase local
docker-compose up -d

# Verificar que está corriendo:
docker-compose ps
# Debe mostrar: postgres y supabase en estado "Up"

# 3. En TERMINAL 1: Iniciar client (puerto 3000)
pnpm dev:client
# http://localhost:3000

# 4. En TERMINAL 2: Iniciar admin (puerto 3001)
pnpm dev:admin
# http://localhost:3001

# Opcional: Iniciar ambas simultáneamente
pnpm dev:all
```

---

## ✅ VERIFICACIONES

**Checklist inicial:**

- [ ] `pnpm --version` muestra 8.x.x
- [ ] `pnpm install` completa sin errores
- [ ] `docker-compose ps` muestra postgres y supabase "Up"
- [ ] Client carga en http://localhost:3000
- [ ] Admin carga en http://localhost:3001
- [ ] Supabase Studio en http://localhost:3000 (desde docker)
- [ ] Ambas apps comparten types (test: `import { Model } from '@proyecto-model/types'`)

---

## 📁 Estructura final

```
proyecto-model/
├── apps/
│   ├── client/                    # pnpm dev:client
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── next.config.js
│   │   ├── package.json           # name: @proyecto-model/client
│   │   └── tsconfig.json
│   │
│   ├── admin/                     # pnpm dev:admin (puerto 3001)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── next.config.js
│   │   ├── package.json           # name: @proyecto-model/admin
│   │   └── tsconfig.json
│   │
│   └── supabase/                  # Migraciones + functions
│       ├── migrations/
│       ├── functions/
│       └── seeds/
│
├── packages/                      # Código compartido
│   ├── types/
│   │   ├── index.ts
│   │   ├── supabase.ts
│   │   └── package.json
│   │
│   ├── utils/
│   │   ├── seo/
│   │   ├── validation/
│   │   ├── helpers/
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── config/
│   │   └── package.json
│   │
│   └── styles/
│       └── package.json
│
├── docs/
│   ├── SETUP_MONOREPO.md          # Este archivo
│   ├── PROMPTS_CLAUDE_CODE.md
│   ├── CHECKLIST_EVALUACION.md
│   └── ROADMAP_EJECUCION.md
│
├── pnpm-workspace.yaml            # Define workspaces
├── package.json                   # Root scripts
├── docker-compose.yml             # Supabase local
├── .env.example
├── .env.local                     # gitignored
├── .gitignore
└── README.md
```

---

## 🎯 Comandos útiles

```bash
# Instalar paquete en workspace específico
pnpm --filter @proyecto-model/client add react-query

# Instalar en packages
pnpm --filter @proyecto-model/types add zod

# Dev en todas las apps
pnpm dev

# Dev solo client
pnpm dev:client

# Dev solo admin
pnpm dev:admin

# Build todo
pnpm build

# Build solo client
pnpm build:client

# Linting
pnpm lint

# Format
pnpm format

# Test
pnpm test

# Ver que workspaces hay
pnpm ls --depth -1
```

---

## 🆘 Troubleshooting

### pnpm no encuentra módulos compartidos
```bash
# Reinstalar todo
pnpm clean
pnpm install
```

### Puerto 3000 o 3001 en uso
```bash
# Cambiar en apps/admin/package.json:
# "dev": "next dev -p 3002"  (cambiar 3001 a 3002)
```

### Docker Compose no inicia
```bash
docker-compose down -v
docker-compose up -d --build
```

### Changes en packages/ no se reflejan
```bash
# Reiniciar dev server
# pnpm linkea automáticamente
```

---

## 📚 SIGUIENTE PASO

Una vez verificadas todas las checklist:

1. Crear `apps/supabase/migrations/` (FASE 2 del roadmap)
2. Ejecutar prompts de Claude Code (TAREA 1.1 en adelante)
3. Usar CHECKLIST_EVALUACION.md para validar

**Documentación:** Ver `docs/ROADMAP_EJECUCION.md`

---

**¡Monorepo setup completado!** 🚀
