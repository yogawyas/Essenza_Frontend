# Desain dan sumber gambar Essenza

Layar React Native baru ditulis dalam JavaScript. SVG di `assets/Design` adalah referensi asli. Splash, dekorasi auth, dan banner registrasi dirender sebagai SVG. Pada layar lain, gambar yang tertanam di ekspor Figma diambil sebagai WebP dan layout dibuat dengan komponen React Native yang dapat disentuh, digulir, dan diperbarui dari data aplikasi.

## Sumber parfum

- [Scento Perfume API](https://www.scento.com/developers/perfume-api) menyediakan piramida notes tanpa API key. Detail parfum mencoba mengambil data API, memeriksa nama, merek dan konsentrasi, lalu memakai data lokal jika tersedia. Koneksi langsung belum bisa diverifikasi di lingkungan pengembangan ini.
- [Fragella](https://api.fragella.com/) paling sesuai untuk katalog lebih besar dari satu sumber. Responsnya menyatukan foto botol, notes top/middle/base, dan gambar per note. Paket gratis saat diperiksa memberi 20 request per bulan. Jika dipakai kemudian, jalankan pengambilan data lewat backend dengan cache dan simpan API key di backend.
- [10ML Fragrance Index](https://10ml.com/perfume-api) menyediakan lebih dari 6.000 profil parfum dan 285 notes saat diperiksa, tanpa API key. Untuk foto, [Open Beauty Facts](https://world.openbeautyfacts.org/data) bisa melengkapi data jika barcode produk dan varian diketahui. Foto produk mengikuti CC BY-SA. Cakupannya berbeda dari basis data notes. Gunakan ilustrasi cadangan ketika foto untuk varian yang tepat belum ditemukan.

### Foto botol di katalog demo

- Santal 33 EDP, Black Orchid EDP, dan Dolce Garden EDP berasal dari SVG Essenza.
- [Chanel N°5 EDP](<https://commons.wikimedia.org/wiki/File:CHANEL_No5_parfum_(cropped).jpg>) oleh arz (domain publik, potongan oleh Koavf), [CK One EDT](https://commons.wikimedia.org/wiki/File:CK_One.jpg) oleh Gonna Fly Now ([CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)), dan [Acqua di Giò EDT](https://commons.wikimedia.org/wiki/File:Acqua_di_Gio.jpg) oleh Gonna Fly Now ([CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)) disimpan sebagai JPEG lokal tanpa perubahan.
- [Flowerbomb EDP](https://us.viktor-rolf.com/fragrance/flowerbomb-eau-de-parfum-by-viktor-rolf-VKR_002.html), [La Vie Est Belle EDP](https://www.lancome-usa.com/fragrance/fragrance-by-collection/la-vie-est-belle/la-vie-est-belle-eau-de-parfum/3605532612768.html), [Oud Wood EDP](https://www.tomfordbeauty.com/products/oud-wood-eau-de-parfum), [Guilty Pour Femme EDP](https://www.gucci.com/us/en/pr/beauty/fragrances/fragrances-for-women/gucci-guilty/gucci-guilty-pour-femme-90ml-eau-de-parfum-p-563241999990099), [Light Blue EDT](https://www.sephora.com/product/light-blue-eau-de-toilette-P516183?skuId=2863249), dan [Acqua di Giò Parfum](https://www.giorgioarmanibeauty-usa.com/fragrances/mens-cologne/acqua-di-gio/acqua-di-gio-parfum/A2608.html) memakai URL foto dari merek atau retailer untuk prototipe. Foto tersebut memerlukan koneksi internet dan kembali ke ilustrasi jika gagal dimuat. URL yang dapat diakses publik tidak menyatakan adanya lisensi untuk mendistribusikan salinan foto.
- Foto hitam Acqua di Giò pada SVG bertuliskan **Profumo**. Entri Parfum sekarang memakai foto produk yang sesuai. Foto biru pada SVG adalah Light Blue Eau Intense Pour Homme, sedangkan entri Light Blue EDT memakai foto Light Blue EDT untuk wanita.

## Notes offline dan kredit foto

Entri katalog memakai notes yang diterbitkan oleh merek saat aplikasi tidak dapat mengambil piramida notes yang cocok. Referensi tambahan: [CK One](https://www.calvinklein.us/en/ck-one/10740.html), [Chanel N°5 EDP](https://www.chanel.com/us/fragrance/p/125530/n5-eau-de-parfum-spray/), [Light Blue EDT](https://www.dolcegabbana.com/en-us/beauty/perfumes-for-her/light-blue/light-blue-eau-de-toilette---VT01JMVT0009V000.html), dan [Acqua di Giò EDT](https://www.giorgioarmanibeauty-usa.com/fragrances/mens-cologne/acqua-di-gio/acqua-di-gio-eau-de-toilette/A005.html). Referensi produk lain ada pada daftar foto di atas.

- [Santal 33](https://www.lelabofragrances.com/santal-33-147.html)
- [Acqua di Giò Parfum](https://www.giorgioarmanibeauty-usa.com/fragrances/mens-cologne/acqua-di-gio/acqua-di-gio-parfum/A2608.html)
- [Black Orchid EDP](https://www.tomfordbeauty.com/products/black-orchid-eau-de-parfum)
- [Dolce Garden EDP](https://www.nordstrom.com/s/dolce-and-gabbana-dolcegabbana-beauty-dolce-garden-eau-de-parfum/4905517)

Foto notes tersimpan sebagai JPEG lokal di `assets/notes`. Foto bahan dari Wikimedia Commons memakai kredit yang terbawa di aplikasi dan tercatat di `src/domain/noteImageCredits.json`. Sebagian foto dipilih dari [koleksi Notewise](https://github.com/victorhisamitsu/notewise/tree/1962c3218c72f29b9ef4614b03a063dd2ae5a999/web/public/notes), lalu foto tambahan diambil langsung dari Wikimedia. Foto dipotong persegi dan diperkecil untuk ubin.

Visual vanilla, citrus, dan beberapa kelompok aroma disiapkan dari SVG Essenza. Musk, aldehydes, aquatic, dan mandora menggunakan ilustrasi. Nama seperti Sicilian Lemon dan Vanilla Absolute menampilkan foto bahan yang mewakili note tersebut. Jika API mengembalikan note baru yang belum memiliki aset, ubinnya tetap menampilkan nama dan ikon.

La Vie Est Belle EDP: foto botol oleh openfoodfacts-contributors, [Open Beauty Facts](https://world.openbeautyfacts.org/product/3605533286555), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), diambil melalui [Openfume](https://stanczykwyatt.github.io/openfume/fragrance/loreal-lancome-la-vie-est-belle-edp-kadn-parfum/), tanpa perubahan.
