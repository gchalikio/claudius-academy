# Security Policy

Claudius Academy is a static, client-side presentation engine. There is no
backend, no authentication, and no server-side state. The only realistic
risk surface is:

- **Untrusted HTML in slide content.** Slide builders accept HTML strings
  for `body`, `left`, `right`, etc. If you build a deck from third-party
  input, sanitize it before passing it in — the engine does not.
- **Dev dependency vulnerabilities.** `@playwright/test` (used only for
  testing) is the sole dev dependency. Dependabot is configured to open
  weekly PRs for upgrades.

## Supported versions

Only the latest tagged release on `main` receives fixes. Older versions are
unsupported.

| Version        | Supported |
| -------------- | --------- |
| `main`         | yes       |
| latest tag     | yes       |
| anything older | no        |

## Reporting a vulnerability

**Please do not file a public issue for security problems.** Instead:

1. Open a private security advisory on GitHub:
   `Security` tab → `Advisories` → `New draft security advisory`
2. Or email the maintainer at `chalikiopoulosgr@gmail.com`.

You'll get an acknowledgement within 7 days. If the issue is confirmed, a
fix will be prepared in a private branch and disclosed coordinately.
