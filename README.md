# srckit-jwt

<p align="center">
  <strong>Decode, encode, verify, and inspect JSON Web Tokens — entirely in your browser.</strong>
</p>

<p align="center">
  <a href="https://jwt.srckit.org">Live Demo</a> ·
  <a href="https://github.com/srckit-org/srckit">SrKit Suite</a> ·
  <a href="https://github.com/srckit-org/srckit-jwt/issues">Report Bug</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/MUI-9-007FFF?style=flat-square&logo=mui&logoColor=white" alt="MUI 9" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/github/license/srckit-org/srckit-jwt?style=flat-square" alt="License" />
</p>

---

## Overview

srckit-jwt is a free, open-source developer tool that lets you work with JSON Web Tokens (JWTs) directly in your browser. No server required — all operations use the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for secure, client-side processing.

Whether you're debugging authentication tokens, building JWT-based APIs, or learning how JWTs work, srckit-jwt provides everything you need in one clean interface.

## Features

### Decode JWT
Paste any JWT and instantly see:
- **Header** — algorithm, token type, key ID
- **Payload** — all claims with human-readable timestamps
- **Registered Claims** — issuer, subject, audience, expiration, not-before, issued-at
- **Custom Claims** — any additional data in the token
- **Raw Parts** — base64url-encoded segments
- **Validity Status** — expired, not-yet-valid, or active

### Encode JWT
Build tokens from scratch:
- Choose algorithm (HS256, HS384, HS512, none)
- Add registered claims (iss, sub, aud, exp, nbf, iat)
- Add custom key-value claims
- Sign with HMAC secret
- Copy the complete token

### Verify JWT
Validate token signatures:
- Supports HS256, HS384, HS512 algorithms
- Enter your secret key
- Instant verification with clear pass/fail status
- View token details alongside verification result

### Inspect JWT
Deep inspection of any token:
- **Structure** — visual breakdown of header, payload, signature
- **Algorithm** — full algorithm details and compatibility info
- **Timestamps** — issued-at, expiration, not-before with relative time
- **Validity** — comprehensive status checks
- **Full JSON** — complete decoded output

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommended: 20+)
- [npm](https://www.npmjs.com/) 9+ or [yarn](https://yarnpkg.com/) 1.22+

### Installation

```bash
# Clone the repository
git clone https://github.com/srckit-org/srckit-jwt.git

# Navigate to the project
cd srckit-jwt

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
srckit-jwt/
├── public/
├── src/
│   ├── components/
│   │   ├── JWTDecode.tsx        # Decode tab component
│   │   ├── JWTEncode.tsx        # Encode tab component
│   │   ├── JWTVerify.tsx        # Verify tab component
│   │   └── JWTInspector.tsx     # Inspector tab component
│   ├── utils/
│   │   └── jwtUtils.ts         # JWT utility functions
│   ├── App.tsx                  # Main app with tab navigation
│   ├── index.css                # Global styles
│   └── main.tsx                 # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI framework |
| [MUI 9](https://mui.com/) | Material Design components |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [TypeScript 6](https://www.typescriptlang.org/) | Type safety |
| [Vite 8](https://vitejs.dev/) | Build tool and dev server |
| [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | Client-side JWT signing/verification |

## Security

- **No server communication** — all JWT operations happen in your browser
- **No data storage** — tokens are never saved or transmitted
- **Web Crypto API** — uses native browser cryptographic functions
- **Open source** — fully auditable code

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for new features
- Test your changes across browsers
- Update documentation if needed

## Related Projects

Part of the [srckit](https://github.com/srckit-org/srckit) developer tools suite:

| Tool | Description |
|------|-------------|
| [srckit-regex](https://github.com/srckit-org/srckit-regex) | Test, match, replace, and learn regex |
| [srckit-echo](https://github.com/srckit-org/srckit-echo) | HTTP request echo & response builder |
| [srckit-json](https://github.com/srckit-org/srckit-json) | Format, validate, query & sort JSON |
| [srckit-headers](https://github.com/srckit-org/srckit-headers) | Inspect, parse & reference HTTP headers |
| [srckit-cors](https://github.com/srckit-org/srckit-cors) | Test, understand & debug CORS |

[View all 25 tools →](https://github.com/orgs/srckit-org/repositories)

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## Author

Built with ❤️ by [srckit-org](https://github.com/srckit-org)

---

<p align="center">
  <sub>If this tool helped you, consider giving it a ⭐ on GitHub!</sub>
</p>
