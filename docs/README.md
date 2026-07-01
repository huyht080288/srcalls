# VoiceChrExtention — Design Documentation

Chrome extension giúp người dùng nghe phát âm và xem phiên âm IPA khi highlight một từ tiếng Anh trên trang web.

## Mục lục

| File | Nội dung |
|------|----------|
| [00-Overview.md](00-Overview.md) | Bối cảnh, mục tiêu, phạm vi v1 |
| [01-Architecture.md](01-Architecture.md) | Kiến trúc extension, folder `src/`, luồng dữ liệu |
| [02-Dictionary-API.md](02-Dictionary-API.md) | Contract Free Dictionary API, parse response, audio |
| [03-Content-Script-UI.md](03-Content-Script-UI.md) | Selection, tooltip, UX |
| [04-Verification.md](04-Verification.md) | Checklist kiểm thử thủ công |
| [05-Out-Of-Scope.md](05-Out-Of-Scope.md) | Hạng mục chưa làm trong v1 |
| [research/dictionary-api-evaluation.md](research/dictionary-api-evaluation.md) | Research & quyết định chọn Dictionary API |

## Task tracking

Xem [../projectmanagement/voice-chr-extension-tasks.md](../projectmanagement/voice-chr-extension-tasks.md).

## Source code

Implementation nằm trong [../src/](../src/).
