# 02 — Dictionary API

## Endpoint

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

- Không cần API key.
- `word`: lowercase, trimmed, chỉ gửi sau khi content script validate từ đơn.

## Response (rút gọn)

API trả **mảng** entries. Mỗi entry:

| Field | Mô tả |
|-------|--------|
| `word` | Từ tra |
| `phonetic` | IPA primary (có thể thiếu) |
| `phonetics[]` | `{ text?, audio? }` — nhiều accent, audio có thể rỗng |

Ví dụ phonetic có audio:

```json
{
  "word": "hello",
  "phonetic": "həˈləʊ",
  "phonetics": [
    { "text": "həˈləʊ", "audio": "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3" }
  ]
}
```

## Parse rules (contract)

Implement trong `src/shared/dictionary.js`:

1. **IPA text** — ưu tiên `entry.phonetic`; fallback `phonetics.find(p => p.text)?.text`.
2. **Audio URL** — `phonetics.find(p => p.audio)?.audio`; normalize:
   - URL bắt đầu `//` → prefix `https:`
   - Trim whitespace; empty string = không có audio
3. **Audio URL** — `pickAudioUrl(phonetics)`: thu thập mọi URL hợp lệ, ưu tiên `-uk.mp3` → `-us.mp3` → `-au.mp3` → `-ca.mp3` → URL đầu tiên.

## Error cases

| HTTP / body | Extension behavior |
|-------------|-------------------|
| 200, empty array | `{ ok: false, error: 'not_found' }` |
| 404 | `{ ok: false, error: 'not_found' }` |
| Network error | `{ ok: false, error: 'network' }` |
| 200, no audio in phonetics | Vẫn hiện IPA nếu có; nút play disabled hoặc ẩn |
| 200, no IPA | Hiện word + trạng thái “no phonetic” (hiếm) |

## Cache

- Key: normalized word (lowercase).
- Store: in-memory Map trong service worker; optional `chrome.storage.session` nếu cần survive SW restart.
- TTL: không bắt buộc v1; cache vô hạn trong session là đủ.

## Rate limiting

API community-hosted, không document quota cứng. Extension nên:

- Chỉ lookup khi selection ổn định (debounce).
- Cache mọi kết quả thành công trong session.

## References

- https://dictionaryapi.dev/
- Research chi tiết: [research/dictionary-api-evaluation.md](research/dictionary-api-evaluation.md)
