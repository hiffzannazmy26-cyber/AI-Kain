# AI Klasifikasi Corak Kain Tradisional

Web app ini dibina daripada model AI PictoBlox untuk projek Image Classification.

## Label model

1. Kain Tenun Sidan
2. Kain Tenun Kelingai
3. Kain Batik
4. Corak Bunga

## Cara guna di komputer

Disebabkan browser tidak membenarkan model AI dimuatkan terus melalui `file://`, buka projek ini melalui server tempatan.

Cara mudah jika ada Python:

```bash
python -m http.server 8000
```

Kemudian buka:

```text
http://localhost:8000
```

## Cara upload ke GitHub Pages

1. Extract fail ZIP ini.
2. Buka GitHub dan cipta repository baharu, contoh: `AI-Kain-WebApp`.
3. Upload semua fail dan folder dalam projek ini ke repository tersebut.
4. Pergi ke **Settings → Pages**.
5. Pada **Build and deployment**, pilih:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Klik **Save**.
7. Tunggu 1–3 minit sehingga GitHub memberi pautan laman web.

## Nota penting

- Kamera biasanya hanya berfungsi jika laman web dibuka melalui HTTPS. GitHub Pages sudah menyediakan HTTPS.
- Model AI menggunakan TensorFlow.js melalui CDN, jadi sambungan Internet diperlukan kali pertama app dibuka.
- Jika keputusan nampak terbalik antara kelas, semak susunan label dalam `app.js` dan `model/labels.txt`.
