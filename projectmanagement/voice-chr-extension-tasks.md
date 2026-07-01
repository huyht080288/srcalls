# VoiceChrExtention — Task Tracking

**Last updated:** 2026-07-01  
**Current phase:** P1 — Core extension (fix verified in browser)

## Status legend

| Status | Meaning |
|--------|---------|
| `todo` | Chưa bắt đầu |
| `in_progress` | Đang làm |
| `done` | Hoàn thành |
| `blocked` | Bị chặn — ghi rõ lý do |
| `deferred` | Hoãn sang phase sau |

---

## Phase 0 — Project setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-1 | Tạo `.cursor/rules/voice-chr-extension-coding.mdc` | done | |
| P0-2 | Tạo `.cursor/skills/voice-chr-extension-modify/SKILL.md` | done | |
| P0-3 | Tạo design docs `docs/00`–`05` | done | |
| P0-4 | Research Dictionary API → `docs/research/` | done | Chọn dictionaryapi.dev |
| P0-5 | Task tracking file (file này) | done | |
| P0-6 | `src/` folder README & structure plan | done | Xem `src/README.md` |

**P0 Definition of done:** Rule, skill, docs, research, tracking tồn tại và nhất quán với nhau.

---

## Phase 1 — Core extension (Dictionary API, single word)

| ID | Task | Status | Depends | Verify |
|----|------|--------|---------|--------|
| P1-1 | `manifest.json` Manifest V3 | done | P0 | Load unpacked không lỗi |
| P1-2 | `src/shared/word.js` — validate & normalize từ đơn | done | P1-1 | `scripts/test-shared.mjs` |
| P1-3 | `src/shared/dictionary.js` — parse API response | done | P0-4 | `scripts/test-shared.mjs` |
| P1-4 | `src/shared/messages.js` — message constants | done | P1-1 | — |
| P1-5 | `src/background/service-worker.js` — fetch + cache + handler | done | P1-3, P1-4 | SW console, Network tab |
| P1-6 | `src/content/content.js` — selection + messaging | done | P1-2, P1-5 | Select word → message sent |
| P1-7 | `src/content/tooltip.css` + Shadow DOM tooltip | done | P1-6 | Tooltip visible, no CSS bleed |
| P1-8 | Audio play on 🔊 click | done | P1-7 | Hear MP3 on test page |
| P1-9 | Error states (not found, network, no audio) | done | P1-7 | `docs/04-Verification.md` |
| P1-10 | Full manual verification checklist | done | P1-9 | `node scripts/test-browser.mjs` |

**P1 Definition of done:** `docs/04-Verification.md` checklist pass trên Chrome Windows.

---

## Phase 2 — Enhancements (deferred)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P2-1 | Options page: accent US/UK preference | deferred | Design TBD |
| P2-2 | Site enable/disable whitelist | deferred | |
| P2-3 | `chrome.storage.sync` settings | deferred | |
| P2-4 | Chrome Web Store packaging | deferred | |

---

## Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | `manifest.json` tại root vs trong `src/`? | — | **Resolved:** root (Chrome Load unpacked convention) — see `docs/01-Architecture.md` |
| Q2 | Hiển thị gì khi select cụm từ — im lặng hay hint? | User | Open — v1 default: im lặng (see `03-Content-Script-UI.md`) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-01 | Khởi tạo project: rule, skill, docs, research, P0 done, P1 planned |
| 2026-07-01 | P1 implemented: manifest, shared modules, service worker, content script + tooltip |
| 2026-07-01 | Fix: selection capture, classic content script, inline CSS; browser test passed |
| 2026-07-01 | Fix audio: offscreen document playback + prefer UK/US audio URLs (v0.1.3) |
| 2026-07-01 | Fix audio on real websites: extension iframe player, bypass page CSP (v0.2.0) |
