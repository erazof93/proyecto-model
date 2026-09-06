# 🗺️ ROADMAP CONFIRMADO - MONOREPO (pnpm workspaces)

**Status:** ✅ CONFIRMADO para monorepo  
**Duración:** 8-10 semanas (local) + 1-2 semanas (auditoría + deploy)  
**Package Manager:** pnpm 8+  
**Stack:** Next.js 15, Supabase, Cloudinary, Docker  

---

## ✅ CAMBIOS RESPECTO A VERSIÓN ANTERIOR

### **De 3 REPOS a 1 MONOREPO**

| Aspecto | Antes (3 repos) | Ahora (Monorepo) |
|---------|-----------------|------------------|
| **Repos** | proyecto-model-client, admin, supabase | proyecto-model (1 repo) |
| **Setup** | 3x `npm install` | 1x `pnpm install` |
| **Types** | Duplicados en ambos | Compartidos en packages/types |
| **Utils** | Duplicados | Compartidos en packages/utils |
| **Deploy** | 3 deploys independientes | 2 deploys (Vercel auto-detecta apps) |
| **Estructura** | Compleja | Más limpia |
| **Mantenimiento** | Alto | Bajo |

### **Ventajas de Monorepo para tu caso**

✅ **Code sharing:** Types + utils + config centralizados  
✅ **SEO consistency:** Metadata helpers reutilizables  
✅ **Development:** `pnpm dev:all` inicia ambas apps  
✅ **Tipo safety:** Cambios en types se propagan automáticamente  
✅ **Escalabilidad:** Agregar mobile app = reutiliza packages/  
✅ **Mantenimiento:** Single source of truth  

---

## 📊 ROADMAP (9 FASES - MONOREPO)

### **FASE 1: SETUP MONOREPO (Semana 1)**

**Tareas:**
```bash
[ ] git clone repo
[ ] Ejecutar SETUP_MONOREPO.md paso a paso
[ ] pnpm install
[ ] docker-compose up -d
[ ] Verificar client en http://localhost:3000
[ ] Verificar admin en http://localhost:3001
[ ] Verificar Supabase local en http://localhost:8000
```

**Verificaciones:**
- ✅ `pnpm --version` → 8.x.x
- ✅ `docker-compose ps` → postgres + supabase "Up"
- ✅ `pnpm dev:client` → http://localhost:3000 carga
- ✅ `pnpm dev:admin` → http://localhost:3001 carga
- ✅ Ambas apps pueden importar: `import { Model } from '@proyecto-model/types'`

**Entregables:**
- Monorepo en GitHub
- Docker Compose corriendo
- client + admin en desarrollo
- packages/ listos

**Checklist:** [SETUP_MONOREPO.md](SETUP_MONOREPO.md)

---

### **FASE 2: CORE BACKEND SQL (Semanas 2-3)**

**Ubicación:** `apps/supabase/migrations/`

**Tareas:**
```sql
[ ] 001_init_schema.sql       - Tablas base (users, models, photos, featured, etc)
[ ] 002_auth_setup.sql        - Supabase Auth config
[ ] 003_rls_policies.sql      - Row Level Security (admin, model, customer)
[ ] 004_indexes.sql           - Optimización (slug, featured_expires, etc)
[ ] 005_seeds.sql             - Datos iniciales (admin user, checklists)
```

**Ejecutar en Supabase Studio:**
```
1. Abrir http://localhost:8000
2. SQL Editor
3. Copiar y ejecutar cada migration en orden
```

**Verificar:**
- ✅ Tablas creadas: `models`, `model_photos`, `featured_listings`
- ✅ RLS habilitado en todas las tablas
- ✅ Indexes creados
- ✅ Seeds ejecutadas (admin user + checklists)

**Checklist:** [ROADMAP_EJECUCION.md - FASE 2](ROADMAP_EJECUCION.md)

---

### **FASE 3: AUTENTICACIÓN (Semana 4)**

**Tareas (Ejecutar con Claude Code):**

En `apps/client/`:

```
[ ] TAREA 1.1: Estructura base + componentes UI
    - app/layout.tsx
    - components/ui/Button.tsx, Card.tsx
    - lib/utils/cn.ts
    - types actualizado

[ ] TAREA 1.2: Login + Registro
    - app/(auth)/login/page.tsx
    - app/(auth)/register/page.tsx
    - hooks/useAuth.ts
    - Supabase Auth integrado (JWT + Google OAuth)

[ ] TAREA 1.3: Zustand Auth Store
    - lib/store/authStore.ts
    - Sesión persistida
```

**Verificaciones:**
- ✅ Login funciona (username + password)
- ✅ Google OAuth funciona
- ✅ Registro modelo → redirige a onboarding
- ✅ Rutas protegidas redirigen a login
- ✅ Logout limpia sesión

**Checklist:** [CHECKLIST_EVALUACION.md - SPRINT 1](CHECKLIST_EVALUACION.md)

---

### **FASE 4: FRONTEND PÚBLICO (Semanas 5-6)**

**Tareas (Claude Code):**

En `apps/client/`:

```
[ ] TAREA 2.1: Home + Banner Carousel
    - app/(public)/page.tsx
    - components/Carousel.tsx
    - hooks/useModelos.ts
    - Featured models carousel + grid recomendadas

[ ] TAREA 2.2: Listado modelos + Filtros
    - app/(public)/modelos/page.tsx
    - Filtros: género, checklist, ciudad
    - Búsqueda por nombre
    - Paginación

[ ] TAREA 2.3: Perfil modelo (público)
    - app/(public)/modelos/[slug]/page.tsx
    - Layout 2 columnas
    - Galería fotos + reseñas
    - SEO meta tags dinámicos
```

**Verificaciones:**
- ✅ Home carga rápido (< 2s)
- ✅ Carousel rotación automática
- ✅ Filtros funcionan
- ✅ Búsqueda por nombre
- ✅ Perfil muestra datos correctos
- ✅ Meta tags dinámicos (og:image, etc)

**Checklist:** [CHECKLIST_EVALUACION.md - SPRINT 2](CHECKLIST_EVALUACION.md)

---

### **FASE 5: DASHBOARD MODELO (Semanas 7-8)**

**Tareas (Claude Code):**

En `apps/client/`:

```
[ ] TAREA 3.1: Dashboard modelo principal
    - app/modelo/layout.tsx
    - app/modelo/dashboard/page.tsx
    - Card "⭐ Destacar anuncio"
    - Link Telegram preconfigurado

[ ] TAREA 3.2: Editar perfil modelo
    - app/modelo/dashboard/perfil/page.tsx
    - Formulario completo editable
    - Indicador completitud (%)
    - Validación Zod

[ ] TAREA 3.3: Gestión fotos modelo
    - app/modelo/dashboard/fotos/page.tsx
    - Upload Cloudinary
    - Marcar como principal
    - Estados: aprobada, en revisión, rechazada
```

**Verificaciones:**
- ✅ Acceso solo logueadas
- ✅ Featured button funciona
- ✅ Editar perfil guarda en Supabase
- ✅ Cloudinary upload funciona
- ✅ Fotos se envían a revisión

**Checklist:** [CHECKLIST_EVALUACION.md - SPRINT 3](CHECKLIST_EVALUACION.md)

---

### **FASE 6: ADMIN PANEL (Semanas 9-10)**

**Tareas (Claude Code):**

En `apps/admin/`:

```
[ ] TAREA 4.1: Dashboard admin
    - app/(admin)/page.tsx
    - KPI cards (modelos verificadas, featured, ingresos)
    - Gráfico ingresos últimos 30 días

[ ] TAREA 4.2: Gestión modelos
    - app/(admin)/modelos/page.tsx
    - Listado filtrable y sorteable
    - app/(admin)/modelos/[id]/page.tsx
    - Editar modelo + verificar fotos

[ ] TAREA 4.3: Gestión featured listings
    - app/(admin)/featured/page.tsx
    - Tabs: activos, próximos a vencer, histórico
    - Crear, extender, cancelar featured
    - Pin/unpin modelos

[ ] TAREA 4.4: Reportes
    - app/(admin)/reportes/page.tsx
    - Gráficos (Recharts)
    - Tabla desglose por modelo
    - Descarga CSV
```

**Verificaciones:**
- ✅ Acceso solo admin
- ✅ Editar modelos funciona
- ✅ Verificar/rechazar fotos funciona
- ✅ Gestión featured funciona
- ✅ Reportes cálculos correctos

**Checklist:** [CHECKLIST_EVALUACION.md - SPRINT 4](CHECKLIST_EVALUACION.md)

---

### **FASE 7: TESTING LOCAL (Semana 11)**

**Tareas:**

```bash
[ ] Unit tests (Jest)
    pnpm test

[ ] Integration tests
    Flujos: registro → dashboard → featured

[ ] E2E tests (Cypress)
    Escenarios: modelo busca, cliente contacta, admin gestiona

[ ] Manual testing
    - Mobile/tablet/desktop responsive
    - Lighthouse > 90
    - WCAG 2.1 AA
```

**Verificaciones:**
- ✅ Todos tests pasan
- ✅ Cobertura > 80%
- ✅ Performance scores > 90
- ✅ Sin errores de accesibilidad

---

### **FASE 8: AUDITORÍA (Semana 12)**

**Tareas:**

```bash
[ ] Code Review
    - TypeScript: tsc --noEmit ✅
    - Lint: pnpm lint ✅
    - Security: npm audit ✅

[ ] Security Audit
    - RLS policies validadas
    - JWT tokens secure
    - XSS/CSRF protección

[ ] Performance Audit
    - LCP < 2.5s
    - Bundle size < 500kb

[ ] Cleanup
    - Console.logs removidos
    - Comentarios de dev removidos
```

**Verificaciones:**
- ✅ Zero linting errors
- ✅ Zero TypeScript errors
- ✅ Zero security vulnerabilities
- ✅ Lighthouse > 90

---

### **FASE 9: DEPLOY A PRODUCCIÓN (Semana 13)**

**Tareas:**

```bash
[ ] Deploy Supabase
    Railway proyecto + PostgreSQL managed

[ ] Deploy Client
    Vercel apps/client → marketplace.com

[ ] Deploy Admin
    Vercel apps/admin → admin.marketplace.com

[ ] Configurar DNS
    marketplace.com → Vercel
    admin.marketplace.com → Vercel

[ ] Monitoring + Backups
    Sentry (error tracking)
    Automated backups
    Health checks
```

**Verificaciones:**
- ✅ Todos servicios "green"
- ✅ HTTPS en todos
- ✅ Monitoring activo
- ✅ Backups automáticos

---

## 🎯 RESUMEN TIMING

```
FASE 1 (Setup):                  1 semana
FASE 2 (Backend SQL):            2 semanas
FASE 3 (Auth):                   1 semana
FASE 4 (Frontend público):       2 semanas
FASE 5 (Dashboard modelo):       2 semanas
FASE 6 (Admin panel):            2 semanas
FASE 7 (Testing):                1 semana
FASE 8 (Auditoría):              1 semana
FASE 9 (Deploy):                 1 semana

TOTAL: 13 semanas (3+ meses)
```

---

## 📋 COMANDOS CLAVE POR FASE

### **FASE 1: Setup**
```bash
pnpm install
docker-compose up -d
pnpm dev:client  # Terminal 1
pnpm dev:admin   # Terminal 2
```

### **FASE 2: Backend**
```bash
# Crear migrations en apps/supabase/migrations/
# Ejecutar en Supabase Studio (http://localhost:8000)
# SQL Editor → Copiar y ejecutar cada .sql
```

### **FASES 3-6: Desarrollo**
```bash
# Copiar prompt de PROMPTS_CLAUDE_CODE.md
# Usar Claude Code CLI
# Validar con CHECKLIST_EVALUACION.md
```

### **FASE 7: Testing**
```bash
pnpm test
pnpm test:watch
# E2E: cypress open
```

### **FASE 8: Auditoría**
```bash
pnpm lint
pnpm format
pnpm build
# Lighthouse Chrome DevTools
```

### **FASE 9: Deploy**
```bash
# Railway: Crear proyecto + conectar GitHub
# Vercel: Crear proyecto + conectar GitHub
# DNS: Cambiar registros (Namecheap, etc)
```

---

## 📚 DOCUMENTACIÓN REQUERIDA

Para empezar, necesitas estos archivos (ya generados):

```
docs/
├── SETUP_MONOREPO.md              ← Paso a paso setup
├── PROMPTS_CLAUDE_CODE.md         ← 13 prompts listos
├── CHECKLIST_EVALUACION.md        ← Validación por tarea
├── ROADMAP_EJECUCION.md           ← Detalles por fase
└── ROADMAP_CONFIRMADO_MONOREPO.md ← Este archivo
```

**Todos ya generados y listos para descargar.** ✅

---

## 🚀 INSTRUCCIONES FINALES (AHORA)

### **PASO 1: Descargar archivos**

```
Descargar del output:
- SETUP_MONOREPO.md
- PROMPTS_CLAUDE_CODE.md
- CHECKLIST_EVALUACION.md
- ROADMAP_EJECUCION.md
- ROADMAP_CONFIRMADO_MONOREPO.md (este)
```

### **PASO 2: Crear monorepo en GitHub**

```bash
# En GitHub:
# 1. New repository
# 2. Nombre: proyecto-model
# 3. Description: Marketplace de modelos - Monorepo
# 4. Private: Sí
# 5. .gitignore: Node
# 6. Create repository

# En local:
git clone https://github.com/tu-usuario/proyecto-model.git
cd proyecto-model
```

### **PASO 3: Crear carpetas y archivos**

```bash
# Crear estructura
mkdir -p apps/{client,admin,supabase}
mkdir -p packages/{types,utils,config,styles}
mkdir -p docs

# Copiar archivos .md a docs/
# Copiar pnpm-workspace.yaml a raíz
# Copiar package.json a raíz
# Copiar docker-compose.yml a raíz
```

### **PASO 4: Ejecutar SETUP_MONOREPO.md**

```bash
# Seguir paso a paso:
# 1. Verificar requisitos (Node 18+, pnpm 8+)
# 2. Crear estructura
# 3. pnpm-workspace.yaml
# 4. package.json raíz
# 5. Inicializar Next.js en apps/client y admin
# 6. Crear packages/
# 7. Docker Compose
# 8. .env.local
# 9. pnpm install
# 10. docker-compose up -d
# 11. pnpm dev:client & pnpm dev:admin
```

### **PASO 5: Validar setup**

```bash
# Checklist de SETUP_MONOREPO.md:
[ ] pnpm --version → 8.x.x
[ ] pnpm install ✅
[ ] docker-compose ps → postgres + supabase "Up"
[ ] http://localhost:3000 → client carga
[ ] http://localhost:3001 → admin carga
[ ] Import compartido: import { Model } from '@proyecto-model/types' ✅
```

### **PASO 6: Comenzar FASE 1**

```bash
# Reportar:
✅ SETUP_MONOREPO COMPLETADO
├─ Docker Compose corriendo
├─ Client en puerto 3000
├─ Admin en puerto 3001
└─ Packages compartidos listos
```

---

## ✅ CONFIRMACIÓN FINAL

**¿Está TODO confirmado para monorepo?**

✅ **Estructura:** 1 repo (proyecto-model) con apps/ + packages/  
✅ **Package Manager:** pnpm 8+ workspaces  
✅ **Local Dev:** Docker Compose + Supabase  
✅ **Roadmap:** 9 fases, 13 semanas  
✅ **Documentación:** 5 .md files listos  
✅ **SEO:** Metadata + slugs centralizados en packages/utils/seo  
✅ **Escalabilidad:** Reutilizable para múltiples apps  

**Status: 🟢 LISTO PARA COMENZAR**

---

## 📞 SIGUIENTE ACCIÓN

**AHORA MISMO:**

1. Descargar los 5 documentos .md
2. Crear repo GitHub "proyecto-model"
3. Clonar en local
4. Ejecutar SETUP_MONOREPO.md paso a paso
5. Reportar cuando FASE 1 esté lista

**Cuando reportes:**
```
✅ FASE 1: SETUP MONOREPO COMPLETADO
├─ Monorepo en GitHub: [url]
├─ Docker: postgres + supabase "Up"
├─ Client: http://localhost:3000 ✅
├─ Admin: http://localhost:3001 ✅
└─ Siguiente: FASE 2 (Backend SQL)
```

---

**¡Listo para comenzar!** 🚀💪

El roadmap está confirmado, la estructura es sólida, la documentación es completa.

**Go go go.** ✨
