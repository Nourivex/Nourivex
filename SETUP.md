# NOURIVEX — panduan setup

Profile README ini **di-generate**. Jangan edit `README.md` langsung. Edit `profile.config.json`, lalu build ulang.

## 1. Isi data kamu

Buka `profile.config.json`, lalu ganti:

| Field | Isi dengan |
|---|---|
| `username` | username GitHub kamu (wajib, dipakai untuk stats dan link repo) |
| `links.email` / `linkedin` / `portfolio` | link kontak. Kosongkan (`""`) untuk menyembunyikan tombolnya |
| `projects[].repo` | nama repo tiap project |
| `projects[].boss` / `win` | tantangan tersulit project itu dan cara kamu menyelesaikannya |
| `projects[].status` | `SHIPPED`, `IN PROGRESS`, atau `LEARNING` |
| `currentQuest` | yang sedang kamu kerjakan sekarang |
| `about`, `stack` | bio dan tech stack (nama icon mengikuti slug [Simple Icons](https://simpleicons.org), atau teks biasa) |

## 2. Build lokal

```bash
node scripts/build.mjs
```

Tidak ada dependency, cukup Node 20+. Untuk melihat hasilnya:

```bash
python -m http.server 4173
```

Lalu buka `http://localhost:4173/scripts/dev/preview.html`.

Paksa mode malam: `NOURI_MODE=night node scripts/build.mjs`.

## 3. Publish ke GitHub

1. Buat repo **public** dengan nama **sama persis dengan username-mu** (misalnya `Nourivex/Nourivex`). Repo ini yang tampil di halaman profil.
2. Push semua file di folder ini ke branch `main`.
3. Buka tab **Actions** → workflow **nourivex** → **Run workflow**. Stats asli akan menggantikan data demo.
4. *(Opsional)* Agar kontribusi private ikut terhitung, buat Personal Access Token (classic, scope `read:user`) dan simpan sebagai secret repo `GH_STATS_TOKEN`.

Setelah itu workflow berjalan otomatis setiap hari:
- **06:00 WIB**: stats diperbarui, Nouri bangun
- **22:00 WIB**: Nouri hibernasi (hero berganti ke mode malam)

## Struktur

```
profile.config.json     ← satu-satunya file yang perlu kamu edit
scripts/build.mjs       ← render semua SVG + README.md + SECRET.md
scripts/stats.mjs       ← ambil data dari GitHub GraphQL → data/stats.json
scripts/lib/
  pixel-bear.mjs        ← karakter Nouri, polar bear Nourivex (sprite pixel 48×64 + sprite game 14×18)
  hero.mjs              ← boot screen + liveness check
  sections.mjs          ← dock, about, loadout, quest cards, save point
  telemetry.mjs         ← stats, activity terrain, achievements
  text.mjs + glyphs.json← teks → path (font tidak bisa dimuat di SVG GitHub)
  theme.mjs             ← palette & komponen window
scripts/dev/            ← preview & lab karakter (tidak dipakai GitHub)
.github/workflows/nourivex.yml
```

## Easter eggs (jangan bocorkan 🤫)

- Buka source README → ASCII Nouri + achievement *Source Reader*
- Hover hero → tooltip dari Nouri
- `▸ open terminal` di paling bawah
- Nouri kecil yang mengintip di footer → `SECRET.md` (404 + *Curious Cat*)
- LED visor Nouri: cyan saat online, amber saat tidur
- Kunjungi profilnya malam hari → Nouri hibernasi

## Lisensi aset

- Glyph diturunkan dari **JetBrains Mono** dan **Space Grotesk** (SIL Open Font License 1.1)
- Logo teknologi dari **Simple Icons** (CC0). Merek tetap milik pemiliknya masing-masing.
- Nouri (polar bear Nourivex) adalah karakter original untuk profil ini.
