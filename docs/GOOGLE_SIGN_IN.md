# Member sign-in with Google

Members (the public) sign in with Google to read full guidance articles and
submit journey forms. Staff keep using `/admin/login` with email + password;
a Google login can never take over a staff account.

## 1. Create OAuth credentials

1. Open <https://console.cloud.google.com/>, select or create a project.
2. **APIs & Services → OAuth consent screen**: choose *External*, set the app
   name, support email and the scopes `openid`, `email`, `profile`.
   While the app is in *Testing*, only listed test users can sign in;
   publish it before launch.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   type **Web application**.
4. **Authorised redirect URIs** — add one per environment, exactly:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://<your-domain>/auth/google/callback` (production)
5. Copy the client ID and secret.

## 2. Configure the server

Set these environment variables (never commit them):

```
SITE_URL="https://<your-domain>"      # must match the redirect URI host
GOOGLE_CLIENT_ID="…apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="…"
```

Restart the app. Without both Google variables the sign-in button is hidden
and `/auth/google/start` redirects to `/signin?error=not_configured`.

## How it works

- `GET /auth/google/start?next=/visit/…#continue` creates a random `state` and
  a PKCE verifier, stores them in a 10-minute httpOnly cookie scoped to
  `/auth/google`, and redirects to Google.
- `GET /auth/google/callback` checks `state`, exchanges the code (with the PKCE
  verifier) server-to-server, reads the profile from Google's userinfo
  endpoint and requires a **verified** email.
- The user is matched by Google ID, then by email (non-staff only), otherwise a
  new account with the **Member** role is created (no password, no admin access).
- A normal database session cookie (`ak_session`) is created and the user is
  sent back to `next` (same-site paths only; `/admin` and open redirects are refused).
- Sign out: `POST /auth/logout`.

## Data stored

Email, name, Google account ID (`googleSub`) and avatar URL. Nothing else from
Google is kept; access tokens are discarded after the profile request.
