# Flow Graph JSON Şeması

`flow-graph-v1.json` (v0, statik) ve `/api/graph` (v1, canlı) aynı sözleşmeyi üretir. Alan adları miselyumdaki orijinal viewer ile **geriye uyumlu** — frontend kodu bu isimleri (`t`, `k`, `w`, `s`) değiştirmeden kullanır.

```json
{
  "nodes": [ Node, ... ],
  "edges": [ Edge, ... ],
  "opportunities": [ Opportunity, ... ]
}
```

## Node

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | string | ✓ | Benzersiz kimlik, ör. `n_wwf`, `h_zafer`, `p_pilot_bolum` |
| `t` | string | ✓ | Görünen başlık |
| `type` | enum | ✓ | `sponsor_ngo` \| `story_hero` \| `project` \| `area` \| `goal` \| `task` \| `sop` \| `note` |
| `region` | enum | ✓ | Tematik küme anahtarı (bkz. `REGIONS` in index.html) — görsel kümeleme için |
| `w` | number (0–1) | ✓ | Görsel ağırlık: node boyutu + glow eşiği |
| `sub` | string | – | Alt başlık (rol, kategori, proje statüsü) |
| `score` | number (0–10) | – | Panelde gösterilen skor (ör. karakter puanı) |
| `meta` | string | – | Serbest metin not (ör. "GAP 2 — Karadeniz") |
| `url` | string | – | Notion sayfa linki, panelde "Notion'da aç" |

v1'de eklenecek tipler için önerilen `sub`/`meta` kullanımı:
- `project`: `sub` = statü (Aktif/Planned/Paused/Backlog/Inbox), `meta` = deadline/gecikme notu
- `goal`: `sub` = North Star kategorisi, `meta` = deadline
- `task`: `sub` = due date, `meta` = bağlı proje

## Edge

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `s` | string | ✓ | Kaynak node id |
| `t` | string | ✓ | Hedef node id |
| `k` | enum | ✓ | `sponsor_character_match` \| `hero_sponsor_relation` \| `gap_match` \| `shared_archetype` \| `serves_goal` \| `depends_on` |
| `w` | number (0–1) | ✓ | Bağlantı gücü — parlaklık/kalınlık |

## Opportunity

`gap_match` edge'lerinin Fırsat Radarı paneli için düzleştirilmiş özeti:

```json
{"sponsor": "...", "sponsor_tier": "Tier 1 - Sıcak", "hero": "...", "hero_score": 10, "reason": "GAP 2 — Karadeniz/Arıcılık"}
```

## Geriye uyumluluk kuralı

Yeni alan eklenebilir (ör. `deadline`, `status`); mevcut alan adı/tipi **değiştirilmez**. `/api/graph` bu şemayı üretirken aynı JSON şeklini döndürür — frontend v0→v1 geçişinde `fetch()` hedefi değişir, parse mantığı değişmez.
