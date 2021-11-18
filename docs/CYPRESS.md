## Cypress
This guide aims to share how Cypress is being used in Plio for performing E2E and integration tests.

### Running the tests locally
Run the following command to run the Cypress tests. Make sure the Plio Frontend, Plio Backend and Plio Analytics applications are running on your local Docker.
```sh
npx cypress open
```

The default `baseUrl` for Cypress is `http://localhost:8080` defined it in `cypress.json`. If you want to use a separate baseUrl, simply modify your cypress command:
```sh
CYPRESS_BASE_URL=https://staging.app.com npx cypress open
```

After running the above command, you will see the cypress window. You can select to run all tests or select one. In any case, once the tests start, you will see the UI tests in a separate browser window.

### Pre-requisites
For login, Plio uses Cypress Google Authentication to mimic the exact user behavior on Google Login functionality. Google OAuth credentials will be required to run the cypress test cases that require login.

Follow the links below one-by-one to retrieve required information from Google:

1. [Google Project and Application Setup](https://docs.cypress.io/guides/testing-strategies/google-authentication#Google-Developer-Console-Setup)
2. [Using the Google OAuth 2.0 Playground to Create Testing Credentials](https://docs.cypress.io/guides/testing-strategies/google-authentication#Using-the-Google-OAuth-2-0-Playground-to-Create-Testing-Credentials)

### Setup
Plio uses `cypress.env.json` to set up environment variables for the Cypress app. To configure your local setup for Cypress, only the following steps are needed:
1. Set up the Plio Frontend, Plio Backend and Plio Analytics applications on your local Docker.
2. Copy `cypress.env.example.json` and rename it as `cypress.env.json`
3. Update the JSON object in `cypress.env.json` by setting the correct configurations - see below.

#### Cypress ENV variables
 Below are the details of all the environment variables.
#### `google_auth.refresh_token`
Google refresh token retrieved in the pre-requisites.

#### `google_auth.client_id`
Google client ID retrieved in the pre-requisites.

#### `google_auth.client_secret`
Google client secret retrieved in the pre-requisites.

#### `plio_backend.convert_social_auth_token_url`
The convert token URL in the Plio backend repo that converts the Social Auth Token and returns a valid Django Auth Token. By default, the value is `http://0.0.0.0:8001/auth/convert-token`.

#### `plio_backend.client_id`
The client id for backend API application.

#### `plio_backend.client_secret`
The client secret for backend API application.
