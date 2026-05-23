# Backend Architecture & Database Schema (Supabase)

Project: IUP International Class Preparation Platform (RapsProject)
Stack: Next.js (App Router), Supabase (PostgreSQL + Auth + Storage), Tailwind CSS.

## 1. Local Development & Docker Setup

We use the Supabase CLI to manage the local Docker environment. Do NOT create a custom `docker-compose.yml`.

**Instructions for Cursor AI:**

1. Initialize Supabase: Run `npx supabase init`
2. Start Docker Containers: Run `npx supabase start` (Make sure Docker Desktop is running).
3. Create Migration: Run `npx supabase migration new init_schema`
4. Apply the SQL schema (from Section 2) into the generated migration file.
5. Apply to local DB: Run `npx supabase db reset`

## 2. Database Schema Definition

Below are the 5 core modules. Use this to construct the SQL migration file. Use `UUID` for all primary keys (generated via `gen_random_uuid()`), and ensure strict Foreign Key constraints with appropriate `ON DELETE` rules (e.g., `CASCADE` or `SET NULL`).

### Module 1: User & Access Management

- **Table `profiles`** (Links to Supabase `auth.users`)
  - `id` (uuid, PK, references auth.users on delete cascade)
  - `email` (text, not null)
  - `full_name` (text, not null)
  - `role` (enum: 'student', 'admin', default 'student')
  - `daily_target_questions` (integer, default 10)
  - `created_at` (timestamptz, default now())

### Module 2: Taxonomy (Subject & Topic)

- **Table `subjects`**
  - `id` (uuid, PK)
  - `name` (text, not null) - e.g., Mathematics, Physics
  - `description` (text, nullable)
- **Table `topics`**
  - `id` (uuid, PK)
  - `subject_id` (uuid, FK to subjects on delete cascade)
  - `name` (text, not null) - e.g., Mathematical Logic

### Module 3: Exam Core (Try Out & Questions)

- **Table `tryouts`**
  - `id` (uuid, PK)
  - `title` (text, not null)
  - `type` (enum: 'simulation', 'practice', default 'simulation')
  - `duration_minutes` (integer, not null)
  - `max_attempts` (integer, nullable)
  - `is_premium` (boolean, default false)
  - `is_published` (boolean, default false)
  - `is_active` (boolean, default true) - Soft delete
- **Table `questions`**
  - `id` (uuid, PK)
  - `tryout_id` (uuid, FK to tryouts on delete cascade)
  - `subject_id` (uuid, FK to subjects on delete cascade)
  - `topic_id` (uuid, FK to topics on delete set null)
  - `sequence_number` (integer, not null)
  - `text` (text, not null)
  - `image_url` (text, nullable) - URL from Supabase Storage
  - `explanation` (text, nullable)
  - `is_active` (boolean, default true) - Soft delete
- **Table `options`**
  - `id` (uuid, PK)
  - `question_id` (uuid, FK to questions on delete cascade)
  - `sequence_number` (integer, not null)
  - `text` (text, not null)
  - `image_url` (text, nullable) - URL from Supabase Storage
  - `is_correct` (boolean, default false)

### Module 4: Activity & Progress

- **Table `tryout_sessions`**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles on delete cascade)
  - `tryout_id` (uuid, FK to tryouts on delete cascade)
  - `start_time` (timestamptz, default now())
  - `end_time` (timestamptz, nullable)
  - `score` (integer, nullable)
  - `status` (enum: 'ongoing', 'completed', default 'ongoing')
- **Table `user_answers`**
  - `id` (uuid, PK)
  - `session_id` (uuid, FK to tryout_sessions on delete cascade)
  - `question_id` (uuid, FK to questions on delete cascade)
  - `option_id` (uuid, FK to options on delete set null)
  - `is_marked_for_review` (boolean, default false)

### Module 5: Subscription & Payment (Midtrans)

- **Table `subscription_plans`**
  - `id` (uuid, PK)
  - `name` (text, not null)
  - `price` (integer, not null)
  - `duration_days` (integer, not null)
  - `is_active` (boolean, default true)
- **Table `transactions`**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles on delete cascade)
  - `plan_id` (uuid, FK to subscription_plans on delete cascade)
  - `midtrans_order_id` (text, unique, not null)
  - `amount` (integer, not null)
  - `status` (enum: 'pending', 'settlement', 'expire', 'cancel', default 'pending')
  - `payment_url` (text, nullable)
  - `created_at` (timestamptz, default now())
- **Table `user_subscriptions`**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles on delete cascade)
  - `plan_id` (uuid, FK to subscription_plans on delete cascade)
  - `transaction_id` (uuid, FK to transactions on delete cascade)
  - `start_date` (timestamptz, not null)
  - `end_date` (timestamptz, not null)
  - `status` (enum: 'active', 'expired', 'canceled', default 'active')

## 3. Storage Configuration

- **Bucket Name:** `exam-assets`
- **Accessibility:** Public
- **Usage:** Stores all images for questions and options. Insert the public URL of the uploaded image into the `image_url` column of the `questions` or `options` table.

## 4. Next Tasks for Cursor

1. Create the Supabase SQL migration file using the schema above.
2. Generate a `supabase/seed.sql` or `lib/mockData.ts` populated with realistic dummy data for IUP International Class (Math & Physics in English), ensuring relations match this new schema.
