# Authentication va Security

Bu bo'lim web xavfsizligi va autentifikatsiya mexanizmlarini chuqur o'rganishga bag'ishlangan. Senior darajadagi frontend developer uchun security bilimi kritik ahamiyatga ega.

## Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [JWT (JSON Web Tokens)](./01-jwt.md) | Token struktura, signing, verification, refresh token pattern |
| 02 | [Cookies](./02-cookies.md) | Cookie attributes, secure flags, SameSite, session management |
| 03 | [LocalStorage Risks](./03-localstorage-risks.md) | Storage xavflari, token saqlash strategiyalari, alternativlar |
| 04 | [XSS (Cross-Site Scripting)](./04-xss.md) | XSS turlari, attack vectors, sanitization, CSP |
| 05 | [CSRF (Cross-Site Request Forgery)](./05-csrf.md) | CSRF mexanizmi, token patterns, SameSite cookies |
| 06 | [CORS (Cross-Origin Resource Sharing)](./06-cors.md) | Same-origin policy, preflight requests, headers configuration |
| 07 | [Best Practices](./07-best-practices.md) | Defense in depth, security checklist, audit metodlari |

## Nima Uchun Security Muhim?

### Real Statistika
- 2023-yilda XSS hujumlar web zaifliklarning **40%** ni tashkil etdi
- CSRF orqali yirik kompaniyalar millionlab dollar yo'qotdi
- JWT noto'g'ri ishlatilganda data breach'lar ro'y berdi

### Interview'da Security Savollari
Senior pozitsiyalar uchun security bilimi **majburiy**:
- JWT vs Session-based auth
- XSS prevention strategiyalari
- CORS muammolarini hal qilish
- Secure cookie configuration

## Xavfsizlik Piramidasi

```
                    ┌─────────────────┐
                    │   Application   │
                    │   Security      │
                    ├─────────────────┤
                    │   Transport     │
                    │   (HTTPS/TLS)   │
                    ├─────────────────┤
                    │   Network       │
                    │   Security      │
                    └─────────────────┘
```

Frontend developer sifatida biz **Application Security** qatlamiga mas'ulmiz:
- Input validation
- Output encoding
- Authentication/Authorization
- Secure data storage
- API security

## Asosiy Tushunchalar

### Authentication vs Authorization
```
Authentication (AuthN): KIM sen?
├── Login/Password
├── OAuth/OIDC
├── Biometric
└── MFA

Authorization (AuthZ): NIMA qila olasan?
├── Role-based (RBAC)
├── Permission-based
├── Attribute-based (ABAC)
└── Resource-based
```

### Security Headers
```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
```

## O'rganish Tartibi

1. **JWT** - zamonaviy authentication asosi
2. **Cookies** - session management va secure storage
3. **LocalStorage Risks** - nima uchun localStorage xavfli
4. **XSS** - eng keng tarqalgan web zaiflik
5. **CSRF** - state-changing request hujumlari
6. **CORS** - cross-origin muammolar va yechimlar
7. **Best Practices** - barcha bilimlarni birlashtirish

## Defense in Depth

Xavfsizlik bir qatlamda emas, ko'p qatlamda ta'minlanadi:

```
┌────────────────────────────────────────────────────┐
│                    WAF/CDN                         │
├────────────────────────────────────────────────────┤
│                 Rate Limiting                      │
├────────────────────────────────────────────────────┤
│              Input Validation                      │
├────────────────────────────────────────────────────┤
│           Output Encoding (XSS)                    │
├────────────────────────────────────────────────────┤
│        Authentication (JWT/Session)                │
├────────────────────────────────────────────────────┤
│           Authorization (RBAC)                     │
├────────────────────────────────────────────────────┤
│         CSRF/CORS Protection                       │
├────────────────────────────────────────────────────┤
│          Secure Data Storage                       │
└────────────────────────────────────────────────────┘
```

## Praktik Mashqlar

Har bir bo'limda:
- **Zaif kod** - xato qanday ko'rinishini tushunish
- **Xavfsiz kod** - to'g'ri implementatsiya
- **Attack scenarios** - real hujum usullari
- **Prevention** - himoya strategiyalari

## Foydali Resurslar

### OWASP
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

### Tools
- [Burp Suite](https://portswigger.net/burp) - security testing
- [OWASP ZAP](https://www.zaproxy.org/) - automated scanner
- [jwt.io](https://jwt.io/) - JWT debugging

**Eslatma:** Security bilimini faqat himoya maqsadida ishlating. Ethical hacking va responsible disclosure prinsiplarini hurmat qiling.
