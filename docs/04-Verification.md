# 04 — Verification

## Chuẩn bị

1. Chrome → `chrome://extensions` → Developer mode ON.
2. **Load unpacked** → chọn thư mục `VoiceChrExtention` (chứa `manifest.json`).
3. Mở trang test: Wikipedia EN, BBC News, hoặc trang HTML tĩnh local.

## Checklist chức năng

### Selection & tooltip

- [ ] Select từ đơn `hello` → tooltip xuất hiện cạnh từ.
- [ ] Select cụm `hello world` → **không** gọi API / không hiện tooltip (hoặc hiện hint out-of-scope tùy implement).
- [ ] Select rỗng / click ngoài → tooltip biến mất.
- [ ] Esc → tooltip biến mất.

### IPA & audio

- [ ] `serendipity` → hiển thị IPA hợp lý.
- [ ] Click 🔊 → nghe được audio.
- [ ] Từ có IPA nhưng không audio (nếu tìm được case) → UI xử lý đúng (disabled/ẩn nút).

### API errors

- [ ] Từ vô nghĩa `xyzxyzxyz` → thông báo not found, không crash.
- [ ] DevTools → Network off → select từ → thông báo network error.

### Regression trang host

- [ ] Tooltip không phá layout trang (Shadow DOM).
- [ ] Select trên input/textarea: behavior chấp nhận được (có thể skip nếu design ghi nhận).

### Cache

- [ ] Select cùng từ 2 lần → lần 2 không gọi API mới (kiểm tra Network tab).

## Console

- Không có uncaught exception khi select/play/error.
- Service worker: `chrome://extensions` → Inspect service worker → log sạch.

## Definition of done (v1)

Tất cả mục **Selection & tooltip**, **IPA & audio**, **API errors** trong checklist pass trên Chrome Windows mới nhất.
