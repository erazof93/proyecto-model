# ✅ CHECKLIST DE EVALUACIÓN POR TAREA

Usa este checklist después de que Claude Code genere código para una tarea. **Todos los ✅ deben estar antes de pasar a siguiente tarea.**

---

## 🎯 SPRINT 1: ESTRUCTURA BASE & AUTENTICACIÓN

### TAREA 1.1: Crear layout root y componentes base

**Archivos a revisar:**
- [ ] `app/layout.tsx`
- [ ] `app/globals.css`
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `lib/utils/cn.ts`
- [ ] `types/index.ts`

**Código - Checklist:**
- [ ] Layout root tiene Providers (React Query, Zustand)
- [ ] Meta tags básicos en layout
- [ ] Button tiene variantes: primary, secondary, ghost
- [ ] Button soporta loading state
- [ ] Button tiene props: variant, size, disabled, children
- [ ] Card tiene props: children, className
- [ ] Colores Tailwind rosa están definidos (PRIMARY: #E84C89, etc)
- [ ] cn() utility function combina clases correctamente
- [ ] Types exports: User, Model, FeaturedListing, enums
- [ ] Sin errores TypeScript (verificar: `tsc --noEmit`)

**Testing:**
- [ ] `pnpm dev` inicia sin errores
- [ ] Home page carga en http://localhost:3000
- [ ] Botones se renderean correctamente
- [ ] Cards se ven con estilos correctos
- [ ] No hay warnings en consola

**Performance:**
- [ ] Build completa sin errores: `pnpm build`
- [ ] No hay unused imports
- [ ] Código está comentado apropiadamente

---

### TAREA 1.2: Crear página de login y registro

**Archivos a revisar:**
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/register/page.tsx`
- [ ] `hooks/useAuth.ts`
- [ ] `middleware.ts`
- [ ] `lib/auth/helpers.ts`
- [ ] `app/(auth)/layout.tsx`

**Código - Checklist:**
- [ ] Login page tiene form con: username, password
- [ ] Login tiene botón "Google OAuth"
- [ ] Login integra Supabase Auth (signInWithPassword)
- [ ] Login integra Supabase Auth (signInWithOAuth google)
- [ ] Login maneja errores con toast notifications
- [ ] Login redirige a dashboard/profile según rol
- [ ] Register tiene PASO 1: seleccionar rol (Modelo/Cliente)
- [ ] Register tiene PASO 2: credenciales + password confirm
- [ ] Register valida con Zod
- [ ] Register crea username en Supabase
- [ ] Register redirige a /modelo/onboarding si rol = model
- [ ] useAuth hook tiene métodos: getUser, getSession, logout, signIn, signUp, signInWithGoogle
- [ ] Middleware protege rutas /modelo/*, /customer/*
- [ ] Middleware redirige no autenticado a /auth/login

**Testing:**
- [ ] Crear cuenta modelo funciona
- [ ] Crear cuenta cliente funciona
- [ ] Login con username y password funciona
- [ ] Google OAuth inicia sesión correctamente
- [ ] Logout funciona
- [ ] Redirecciones correctas
- [ ] Validación Zod funciona (mensajes de error)
- [ ] No se puede acceder /modelo/dashboard sin login

**Seguridad:**
- [ ] Password hasheado en Supabase (bcrypt)
- [ ] JWT en cookies secure
- [ ] No hay contraseña en logs
- [ ] CSRF protection (Supabase lo maneja)

---

### TAREA 1.3: Crear contexto de autenticación global (Zustand)

**Archivos a revisar:**
- [ ] `lib/store/authStore.ts`

**Código - Checklist:**
- [ ] Store tiene estado: user, session, loading, error
- [ ] Store tiene acciones: setUser, clearUser, setLoading, setError, initialize
- [ ] initialize() lee sesión de Supabase al cargar
- [ ] Selectores optimizados: selectUser, selectSession, selectIsAuthenticated, selectUserRole
- [ ] TypeScript types correctos para estado
- [ ] Zustand persiste sesión (opcional: localStorage)

**Testing:**
- [ ] `useAuthStore()` funciona en componentes
- [ ] User se actualiza al loguearse
- [ ] Loading state funciona
- [ ] Selectores no causan re-renders innecesarios

**Performance:**
- [ ] Store no causa re-renders en todo árbol (selectores)
- [ ] initialize() se ejecuta UNA VEZ al cargar app

---

## 🎯 SPRINT 2: PÁGINAS PÚBLICAS

### TAREA 2.1: Crear página HOME con banner carousel

**Archivos a revisar:**
- [ ] `app/(public)/page.tsx`
- [ ] `components/Carousel.tsx`
- [ ] `components/ModelCard.tsx`
- [ ] `hooks/useModelos.ts`

**Código - Checklist:**
- [ ] Home page tiene header con logo + search bar
- [ ] Search area tiene dropdowns: género, checklist, ciudad
- [ ] Banner carousel muestra 5-8 modelos destacadas
- [ ] Carousel tiene rotación automática (4s)
- [ ] Carousel tiene botones prev/next
- [ ] Carousel tiene dots indicadores
- [ ] Foto en carousel aspecto 9:11
- [ ] Overlay inferior muestra: nombre, edad, género, badge verificado
- [ ] Grid modelos recomendadas (3 cols desktop, 1 mobile)
- [ ] Cada card muestra: foto, nombre, edad, género, checklist, botón ver
- [ ] useModelos hook obtiene datos Supabase
- [ ] getFeaturedModels() filtra is_featured = true
- [ ] getRecommendedModels() obtiene últimos activos
- [ ] React Query caché implementado
- [ ] Placeholders grises para fotos sin cargar
- [ ] Footer incluido

**Testing:**
- [ ] Home page carga sin errores
- [ ] Carousel rotación automática funciona
- [ ] Botones carousel (prev/next) funcionan
- [ ] Grid responsive en diferentes tamaños
- [ ] Datos de Supabase cargan correctamente
- [ ] Imágenes cargan con fallback placeholder
- [ ] No hay layout shift cuando cargan fotos

**Performance:**
- [ ] `pnpm build` completa sin errores
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] Layout shift mínimo (CLS < 0.1)

**SEO:**
- [ ] Meta tags en generateMetadata
- [ ] Title descriptivo
- [ ] Description con palabras clave
- [ ] og:image configurada

---

### TAREA 2.2: Crear página de listado de modelos

**Archivos a revisar:**
- [ ] `app/(public)/modelos/page.tsx`
- [ ] `components/FilterSidebar.tsx`
- [ ] `components/ModelGrid.tsx`
- [ ] `hooks/useFilteredModelos.ts`

**Código - Checklist:**
- [ ] Página listado tiene sidebar filtros (desktop) / hamburger (mobile)
- [ ] Filtros: género (checkboxes), checklist, ciudad, ordenamiento
- [ ] Filtros aplicables en tiempo real
- [ ] Grid 3 cols desktop, 2 tablet, 1 mobile
- [ ] Paginación funciona (12 items por página)
- [ ] Búsqueda por nombre ILIKE
- [ ] useFilteredModels hook obtiene datos Supabase
- [ ] Query usa filtros: WHERE gender, cities, checklists
- [ ] Búsqueda ILIKE integrada
- [ ] React Query para caché

**Testing:**
- [ ] Filtro género funciona
- [ ] Filtro checklist funciona
- [ ] Filtro ciudad funciona
- [ ] Ordenamiento funciona (nuevo, destacado, A-Z)
- [ ] Paginación funciona
- [ ] Búsqueda por nombre funciona
- [ ] Responsive correcto en mobile

**Performance:**
- [ ] Lazy loading en grid
- [ ] No refetch innecesario de datos
- [ ] Filtering es rápido (< 200ms)

---

### TAREA 2.3: Crear página de perfil modelo (público)

**Archivos a revisar:**
- [ ] `app/(public)/modelos/[slug]/page.tsx`
- [ ] `components/ModelProfile.tsx`
- [ ] `lib/utils/slug.ts`

**Código - Checklist:**
- [ ] Perfil tiene layout 2 columnas (60/40) desktop
- [ ] Left side: foto hero, info, servicios, botón contactar
- [ ] Right side: galería, info adicional
- [ ] Hero foto aspecto 9:11
- [ ] Overlay inferior con nombre + edad
- [ ] Muestra: edad, género, ciudad, badge verificado
- [ ] Bio/descripción renderiza correctamente
- [ ] Servicios muestran como tags coloreados
- [ ] Botón "📞 Contactar" abre WhatsApp/Telegram
- [ ] Iconos redes sociales
- [ ] Galería grid 2-3 columnas
- [ ] Reseñas muestran si cliente logueado
- [ ] generateMetadata SEO dinámico
- [ ] generateStaticParams pre-genera paths populares
- [ ] Slug generador funciona
- [ ] Responsive 1 columna en mobile

**Testing:**
- [ ] Página carga por slug correcto
- [ ] Foto hero carga sin errores
- [ ] Contactar abre WhatsApp/Telegram
- [ ] Reseñas muestran correctamente
- [ ] Meta tags dinámicos (og:image, etc)
- [ ] Slug válido (no caracteres especiales)

**SEO:**
- [ ] Title personalizado por modelo
- [ ] Description dinámico
- [ ] og:image con foto modelo
- [ ] Schema JSON LD (LocalBusinessSchema)

---

## 🎯 SPRINT 3: DASHBOARD MODELO

### TAREA 3.1: Crear dashboard modelo principal

**Archivos a revisar:**
- [ ] `app/modelo/layout.tsx`
- [ ] `app/modelo/dashboard/page.tsx`
- [ ] `components/dashboard/FeaturedCard.tsx`
- [ ] `lib/constants/featured-options.ts`

**Código - Checklist:**
- [ ] Dashboard tiene sidebar (desktop) / hamburger (mobile)
- [ ] Menu items: Mi perfil, Mis fotos, Mis servicios, Mis reseñas
- [ ] Botón "Contactar admin" prominente
- [ ] Card "⭐ DESTACAR MI ANUNCIO" grande
- [ ] Opciones: TOP lista ($50 x 7 días) | BANNER ($75 x 7 días)
- [ ] Botón "Contactar admin" abre Telegram preconfigurado
- [ ] Si ya destacada: muestra "✅ Tu anuncio está destacado hasta [fecha]"
- [ ] Cards secundarias: perfil %, fotos aprobadas, reseñas
- [ ] Layout protegido (solo modelo logueada)
- [ ] Sidebar tiene logout
- [ ] Link Telegram preconfigurado con mensaje correcto

**Testing:**
- [ ] Dashboard carga solo si logueada
- [ ] Redirige a login si no autenticada
- [ ] Contactar admin abre Telegram correctamente
- [ ] Muestra estado correcto de featured
- [ ] Cards muestran datos correctos de modelo

**Security:**
- [ ] Middleware protege ruta
- [ ] RLS policy de Supabase valida usuario
- [ ] No muestra datos de otra modelo

---

### TAREA 3.2: Crear página edición perfil modelo

**Archivos a revisar:**
- [ ] `app/modelo/dashboard/perfil/page.tsx`
- [ ] `components/forms/ProfileForm.tsx`
- [ ] `hooks/useModelProfile.ts`
- [ ] `lib/validators/profile.ts`

**Código - Checklist:**
- [ ] Formulario tiene todos campos: nombre, edad, altura, peso, talla
- [ ] Upload foto Cloudinary funciona
- [ ] Validación Zod completa
- [ ] Ciudades checkboxes: Lima, Callao
- [ ] Idiomas checkboxes: Español, Inglés, etc
- [ ] Contacto: teléfono, whatsapp, instagram, tiktok, telegram
- [ ] Checklists checkboxes múltiples
- [ ] Indicador completitud (barra %) funciona
- [ ] Botones: Guardar, Cancelar
- [ ] useModelProfile hook actualiza Supabase
- [ ] updateProfile(data) valida y guarda

**Testing:**
- [ ] Formulario llena y guarda correctamente
- [ ] Upload foto a Cloudinary funciona
- [ ] Validación Zod rechaza datos inválidos
- [ ] Indicador % actualiza real-time
- [ ] Error handling funciona
- [ ] Datos se cargan al reload

**Validation:**
- [ ] Zod schema valida edad (número positivo)
- [ ] Zod schema valida altura/peso (números)
- [ ] Zod schema valida strings (longitud)

---

### TAREA 3.3: Crear página gestión de fotos modelo

**Archivos a revisar:**
- [ ] `app/modelo/dashboard/fotos/page.tsx`
- [ ] `hooks/useModelPhotos.ts`
- [ ] `components/PhotoUpload.tsx`
- [ ] `components/PhotoGallery.tsx`
- [ ] `lib/cloudinary/uploader.ts`

**Código - Checklist:**
- [ ] Página tiene 3 secciones: aprobadas, en revisión, rechazadas
- [ ] Cada foto miniatura con estado badge
- [ ] Botón "☆ Marcar como principal" funciona
- [ ] Botón "🗑️ Eliminar" funciona
- [ ] Upload Cloudinary drag & drop funciona
- [ ] Preview antes de subir
- [ ] Auto-envía a admin para verificación
- [ ] Badge ⭐ "Principal" en foto main
- [ ] useModelPhotos hook completo
- [ ] Upload funciona sin errores
- [ ] Cloudinary uploader integrado

**Testing:**
- [ ] Upload foto funciona
- [ ] Preview muestra correctamente
- [ ] Marcar como principal funciona
- [ ] Fotos eliminadas desaparecen
- [ ] Fotos nuevas van a "en revisión"
- [ ] Galería actualiza en tiempo real

**Cloudinary:**
- [ ] API key configurada en env
- [ ] Upload preset unsigned funciona
- [ ] Fotos transformadas correctamente (thumbnail, etc)

---

## 🎯 SPRINT 4: ADMIN PANEL

### TAREA 4.1: Crear dashboard admin principal

**Archivos a revisar:**
- [ ] `app/(admin)/page.tsx` (en proyecto-model-admin)
- [ ] `components/KPICard.tsx`
- [ ] `components/charts/IncomeChart.tsx`

**Código - Checklist:**
- [ ] Dashboard tiene 4 KPI cards
- [ ] KPI "Modelos verificadas" calcula correctamente
- [ ] KPI "Pendientes verificación" muestra número
- [ ] KPI "Featured activos" cuenta correctamente
- [ ] KPI "Ingresos mes" suma transacciones
- [ ] Gráfico "Ingresos últimos 30 días" con Recharts
- [ ] Tablas rápidas: modelos recientes, solicitudes
- [ ] Datos de Supabase con agregaciones (COUNT, SUM)
- [ ] Sidebar con menú admin
- [ ] Protegido: solo admin puede acceder

**Testing:**
- [ ] Dashboard carga sin errores
- [ ] KPIs muestran números correctos
- [ ] Gráfico renderiza correctamente
- [ ] Datos actualizan en tiempo real (React Query)
- [ ] Responsive en mobile

**Performance:**
- [ ] Gráficos no causan lag
- [ ] Datos cachean correctamente

---

### TAREA 4.2: Crear página gestión de modelos (admin)

**Archivos a revisar:**
- [ ] `app/(admin)/modelos/page.tsx`
- [ ] `app/(admin)/modelos/[id]/page.tsx`
- [ ] `components/ModelTable.tsx`
- [ ] `components/ModelEditForm.tsx`
- [ ] `hooks/useAdminModelos.ts`

**Código - Checklist:**
- [ ] Listado modelos tiene filtros: nombre, estado, género
- [ ] Tabla con TanStack Table (sort, filter, paginate)
- [ ] Botones acción: "Ver detalle", "Editar"
- [ ] Detalle modelo tiene 2 tabs: Información, Fotos
- [ ] TAB Información: formulario editable con todos campos
- [ ] TAB Información: toggles "Verificada", "Activa"
- [ ] TAB Fotos: galería por estado
- [ ] TAB Fotos: botones Aprobar, Rechazar, Eliminar fotos
- [ ] TAB Fotos: admin puede subir fotos
- [ ] TAB Fotos: marcar como principal
- [ ] useAdminModelos hook CRUD completo
- [ ] updateModelo valida y guarda

**Testing:**
- [ ] Listado carga todas modelos
- [ ] Filtros funcionan
- [ ] Sort por columnas funciona
- [ ] Paginación funciona
- [ ] Editar modelo funciona
- [ ] Verificar modelo funciona
- [ ] Activar/desactivar funciona
- [ ] Gestión fotos funciona

**Security:**
- [ ] Middleware protege /admin/*
- [ ] RLS policy de Supabase valida admin
- [ ] Solo admin puede editar modelos

---

### TAREA 4.3: Crear página gestión de featured listings

**Archivos a revisar:**
- [ ] `app/(admin)/featured/page.tsx`
- [ ] `components/FeaturedTable.tsx`
- [ ] `hooks/useAdminFeatured.ts`

**Código - Checklist:**
- [ ] TAB "Activos ahora" muestra featured activos
- [ ] TAB "Próximos a vencer" muestra alertas ⚠️ rojo (< 7 días)
- [ ] TAB "Histórico" con filtros fecha, modelo, tipo
- [ ] TAB "Solicitudes pendientes" muestra no aprobadas
- [ ] Tabla muestra: modelo, tipo, inicio, vencimiento, días restantes, pinned
- [ ] Botones: Extender, Cancelar, Pin/Unpin
- [ ] Extender añade días automáticamente
- [ ] Pin/Unpin actualiza is_pinned
- [ ] Crear featured desde tabla
- [ ] useAdminFeatured hook completo

**Testing:**
- [ ] Listado activos muestra correctamente
- [ ] Alertas rojas para < 7 días
- [ ] Extender featured funciona
- [ ] Cancelar featured funciona
- [ ] Pin/unpin funciona
- [ ] Histórico filtrable
- [ ] Aprobar solicitud crea featured

**Alerts:**
- [ ] Color rojo para próximos a vencer
- [ ] Tooltip muestra "Vence en X días"

---

### TAREA 4.4: Crear página reportes

**Archivos a revisar:**
- [ ] `app/(admin)/reportes/page.tsx`
- [ ] `components/charts/RevenueChart.tsx`
- [ ] `components/charts/FeaturedPieChart.tsx`
- [ ] `components/ReportTable.tsx`
- [ ] `hooks/useReports.ts`

**Código - Checklist:**
- [ ] Cards KPI: ingresos mes, featured vendidos, modelo top
- [ ] Gráfico "Ingresos últimos 12 meses" (barchart Recharts)
- [ ] Gráfico "Featured" (pie chart TOP vs BANNER %)
- [ ] Tabla desglose por modelo: featured pagados, ingresos, %
- [ ] Tabla sorteable y filtrable
- [ ] Botón "Descargar reporte" (CSV)
- [ ] useReports hook obtiene datos agregados
- [ ] Calcular SUM, COUNT, GROUP BY correctamente

**Testing:**
- [ ] Gráficos renderizan sin errores
- [ ] Datos calculan correctamente
- [ ] Tabla sortea por columnas
- [ ] Botón descargar CSV funciona
- [ ] Números suman correctamente

**Performance:**
- [ ] Gráficos con Recharts no causan lag
- [ ] Query de datos es rápida (< 500ms)

---

## 📋 MATRIZ DE EVALUACIÓN RÁPIDA

| Tarea | Código | Testing | Security | Performance | ¿Completada? |
|-------|--------|---------|----------|-------------|------------|
| 1.1 Layout | ✅ | ✅ | N/A | ✅ | ✅ |
| 1.2 Auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| 1.3 Zustand | ✅ | ✅ | N/A | ✅ | ✅ |
| 2.1 Home | ✅ | ✅ | N/A | ✅ | ✅ |
| 2.2 Listado | ✅ | ✅ | N/A | ✅ | ✅ |
| 2.3 Perfil | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3.1 Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3.2 Editar Perfil | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3.3 Fotos | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4.1 Admin Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4.2 Admin Modelos | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4.3 Admin Featured | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4.4 Reportes | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 CÓMO USAR ESTE CHECKLIST

1. **Después de cada tarea** de Claude Code, ejecuta el checklist
2. **Marca ✅** si cumple, **❌** si no
3. **Si hay ❌**, pide corrección a Claude Code
4. **Solo cuando todo ✅**, pasar a siguiente tarea
5. **Reportar resultado** en próxima conversación: "Tarea 1.1: ✅ COMPLETADA"

---

**Éxito con el development.** 🚀
