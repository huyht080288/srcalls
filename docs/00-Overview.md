# 00 — Overview

## Bối cảnh

Khi đọc website tiếng Anh, người dùng gặp từ không quen và không biết cách phát âm. Quy trình hiện tại (copy → Google Translate / Cambridge Dictionary → paste → bấm nghe) tốn thời gian.

## Mục tiêu

Xây dựng Chrome extension **VoiceChrExtention** để:

1. User **highlight (select) một từ** tiếng Anh trên bất kỳ trang web nào.
2. Tooltip hiện **ngay cạnh từ**, gồm **phiên âm IPA** và **nút phát âm**.
3. Bấm nút phát âm → nghe audio chất lượng từ điển (MP3).

## Phạm vi v1

- **Từ đơn** tiếng Anh (một token, cho phép hyphen/apostrophe trong từ như `don't`, `well-known`).
- Nguồn dữ liệu: [Free Dictionary API](https://dictionaryapi.dev/) — không API key.
- Chỉ Chrome (Manifest V3); chưa publish Chrome Web Store.

## Không nằm trong v1

Xem [05-Out-Of-Scope.md](05-Out-Of-Scope.md).

## Persona

Người học tiếng Anh, đọc nội dung web tiếng Anh, cần tra phát âm nhanh không rời trang.

## Success criteria

- Select một từ phổ biến (vd. `hello`, `serendipity`) → IPA + audio trong &lt; 1 giây (mạng bình thường).
- Tooltip không bị che bởi CSS trang host (Shadow DOM).
- Extension load được qua **Load unpacked** trên Chrome.
