# Regenerative Stories — Site · Üretim Pipeline'ı

> Bu dosya, siteyi Claude ile üretirken hangi yüzeyi (Chat / Design / Code) hangi aşamada kullanacağımızı tanımlar. Notion'daki proje sayfasının altına referans olarak konur.
> Merkez animasyon: scroll ile ilerleyen **miselyum ağı → elektrik sinyali → tohum → bahçe** dönüşümü.

---

## 0. Roller — Hangi yüzey neyi yapar

Karışıklığın çıktığı yer, aynı işi iki yerde yapmak. Sınırları net çiziyoruz:

| Yüzey | Tek cümlede işi | Burada **tutulan** şey | Burada **tutulmayan** şey |
|---|---|---|---|
| **Notion** (Second Brain) | Tek doğruluk kaynağı | İçerik, karar logu, faz durumu, linkler | Kod, geçici denemeler |
| **Claude Chat** | Strateji + içerik + kavram ispatı | Marka sesi, copy, "neden böyle" kararları, hızlı prototipler | Production kodu |
| **Claude Design** | Görsel keşif | Animasyonun bakış/his alternatifleri, renk-hareket yönleri | Deploy edilecek son kod |
| **Claude Code** (Mac klasörü) | Gerçek kod | Sitenin kendisi, repo, deploy | Strateji tartışması |

**Akış yönü her zaman aynı:** Notion (içerik) → Chat (karar) → Design (görsel yön) → Code (production) → deploy. Geri besleme: Code'da çıkan kararlar Notion'a not düşülür.

---

## 1. Genel Build Flow — 6 Faz

### Faz 1 · Hazırlık (Notion + Chat)
- Notion'da proje sayfası tek isimle: **Regenerative Stories — Site**
- İçerik paketleri (`03_EPISODE_CONTENT_PACK`, `02_CONTENT_INVENTORY`) Chat'in Project knowledge base'ine eklenir
- Marka sesi + yasaklı kelimeler + duyusal-çıpa kuralı tek yerde sabitlenir
- **Çıktı:** Onaylı içerik + design token sistemi (renk, font, kilim-motif kararı)

### Faz 2 · Animasyon konsepti (Chat → Design)
- Chat'te teknik yol kararı verilir (aşağıdaki Bölüm 2'ye bak)
- Design'da animasyonun 2–3 görsel yönü keşfedilir: yoğunluk, renk ısısı, hareket karakteri
- **Çıktı:** Beğenilen tek bir animasyon yönü (mood + hareket dili)

### Faz 3 · İskelet (Code)
- Mac klasöründe Claude Code session'ı açılır, repo: `regenerativestories-site`
- Sayfa yapısı kurulur: nav, hero (animasyon yuvası boş), Our Films, Impact Strip, Coming Next, Contact
- `frontend-design` skill kullanılır — templated görünmemesi için
- **Çıktı:** İçeriği yerinde, animasyonu henüz boş, çalışan site

### Faz 4 · Animasyon entegrasyonu (Design → Code)
- Design'daki yön `/design-sync` ile Code'a aktarılır
- Production animasyon Code içinde kurulur, optimize edilir (performans, mobil, reduced-motion)
- **Çıktı:** Animasyon hero'da canlı

### Faz 5 · Görsel varlıklar (Chat + Notion)
- Film still'leri, portre fotoğrafları toplanır ve Code'a yerleştirilir
- YouTube ID'leri (`GwbonuGbL9k`, `fP2MbUsGDoY`, `0cRb0rBAsDI`) embed edilir
- **Çıktı:** Placeholder kalmamış, gerçek görsellerle dolu site

### Faz 6 · Deploy (Code → Cloudflare)
- `01_DEPLOYMENT_GUIDE` izlenir: Cloudflare Pages Direct Upload + custom domain
- Doğrulama: SSL, mobil, regenerativestories.earth açılıyor
- **Çıktı:** Canlı site, NatGeo başvurusuna eklenebilir URL

---

## 2. Merkez İş — Gerçekçi Miselyum Animasyonu Pipeline'ı

Bu, projenin imza unsuru. İki teknik yol var; karar bu projenin kaderini belirler.

### İki yol

**Yol A — Kod-native / generative (ÖNERİLEN)**
Miselyum ağı, elektrik, tohum, bahçe; hepsi tarayıcıda anlık üretilir (WebGL/shader + canvas). Video dosyası yok.
- ✅ Temayla bire bir uyumlu — gerçekten "büyüyen", canlı bir sistem
- ✅ Hafif, hızlı yükleme; renk/hız/yoğunluk tek satırla değişir
- ✅ Scroll'a kusursuz bağlanır, tamamen kontrol bizde
- ✅ Tek Claude yüzeyiyle (Code) kurulabilir, dış araç gerekmez
- ⚠️ "Sinematik gerçekçilik" için shader işçiliği gerekir (Design'da prototiplenir)

**Yol B — AI video + scroll-scrubbing**
Dışarıda bir AI video aracında klip üretilir, karelere bölünür (ffmpeg), scroll pozisyonuna göre kare-kare oynatılır (Apple ürün sayfası tekniği).
- ✅ Foto-gerçekçi doku mümkün
- ❌ Bir video-üretim aracı/connector gerektirir (şu an bağlı değil)
- ❌ Ağır dosya, sabit içerik — değiştirmek için yeniden render
- ❌ Hiçbir Claude yüzeyi video üretmez; bu adım dışarıda yapılır

**Karar:** Yol A ile gidiyoruz. "Daha gerçekçi" hissi, video değil **shader kalitesinden** gelir — volumetrik glow, derinlik, organik dallanma, parçacık sinyalleri. Bu chat'teki prototip kavram ispatıydı; production'da WebGL'e yükseltilir.

### Animasyonun production adımları (Yol A)

1. **Konsept (Chat)** — fazlar, zamanlama, anlatı yayı: ağ → sinyal → yakınsama → bahçe. (Bu chat'te yapıldı.)
2. **Görsel yön (Design)** — shader mood'u keşfedilir: ışık ısısı, glow yoğunluğu, derinlik hissi. 2–3 alternatif. Beğenilen seçilir.
3. **Production kurulumu (Code):**
   - Miselyum ağı: L-system / branching algoritması, seed'li PRNG ile tutarlı
   - Elektrik: ağ üzerinde yol alan parçacık sinyalleri
   - Yakınsama: ağ tek merkeze morph → parlayan tohum
   - Bahçe: tohumdan procedural gövde + yaprak + kilim-motif çiçek
   - Scroll bağlama: sticky/pinned stage + scroll-progress hesabı
4. **Cilalama (Code):**
   - Performans: 60fps hedefi, mobilde düşürülmüş parçacık sayısı
   - `prefers-reduced-motion`: animasyon statik son kareye düşer
   - Mobil: scroll mantığı aynı, viewBox/yoğunluk uyarlanır
5. **Karar logu (Notion):** seçilen palet, hız, shader yönü not düşülür

---

## 3. Yüzeyler Arası Handoff Kuralları

Bir işin yanlış yerde yapılması en büyük zaman kaybı. Şüphede kalınca:

| Soru | Cevap |
|---|---|
| Yeni bir copy/başlık mı yazılıyor? | **Chat** (sonra Notion'a) |
| Animasyonun *nasıl görüneceği* mi tartışılıyor? | **Design** |
| Animasyonun *nasıl çalışacağı* (kod) mı? | **Code** |
| Renk/font sistemi mi değişiyor? | **Chat'te karar → Design'da gör → Code'da uygula** |
| Site mi deploy ediliyor? | **Code → Cloudflare** |
| "Proje hangi fazda?" | **Notion** (tek bakışta) |

**Altın kural:** Code = tek gerçek kod. Chat ve Design'daki her şey "taslak"tır; kalıcı olması gerekiyorsa Code'a veya Notion'a taşınır.

---

## 4. Notion-Merkez Konvansiyonu

Notion proje sayfasında sabit tutulacak alanlar:

- **Faz durumu:** Faz 1–6 arası nerede olduğumuz (tek satır)
- **Linkler:** Claude Project linki · Mac repo yolu · canlı/preview URL
- **Karar logu:** tarih + karar + neden (örn. "20 Haz — animasyon Yol A, video değil; tema uyumu + performans")
- **Açık sorular:** iletişim e-postası, YouTube kanal handle'ı, eksik görseller
- **İçerik kaynağı:** içerik paketleri buraya bağlı kalır; Chat oradan çeker (Notion MCP)

---

*v1 · Regenerative Stories — Site · Pipeline referansı*
