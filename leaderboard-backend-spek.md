# `leaderboard-backend-spek.md` - Leaderboard API Specification

## 1. Feature Overview
Kita akan membuat endpoint API untuk fitur Leaderboard. Leaderboard ini harus mendukung pemeringkatan berdasarkan 3 filter utama:
1. **OVERALL (Default):** Rata-rata nilai total dari semua Try Out yang dikerjakan user.
2. **SUBJECT:** Rata-rata nilai user khusus untuk mata pelajaran tertentu (MATHEMATICS atau PHYSICS).
3. **TRYOUT:** Peringkat nilai pada satu ID ujian/Try Out spesifik.

## 2. API Endpoint Definition
* **Route:** `GET /api/v1/leaderboard`
* **Query Parameters:**
  * `filterType` (enum: `OVERALL`, `SUBJECT`, `TRYOUT`) - Required.
  * `subject` (string: `MATHEMATICS`, `PHYSICS`) - Required if filterType is `SUBJECT`.
  * `examId` (string: UUID) - Required if filterType is `TRYOUT`.
  * `limit` (number) - Optional, default 50.

## 3. Data Aggregation Logic (Prisma)
Instruksikan Prisma untuk melakukan agregasi data berdasarkan `filterType`:

### A. If `filterType === 'OVERALL'`
* Lakukan query ke model `Attempt`.
* Kelompokkan (`groupBy`) berdasarkan `userId`.
* Hitung rata-rata (`_avg`) dari field `score`.
* Join dengan tabel `User` untuk mengambil `fullName` dan `avatarUrl` (jika ada).
* Urutkan dari nilai rata-rata tertinggi ke terendah.

### B. If `filterType === 'TRYOUT'`
* Lakukan query ke model `Attempt` dengan kondisi `where: { examId: req.query.examId }`.
* Pilih nilai tertinggi (Max Score) untuk setiap `userId` jika mereka mengerjakan lebih dari sekali.
* Urutkan berdasarkan `score` descending (DESC).
* Join dengan tabel `User`.

### C. If `filterType === 'SUBJECT'`
* Karena skor per mata pelajaran mungkin tidak disimpan langsung di `Attempt`, lakukan query ke `AttemptDetail` atau relasi soal untuk menghitung persentase jawaban benar per user khusus untuk soal dengan `subject` tersebut. *(Sesuaikan dengan detail schema yang ada)*.

## 4. Standardized Response Format
Backend harus mengembalikan array yang sudah terurut rapi beserta *rank*-nya.

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "uuid-1",
      "fullName": "Budi Santoso",
      "score": 92.5,
      "avatarUrl": "https://..."
    },
    {
      "rank": 2,
      "userId": "uuid-2",
      "fullName": "Siti Aminah",
      "score": 88.0,
      "avatarUrl": "https://..."
    }
    // ... up to limit
  ]
}