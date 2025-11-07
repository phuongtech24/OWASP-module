# A7-XSS — Cross-Site Scripting (XSS) (Report Template)

**Project:** OWASP Top 10 Playground — Module: Cross-Site Scripting (XSS)
**Tác giả:** Nguyễn Khắc Nam Phương
**Ngày:** 06/11/2025

---

## 1. Executive summary

[Short summary of findings]
Trong bài kiểm thử này, tôi đã phát hiện và chứng minh ba kiểu XSS trên ứng dụng mẫu chạy local: **Reflected XSS** (`/reflected`), **Stored XSS** (`/stored`) và **DOM-based XSS** (`/dom`).  
Tất cả PoC đều được thu thập (screenshot alert, HAR/Burp logs). Đã áp dụng biện pháp khắc phục (escape/sanitize hoặc thay đổi API nguy hiểm) và xác minh lại sau vá — các payload không còn thực thi.

**Severity (tổng quan):**
- Stored XSS: **High** (persistent, có thể ảnh hưởng nhiều người dùng).
- Reflected XSS: **Medium** (cần user interaction thông qua URL).
- DOM XSS: **Medium** (client-side; mức độ nguy hiểm phụ thuộc vào cách dữ liệu được sử dụng).

## 2. Scope
[List of endpoints/parameters tested]

Endpoints kiểm thử (local):
- `http://localhost:3000/reflected` — param: `q` (Reflected)
- `http://localhost:3000/stored` — form param: `comment` (Stored)
- `http://localhost:3000/dom` — fragment/hash: `location.hash` (DOM)

Tools: Browser (Chrome/Firefox), Burp Suite (interception & Repeater), DevTools, HAR export.

## 3. Environment & How to run
[Runtime, steps to run the vulnerable app if provided]

**Environment:**
- Node.js v16+ (test trên local machine)
- Express + EJS (template engine)
- App sample nằm trong `A7-XSS/vulnerable-app/sample`

**How to run:**
```bash
cd A7-XSS/vulnerable-app/sample
npm install
npm start
# App chạy tại http://localhost:3000

## 4. Vulnerability summary & PoC
[Explain vulnerability, include example PoC(s) and payloads]

4.1 Reflected XSS

Endpoint: /reflected?q=...

PoC URL:
http://localhost:3000/reflected?q=%3Cscript%3Ealert(document.cookie)%3C%2Fscript%3E
(URL-encoded: ?q=<script>alert(document.cookie)</script>)

Observed: Khi truy cập URL PoC, trình duyệt hiện popup alert(document.cookie). Capture evidence: demo/reflected_alert.png, demo/reflected_har.har, demo/reflected_burp.txt.

Vulnerable code (example): EJS template dùng unescaped rendering:

<!-- vulnerable -->
<p>Result: <%- q %></p>


PoC request (example):

GET /reflected?q=<script>alert(1)</script> HTTP/1.1
Host: localhost:3000


Impact: Kẻ tấn công có thể lừa nạn nhân mở URL crafted để thực thi script trong ngữ cảnh site — có thể đánh cắp cookie (trừ cookie HttpOnly), thực hiện hành động thay người dùng, hoặc load remote payload.

4.2 Stored XSS

Endpoint: /stored (POST form, field comment)

PoC: submit comment body: <script>alert('stored:'+document.cookie)</script>

Observed: Payload lưu vào DB và khi người dùng truy xuất trang /stored, script thực thi (popup). Evidence: demo/stored_alert.png, demo/stored_har.har.

Vulnerable code (example): comment rendered unescaped:

<!-- vulnerable -->
<li><strong><%= c.name %>:</strong> <%- c.comment %></li>


Impact: Stored XSS có thể lặp lại, ảnh hưởng mọi người xem trang, rất nguy hiểm (phishing, session theft, persistent malware).

4.3 DOM-based XSS

Endpoint: /dom (client-side use of location.hash)

PoC URL:
http://localhost:3000/dom#%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E
(hash = <img src=x onerror=alert(1)>)

Observed: Trang gán fragment vào DOM bằng API nguy hiểm (innerHTML) => alert xuất hiện. Evidence: demo/dom_alert.png, demo/dom_har.har.

Vulnerable code (example):

const out = document.getElementById('out');
const hash = location.hash ? decodeURIComponent(location.hash.substring(1)) : '';
// vulnerable:
out.innerHTML = hash;


Impact: Tùy code client, attacker có thể làm nạn nhân thực thi script thông qua hash/referrer/localStorage,...

## 5. Root cause
[Root cause analysis]

Reflected/Stored: template engine/renderer chèn dữ liệu người dùng vào HTML mà không escape (sử dụng unescaped EJS <%- ... %>), do đó HTML/JS bất kỳ được trả về trình duyệt sẽ thực thi.

DOM-based: client-side code trực tiếp gán dữ liệu không tin cậy vào DOM bằng innerHTML (hoặc các sink tương tự), dẫn tới thực thi script mà không qua server-side validation/sanitization.

## 6. Remediation
[Concrete fixes and code snippets]

Server-side quick fixes

Escape on output (EJS): đổi <%- q %> → <%= q %> để EJS tự escape.

Sanitization (when HTML allowed): sanitize input with a whitelist (e.g. sanitize-html or server-side DOMPurify).

Example escape helper (Node/Express):

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


Use in template rendering:

<!-- safe: escaped -->
<p>Result: <%= q %></p>
<!-- or manual: -->
<p>Result: <%= escapeHtml(q) %></p>

Client-side fix (DOM)

Prefer textContent:

// safe
out.textContent = hash;


If HTML required, sanitize before inserting:

out.innerHTML = DOMPurify.sanitize(hash);

Other mitigations

Set HttpOnly and SameSite on session cookies.

Apply a restrictive Content-Security-Policy (CSP) to reduce impact of XSS:

Content-Security-Policy: default-src 'self'; script-src 'self'


Validate & whitelist inputs server-side; use prepared rendering APIs; minimize direct string concatenation into script/attribute contexts.

## 7. Evidence
[Attach screenshots, HAR, Burp logs, video files]

(Placed in A7-XSS/demo/)

demo/reflected_alert.png — screenshot of reflected alert popup.

demo/reflected_har.har — network HAR for reflected PoC.

demo/reflected_burp.txt — Burp capture / request for reflected PoC.

demo/stored_alert.png — screenshot of stored alert popup.

demo/stored_har.har — HAR for stored PoC.

demo/stored_burp.txt — Burp logs showing POST insertion.

demo/dom_alert.png — screenshot of DOM alert popup.

demo/dom_har.har — HAR for DOM PoC.

8. Re-test & verification

Sau khi áp dụng các sửa đổi:

Reflected: payload hiển thị ở dạng text (escaped) — không có alert. Kiểm tra bằng PoC URL; evidence: demo/reflected_after_fix.png.

Stored: sau submit payload, comment hiển thị escaped và không thực thi — evidence: demo/stored_after_fix.png.

DOM: hash hiển thị dưới dạng text hoặc đã được DOMPurify sanitize — evidence: demo/dom_after_fix.png.

## 9. References
[Useful links and OWASP resources]

OWASP XSS: https://owasp.org/www-community/attacks/xss/

DOMPurify: https://github.com/cure53/DOMPurify

OWASP Cheat Sheet: Cross Site Scripting Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html