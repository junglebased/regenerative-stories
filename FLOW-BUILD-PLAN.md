# FLOW — 2nd Brain Kokpit: Reverse Engineering + Build Plan

## Context

Kullanıcı (solo belgesel yapımcısı, ADHD, Notion = 27 database'lik single source of truth) **tüm second brain'i** için görsel, yönetilebilir, konuşulabilir bir kokpit istiyor: merkezde canlı knowledge graph (Obsidian graph mantığı), üzerinde sesli/yazılı komut, Express'e giden işi öne çıkaran modüller. Mevcut varlık: `rs-miselyum-agi.vercel.app` (Three.js r128 tek-HTML graph viewer). Bu doküman kod içermez; Sonnet'in inşasını yönlendiren teknik plandır.

**Kullanıcı kararları:** backend = tek HTML + Vercel `/api` serverless; Flow = **yeni Vercel projesi** (miselyum vitrin olarak kalır); mevcut brain-graph-v1.json başka yerde duruyor → import adımı planda; mevcut second brain skill seti ile entegrasyon (bkz. §7).

---

## 1. REVERSE ENGINEERING

### 1a. Miselyum viewer (canlı deploy'un tam kaynağı incelendi)

Tek HTML, Three.js r128 (cdnjs), veri **inline** `GRAPH_DATA` objesi: **37 node / 47 edge / 6 opportunity** (177/410'luk tam set deploy'da değil; o JSON başka yerde). Node şeması: `{id, t, type(sponsor_ngo|story_hero), region, w, sub, score, meta, url(Notion)}`. Edge: `{s, t, k(sponsor_character_match|hero_sponsor_relation|gap_match|shared_archetype), w}`.

**Gerçekten çalışan:**
- Orbit/zoom/pinch kamera, raycast tap-select → detay paneli (bağlantı listesi + "Notion'da aç" linki)
- Arama kutusu (substring, 8 sonuç, seçince `flyTo` kamera lerp)
- Region chip filtreleri (legend; gizleme edge'lere de yansıyor)
- Seçili node'da edge highlight (seçiliye bağlı ×2.2 parlak, gerisi ×0.12 sönük)
- Fırsat Radarı paneli (`opportunities` array'inden statik render)
- Cinema mode (HUD gizle + otomatik kamera), boot ekranı, akış partikülleri, dekoratif miselyum/toprak/spor katmanı
- Pozisyonlar **statik seeded hash** (force simülasyon yok) — deterministik, ucuz, mobilde akıcı

**Süs / bozuk:**
- **"Ağa Sor" kutusu bozuk:** tarayıcıdan doğrudan `api.anthropic.com/v1/messages`'a fetch atıyor, `x-api-key` ve `anthropic-version` header'ı yok → her çağrı 401. Tasarımı doğru (node index'i system prompt'ta, cevap `{path:[], answer}` JSON'u, path'teki node'ları sırayla seçip kamerayı gezdiriyor) ama hiç çalışmamış. **Flow'un 1 numaralı düzeltmesi bu.**
- Boot ekranı, "TOPRAK ANALİZ EDİLİYOR" satırları: saf atmosfer (korunmaya değer süs).

### 1b. Jarvis-style dashboard trendi

Ortak mimari 4 katman: **veri kaynakları** (takvim, mail, Notion, GitHub — MCP veya doğrudan API) → **zeka** (Claude/GPT chat loop + tool-use, bazen RAG) → **yüzey** (web dashboard / Telegram / terminal) → **ses** (STT + TTS).

İncelenen build'ler:
- *Julian-Ivanov/jarvis-voice-assistant:* Chrome **Web Speech API** (STT) → FastAPI → **Claude Haiku** → TTS; double-clap wake, ekran görüntüsü analizi. Ders: tarayıcı STT'si gerçek build'lerde yeterli.
- *Sid Bharath "How I Built Jarvis" + FrankX:* Claude Code + CLAUDE.md (bellek) + MCP server'lar + skill/subagent. Dashboard yok; zeka katmanı terminalde. Ders: zeka katmanı için agentic tool-use şart, UI opsiyonel.
- *clarvis:* Claude Code mesajlarını TTS'e basar. Ders: TTS "kokpit konuşuyor" hissinin en ucuz yolu.
- *chase_ai_ (TikTok, viral):* agent + tool'lar + RAG, gösterişli HUD. Ders/uyarı: viral build'lerde ekranın ~%70'i süs (animasyonlu sayaçlar, statik paneller); canlı çalışan kısım chat loop + birkaç API özeti.
- *Local voice stack (Home Assistant ekolü):* faster-whisper (GPU) + Piper TTS + Ollama. **Piper Ekim 2025'te arşivlendi**; yeni projeler Kokoro/Coqui XTTS'e bakıyor. Ders: local ses = donanım + bakım yükü; tarayıcı kokpiti için gereksiz.

**Modül envanteri (trendde tekrarlayanlar):** sabah brifingi, inbox özeti, takvim, görev listesi, hedef sayacı, komut paleti, sesli döngü, bildirim feed'i. Gerçek işlevsellik sıralaması: brifing/özet (kolay, yüksek değer) > komut paleti > sesli giriş > sesli cevap > "canlı" sayaçlar (çoğunlukla süs).

### 1c. Obsidian graph view'dan alınacak UX

| Özellik | Obsidian | Miselyum | Flow kararı |
|---|---|---|---|
| Hover'da bağlantı highlight | ✓ | ✗ (sadece click) | **Al** — raycast zaten var, hover'a bağla |
| Local graph (depth 1–2) | ✓ | ✗ | **Al** — seçili node + komşuları modu |
| Arama filtresi | ✓ | ✓ | Var |
| Renk grupları | ✓ | ✓ (region) | Var, DB-tipine genişlet |
| Force simülasyonu | ✓ | ✗ (seeded statik) | **Alma (v0/v1)** — statik pozisyon mobilde akıcı, deterministik; 500+ node'da cluster kalitesi yetmezse v2'de değerlendir |
| Node drag | ✓ | ✗ | Alma — kokpitte gereksiz |
| Zoom'a göre label LOD | ✓ | kısmen | **Al** — 500+ node'da şart |

---

## 2. FLOW TASARIM KARARLARI

### Kapsam: tüm second brain

Graph artık sadece hero↔sponsor değil. Node tipleri (Notion DB'lerinden): `project`, `area`, `task`, `sop`, `story_hero`, `sponsor_ngo`, `note`. 27 DB'nin hepsi değil, **omurga 6-7 DB** v1'e girer (Projects, Areas, Tasks, SOPs, Story Heroes, Sponsor Pipeline + varsa Notes); gerisi talep üzerine. 504 karakter + 77 kurum + projeler ≈ 600–700 node — Three.js InstancedMesh bunu rahat taşır.

### Katman mimarisi

```
[Notion 27 DB] ──REST API──> [Vercel /api/*  (key'ler env'de)]
                                  │ /api/graph  → graph JSON (5 dk cache)
                                  │ /api/ask    → Anthropic Messages (tool-use: Notion sorgusu)
                                  │ /api/brief  → sabah raporu (task + sponsor follow-up)
                                  ▼
[index.html — tek dosya kokpit]
   ├─ Three.js r128 sahne (miselyum fork: instanced node'lar, bezier edge, flow partikül)
   ├─ HUD: komut paleti (Cmd+K), arama, chip filtreler, detay paneli
   ├─ Modül panelleri: Sabah Raporu, Fırsat Radarı, Goal-Lock
   └─ Ses: Web Speech API (STT tr-TR) + speechSynthesis (TTS)
```

### Konuşma katmanı akışı

1. Girdi: yazı (komut paleti / sor kutusu) veya ses (mik butonu → `SpeechRecognition` tr-TR → transcript aynı kutuya düşer). Islak wake-word yok — buton, ADHD-dostu ve güvenilir.
2. `/api/ask`'e POST: `{question, focus_node?}`. Server tarafı: system prompt'ta kompakt node index'i (id|başlık|tip|bölge — miselyumdaki desen korunur) + Anthropic tool-use ile 1-2 Notion sorgusu (ör. "bu sponsorun son follow-up'ı ne zaman").
3. Cevap sözleşmesi (miselyumdakinin evrimi): `{answer: "2-3 cümle TR", path: [node_id...], actions?: [{type:"open_notion", url}]}`.
4. Frontend: `answer`'ı panelde gösterir + `speechSynthesis` ile okur (kapatılabilir); `path`'teki node'ları sırayla `selectNode`+`flyTo` ile gezdirir — "kokpitte pilot" anı budur.

### Modüller (Express odaklı, hepsi gerçek veri)

- **Sabah Raporu:** `/api/brief` → bugünün taskları (Tasks DB, due=today) + 7+ gündür dokunulmamış sıcak sponsor follow-up'ları (Pipeline DB, tier + last-contact). Panel + tek tuşla sesli okuma.
- **Fırsat Radarı:** mevcut radar paneli korunur; veri statik array yerine graph'taki `gap_match` edge'lerinden türetilir (genelleştirme: sponsor↔hero'ya ek proje↔fon eşleşmeleri).
- **Goal-Lock oranı:** Tasks DB'de kategori/etiket üzerinden `Express işi / toplam` oranı; HUD'da tek sayı + ince bar. Sayaç süs değil, brief verisinden hesaplanır.

## 3. TEKNİK KARARLAR

| Karar | Seçim | Neden |
|---|---|---|
| Graph render | **Three.js r128 devam** (miselyum fork) | Kanıtlanmış kod tabanı, mobilde akıcı, estetik kimlik hazır. D3/force-graph'a geçiş sıfırdan yazım + 2D'ye düşüş demek; kazanç yok. |
| Layout | Seeded statik pozisyon devam; tip-bazlı region merkezleri yeniden tanımlanır | Deterministik, CPU-ucuz; force sim 600 node'da mobili zorlar. |
| STT | **Web Speech API** (`SpeechRecognition`, `lang:'tr-TR'`) | Sıfır maliyet/backend/latency; Chrome'da TR desteği yeterli. Whisper API = audio upload + maliyet + gecikme; kokpit tarayıcıda yaşıyor. Fallback: desteklenmeyen tarayıcıda mik butonu gizlenir, yazı çalışır. |
| TTS | v1: `speechSynthesis` (bedava, robotik ama iş görür). v2: ElevenLabs/OpenAI TTS opsiyonu `/api/tts` üzerinden | Önce çalışan, sonra güzel. |
| LLM | `/api/ask` → Anthropic Messages, model `claude-sonnet-5`, max_tokens ~1000, tool-use ile Notion | Key server'da; miselyumdaki 401 sorunu kökten çözülür. |
| Notion verisi | **REST API** (MCP değil) — MCP Claude istemcileri içindir, deploy edilmiş sayfa kullanamaz. `/api/graph` in-memory 5 dk cache (Notion limiti ~3 rps) | Canlılık/maliyet dengesi; kokpit açılışta 1 çağrı. |
| Graph üretimi | v0: mevcut brain-graph-v1.json **import** (kullanıcıdan alınacak) + `scripts/sync-notion.mjs` ile yeniden üretilebilir. v1: `/api/graph` canlı | JSON şeması miselyumdakiyle geriye uyumlu tutulur (`nodes/edges/opportunities`). |
| State | Hepsi in-memory (localStorage/sessionStorage **yok** — kısıt) | Sayfa yenilenince temiz açılış; kalıcı durum zaten Notion'da. |
| Yapı | Bu repoda `flow/` klasörü, Vercel'de **yeni proje** root'u `flow/` olarak (monorepo root ayarı). İstenirse sonra ayrı repoya taşınır | Tek git geçmişi, erişim zaten var. |

## 4. FAZ PLANI

**v0 — çalışan minimum kokpit (tek oturumluk inşa)**
Teslim: yeni Vercel projesinde tek URL; miselyum fork'u yeni node tipleriyle açılıyor; mevcut graph JSON import edilmiş; **çalışan** "Sor" (yazılı → `/api/ask` gerçek key'le → cevap + node gezintisi); hover highlight; komut paleti (Cmd+K: ara/sor/filtre tek kutu).
Kapsam dışı: ses, canlı Notion, modül panelleri.

**v1 — canlı veri + ses**
Teslim: `/api/graph` (Notion 6-7 omurga DB → graph, 5 dk cache), `/api/brief` + Sabah Raporu paneli, Goal-Lock sayacı, mik butonu (Web Speech STT) + `speechSynthesis` cevap okuma, Fırsat Radarı `gap_match`'ten türetilmiş, local-graph (depth-1) modu.

**v2 — cila**
Teslim: kaliteli TTS (`/api/tts`), label LOD, gap_match yeniden hesaplama endpoint'i (`/api/recompute`), kalan DB'lerin grafa eklenmesi, cinema/focus iyileştirmeleri.

## 5. SONNET HANDOFF — dosyalar ve inşa sırası

```
flow/
├── data/schema.md            # 1. graph JSON sözleşmesi (node/edge tipleri, geriye uyumluluk)
├── data/flow-graph-v1.json   # 2. import edilen mevcut JSON (kullanıcı sağlar) — v0 veri kaynağı
├── public/index.html         # 3. kokpit: miselyum fork + yeni tipler + hover + Cmd+K + sor akışı
├── api/ask.js                # 4. Anthropic proxy (system: node index; cevap sözleşmesi JSON)
├── api/graph.js              # 5. (v1) Notion → graph, 5 dk cache
├── api/brief.js              # 6. (v1) sabah raporu
├── scripts/sync-notion.mjs   # 7. (v1) lokal/CI graph üretici (api/graph ile aynı çekirdek modül)
└── vercel.json               # 8. yeni proje config (env: ANTHROPIC_API_KEY, NOTION_TOKEN)
```

Sıra: 1→2→3 (statik kokpit ayakta) → 4 (konuşma canlanır, **v0 biter**) → 5–7 (v1). Miselyum kaynağı fork tabanı olarak `rs-miselyum-agi.vercel.app`'ten alınır (bu oturumda tam kaynak çekildi ve doğrulandı).

Sonnet için kritik notlar:
- `askBrain()` desenini koru ama fetch'i `/api/ask`'e çevir; `anthropic-version` ve key server tarafında.
- `GRAPH_DATA` inline yerine `fetch('/data/flow-graph-v1.json')` (v0) → `fetch('/api/graph')` (v1); şema alan adları (`t`, `k`, `w`, `s`) değişmez.
- `REGIONS` objesi node-tipi bazlı yeniden tanımlanır (project/area/task/sop/hero/sponsor kümeleri); seeded pozisyon fonksiyonu aynen kalır.
- HTML'e hiçbir storage API'si girmeyecek; her durum in-memory.

## 6. AÇIK MADDE + DOĞRULAMA

**Kullanıcıdan istenecek:** brain-graph-v1.json'ın (177 node) bulunduğu yer — inşa başlamadan `flow/data/`'ya alınacak. Gelmezse v0 deploy'daki 37-node setle açılır, v1 sync'i tam seti üretir.

**Doğrulama (inşa sonrası):**
1. Vercel preview URL'de sayfa açılır; konsolda sıfır hata, node/edge sayaçları JSON'la eşleşir.
2. "Sor" kutusuna TR soru → `/api/ask` 200 döner, cevap panelde, kamera path'teki node'ları gezer (401'in öldüğü kanıtlanır).
3. `/api/brief` curl ile: bugünün taskları + bekleyen follow-up gerçek Notion verisiyle döner.
4. Chrome'da mik butonu → TR konuşma transkript olarak kutuya düşer; cevap sesli okunur.
5. Mobil Safari'de orbit/pinch/tap-select akıcı (miselyum paritesi).

## 7. MEVCUT SECOND BRAIN SKILL SETİ İLE ENTEGRASYON

Kullanıcının Claude tarafında hazır bir skill seti var; en alakalıları: `goal-lock` (hedef filtresi), `documentary-research-analyst` (RS karakter tarama/puanlama → Story Heroes), `documentary-story-editor` (kurgu/transkript), `natgeo-grant-writer`, `signal-mine` (ham girdi → içerik fırsatı), `adhd-product-intelligence`.

Entegrasyon ilkesi — **iki katman, tek veri:**
- Skill'ler **Claude istemcisinde** çalışır (üretim/analiz katmanı), Flow **tarayıcıda** çalışır (görüş/komut katmanı). Skill'ler deploy edilmiş sayfadan çağrılamaz; köprü **Notion**'dur: skill çıktıları Notion'a yazılır (zaten öyle), Flow sync'i onları graph/brief olarak gösterir. Ekstra entegrasyon kodu gerekmez.
- **Goal-Lock hizalaması:** kokpitteki Goal-Lock sayacı, `goal-lock` skill'inin okuduğu aynı Notion hedef kaydından beslenmeli — iki ayrı "hedef tanımı" olmasın. `/api/brief` bu kaydı okur.
- **`/api/ask` system prompt'u** skill'lerdeki karar mantığının hafif özetini taşıyabilir (ör. goal-lock kriteri: "Express işi mi?"). Ağır işler (karakter araştırması, grant yazımı) kokpitten tetiklenmez; kokpit "bunu Claude'da `/documentary-research-analyst` ile aç" yönlendirmesi verir (v2: cevap `actions` alanına `{type:"suggest_skill", name}` eklenir).

Not: `/caveman` skill'i bu remote oturumda mevcut değil (skill listesinde yok); muhtemelen lokal kurulumda. İnşa oturumu lokalde yapılırsa Sonnet'e "/caveman ile üslup" talimatı orada verilmeli.

---

**Kaynaklar:** [Julian-Ivanov/jarvis-voice-assistant](https://github.com/Julian-Ivanov/jarvis-voice-assistant) · [Sid Bharath — How I Built Jarvis](https://sidbharath.com/blog/how-i-built-jarvis/) · [FrankX — Build Your Own Jarvis](https://www.frankx.ai/blog/build-your-own-jarvis-claude-code) · [clarvis](https://github.com/nickpending/clarvis) · [chase_ai_ TikTok](https://www.tiktok.com/@chase_ai_/video/7470226053504568622) · [Local voice stack 2026](https://dev.to/kunal_d6a8fea2309e1571ee7/local-ai-voice-assistant-stack-2026-whisper-piper-ollama-wired-together-572l) · [Joe Karlsson — local voice HA](https://www.joekarlsson.com/blog/local-voice-ai-home-assistant-gpu/) · [Obsidian Graph view docs](https://obsidian.md/help/plugins/graph) · [Obsidian 3D graph plugin](https://github.com/Apoo711/obsidian-3d-graph)
