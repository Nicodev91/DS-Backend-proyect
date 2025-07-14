# Backend - DataSentinel 

Backend desarrollado con NestJS para el sistema de DataSentinel, incluyendo autenticación JWT, sistema de OTP por email y gestión de usuarios.

## 🚀 Características

- **Autenticación JWT** con Passport.js
- **Sistema de OTP** por email para verificación
- **Base de datos PostgreSQL** con Prisma ORM
- **Documentación API** con Scalar
- **Logging estructurado** con Pino
- **Validación de datos** con class-validator
- **Envío de emails** con Nodemailer y Handlebars
- **Docker** y Docker Compose para despliegue
- **Multi-esquema** de base de datos

## 📋 Requisitos Previos

- **Node.js** 20.x o superior
- **pnpm** (https://pnpm.io/)
- **PostgreSQL** (para desarrollo local) o **Supabase** (para producción)
- **Docker** y **Docker Compose** (opcional)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd Backend-DataSentinel
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp dev.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración básica
TYPE='ms'
ENV='local'
PORT=8091
GLOBAL_PREFIX='/v1'
COMPONENT="data-sentinel:1.0.0"

# Base de datos PostgreSQL/Supabase
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base_datos?schema=dataSentinel-back"
DIRECT_URL="postgresql://usuario:contraseña@host:puerto/base_datos"

# JWT
JWT_SECRET="tu_jwt_secret_muy_seguro"

# Configuración SMTP para emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_email@gmail.com"
SMTP_PASS="tu_contraseña_de_aplicacion"
```

### 4. Configurar la base de datos

#### Opción A: Supabase (Recomendado para producción)
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Obtén las URLs de conexión desde Settings > Database
3. Asegúrate de incluir `?schema=dataSentinel-back` en la DATABASE_URL
4. Para Supabase, incluye `sslmode=require` en la cadena de conexión

#### Opción B: PostgreSQL local
```bash
# Instalar PostgreSQL localmente o usar Docker
docker run --name postgres-data-sentinel -e POSTGRES_PASSWORD=password -e POSTGRES_DB=data-sentinel -p 5432:5432 -d postgres:15-alpine
```

### 5. Ejecutar migraciones y generar cliente Prisma

```bash
# Generar el cliente de Prisma
pnpm prisma:generate

# Ejecutar migraciones (solo para PostgreSQL local)
pnpx prisma migrate dev --schema=src/modules/prisma/schema.prisma --name init

# Para Supabase, solo generar el cliente
pnpm prisma:generate
```

## 🚀 Ejecución

### Desarrollo local
```bash
# Modo desarrollo con hot reload
pnpm start:dev

# Modo debug
pnpm start:debug

# Modo producción
pnpm start:prod
```

### Con Docker
```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# Solo construir la imagen
docker build -t backend-data-sentinel .

# Ejecutar contenedor
docker run -p 8091:8091 --env-file .env backend-data-sentinel
```

## 📚 Endpoints de la API

### Base URL
```
http://localhost:8091/v1
```

### Endpoints principales

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil del usuario

#### OTP (One-Time Password)
- `POST /send-otp` - Enviar código OTP por email
- `POST /verify-otp` - Verificar código OTP

#### Health Check
- `GET /health` - Estado del servicio

### Documentación API
La documentación interactiva está disponible en:
```
http://localhost:8091/scalar
```

## 🗄️ Base de Datos

### Esquema
El proyecto utiliza el esquema `back_office` en PostgreSQL con las siguientes tablas:

#### User
- `id` - Identificador único
- `email` - Email del usuario (único)
- `password` - Contraseña hasheada
- `created_at` - Fecha de creación

#### Otp
- `id` - Identificador único
- `code` - Código OTP
- `expires_at` - Fecha de expiración
- `used` - Estado de uso
- `created_at` - Fecha de creación
- `user_id` - Referencia al usuario

### Comandos útiles de Prisma

```bash
# Generar cliente Prisma
pnpm prisma:generate

# Abrir Prisma Studio (interfaz visual)
pnpm prisma:studio

# Ver estado de migraciones
npx prisma migrate status --schema=src/modules/prisma/schema.prisma

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset --schema=src/modules/prisma/schema.prisma
```

## 🔧 Scripts disponibles

```bash
# Desarrollo
pnpm start:dev          # Servidor en modo desarrollo
pnpm start:debug        # Servidor en modo debug
pnpm start:prod         # Servidor en modo producción

# Base de datos
pnpm prisma:generate    # Generar cliente Prisma
pnpm prisma:studio      # Abrir Prisma Studio

# Testing
pnpm test               # Ejecutar tests
pnpm test:watch         # Tests en modo watch
pnpm test:e2e           # Tests end-to-end

# Linting y formateo
pnpm lint               # Ejecutar ESLint
pnpm format             # Formatear código con Prettier

# Build
pnpm build              # Compilar proyecto
```

## 🐳 Docker

### Variables de entorno para Docker
Asegúrate de que tu archivo `.env` contenga todas las variables necesarias:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_datos?schema=back_office
DIRECT_URL=postgresql://usuario:contraseña@host:puerto/base_datos
JWT_SECRET=tu_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña
```

### Comandos Docker
```bash
# Construir imagen
docker build -t backend-data-sentinel .

# Ejecutar con Docker Compose
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down
```

## 🔐 Configuración de Email

### Gmail
Para usar Gmail como servidor SMTP:

1. Activa la verificación en dos pasos en tu cuenta de Google
2. Genera una contraseña de aplicación
3. Usa esa contraseña en `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

### Otros proveedores
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Proveedor propio**: Consulta la documentación de tu proveedor

## 🚨 Solución de problemas

### Error de conexión a la base de datos
- Verifica que las URLs de conexión sean correctas
- Para Supabase, asegúrate de incluir `sslmode=require`
- Verifica que el esquema `back_office` exista

### Error de migraciones
- Para Supabase, no uses `prisma migrate dev`, solo `prisma generate`
- Para PostgreSQL local, ejecuta las migraciones normalmente

### Error de email
- Verifica las credenciales SMTP
- Para Gmail, usa contraseñas de aplicación
- Verifica que el puerto SMTP sea correcto

### Error de JWT
- Asegúrate de que `JWT_SECRET` esté configurado
- Usa una cadena segura y única

## 📝 Notas importantes

- El proyecto usa **multi-esquema** de Prisma con el esquema `back_office`
- Para **Supabase**, incluye `sslmode=require` en la cadena de conexión
- Las migraciones automáticas están deshabilitadas para Supabase
- El sistema de logging usa **Pino** para mejor rendimiento
- La documentación API usa **Scalar** en lugar de Swagger tradicional

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y no tiene licencia pública.
