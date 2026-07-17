# End-to-End Testing

The browser suite uses Playwright and covers the nine journeys declared in
`tests/e2e/journeys.json`.

## Run Locally

Install dependencies, start the backend at `http://localhost:8001`, and provide
the Google test-account credentials in the environment:

```sh
export GOOGLE_OAUTH2_CLIENT_ID=...
export GOOGLE_OAUTH2_CLIENT_SECRET=...
export GOOGLE_OAUTH2_REFRESH_TOKEN="$(cat ~/.plio-e2e-refresh-token)"
npm run seed:e2e
npm run test:e2e
```

`npm run seed:e2e` is idempotent. It creates the `e2e` and `e2e-alt`
workspaces, creator memberships, and the learner/plio fixtures. The single test
command starts the frontend on port 8080 or reuses an already-running frontend.

Run one journey by passing its filename or title to Playwright:

```sh
npm run test:e2e -- creator-golden-path
```

## Real Playback

CI drives the Player through the committed playback-state hook because hosted
runners cannot reliably play YouTube video. Run the true video variants locally
with the `@real-playback` tag:

```sh
npm run test:e2e -- --project=chromium --grep @real-playback
```

The Playwright configuration enables autoplay for this local lane. These tests
are excluded on GitHub Actions.

## CI Topology

Frontend pull requests use `.github/workflows/e2e-pr.yml`; backend pull requests
use a thin caller in `plio-backend`. Both call the reusable frontend workflow at
`.github/workflows/e2e.yml`.

The workflow pairs the triggering branch with the same-named branch in the
sibling repository, falling back to `main` when it does not exist. The resolved
branch pairing is printed in the job summary. Four shards each boot an ephemeral
frontend/backend stack with a fresh database, seed it, run Chromium, and tear it
down. The manifest check fails unless every required journey has a green result
and reports the count beside the pairing.

## Quarantine Policy

Add `@quarantine` to a spec title only after evidence that the same commit failed
and later passed unchanged. Pull requests report quarantined results separately
without blocking merge. Scheduled and manually dispatched runs treat the same
tests as blocking.

Remove the tag after fixing the cause and observing a green unchanged nightly
run. Do not quarantine a consistently failing spec. The workflow implementation
is in [e2e.yml](../.github/workflows/e2e.yml).

## Google Refresh Token

The e2e secret set is only `GOOGLE_OAUTH2_CLIENT_ID`,
`GOOGLE_OAUTH2_CLIENT_SECRET`, and `GOOGLE_OAUTH2_REFRESH_TOKEN`. Re-mint the
refresh token after rotation or revocation; the procedure takes about five
minutes:

1. Open GCP project `plio-298804` ("Plio", project number `865363153324`) and
   select the OAuth client beginning `865363153324-`. Its authorized redirect
   URIs must include `https://developers.google.com/oauthplayground`.
2. Confirm Google Auth Platform > Audience is **In production**.
3. Sign into a browser as `plio.e2e.user@gmail.com`, open
   [OAuth Playground](https://developers.google.com/oauthplayground), open the
   settings gear, enable **Use your own OAuth credentials**, and enter the client
   ID and secret from `plio-backend/.env`.
4. Enter scopes
   `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`,
   authorize as the test account, exchange the authorization code, and copy the
   refresh token.
5. Update GitHub and the canonical local copy:

   ```sh
   gh secret set GOOGLE_OAUTH2_REFRESH_TOKEN -R avantifellows/plio-frontend
   printf '%s' '<refresh-token>' > ~/.plio-e2e-refresh-token
   chmod 600 ~/.plio-e2e-refresh-token
   ```
