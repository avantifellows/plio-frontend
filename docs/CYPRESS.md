## Cypress
This guide aims to share how Cypress is being used in Plio for performing E2E and integration tests.

### Running the tests locally
Run the following command to run the Cypress tests. Make sure the Plio Frontend, Plio Backend and Plio Analytics applications are running on your local Docker.
```sh
npx cypress open
```

Run Cypress in headless mode:
```sh
npx cypress run
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
##### `auth_google_refresh_token`
Google refresh token retrieved in the pre-requisites.

##### `auth_google_client_id`
Google client ID retrieved in the pre-requisites.

##### `auth_google_client_secret`
Google client secret retrieved in the pre-requisites.

##### `plio_backend_convert_social_auth_token_url`
The convert token URL in the Plio backend repo that converts the Social Auth Token and returns a valid Django Auth Token. By default, the value is `http://0.0.0.0:8001/auth/convert-token`.

##### `plio_backend_client_id`
The client id for backend API application.

##### `plio_backend_client_secret`
The client secret for backend API application.


### Cypress Dashboard
The Cypress Dashboard is a web interface that allows you to run and debug your Cypress tests. To integrate Cypress Dashboard with your local integration tests, follow the steps below:
1.  Create an account in [Cypress Dashboard](https://dashboard.cypress.io/).
2.  Create a project if not already exists.
3.  Get the projectId from project settings page and replace the `projectId` in `cypress.json` with the projectId.
4.  Get the Cypress Record Key from project settings page.
5.  Run the following command. This will record the integration tests and upload the results to the Cypress Dashboard.
    ```sh
    npx cypress run --record --key your_cypress_key
    ```

### Continuous Integration
The file [integration-testing.yml](../.github/workflows/integration-testing.yml) is used to run the integration tests in GitHub Actions.
To set up CI, follow the steps below:
1. Create a new GitHub Environment and name it `Integration Testing`.
2. Add the following variables to the GitHub environment:
   1. Cypress Dashboard - Refer Cypress Dashboard section above
      1. `CYPRESS_RECORD_KEY`
   2. Plio Analytics (CubeJS) - Refer [Plio Analytics ENV guide](https://github.com/avantifellows/plio-analytics/blob/master/docs/ENV.md)
      1. `CUBEJS_API_SECRET`
   3. Plio Frontend (Cypress) - Refer Frontend Cypress ENV guide above
      1. `CYPRESS_AUTH_GOOGLE_CLIENT_ID`
      2. `CYPRESS_AUTH_GOOGLE_CLIENT_SECRET`
      3. `CYPRESS_AUTH_GOOGLE_REFRESH_TOKEN`
      4. `CYPRESS_PLIO_BACKEND_CONVERT_SOCIAL_AUTH_TOKEN_URL`
   4. Plio Frontend (VueJS) - Refer [Plio Frontend ENV guide](../docs/ENV.md)
      1. `VUE_APP_BACKEND_API_CLIENT_ID`
      2. `VUE_APP_BACKEND_API_CLIENT_SECRET`
      3. `VUE_APP_GOOGLE_CLIENT_ID`
   5. Plio Backend (Django) - Refer [Plio Backend ENV guide](https://github.com/avantifellows/plio-backend/blob/master/docs/ENV.md)
      1. `DJANGO_DEFAULT_OAUTH2_CLIENT_ID`
      2. `DJANGO_DEFAULT_OAUTH2_CLIENT_SECRET`
      3. `DJANGO_DEFAULT_OAUTH2_CLIENT_SETUP`
      4. `DJANGO_GOOGLE_OAUTH2_CLIENT_ID`
      5. `DJANGO_GOOGLE_OAUTH2_CLIENT_SECRET`
      6. `DJANGO_SECRET_KEY`
