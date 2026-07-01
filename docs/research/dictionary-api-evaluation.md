# Research — Dictionary API Evaluation

**Date:** 2026-07-01  
**Decision:** Chọn **Free Dictionary API** (`dictionaryapi.dev`) — từ đơn, IPA + MP3 audio, không API key.

## Vấn đề cần giải quyết

User highlight từ tiếng Anh trên web → cần **phiên âm IPA** và **audio phát âm** tức thì, không rời trang.

## Ràng buộc đã chốt

- Chấp nhận **chỉ từ đơn** (không cụm từ).
- Ưu tiên **miễn phí**, không backend riêng, phù hợp Chrome extension cá nhân.
- Chất lượng audio “từ điển” tốt hơn TTS generic.

## Ứng viên đã xem xét

| Giải pháp | IPA | Audio | Từ đơn | API key | Ghi chú |
|-----------|-----|-------|--------|---------|---------|
| **Free Dictionary API** | ✅ | ✅ MP3 | ✅ | Không | **Đã chọn** |
| Web Speech API | ❌ | TTS | ✅/cụm | Không | Out of scope v1 |
| Google Cloud TTS | ❌ | TTS cao cấp | ✅/cụm | Có + billing | Phức tạp |
| Scrape Cambridge/Oxford | ✅ | ✅ | Một phần | Không | ToS / fragile |
| Wikimedia audio | Một phần | ✅ human | Không đều | Không | Parse phức tạp |

## Free Dictionary API — chi tiết

**Base URL:** `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

**Ưu điểm:**

- Một request trả cả IPA lẫn URL audio.
- Audio thường từ Google Dictionary CDN — chất lượng tốt.
- Không authentication; dễ gọi từ service worker.
- Cộng đồng extension tương tự đã dùng (vd. Quick-Dictionary pattern).

**Nhược điểm:**

- Không hỗ trợ cụm từ — **chấp nhận** cho v1.
- Một số từ thiếu audio hoặc thiếu IPA — UI phải xử lý gracefully.
- Không SLA / rate limit công khai — cần debounce + cache.

**Sample request:**

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/hello
```

**Sample audio URL pattern:**

```
//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3
```

→ Extension normalize thành `https://...` trước khi `Audio.play()`.

## Quyết định cuối

| Hạng mục | Quyết định |
|----------|------------|
| Nguồn IPA + audio | Free Dictionary API |
| Phạm vi lookup | Từ đơn English |
| Fallback TTS | Không (v1) |
| Cache | Session cache trong service worker |

## Tài liệu liên quan

- Contract implement: [../02-Dictionary-API.md](../02-Dictionary-API.md)
- Out of scope alternatives: [../05-Out-Of-Scope.md](../05-Out-Of-Scope.md)
