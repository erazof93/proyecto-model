# 🗺️ ROADMAP DE EJECUCIÓN - MARKETPLACE MODELS

**Proyecto:** Marketplace de modelos con Supabase + Next.js  
**Duración:** 8-10 semanas (local) + 1-2 semanas (deploy + auditoría)  
**Stack:** Next.js 15, Supabase, Cloudinary, Docker  
**Repos:** 3 (client, admin, supabase)

---

## 📊 RESUMEN EJECUTIVO

```
FASE 1: SETUP (1 semana)
├─ Crear 3 repos
├─ Configurar Docker + Supabase local
├─ Setup Next.js (client + admin)
└─ Documentación base

FASE 2: CORE BACKEND (2 semanas)
├─ DDL SQL (tablas, RLS, indexes)
├─ Migrations
├─ Seeds (admin user, checklists)
└─ Edge Functions (si necesarias)

FASE 3: AUTENTICACIÓN (1 semana)
├─ Login/Registro (Supabase Auth)
├─ Google OAuth
├─ JWT + cookies
└─ Middleware protección

FASE 4: FRONTEND PÚBLICO (2 semanas)
├─ Home + banner carousel
├─ Listado modelos + filtros
├─ Perfil modelo público
└─ Búsqueda ILIKE

FASE 5: DASHBOARD MODELO (2 semanas)
├─ Dashboard principal
├─ Editar perfil
├─ Gestión fotos + Cloudinary
├─ Sistema de reseñas
└─ Featured listings

FASE 6: ADMIN PANEL (2 semanas)
├─ Dashboard analytics
├─ Gestión modelos (editar, verificar)
├─ Gestión featured listings
├─ Reportes + gráficos
└─ Checklists

FASE 7: TESTING LOCAL (1 semana)
├─ Unit tests (Jest)
├─ Integration tests
├─ E2E tests (Cypress/Playwright)
└─ Bug fixes

FASE 8: AUDITORÍA (1 semana)
├─ Code review
├─ Security audit
├─ Performance audit
├─ Cleanup

FASE 9: DEPLOY (1 semana)
├─ Railway (Supabase + DB)
├─ Vercel client
├─ Vercel admin
├─ Configuración DNS
└─ Go-live

TOTAL: 10-11 semanas
```

---

## 📋 DETALLES POR FASE

### **FASE 1: SETUP (Semana 1)**

**Tareas:**
- [ ] Crear 3 repos GitHub
- [ ] Clonar en local
- [ ] Ejecutar SETUP_CLIENT.md
- [ ] Ejecutar SETUP_ADMIN.md
- [ ] Docker Compose up
- [ ] Verificar Supabase local (http://localhost:8000)
- [ ] Carpeta /public/design para mockups Claude Design

**Entregables:**
- 3 repos creados con estructura base
- Docker Compose corriendo
- Next.js dev servers en puertos 3000 (client) y 3001 (admin)
- Documentación organizada

**Checklist:**
- [ ] `pnpm dev` funciona en client
- [ ] `pnpm dev -p 3001` funciona en admin
- [ ] Supabase local accesible
- [ ] .env.local configurado
- [ ] Git init en cada repo

---

### **FASE 2: CORE BACKEND (Semanas 2-3)**

**Archivo: `proyecto-model-supabase/migrations/`**

Tareas (en orden):
- [ ] `001_init_schema.sql` - Tablas base
- [ ] `002_auth_setup.sql` - Auth config
- [ ] `003_rls_policies.sql` - Row Level Security
- [ ] `004_indexes.sql` - Optimización
- [ ] `005_seeds.sql` - Datos iniciales (admin, checklists)

**Crear en `001_init_schema.sql`:**
```sql
-- Tables:
- users (extend auth.users)
- profiles (user_id FK)
- models (user_id FK, avatar_url, gender, age, etc)
- model_photos (model_id FK, cloudinary_id, is_verified, is_primary)
- model_checklists (model_id FK, checklist_id FK)
- checklists (name, description)
- featured_listings (model_id FK, type, price, start_date, end_date, status)
- transactions (model_id FK, featured_listing_id FK, amount)
- reviews (model_id FK, customer_id FK, rating, comment)

-- Types:
- enum gender (WOMAN, MAN, TRANSGENDER)
- enum role (admin, model, customer)
- enum featured_status (ACTIVE, EXPIRED, CANCELLED)
- enum payment_status (PENDING, VERIFIED, FAILED)

-- Indexes:
- idx_models_slug
- idx_models_gender
- idx_models_featured_expires
- idx_featured_listings_status
- idx_photos_model_verified
```

**En `003_rls_policies.sql`:**
```sql
-- ADMIN: Full access
- models.* → admin
- featured_listings.* → admin
- transactions.* → admin
- checklists.* → admin

-- MODEL: Own data only
- models (read own, update own)
- model_photos (read own, create own, delete own)
- featured_listings (read own)
- reviews (read own)

-- CUSTOMER: Read public only
- models (read public, is_active=true)
- model_photos (read public, is_approved=true)
- reviews (read public)
```

**Verificación:**
- [ ] `psql` conecta a DB
- [ ] Todas tablas creadas: `\dt`
- [ ] RLS habilitado: `\dP`
- [ ] Indexes creados: `\di`
- [ ] Seeds ejecutadas

---

### **FASE 3: AUTENTICACIÓN (Semana 4)**

**Tareas: Ejecutar PROMPTS_CLAUDE_CODE.md**

**TAREA 1.1:** Estructura base + componentes UI  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 1.2:** Login + Registro  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 1.3:** Zustand Auth Store  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**Testing:**
- [ ] Crear modelo: ✅ redirige a onboarding
- [ ] Crear cliente: ✅ redirige a perfil
- [ ] Google OAuth: ✅ funciona
- [ ] Logout: ✅ limpia sesión
- [ ] Rutas protegidas: ✅ redirige a login

---

### **FASE 4: FRONTEND PÚBLICO (Semanas 5-6)**

**Tareas: PROMPTS_CLAUDE_CODE.md SPRINT 2**

**TAREA 2.1:** Home + Carousel  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 2.2:** Listado modelos + Filtros  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 2.3:** Perfil modelo público  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**Testing:**
- [ ] Home carga rápido (< 2s)
- [ ] Carousel rotación automática: ✅
- [ ] Filtros funcionan: ✅
- [ ] Búsqueda por nombre: ✅
- [ ] Perfil muestra datos correctos: ✅
- [ ] SEO meta tags: ✅

---

### **FASE 5: DASHBOARD MODELO (Semanas 7-8)**

**Tareas: PROMPTS_CLAUDE_CODE.md SPRINT 3**

**TAREA 3.1:** Dashboard principal  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 3.2:** Editar perfil  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 3.3:** Gestión fotos + Cloudinary  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**Testing:**
- [ ] Acceso solo logueadas: ✅
- [ ] Featured button funciona: ✅
- [ ] Editar perfil guarda: ✅
- [ ] Cloudinary upload funciona: ✅
- [ ] Fotos se envían a revisión: ✅

---

### **FASE 6: ADMIN PANEL (Semanas 9-10)**

**Tareas: PROMPTS_CLAUDE_CODE.md SPRINT 4**

En `proyecto-model-admin`:

**TAREA 4.1:** Dashboard admin  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 4.2:** Gestión modelos  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 4.3:** Gestión featured listings  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**TAREA 4.4:** Reportes  
- [ ] Completada
- [ ] Checklist de evaluación ✅

**Testing:**
- [ ] Acceso solo admin: ✅
- [ ] Editar modelos: ✅
- [ ] Verificar fotos: ✅
- [ ] Gestión featured: ✅
- [ ] Reportes cálculo correcto: ✅

---

### **FASE 7: TESTING LOCAL (Semana 11)**

**Unit Tests:**
```bash
pnpm test --coverage

Archivos a testear:
- lib/utils/ (100% coverage)
- lib/store/ (95% coverage)
- hooks/ (90% coverage)
- types/ (N/A)
```

**Integration Tests:**
```bash
pnpm test:integration

Flujos a testear:
- Registro modelo → onboarding → dashboard
- Editar perfil → guardar → reload
- Upload foto → revisión → aprobación
- Admin edita modelo → actualización
```

**E2E Tests (Cypress):**
```bash
pnpm cypress open

Escenarios:
1. Modelo nueva: registra → completa perfil → destaca anuncio
2. Cliente: busca modelo → filtra → ve perfil → contacta
3. Admin: verifica modelo → edita → aprueba fotos
```

**Manual Testing Checklist:**
- [ ] Todos flows de usuario testeados manualmente
- [ ] Responsive tested en mobile/tablet/desktop
- [ ] Performance: lighthouse scores > 90
- [ ] Accesibilidad: WCAG 2.1 AA

---

### **FASE 8: AUDITORÍA (Semana 12)**

**Code Review:**
- [ ] TypeScript: `tsc --noEmit` sin errores
- [ ] Lint: `pnpm lint` sin warnings
- [ ] Formatting: `pnpm format`
- [ ] Dependencies: `npm audit` sin vulnerabilidades
- [ ] Unused code: eliminar

**Security Audit:**
- [ ] RLS policies validadas (Supabase)
- [ ] JWT tokens secure
- [ ] Cloudinary API keys protegidas
- [ ] CORS configurado correctamente
- [ ] SQL injection: imposible (ORM)
- [ ] XSS: React escapa por defecto
- [ ] CSRF: token validation

**Performance Audit:**
- [ ] LCP < 2.5s (home)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 500kb (client)
- [ ] Bundle size < 300kb (admin)
- [ ] Images optimizadas (WebP, AVIF)
- [ ] Queries Supabase < 500ms

**SEO Audit:**
- [ ] Meta tags dinámicos
- [ ] og: tags (image, title, description)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Structured data (JSON-LD)
- [ ] Mobile friendly (mobile test)

**Cleanup:**
- [ ] Comentarios de desarrollo removidos
- [ ] Console.logs removidos
- [ ] Archivos temporales eliminados
- [ ] .env.example actualizado
- [ ] README completo en cada repo

---

### **FASE 9: DEPLOY A PRODUCCIÓN (Semana 13)**

**Pre-deploy Checklist:**
- [ ] Todos tests pasan
- [ ] Code review completado
- [ ] Auditoría completada
- [ ] Backups configurados
- [ ] Monitoring configurado
- [ ] Error tracking (Sentry) setup

**Deploy Railway (Backend + DB):**
```bash
1. Crear proyecto en Railway
2. Conectar repo proyecto-model-supabase
3. Configurar variables de entorno
4. Ejecutar migraciones SQL
5. Ejecutar seeds
6. Verificar conectividad
```

**Deploy Vercel (Client):**
```bash
1. Crear proyecto Vercel
2. Conectar repo proyecto-model-client
3. Configurar variables de entorno (PROD)
4. Dominio: marketplace.com
5. HTTPS automático
6. Preivew deployments
```

**Deploy Vercel (Admin):**
```bash
1. Crear proyecto Vercel
2. Conectar repo proyecto-model-admin
3. Configurar variables de entorno (PROD)
4. Dominio: admin.marketplace.com
5. HTTPS automático
```

**Configuración DNS:**
```
marketplace.com → Vercel (client)
admin.marketplace.com → Vercel (admin)
api.marketplace.com → Railway (backend - si aplica)

Cloudinary: C-name configurado
```

**Post-deploy:**
- [ ] Health checks en todas URLs
- [ ] Monitoring activo
- [ ] Error tracking funciona
- [ ] Analytics habilitado
- [ ] Backups automáticos

---

## 🎯 WORKFLOW ESPECÍFICO

### **Cómo usar Claude Code CLI para cada tarea:**

```bash
# Paso 1: Copiar prompt de PROMPTS_CLAUDE_CODE.md

# Paso 2: Abrir Claude Code
# - Web: claudecode.com
# - CLI: claude code --prompt "PROMPT_AQUI"

# Paso 3: Especificar ruta
# Cuando pregunte: "apps/client" o "apps/admin"

# Paso 4: Dejar que genere
# Esperar a que complete

# Paso 5: Revisar checklist
# Usar CHECKLIST_EVALUACION.md para validar

# Paso 6: Si hay errores
# Pedir corrección específica a Claude Code

# Paso 7: Reportar a conversación
# "Tarea 1.1: ✅ COMPLETADA"
# Pegar resultado si necesario
```

---

## 📈 TRACKING DE PROGRESO

**Usa esta tabla para trackear progreso:**

| Sprint | Tarea | Estado | Checklist | Inicio | Fin |
|--------|-------|--------|-----------|--------|-----|
| 1 | 1.1 Layout | ⏳ | 0/10 | - | - |
| 1 | 1.2 Auth | ⏳ | 0/12 | - | - |
| 1 | 1.3 Zustand | ⏳ | 0/5 | - | - |
| 2 | 2.1 Home | ⏳ | 0/12 | - | - |
| 2 | 2.2 Listado | ⏳ | 0/10 | - | - |
| 2 | 2.3 Perfil | ⏳ | 0/11 | - | - |
| 3 | 3.1 Dashboard | ⏳ | 0/10 | - | - |
| 3 | 3.2 Editar | ⏳ | 0/10 | - | - |
| 3 | 3.3 Fotos | ⏳ | 0/12 | - | - |
| 4 | 4.1 Admin Dashboard | ⏳ | 0/10 | - | - |
| 4 | 4.2 Admin Modelos | ⏳ | 0/14 | - | - |
| 4 | 4.3 Admin Featured | ⏳ | 0/12 | - | - |
| 4 | 4.4 Reportes | ⏳ | 0/10 | - | - |

---

## 🎯 PRÓXIMOS PASOS (AHORA)

1. **Descarga estos archivos .md:**
   - SETUP_CLIENT.md
   - SETUP_ADMIN.md
   - PROMPTS_CLAUDE_CODE.md
   - CHECKLIST_EVALUACION.md
   - ROADMAP_EJECUCION.md (este)

2. **Crea carpetas:**
   ```
   proyecto-model-client/
   ├── docs/
   │   ├── SETUP.md
   │   ├── ARCHITECTURE.md
   │   └── API.md
   
   proyecto-model-admin/
   ├── docs/
   │   ├── SETUP.md
   │   └── ARCHITECTURE.md
   
   proyecto-model-supabase/
   ├── docs/
   │   ├── SCHEMA.md
   │   └── RLS_POLICIES.md
   ```

3. **Ejecuta FASE 1 (Setup):**
   - Sigue SETUP_CLIENT.md paso a paso
   - Sigue SETUP_ADMIN.md paso a paso
   - Verifica Docker Compose

4. **Reporta cuando FASE 1 esté lista:**
   - "✅ FASE 1 COMPLETADA"
   - Pega resultado de `docker-compose ps`
   - Pega resultado de `pnpm dev` en ambos repos

---

## 📞 SOPORTE

Si necesitas ayuda:
1. Verifica checklist relevante
2. Revisa troubleshooting en SETUP.md
3. Reporta error específico
4. Proporciona logs de consola

---

**¡Listo para empezar? Comienza con FASE 1 (Setup).** 🚀

**Tiempo estimado por fase:**
- FASE 1: 1 día (setup)
- FASES 2-8: 6-8 semanas (desarrollo)
- FASE 9: 1 semana (deploy + monitoring)

**Total: 8-10 semanas a código limpio y testeado.** ✨
