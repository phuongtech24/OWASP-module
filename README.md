# OWASP Top 10 Playground — Full Module Collection

**Tác giả:** Nguyễn Khắc Nam Phương  
**Mục tiêu:** Bộ lab học tập theo OWASP Top 10 — gồm 10 module (A1 → A10). Mỗi module chứa ví dụ/mini-app có lỗ hổng tương ứng để học cách phát hiện, khai thác (PoC), vá và chứng minh.  
**Lưu ý:** Các ứng dụng có lỗ hổng được **mô phỏng cho mục đích học tập** — chỉ chạy trên môi trường local hoặc lab riêng; **không** deploy trên môi trường production hoặc public.

---

## Nội dung repo (cấu trúc)
repo-root/
├─ A1-Injection/
├─ A2-Broken-Authentication/
├─ A3-Sensitive-Data-Exposure/
├─ A4-XXE/
├─ A5-Broken-Access-Control/
├─ A6-Security-Misconfiguration/
├─ A7-XSS/
├─ A8-Insecure-Deserialization/
├─ A9-Components-Known-Vulns/
├─ A10-Logging-Monitoring/
├─ README.md # (this file)
└─ LICENSE


Mỗi thư mục `A*-*` chứa:
- Một sample app / demo (Node.js/Express/EJS hoặc tương tự) hoặc hướng dẫn lab.
- Thư mục `demo/` (ảnh, HAR, video), `docs/` (report.md, report.pdf), `fix/` (patch), `pocs/` (payloads).

---

## Quick start — chạy mọi module (local)
> Yêu cầu: Node.js v16+ (hoặc tương thích), npm

Mỗi module có thể có cách chạy khác nhau; ví dụ chuẩn (thư mục `vulnerable-app/sample` trong mỗi module):

```bash
# ví dụ chạy module A7-XSS
cd A7-XSS/vulnerable-app/sample
npm install
npm start
# mở trình duyệt
# http://localhost:3000/reflected
# http://localhost:3000/stored
# http://localhost:3000/dom

See docs/report.md for details and demo/ for screenshots.
