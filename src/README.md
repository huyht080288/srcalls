# Source — VoiceChrExtention

Implementation code cho Chrome extension. Design chi tiết: [../docs/01-Architecture.md](../docs/01-Architecture.md).

## Planned structure

```
src/
├── background/
│   └── service-worker.js    # Dictionary API lookup, cache, messages
├── content/
│   ├── content.js           # Selection listener, tooltip
│   └── tooltip.css          # Shadow DOM styles
└── shared/
    ├── messages.js          # Message type constants
    ├── word.js              # Single-word validation
    └── dictionary.js        # Parse API → { ipa, audioUrl }
```

`manifest.json` nằm tại **repo root** (Chrome **Load unpacked** trỏ vào thư mục gốc).

## Status

**Phase 1 implemented** — load unpacked từ repo root. Manual checklist: [../docs/04-Verification.md](../docs/04-Verification.md).

## Conventions

- Vanilla JavaScript (ES modules), Manifest V3.
- Không thêm build toolchain trừ khi user yêu cầu.
- Mọi thay đổi behavior phải sync `docs/` tương ứng.
