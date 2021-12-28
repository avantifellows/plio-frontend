## Cypress
This guide aims to share how TestCafe is being used in Plio for performing E2E and integration tests.

### Pre-requisites
```sh
npm i -g testcafe testcafe-browser-provider-browserstack
export BROWSERSTACK_BASE_URL="http://localhost:8080"
export BROWSERSTACK_USERNAME="" # Your BrowserStack username
export BROWSERSTACK_ACCESS_KEY="" # Your BrowserStack access key
export BROWSERSTACK_LOCAL_IDENTIFIER="TestCafe"
export BROWSERSTACK_USE_AUTOMATE="1"
export BROWSERSTACK_PROJECT_NAME="plio"
export BROWSERSTACK_BUILD_ID="plio"
export GOOGLE_ACCOUNT_EMAIL="" # Your Google account email
export GOOGLE_ACCOUNT_PASSWORD="" # Your Google account password
```
