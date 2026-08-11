# srckit-jwt

> Part of [srckit](https://github.com/srckit-org/srckit) — developer tools suite

Decode, encode, verify, and inspect JSON Web Tokens entirely in your browser. No server required — all operations use the Web Crypto API.

## Features

- **Decode** — Paste a JWT to see decoded header, payload, and registered claims with human-readable timestamps
- **Encode** — Build JWTs with custom headers, payload claims, and HMAC signing secrets
- **Verify** — Verify HMAC signatures (HS256/HS384/HS512) against a secret key
- **Inspector** — Deep inspection of algorithm, validity status, timestamps, and raw structure

## Tech Stack

React 19 · MUI 9 · Tailwind CSS 4 · TypeScript 6 · Vite 8

## Getting Started

```bash
npm install
npm run dev
```

## Security

All JWT operations happen entirely in-browser. No tokens are sent to any server.

## License

MIT © [srckit-org](https://github.com/srckit-org)
