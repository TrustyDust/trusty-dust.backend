# trustydust-backend

Backend MVP untuk ekosistem TrustyDust yang menggabungkan reputasi sosial, job escrow, dan integrasi ZK. Proyek dibangun dengan NestJS + Prisma ORM + Neon PostgreSQL, serta modul blockchain menggunakan viem agar siap dihubungkan ke chain (Lisk/Mantle/custom EVM).

## Fitur Utama
- **Auth Module**: Verifikasi Privy JWT lalu menerbitkan backend JWT, lengkap dengan `PrivyAuthGuard` dan `JwtAuthGuard`.
- **User Module**: CRUD profil dasar (`walletAddress`, `username`, `avatar`, `tier`, `trustScore`).
- **Social Module**: Posting, like/comment/repost, dan boost dengan perhitungan reward DUST serta pencatatan `TrustEvent`.
- **Trust Module**: Mesin skor (`baseScore`, `dustMultiplier`, `totalScore`) + trigger otomatis ke Tier Module.
- **ZK Module**: Endpoint `/zk/prove` untuk backend Noir proving & `/zk/verify` untuk cek kontrak `TrustVerification.sol`, semuanya tersinkron dengan Prisma `ZkProof`.
- **DUST Module**: Akuntansi off-chain (reward, burn untuk boost, multiplier hook).
- **Tier & SBT Module**: Otomatis upgrade tier, update metadata SBT, dan notifikasi user.
- **Jobs + Escrow Module**: Flow full (create/apply/submit/confirm), mengunci USDC on-chain lewat viem escrow client.
- **Notification Module**: REST list + Websocket gateway untuk push updates.
- **Blockchain Module**: viem public/wallet client + ABI loader untuk Dust Token, TrustVerification, EscrowFactory, dan SBT NFT.

## Persiapan Lingkungan
1. **Install dependensi**
   ```bash
   npm install
   ```
2. **Salin file env lalu isi kredensial**
   ```bash
   cp .env.example .env
   ```
3. **Generate Prisma Client & jalankan migrasi awal**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate --name init
   ```
4. **Start server**
   ```bash
   npm run start:dev
   ```

### Variabel ENV Penting
- `DATABASE_URL` → koneksi Neon PostgreSQL.
- `JWT_SECRET` → secret backend JWT.
- `PRIVY_SECRET_KEY` → untuk verifikasi token Privy.
- `RPC_URL` → RPC Lisk/Mantle/custom EVM.
- `TRUST_VERIFICATION_ADDRESS`, `DUST_TOKEN_ADDRESS`, `ESCROW_FACTORY_ADDRESS`, `SBT_CONTRACT_ADDRESS`, `ESCROW_SIGNER_KEY` → alamat kontrak + private key signer yang digunakan oleh `BlockchainService`.

## Prisma Schema
Seluruh entitas yang diminta tersedia di `prisma/schema.prisma`: `User`, `Post`, `PostMedia`, `PostReaction`, `PostBoost`, `TrustEvent`, `TrustSnapshot`, `ZkProof`, `TierHistory`, `SbtToken`, `Job`, `JobApplication`, `JobEscrow`, `Token`, `UserTokenBalance`, `Notification`.

## Endpoint Ringkas
| Endpoint | Method | Keterangan |
| --- | --- | --- |
| `/api/v1/auth/login` | POST | FE kirim `Authorization: Bearer <privy_jwt>`, backend verifikasi Privy lalu balas backend JWT.
| `/api/v1/users/me` | GET/PATCH | Lihat & update profil (JWT required).
| `/api/v1/social/posts` | POST | Buat post, otomatis +3 DUST.
| `/api/v1/social/posts/:id/react` | POST | Like/Comment/Repost (+1/+3/+1 DUST, daily cap 50 DUST).
| `/api/v1/social/posts/:id/boost` | POST | Burn DUST untuk promote post.
| `/api/v1/trust/score` | GET | Ambil skor terkini.
| `/api/v1/zk/prove` | POST | Backend generate proof Noir.
| `/api/v1/zk/verify` | POST | Simpan proof Noir setelah diverifikasi on-chain.
| `/api/v1/jobs/create` | POST | Buat job (butuh proof ≥ minTrustScore, burn 50 DUST, lock escrow).
| `/api/v1/jobs/:id/apply` | POST | Worker apply (proof ≥ minTrustScore, burn 20 DUST).
| `/api/v1/jobs/application/:id/submit` | POST | Worker submit deliverable.
| `/api/v1/jobs/application/:id/confirm` | POST | Poster konfirmasi, escrow release USDC, TrustEvent +100.
| `/api/v1/tier/me` | GET | Lihat tier + history.
| `/api/v1/notifications` | GET | Ambil notifikasi terbaru; socket gateway tersedia di `ws://host:PORT` (query `userId` untuk join room pribadi).

Semua endpoint (kecuali `/auth/login` & `/health`) memakai `JwtAuthGuard`.

## Alur Login (Privy + Backend JWT)
1. FE login ke Privy → dapat Privy JWT.
2. FE melakukan `POST /auth/login` dengan header `Authorization: Bearer <privy_jwt>`.
3. Backend `PrivyAuthGuard` mengecek token via Privy API. Jika user belum ada → dibuat pada tabel `User`.
4. Backend menerbitkan JWT `{ userId, walletAddress }`. Token ini wajib dipakai untuk seluruh endpoint lainnya.

## Auto Trust & Tier Flow
- Setiap interaksi sosial / job selesai → `TrustEvent` dicatat, `TrustService` mengisi `TrustSnapshot` dan menghitung `totalScore = min(1000, baseScore * dustMultiplier)`.
- `TierService` mengecek threshold Dust/Spark/Flare/Nova. Jika naik tier → simpan `TierHistory`, trigger SBT metadata update & kirim notifikasi.
- `ZkService.queueProofRequest` menandai bahwa FE/BE perlu menyiapkan proof baru sesuai tier.

## Jobs + Escrow Flow
1. **Create**: Poster verifikasi proof ≥ `minTrustScore`, burn 50 DUST, membuat job status OPEN. Escrow module mengunci reward USDC melalui viem + menyimpan tx hash di `JobEscrow`.
2. **Apply**: Worker kirim proof, burn 20 DUST, membuat `JobApplication` status APPLIED.
3. **Submit**: Worker mengirim `workSubmissionText`, status menjadi SUBMITTED.
4. **Confirm**: Poster konfirmasi → Escrow release (atau refund jika perlu), `TrustEvent(job_completed, +100)` dijalankan dan tier dicek ulang.

## Noir + ZK Backend
Best practice singkat saat memakai Noir + Barretenberg:
- **Pisahkan circuit & backend** – simpan circuit di `circuits/trust_score`, dan cache ACIR/proving key agar tidak compile di runtime request.
- **Validasi boolean output** – contoh circuit memaksa `is_valid` hanya 0/1 sehingga verifier bisa percaya output publiknya.
- **Gunakan string untuk Field** – saat membangun witness di backend, kirim `userScore` dan `minScore` sebagai string agar Noir WASM tidak kehilangan presisi.
- **Kompilasi deterministic** – jalankan `nargo check` sebelum `nargo compile` untuk memastikan constraint konsisten.
- **Pisahkan proving & verification key** – `ZkCompiler` hanya load sekali saat bootstrap lalu direuse di `ZkProver`.

### Struktur Circuit & Cara Compile
```bash
cd circuits/trust_score
nargo check
nargo compile
```
Hasil kompilasi (`build/trust_score.acir.gz`, proving/verification key) akan otomatis di-load oleh `ZkCompiler` ketika aplikasi start.

### ZK Workflow Backend
1. **Proving** – `POST /zk/prove` body `{ "userId": "...", "minScore": 300 }`. Service mengambil `trustScore` user dari DB, menjalankan Noir WASM + Barretenberg untuk membuat proof + `publicInputs`, lalu menyimpannya ke tabel `ZkProof`.
2. **Verifikasi on-chain** – `POST /zk/verify` body `{ proof, publicInputs }`. Backend memanggil kontrak `TrustVerification.sol` via viem. ABI ada di `src/abis/trust-verification.json` dan contoh kontrak berada di `contracts/TrustVerification.sol` (siap dikompilasi dengan Foundry `forge build`).
3. **Testing script** – `npm run test:zk` menjalankan `scripts/test-zk.ts` yang:
   - mengecek hasil kompilasi circuit,
   - menjalankan prover backend untuk nilai dummy,
   - memanggil verifier on-chain bila alamat tersedia,
   - menyimpan proof contoh ke Prisma `ZkProof`.

> Catatan Foundry: deploy contoh kontrak dengan `forge create` lalu isi env `TRUST_VERIFICATION_ADDRESS`. Kontrak `TrustVerification.sol` hanya meneruskan pemanggilan ke verifier Noir yang dihasilkan Nargo.

## Contoh API Call
```bash
# Login (Privy token via Authorization header)
curl -X POST http://localhost:3000/auth/login \
  -H "Authorization: Bearer <privy_jwt>"

# Buat post
token="<backend_jwt>"
curl -X POST http://localhost:3000/social/posts \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello Dusty world","mediaUrls":["ipfs://cid"]}'

# Apply job dengan proof tersimpan
token="<backend_jwt>"
curl -X POST http://localhost:3000/jobs/cku1.../apply \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"zkProofId":"proof_cuid"}'
```

## Migrasi & Maintenance
- `npm run prisma:generate` – regenerasi Prisma Client bila schema berubah.
- `npm run prisma:migrate --name <migration>` – membuat dan menjalankan migrasi Neon.
- `npm run start:dev` – jalankan Nest dengan watch mode.

## Catatan Tambahan
- Module blockchain (per poin 11) sudah memuat viem public/wallet client, loader ABI (`src/abis/*.json`), dan helper untuk `verifyTrustProof`, `burnDustBoost`, `lock/release/refund` escrow, serta update metadata SBT.
- Semua file menggunakan ASCII & diberi komentar seperlunya agar mudah dipahami.
