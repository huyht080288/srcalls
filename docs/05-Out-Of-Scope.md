# 05 — Out Of Scope (v1)

Các hạng mục sau **không** implement trừ khi user yêu cầu mở rộng scope và cập nhật design/tasks.

## Ngôn ngữ & nội dung

- Cụm từ / câu nhiều từ (`hello world`, cả câu).
- Từ có dấu non-ASCII (`café`, `naïve`) — v1 chỉ `[a-zA-Z]` + hyphen/apostrophe.
- Ngôn ngữ khác ngoài English.

## Phát âm & dữ liệu

- Web Speech API / TTS fallback khi không có audio MP3.
- Google Cloud TTS, Azure Speech, Amazon Polly.
- Scrape audio từ Cambridge, Oxford, Merriam-Webster.
- Wikimedia / Wiktionary audio pipeline.

## Tính năng sản phẩm

- Dịch nghĩa từ, ví dụ câu, synonym (API có nhưng UI v1 không hiển thị).
- Popup/options page (accent US/UK, blacklist site) — deferred phase 2.
- Firefox / Edge port.
- Chrome Web Store publish, analytics, telemetry.
- Offline dictionary bundle.

## Kỹ thuật

- React/Vue build toolchain — v1 vanilla JS.
- Unit test framework — chỉ manual verification checklist v1.
