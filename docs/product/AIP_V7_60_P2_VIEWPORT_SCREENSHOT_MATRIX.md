# AIP v7.60-P2 Viewport Screenshot Matrix

**Phase:** v7.60-P2
**Status:** CAPTURED

---

## Matrix

| Route | 1440×900 | 1280×720 | 1024×768 | 768×1024 | 390×844 |
|---|---|---|---|---|---|
| Main `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Governance `/governance` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Datasets `/datasets` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plugin Pool `/plugin-pool` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Factory Status `/factory-status` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Total:** 25 screenshots captured via Playwright 1.60.0 (headless Chromium).

---

## Per-Viewport Summary

| Viewport | Sidebar | Layout | Errors |
|---|---|---|---|
| 1440×900 | visible across all routes | ok across all routes | 4-8 API errors per route |
| 1280×720 | visible across all routes | ok across all routes | 4-8 API errors per route |
| 1024×768 | visible across all routes | ok across all routes | 4-8 API errors per route |
| 768×1024 | visible across all routes | ok across all routes | 4-8 API errors per route |
| 390×844 | visible across all routes | ok across all routes | 4-8 API errors per route |

---

## Screenshot Location

```
E:\AIP\screenshots_p2/
├── main_desktop_1440.png
├── main_desktop_1280.png
├── main_tablet_landscape_1024.png
├── main_tablet_portrait_768.png
├── main_mobile_390.png
├── governance_desktop_1440.png
├── governance_desktop_1280.png
├── ...
└── factory_status_mobile_390.png
```

---

## Tooling

| Tool | Version |
|---|---|
| Playwright | 1.60.0 |
| Browser | Chromium (headless, Chrome for Testing 148.0.7778.96) |
| UI URL | `http://127.0.0.1:5173` |
| API | Not running (expected; errors are known) |
