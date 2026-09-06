# 🤖 PROMPTS PARA CLAUDE CODE CLI

Estos prompts están diseñados para ejecutarse con **Claude Code** (CLI) de forma modular y específica.

Estructura: Cada prompt es **UNA TAREA GRANULAR** que puede ejecutarse y validarse independientemente.

---

## 📋 CÓMO USAR

```bash
# Opción 1: Copiar y pegar en Claude Code (web)
# Opción 2: Ejecutar en CLI (si está disponible)
claude code --prompt "PROMPT_AQUI"

# Opción 3: En archivo (crear file.md, copiar prompt, ejecutar)
```

---

## 🎯 SPRINT 1: ESTRUCTURA BASE & AUTENTICACIÓN

### **TAREA 1.1: Crear layout root y componentes base**

```
Contexto: Proyecto Next.js 15 para marketplace de modelos

Crear los siguientes archivos en proyecto-model-client:

1. app/layout.tsx
   - Root layout con Tailwind
   - Meta tags básicos
   - Providers (Zustand, React Query)
   - Estilos globals

2. components/ui/Button.tsx
   - Componente botón reutilizable
   - Variantes: primary (rosa), secondary, ghost
   - Soportar loading state
   - Props: variant, size, disabled, children

3. components/ui/Card.tsx
   - Componente card reutilizable
   - Props: children, className
   - Estilos Tailwind (border, shadow, rounded)

4. lib/utils/cn.ts
   - Utilidad para combinar clases Tailwind (clsx + tailwind-merge)

5. types/index.ts
   - Types base: User, Model, FeaturedListing
   - Enums: Role, Gender, FeaturedStatus

Usar Tailwind CSS con colores ROSA:
- PRIMARY: #E84C89
- SECONDARY: #F5A3C7
- ACCENT: #C72B7F

Placeholders de imágenes: gris (placeholder-gray-300)

Archivos a crear:
- app/layout.tsx
- app/globals.css
- components/ui/Button.tsx
- components/ui/Card.tsx
- lib/utils/cn.ts
- types/index.ts

Entregar código limpio, bien comentado, listo para producción.
```

---

### **TAREA 1.2: Crear página de login y registro**

```
Contexto: Autenticación con Supabase (JWT + Google OAuth)

Crear flujo de autenticación completo:

1. app/(auth)/login/page.tsx
   - Form con campos: username, password
   - Botón "Ingresar con Google"
   - Link a registro
   - Integración Supabase Auth:
     * signInWithPassword(username, password)
     * signInWithOAuth({ provider: 'google' })
   - Manejo de errores (toast notifications)
   - Redirección a /modelo/dashboard o /customer/profile según rol

2. app/(auth)/register/page.tsx
   - Form multi-step:
     * PASO 1: Seleccionar rol (Modelo/Cliente)
     * PASO 2: Crear credenciales (username, password, confirm password)
   - Integración Supabase Auth:
     * signUp(email, password)
     * Crear user.username
   - Validación Zod
   - Redirección a /modelo/onboarding si rol = 'model'

3. hooks/useAuth.ts
   - Hook para manejar autenticación
   - getUser()
   - getSession()
   - logout()
   - signIn(username, password)
   - signUp(email, password, username)
   - signInWithGoogle()

4. middleware.ts
   - Proteger rutas privadas: /modelo/*, /customer/*
   - Redirigir a /auth/login si no autenticado
   - Redirigir a /auth/login si es admin intenta acceder

Requisitos:
- Username, NO email para login
- Google OAuth integrado
- Validación Zod
- Error handling claro
- Toast notifications para feedback
- Cookies seguras

Archivos a crear:
- app/(auth)/layout.tsx
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- hooks/useAuth.ts
- middleware.ts
- lib/auth/helpers.ts

Código limpio, tipos completos, listo para testing.
```

---

### **TAREA 1.3: Crear contexto de autenticación global (Zustand)**

```
Contexto: Estado global para usuario logueado

Crear store Zustand para manejar sesión del usuario:

1. lib/store/authStore.ts
   - Store Zustand con estado:
     * user: User | null
     * session: Session | null
     * loading: boolean
     * error: string | null
   
   - Acciones:
     * setUser(user)
     * clearUser()
     * setLoading(boolean)
     * setError(error)
     * initialize() → Leer sesión de Supabase al cargar app
   
   - Selectores (para optimización):
     * selectUser
     * selectSession
     * selectIsAuthenticated
     * selectUserRole

2. lib/store/useAuthStore.ts
   - Export custom hook: useAuthStore()

Usar Zustand con TypeScript:
- Interfaces claras
- Actions tipadas
- Selectores para re-renders optimizados

Archivos a crear:
- lib/store/authStore.ts

Nota: Este store se inicializa en app/layout.tsx
```

---

## 🎯 SPRINT 2: PÁGINAS PÚBLICAS (HOME, LISTADO, PERFIL)

### **TAREA 2.1: Crear página HOME con banner carousel**

```
Contexto: Home page pública con banner carousel de modelos destacadas

1. app/(public)/page.tsx (HOME PAGE)
   - Header con logo + search bar
   - Search area con dropdowns:
     * Género (Mujer, Hombre, Transexual)
     * Checklist (dinámico desde Supabase)
     * Ciudad (Lima, Callao)
     * Botón "Buscar"
   - Banner Carousel:
     * Mostrar 5-8 modelos destacadas
     * Foto principal (aspect 9:11)
     * Overlay inferior con: Nombre, Edad, Género, Badge "Verificado"
     * Rotación automática (4s)
     * Botones prev/next
     * Dots indicadores
   - Grid de modelos recomendadas (3 columnas desktop)
   - Cada card: foto, nombre, edad, género, 1 checklist, botón "Ver perfil"
   - Footer

2. components/ui/Carousel.tsx
   - Carousel reutilizable
   - Props: items, autoplay, interval
   - Controls: prev, next, dots

3. hooks/useModelos.ts
   - Hook para obtener modelos de Supabase
   - getFeaturedModels() → modelos con is_featured = true
   - getRecommendedModels() → últimos 12 modelos activos
   - Caché con React Query (stale-while-revalidate)

Integración Supabase:
- Query table 'models' donde is_featured = true y status = 'ACTIVE'
- Query photos para obtener avatar_url
- Filtro por gender, cities (si aplica)

Requisitos:
- Responsive (desktop 3 cols, tablet 2 cols, mobile 1 col)
- Imágenes con fallback gray placeholder
- Performance optimizado (lazy loading)
- SSR con Next.js (revalidate: 60)

Archivos a crear:
- app/(public)/page.tsx
- components/Carousel.tsx
- components/ModelCard.tsx
- hooks/useModelos.ts
```

---

### **TAREA 2.2: Crear página de listado de modelos**

```
Contexto: Página /modelos con filtros y búsqueda

1. app/(public)/modelos/page.tsx
   - Layout: Sidebar filtros (desktop) | Collapsible (mobile)
   - Filtros:
     * Género: checkboxes (Mujer, Hombre, Transexual)
     * Checklist: checkboxes múltiples
     * Ciudad: dropdown/checkboxes
     * Ordenamiento: select (Más nuevo, Destacados, A-Z)
   - Grid de modelos (3 cols desktop, 1 mobile)
   - Paginación (12 items por página)
   - Search simple por nombre (ILIKE)

2. hooks/useFilteredModels.ts
   - Hook para filtrar modelos
   - Parámetros: gender, checklists, cities, sort, page
   - Query Supabase con filtros
   - React Query para caché

Integración Supabase:
- Query con filtros: WHERE gender = ? AND cities @> ? etc
- Paginación: LIMIT 12 OFFSET page*12
- Búsqueda: nombre ILIKE %search%

Requisitos:
- Filtros aplicables en tiempo real
- Responsive (sidebar → hamburger en mobile)
- Performance (lazy loading images)
- SEO friendly (SSG con revalidate)

Archivos a crear:
- app/(public)/modelos/page.tsx
- components/FilterSidebar.tsx
- components/ModelGrid.tsx
- hooks/useFilteredModelos.ts
```

---

### **TAREA 2.3: Crear página de perfil modelo (público)**

```
Contexto: Página /modelos/[slug] - perfil público de modelo

1. app/(public)/modelos/[slug]/page.tsx
   - Layout 2 columnas (60/40):
     * Left: Foto hero, info, servicios, botón contactar
     * Right: Galería de fotos, info adicional
   - Hero section:
     * Foto principal (9:11)
     * Overlay inferior: nombre + edad
   - Info block:
     * Nombre, Edad, Género, Ciudad
     * Badge "✅ Verificado"
     * Bio/descripción
   - Servicios/Checklists:
     * Tags coloreados
   - Botón "📞 Contactar" → abre WhatsApp/Telegram
   - Iconos redes sociales
   - Galerías:
     * Grid 2-3 columnas
     * Cada foto con estado ("Aprobada ✅")
   - Reseñas (si cliente logueado):
     * Listado de reseñas
     * Botón "Dejar reseña"

2. components/ModelProfile.tsx
   - Componente principal para perfil

3. generateMetadata function
   - SEO: title, description, og:image
   - Dinámico basado en modelo

4. generateStaticParams function
   - Pre-generate paths para slug populares
   - ISR con revalidate: 3600

Integración Supabase:
- Query table 'models' por slug
- Query 'model_photos' para galería
- Query 'model_checklists' para servicios
- Query 'reviews' para reseñas

Requisitos:
- Responsive (2 cols desktop, 1 col mobile)
- Imagen principal optimizada (aspect 9:11)
- SEO meta tags dinámicos
- ISR para rendimiento

Archivos a crear:
- app/(public)/modelos/[slug]/page.tsx
- components/ModelProfile.tsx
- lib/utils/slug.ts (generador de slugs)
```

---

## 🎯 SPRINT 3: DASHBOARD MODELO (PRIVADO)

### **TAREA 3.1: Crear dashboard modelo principal**

```
Contexto: /modelo/dashboard - página principal de modelo logueada

1. app/modelo/dashboard/page.tsx
   - Sidebar (desktop) | Hamburger (mobile):
     * Menu items: Mi perfil, Mis fotos, Mis servicios, Mis reseñas
     * Botón "Contactar admin" prominente
   - Main content:
     * Card grande: "⭐ DESTACAR MI ANUNCIO"
       - Opciones: TOP lista ($50 x 7 días) | BANNER ($75 x 7 días)
       - Botón "Contactar admin" → Abre Telegram con mensaje preconfigurado
       - Si ya destacada: "✅ Tu anuncio está destacado hasta [fecha]"
     * Cards secundarias:
       - "Perfil completado: 60%"
       - "Fotos aprobadas: 5"
       - "Reseñas: 3"

2. app/modelo/layout.tsx
   - Layout privado para modelo
   - Sidebar con navegación
   - Protegido: solo modelo logueada puede acceder

3. components/dashboard/FeaturedCard.tsx
   - Card para destacar anuncio
   - Mostrar estado actual

4. lib/constants/featured-options.ts
   - Opciones featured (TOP, BANNER, precios, duración)

Integración Supabase:
- Obtener datos del modelo logueado
- Query featured_listings activos del modelo
- Calcular porcentaje completitud de perfil

Requisitos:
- Protegido por AuthGuard
- UX clara para destacar anuncio
- Mostrar estado actual de featured
- Link Telegram preconfigurado

Archivos a crear:
- app/modelo/layout.tsx
- app/modelo/dashboard/page.tsx
- components/dashboard/FeaturedCard.tsx
- lib/constants/featured-options.ts
- lib/utils/telegram-link.ts
```

---

### **TAREA 3.2: Crear página edición perfil modelo**

```
Contexto: /modelo/dashboard/perfil - editar datos de modelo

1. app/modelo/dashboard/perfil/page.tsx
   - Formulario editable con campos:
     * Foto de perfil (upload Cloudinary)
     * Nombre/Alias (input)
     * Género (dropdown, pre-selectcionado)
     * Edad (input numérico)
     * Altura (cm)
     * Peso (kg)
     * Talla de ropa (dropdown)
     * Bio/descripción (textarea)
     * Ciudades donde viaja (checkboxes)
     * Idiomas (checkboxes)
     * Contacto: teléfono, WhatsApp, Instagram, TikTok, Telegram
     * Servicios/Checklists (checkboxes múltiples)
   - Indicador de completitud (barra %): "Perfil completado 75%"
   - Botones: "Guardar cambios", "Cancelar"

2. hooks/useModelProfile.ts
   - Hook para obtener/actualizar perfil
   - updateProfile(data)
   - Validación Zod

3. components/forms/ProfileForm.tsx
   - Formulario reutilizable
   - React Hook Form + Zod

Integración Supabase:
- UPDATE models table con datos nuevos
- RLS policy: solo puede editar su perfil

Requisitos:
- Validación Zod completa
- Upload Cloudinary para foto
- Indicador de completitud visual
- Error handling

Archivos a crear:
- app/modelo/dashboard/perfil/page.tsx
- components/forms/ProfileForm.tsx
- hooks/useModelProfile.ts
- lib/validators/profile.ts (Zod schema)
```

---

### **TAREA 3.3: Crear página gestión de fotos modelo**

```
Contexto: /modelo/dashboard/fotos - subir y gestionar galería

1. app/modelo/dashboard/fotos/page.tsx
   - Secciones:
     * "Mis fotos aprobadas" (grid)
     * "Fotos en revisión" (grid)
     * "Fotos rechazadas" (grid)
   - Cada foto miniatura con:
     * Badge de estado (✅ Aprobada | ⏳ En revisión | ❌ Rechazada)
     * Badge ⭐ "Principal" si es main
     * Botón "☆ Marcar como principal"
     * Botón "🗑️ Eliminar"
   - Botón grande "+ AGREGAR FOTO"
     * Upload Cloudinary (drag & drop)
     * Preview antes de subir
     * Auto-envía a admin para verificación
   - Info: "Las fotos serán verificadas por el admin"

2. hooks/useModelPhotos.ts
   - Hook para obtener/subir fotos
   - getPhotos()
   - uploadPhoto(file)
   - markAsMain(photoId)
   - deletePhoto(photoId)

3. components/PhotoUpload.tsx
   - Componente upload Cloudinary
   - Drag & drop
   - Preview

4. components/PhotoGallery.tsx
   - Galería por estado

Integración Supabase:
- INSERT model_photos con is_verified = false
- UPDATE para marcar main y eliminar
- RLS: solo puede editar propias fotos

Requisitos:
- Upload Cloudinary seamless
- Preview antes de subir
- Estados visuales claros
- Limit fotos (máx 20 por modelo)

Archivos a crear:
- app/modelo/dashboard/fotos/page.tsx
- hooks/useModelPhotos.ts
- components/PhotoUpload.tsx
- components/PhotoGallery.tsx
- lib/cloudinary/uploader.ts
```

---

## 🎯 SPRINT 4: ADMIN PANEL (PRIVADO)

### **TAREA 4.1: Crear dashboard admin principal**

```
Contexto: /admin - página principal del admin

Archivo: app/(admin)/page.tsx en proyecto-model-admin

1. Layout:
   - Sidebar con menú
   - Main content con KPIs

2. Cards principales (KPIs):
   - "Modelos verificadas: 24"
   - "Pendientes verificación: 3"
   - "Featured activos: 8"
   - "Ingresos este mes: S/ 1,850"

3. Gráfico:
   - "Ingresos últimos 30 días" (recharts barchart)

4. Tablas rápidas:
   - "Modelos recientes" (últimas 5)
   - "Solicitudes pendientes" (si existen)

Integración Supabase:
- COUNT modelos donde is_verified = true
- COUNT modelos donde status = 'pending'
- COUNT featured_listings donde status = 'ACTIVE'
- SUM de transaction amounts para ingresos
- Query con agregaciones

Requisitos:
- Protegido: solo admin
- Datos en tiempo real (React Query)
- Gráficos con Recharts
- Responsive

Archivos a crear:
- app/(admin)/page.tsx
- components/KPICard.tsx
- components/charts/IncomeChart.tsx
```

---

### **TAREA 4.2: Crear página gestión de modelos (admin)**

```
Contexto: /admin/modelos - listar y gestionar todas las modelos

1. app/(admin)/modelos/page.tsx
   - Filtros arriba:
     * Search por nombre
     * Dropdown estado (Pendiente, Activa, Inactiva)
     * Dropdown género
     * Botón aplicar
   - Tabla responsive:
     * Columnas: Nombre, Género, Edad, Ciudad, Estado (badge), Fotos, Acciones
     * Paginación
     * Botones de acción: 👁️ "Ver detalle", ✏️ "Editar"
   - Tabla con TanStack Table para manejo avanzado

2. app/(admin)/modelos/[id]/page.tsx
   - Tabs: Información | Fotos
   - TAB Información:
     * Mismo formulario que modelo edita pero todo editables
     * Toggles: "✅ Verificada", "🟢 Activa en listado"
     * Botones: Guardar, Cancelar
   - TAB Fotos:
     * Galería de fotos por estado
     * Botones: Aprobar, Rechazar, Eliminar
     * Admin puede subir fotos directamente
     * Marcar como principal

3. hooks/useAdminModelos.ts
   - Hook para CRUD de modelos
   - getModelos(filters)
   - getModeloById(id)
   - updateModelo(id, data)
   - verifyModel(id)
   - approvePhoto(photoId)

Integración Supabase:
- Query modelos con filtros
- UPDATE/DELETE con admin role
- RLS policy: solo admin

Requisitos:
- Tabla avanzada (sort, filter, pagination)
- Formulario editable completo
- Gestión de fotos clara
- Error handling

Archivos a crear:
- app/(admin)/modelos/page.tsx
- app/(admin)/modelos/[id]/page.tsx
- components/ModelTable.tsx
- components/ModelEditForm.tsx
- hooks/useAdminModelos.ts
```

---

### **TAREA 4.3: Crear página gestión de featured listings**

```
Contexto: /admin/featured - gestionar anuncios destacados

1. app/(admin)/featured/page.tsx
   - Tabs:
     * "Activos ahora" - tabla con destacadas activas
     * "Próximos a vencer" - tabla con alerts ⚠️ (rojo si < 7 días)
     * "Histórico" - tabla con todas (filtrable por fecha, modelo, tipo)
     * "Solicitudes pendientes" - si hay (tabla)
   
   - Tabla estructura:
     * Columnas: Modelo, Tipo (TOP/BANNER), Inicio, Vencimiento, Días restantes, Pinned, Acciones
     * Botones: Extender, Cancelar, 📌 Pin/Unpin
   
   - Solicitudes pendientes:
     * Tabla: Modelo, Tipo, Fecha solicitud, Botón "Aprobar"

2. hooks/useAdminFeatured.ts
   - Hook para CRUD featured_listings
   - getFeatured(status)
   - createFeatured(modelId, type, duration)
   - extendFeatured(featuredId, extraDays)
   - cancelFeatured(featuredId)
   - togglePin(featuredId)

Integración Supabase:
- Query featured_listings con agregaciones
- Calcular días restantes
- INSERT transacción cuando aprueba
- UPDATE is_featured en models table

Requisitos:
- Alertas visuales para vencimientos
- Acciones rápidas (extender, cancelar)
- Histórico completo
- Pinning manual

Archivos a crear:
- app/(admin)/featured/page.tsx
- components/FeaturedTable.tsx
- hooks/useAdminFeatured.ts
```

---

### **TAREA 4.4: Crear página reportes**

```
Contexto: /admin/reportes - analytics y reportes financieros

1. app/(admin)/reportes/page.tsx
   - Cards KPI:
     * Ingresos este mes
     * Featured vendidos (TOP vs BANNER %)
     * Modelo más popular
   
   - Gráfico 1: Ingresos últimos 12 meses (recharts barchart)
   - Gráfico 2: Featured (pie chart TOP/BANNER %)
   
   - Tabla: Desglose por modelo
     * Columnas: Modelo, Featured pagados, Ingresos total, % del total
     * Sorteable, filtrable
   
   - Botón "Descargar reporte" (CSV/PDF)

2. hooks/useReports.ts
   - Hook para obtener datos de reportes
   - getRevenueData(dateRange)
   - getFeaturedStats()
   - getModelStats()

Integración Supabase:
- Query transactions con agregaciones (SUM, COUNT, GROUP BY)
- Query featured_listings con GROUP BY tipo
- Calcular porcentajes y promedios

Requisitos:
- Gráficos con Recharts
- Tabla sorteable
- Export a CSV
- Responsive

Archivos a crear:
- app/(admin)/reportes/page.tsx
- components/charts/RevenueChart.tsx
- components/charts/FeaturedPieChart.tsx
- components/ReportTable.tsx
- hooks/useReports.ts
```

---

## 📋 PLANTILLA GENERAL PARA PROMPTS PERSONALIZADOS

Si necesitas hacer otra tarea, usa esta estructura:

```
Contexto: [Describe qué hace]

Crear/Modificar:
1. [Archivo 1] - [Responsabilidad]
2. [Archivo 2] - [Responsabilidad]
...

Requisitos:
- [Requisito 1]
- [Requisito 2]
...

Integración Supabase:
- [Query/mutation 1]
- [Query/mutation 2]
...

Archivos a crear:
- [list de files]

Notas:
- [Cualquier nota especial]
```

---

## ✅ CÓMO USAR ESTOS PROMPTS

1. **Copiar prompt completo** (incluye contexto + requisitos)
2. **Abrir Claude Code** o **Claude en CLI**
3. **Pegar prompt** en la interfaz
4. **Especificar ruta** (apps/client o apps/admin)
5. **Dejar que genere código**
6. **Revisarlo y ajustarlo** según necesidad
7. **Reportar resultado** en siguiente conversación

---

**Todos los prompts están listos. Úsalos en orden de sprints.** ✨
