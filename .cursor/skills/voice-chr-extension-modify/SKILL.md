---
name: voice-chr-extension-modify
description: Modify, review, investigate, or implement the VoiceChrExtention Chrome extension. Use when the user mentions VoiceChrExtention, voice pronunciation extension, Chrome extension, content script, phonetic, IPA, Dictionary API, dictionaryapi.dev, text selection tooltip, or folders src/ or docs/ in this project.
---

# VoiceChrExtention Modify Skill

## Khi nào dùng skill này

Dùng skill này khi người dùng yêu cầu sửa, review, điều tra, đồng bộ tài liệu, hoặc implement Chrome extension `VoiceChrExtention`.

Trigger thường gặp:

- `VoiceChrExtention`, `Voice Chr Extension`
- Chrome extension, Manifest V3, content script, service worker
- Phonetic, IPA, pronunciation, phát âm
- Dictionary API, `dictionaryapi.dev`
- Text selection, highlight, tooltip
- `src/`, `docs/`, `projectmanagement/`

## Phạm vi coding chính

- `src/`: toàn bộ source code extension (content script, background/service worker, shared modules, styles, assets).
- `docs/`: tài liệu thiết kế và research; khi coding làm thay đổi contract hoặc hành vi, cập nhật lại tài liệu tương ứng tại folder này.
- `projectmanagement/voice-chr-extension-tasks.md`: tracking công việc; cập nhật status khi bắt đầu/kết thúc task.

Thứ tự implement mặc định:

1. Giai đoạn 1: manifest + service worker (lookup Dictionary API)
2. Giai đoạn 2: content script (selection + tooltip UI)
3. Giai đoạn 3: options/popup (accent, enable/disable) nếu design yêu cầu

## Tài liệu nguồn bắt buộc đọc

Trước khi kết luận hoặc sửa file, đọc tài liệu hiện tại trong:

- `docs/README.md`
- `docs/00-Overview.md`
- `docs/01-Architecture.md`
- `docs/02-Dictionary-API.md`
- `docs/03-Content-Script-UI.md`
- `docs/04-Verification.md`
- `docs/05-Out-Of-Scope.md`
- `docs/research/dictionary-api-evaluation.md`
- `projectmanagement/voice-chr-extension-tasks.md`

Nếu chỉ sửa một layer, vẫn đọc ít nhất file design của layer đó và các file contract liên quan.

## Quy trình sửa đổi

1. Xác định yêu cầu thuộc loại nào: code implementation, design sync, review, điều tra luồng, hay giải thích hành vi.
2. Xác định đúng layer: background lookup, content script/UI, manifest/permissions, hay docs/tasks.
3. Đọc nội dung file hiện tại trước khi điều tra, sửa, hoặc kết luận vì người dùng có thể chỉnh sửa song song.
4. Nếu nội dung file khác context trước đó hoặc có nhiều hướng thiết kế hợp lý, hỏi xác nhận trước khi sửa lớn.
5. Sửa đúng phạm vi layer bị ảnh hưởng, sau đó đồng bộ các file design và task tracking liên quan.
6. Sau khi sửa, kiểm tra lại contract chính: selection behavior, IPA display, audio play, API error handling, manifest permissions, verification checklist.
7. Báo lại ngắn gọn phần đã sửa, phần đã kiểm tra, và phần cần user review.

## Nguyên tắc coding mặc định

### Suy nghĩ trước khi lập trình

- Nêu rõ giả định trước khi triển khai nếu yêu cầu có điểm chưa chắc.
- Nếu có nhiều cách hiểu hoặc nhiều hướng triển khai hợp lý, không âm thầm chọn; trình bày ngắn gọn và hỏi xác nhận.
- Nếu có cách tiếp cận đơn giản hơn hoặc phạm vi hiện tại có vẻ quá rộng, nói rõ để user quyết định.
- Nếu thiếu thông tin quan trọng, dừng lại và hỏi thay vì tự suy đoán.

### Ưu tiên sự đơn giản

- Viết lượng code tối thiểu để giải quyết đúng yêu cầu.
- Không thêm tính năng ngoài scope, option linh hoạt, abstraction, hoặc error handling cho trường hợp không thực tế nếu chưa được yêu cầu.
- Nếu thay đổi bắt đầu phình to, rà lại xem có thể xử lý bằng hướng nhỏ hơn bám pattern hiện có không.

### Thay đổi mang tính phẫu thuật

- Chỉ chạm vào file và dòng có lý do trực tiếp từ yêu cầu.
- Không refactor, reformat, hoặc “cải tiến” code lân cận nếu không cần thiết.
- Tuân thủ style hiện có của repo, kể cả khi có cách viết khác hiện đại hơn.
- Nếu phát hiện dead code không liên quan, chỉ báo lại; không tự xóa.
- Xóa import/biến/hàm thừa do chính thay đổi của mình tạo ra.

### Thực thi theo mục tiêu

- Với task nhiều bước, dùng kế hoạch ngắn dạng: bước làm -> cách verify.
- Mỗi thay đổi phải có cách kiểm tra: load unpacked extension, manual selection test trên trang web, hoặc sync design.
- Nếu verification fail, sửa và kiểm lại; nếu bị giới hạn bởi môi trường, báo rõ giới hạn.

## Contract nghiệp vụ cốt lõi

Extension hỗ trợ người dùng đọc trang web tiếng Anh:

- User **select (highlight) một từ đơn** tiếng Anh trên trang web.
- Tooltip xuất hiện cạnh vùng selection, hiển thị **IPA (phiên âm)** và **nút phát âm**.
- Click nút phát âm → phát audio MP3 từ Free Dictionary API khi có sẵn.
- Chỉ hỗ trợ **từ đơn**; cụm từ nhiều từ nằm ngoài scope v1 (xem `docs/05-Out-Of-Scope.md`).

Nguồn dữ liệu: `GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}` — chi tiết tại `docs/02-Dictionary-API.md`.

## Layer và điểm cần giữ nhất quán

### Background / Service Worker

Nguồn: `docs/01-Architecture.md`, `docs/02-Dictionary-API.md`.

- Nhận message lookup từ content script.
- Gọi Dictionary API, normalize response (IPA text, audio URL).
- Cache kết quả theo word (in-memory hoặc `chrome.storage.session`).
- Trả lỗi rõ ràng khi word not found hoặc không có audio.

### Content Script + UI

Nguồn: `docs/03-Content-Script-UI.md`.

- Lắng nghe selection (`mouseup` / `selectionchange` với debounce).
- Validate selection là **một từ đơn** (regex `[a-zA-Z'-]+`, trim, reject whitespace/multi-word).
- Render tooltip trong Shadow DOM để tránh CSS conflict trang host.
- Position tooltip cạnh selection rect; ẩn khi click outside hoặc Esc.

### Manifest & Permissions

Nguồn: `docs/01-Architecture.md`.

- Manifest V3.
- `host_permissions` cho `https://api.dictionaryapi.dev/*` và audio CDN nếu cần.
- Content script inject `<all_urls>` hoặc phạm vi user chọn theo design.

## Quy tắc chống ghi đè

- Luôn đọc file hiện tại ngay trước khi edit.
- Không thay thế block lớn nếu không chắc block đó chưa bị user chỉnh tay.
- Nếu user đã update file trong IDE, lấy nội dung hiện tại làm nguồn thật.
- Khi đồng bộ nhiều file, nói rõ danh sách file dự kiến sửa trước khi edit.

## Checklist trước khi trả lời

- Đã bám đúng tài liệu nguồn trong `docs/`.
- Code nằm trong `src/`, không rải file implementation ngoài scope folder.
- Dictionary API contract, UI behavior, và verification không mâu thuẫn nhau.
- Task tracking đã cập nhật nếu hoàn thành hoặc bắt đầu task mới.
- Không đưa hạng mục out-of-scope vào implementation nếu chưa được user xác nhận.
