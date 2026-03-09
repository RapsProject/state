# --- Opsi A: Supabase local (Auth + DB, untuk integrasi golden) ---
# 1. Pastikan Docker Desktop jalan
# 2. npm run supabase:start
# 3. npm run supabase:status  -> salin "DB URL" dan "JWT secret" ke .env (DATABASE_URL, SUPABASE_JWT_SECRET)
# 4. npm run migrate
# 5. npm run seed   (opsional)
# 6. npm run dev
# Frontend (golden) pakai: API URL + anon key dari supabase status (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

# --- Opsi B: Hanya Postgres (docker-compose) ---
docker-compose up -d
docker ps
# npm run migrate
# npm run dev

# Buat nyalain docker
docker start <nama db>

# Buat cek docker yg ga nyala
docker ps -a

# Buat stop docker yg nyala
docker stop <nama db>    

# Cara jalanin (Auth + DB lokal pakai Docker)
## Jalankan Supabase (Docker)
### Di folder state:
   npm run supabase:start
### Lalu:
   npm run supabase:status

# Salin DB URL dan JWT secret ke state/.env (dan kalau mau, API URL + anon key ke golden/.env jika beda dari default).
## Migrate & seed state
### Masih di state:
   npm run migrate   npm run seed   npm run dev
### Jalankan golden
### Di folder golden:
   npm run dev

# Cek Auth
## Buka http://localhost:5173 → Register (email + password + full name) atau Login. Setelah login, profile di-sync ke state dan token dipakai untuk semua request ke state.

# Cek tryout
## Masuk ke Simulation → pilih tryout → View Details → Start Simulation → kerjakan soal → Submit. Halaman result menampilkan score dan review dari backend.

Supabase Studio: http://127.0.0.1:54323 (lihat user Auth, tabel, dll.).