# 03 — Content Script & UI

## Selection behavior

| Event | Hành vi |
|-------|---------|
| `pointerup` (capture) | Capture selection ngay khi thả chuột |
| `selectionchange` | Hỗ trợ chọn bằng bàn phím (debounce 50ms) |
| Click outside / Esc | Ẩn tooltip |
| Click vào tooltip / nút 🔊 | **Không** ẩn, **không** lookup lại |

## Single-word validation

Chỉ lookup khi selection thỏa **tất cả**:

1. `trim()` không rỗng.
2. Không chứa whitespace (reject cụm từ).
3. Match regex: `^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$`  
   - Cho phép: `hello`, `don't`, `well-known`
   - Reject: `hello world`, `123`, `café` (v1 — ASCII letters only)

Normalize trước khi gửi API: `toLowerCase()`.

## Tooltip UI

### Nội dung

```
[ /həˈləʊ/ ]  [ 🔊 ]
```

- **IPA**: font monospace hoặc serif phân biệt; hiển thị trong `/.../` nếu API không có slashes.
- **Nút play**: icon 🔊 hoặc SVG speaker; `aria-label="Play pronunciation"`.
- **Loading**: spinner nhỏ trong lúc chờ API.
- **Error**: message ngắn (`Word not found`, `No audio`) — không alert/modal.

### Positioning

- Anchor: `Range.getBoundingClientRect()` của selection.
- Đặt tooltip **phía dưới** selection, căn trái; flip lên trên nếu không đủ viewport height.
- `position: fixed` + `z-index: 2147483647`.

### Shadow DOM

- Host element: `#voice-chr-ext-root` (fixed, pointer-events none trên host; pointer-events auto trên tooltip).
- Shadow root chứa tooltip + `tooltip.css` — tránh CSS conflict trang web.

## Audio playback

Phát âm qua **iframe extension** (`src/audio/player.html`) nhúng trong Shadow DOM — ngữ cảnh `chrome-extension://`, **không bị CSP `media-src` của trang web chặn** (khác với `test-page.html` không có CSP).

Click 🔊 → `postMessage` tới iframe → `Audio.play()` trong extension origin.

## Accessibility

- Tooltip `role="status"` khi loading; `role="group"` khi có kết quả.
- Nút play focusable (`tabindex="0"`), Enter/Space kích hoạt play.
