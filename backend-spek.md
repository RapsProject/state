backend-spek.md - Backend API Specification

1. Project Overview

Repository ini adalah Backend Server (REST API) untuk platform persiapan masuk kuliah (IUP International Class).

    Role: Melayani request data dari Frontend (Next.js), menangani logika bisnis yang kompleks (seperti penilaian otomatis), dan mengelola database.

    Architecture: Decoupled Monolith (Frontend dan Backend terpisah).

    Design Pattern: Controller-Service-Repository pattern untuk memastikan kode bersih, testable, dan scalable.

2. Tech Stack Requirements

   Runtime: Node.js (LTS Version).

   Language: TypeScript (Strict Mode is Mandatory).

   Framework: Express.js (dengan helmet, cors, morgan).

   Database: PostgreSQL (Hosted on Supabase).

   ORM: Prisma.

   Auth Verification: Supabase Admin SDK / JWT Verification.

   Validation: Zod (Untuk validasi input request body).

3. Directory Structure (Clean Architecture)

Agar AI tidak membuat struktur file yang berantakan, ikuti struktur folder ini secara ketat:
Plaintext

src/
├── config/ # Environment variables (dotenv) & DB Config
│ ├── env.ts # Zod-validated env variables
│ └── prisma.ts # Prisma Client Instance
├── controllers/ # Handler Request & Response (Hanya panggil Service)
│ ├── authController.ts
│ ├── questionController.ts
│ └── simulationController.ts
├── services/ # Business Logic (Hitung skor, validasi aturan)
│ ├── gradingService.ts
│ ├── questionService.ts
│ └── userService.ts
├── middlewares/ # Express Middlewares
│ ├── auth.ts # Verify Supabase Token
│ ├── validation.ts # Zod Middleware
│ └── error.ts # Global Error Handler
├── routes/ # Definisi Endpoint API
│ ├── v1/
│ │ ├── authRoutes.ts
│ │ ├── questionRoutes.ts
│ │ └── simulationRoutes.ts
│ └── index.ts # Main Router Aggregator
├── utils/ # Helper functions (Response formatter, logger)
│ ├── response.ts # Standard JSON response wrapper
│ └── logger.ts
├── types/ # TypeScript Global Definitions
│ └── express.d.ts # Extend Request type with 'user'
├── app.ts # Express App Setup (Middlewares config)
└── server.ts # Server Listener (Port config)

4. Authentication Integration (Crucial)

Backend TIDAK menangani Login/Register (itu tugas Frontend via Supabase Auth). Backend bertugas memverifikasi Access Token yang dikirim Frontend.
Flow:

    Frontend mengirim request: GET /api/v1/questions dengan Header Authorization: Bearer <JWT_TOKEN>.

    Backend Middleware (middlewares/auth.ts) melakukan:

        Decode JWT menggunakan Supabase Secret.

        Jika valid, ambil sub (User ID).

        Inject User ID ke req.user.

        Lanjut ke Controller.

    Jika token invalid/expired -> Return 401 Unauthorized.

5. Database Schema (Prisma)

Schema ini harus sinkron dengan kebutuhan Frontend. Gunakan uuid untuk ID agar aman.

Instruction for AI: Buat file prisma/schema.prisma dengan model berikut:
Code snippet

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
}

// Enum sesuai mata pelajaran IUP International Class
enum Subject {
MATHEMATICS
PHYSICS
ENGLISH
LOGIC // Aptitude Test
CHEMISTRY // Optional untuk jurusan tertentu
}

enum Role {
STUDENT
ADMIN
}

// User disinkronkan dari Supabase Auth
model User {
id String @id // UUID dari Supabase Auth (BUKAN @default(uuid))
email String @unique
fullName String?
role Role @default(STUDENT)
targetMajor String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

attempts Attempt[]
}

model Question {
id String @id @default(uuid())
content String @db.Text // Support Markdown/LaTeX
imageUrl String?
subject Subject
difficulty Int @default(1) // 1 (Easy) - 5 (Hard)
explanation String? @db.Text // Pembahasan soal

options Option[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Option {
id String @id @default(uuid())
text String
isCorrect Boolean @default(false)
questionId String
question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

// Try Out / Simulation Session
model Exam {
id String @id @default(uuid())
title String
description String?
durationMins Int
isActive Boolean @default(true)

// Relasi jika Exam terdiri dari kumpulan soal tertentu (Many-to-Many)
// Untuk fase awal, kita bisa random soal based on subject
}

// History Pengerjaan User
model Attempt {
id String @id @default(uuid())
userId String
user User @relation(fields: [userId], references: [id])

score Float // Nilai Akhir (0-100)
totalCorrect Int
totalWrong Int

startedAt DateTime @default(now())
completedAt DateTime?

details AttemptDetail[] // Jawaban detail per soal
}

model AttemptDetail {
id String @id @default(uuid())
attemptId String
attempt Attempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

questionId String
// Kita simpan snapshot ID jawaban user
selectedOptionId String?
isCorrect Boolean
}

6. API Endpoint Specification

Semua response harus mengikuti format JSON standar:
JSON

{
"success": true,
"message": "Operation successful",
"data": { ... }
}

6.1. User Management

    POST /api/v1/users/sync: Dipanggil Frontend setelah login pertama kali untuk memastikan data user ada di tabel User Prisma.

    GET /api/v1/users/me: Get profil user & statistik singkat.

6.2. Question Bank (Practice Mode)

    GET /api/v1/questions: Fetch soal.

        Query Params: ?subject=MATH&limit=10&difficulty=3.

        Logic: Jangan kirim field isCorrect pada options ke Frontend saat fetch soal (agar tidak bisa diintip di Network Tab).

    POST /api/v1/questions/answer: Submit satu jawaban (Mode Latihan).

        Body: { questionId: "...", selectedOptionId: "..." }

        Response: { isCorrect: true, explanation: "..." } (Baru kirim pembahasan setelah dijawab).

6.3. Simulation (Try Out Mode)

    POST /api/v1/simulation/start: Mulai sesi baru. Generate Attempt ID.

    POST /api/v1/simulation/submit: Submit semua jawaban sekaligus.

        Body: { attemptId: "...", answers: [{ questionId: "...", selectedOptionId: "..." }] }

        Backend Logic: Hitung total score, simpan ke database, dan return ScoreResult.

7. Implementation Steps for AI Assistant

Step 1: Setup Foundation

    Initialize Node.js project (npm init -y).

    Install dependencies: express, cors, dotenv, helmet, zod, @prisma/client.

    Install dev dependencies: typescript, ts-node, nodemon, @types/express, prisma.

    Setup tsconfig.json (Target ES2020, Strict: true).

Step 2: Database & Model

    Initialize Prisma (npx prisma init).

    Copy Schema di atas ke schema.prisma.

    Generate client (npx prisma generate).

Step 3: Core Logic

    Create src/app.ts with Express basic setup.

    Create middlewares/auth.ts to verify Bearer Token (Simulate verification or use Supabase library).

    Implement services/gradingService.ts for scoring logic.

Step 4: API Routes

    Implement routes/v1/questionRoutes.ts and routes/v1/simulationRoutes.ts.

    Connect to Controllers.
