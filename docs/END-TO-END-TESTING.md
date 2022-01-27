## TestCafe
This guide aims to share how TestCafe is being used in Plio for performing End-to-End (E2E) and integration tests.

#### End-to-End (E2E) Testing
End-to-End testing sits on top of integration testing. While integration testing is limited to check integration between two functional components, end-to-end testing is more focused on the whole application and integration of several components together in an end-to-end workflow.
End-to-End testing generally mimics the user behavior on an actual browser and the actions they may take while using the application.

#### BrowserStack
Plio uses BrowserStack to enable automated End-to-End cross-browser and cross-OS testing.
[BrowserStack](https://www.browserstack.com/) is a cloud-based service that provides a virtual browser for testing web application. It is a free service that allows you to test your web application on a variety of devices and browsers.
Plio's [Continuous Integration workflow](../.github/workflows/ci.yml) runs the E2E tests on the following operating systems and browsers using BrowserStack:
1. Chrome v96 (Windows 10, OSX Big Sur, OSX Catalina)
2. Firefox v95 (Windows 10, OSX Big Sur, OSX Catalina)
3. Edge v96 (Windows 10)
4. Safari v14.1 (OSX Big Sur)
5. Safari v13.1 (OSX Catalina)


### Pre-requisites
For login, Plio uses Google OAuth Playground Authentication to mimic the exact user behavior on Google Login functionality. Google OAuth credentials will be required to run the test cases that require login.

Follow the links below one-by-one to retrieve required information from Google:
1. [Google Project and Application Setup](https://docs.cypress.io/guides/testing-strategies/google-authentication#Google-Developer-Console-Setup)
2. [Using the Google OAuth 2.0 Playground to Create Testing Credentials](https://docs.cypress.io/guides/testing-strategies/google-authentication#Using-the-Google-OAuth-2-0-Playground-to-Create-Testing-Credentials)

### Installation
1. Install TestCafe for BrowserStack globally:
    ```sh
    npm i -g testcafe testcafe-browser-provider-browserstack
    ```

2. Add the following env variables to your `~/.bash_profile` or `~/.zshrc` file:
    ```sh
    export BROWSERSTACK_BASE_URL="http://localhost:8080"
    export BROWSERSTACK_USERNAME="" # Your BrowserStack username
    export BROWSERSTACK_ACCESS_KEY="" # Your BrowserStack access key
    export BROWSERSTACK_PROJECT_NAME="plio"
    ```

3. Once the env variables are added, restart your terminal or run one of the following command:
    ```sh
    source ~/.bash_profile
    # or
    source ~/.zshrc
    ```

### Getting started
1. To run a test case locally, execute the following command from the project root folder:
    ```sh
    # syntax
    testcafe browser ./path/to/test.spec.js

    # example
    testcafe chrome ./tests/integration/integration/login/login-hi.spec.js
    ```
2. To list all the browsers available, run the following command:
    ```sh
    # command to see local browsers
    testcafe --list-browsers

    # command to see BrowserStack browsers
    testcafe -b browserstack
    ```


### Environment variables
Setup the following environment variables in your `~/.bash_profile` or `~/.zshrc` file if you're trying to run testcafe locally with BrowserStack. Also, set them up on Continuous Integration environment using GitHub secrets.

#### `BROWSERSTACK_BASE_URL`
The base url of the application registered with BrowserStack. Should be the frontend application URL.

#### `BROWSERSTACK_USERNAME`
Required to connect to your BrowserStack account. Get this information from your BrowserStack account settings.

#### `BROWSERSTACK_ACCESS_KEY`
Required to connect to your BrowserStack account. Get this information from your BrowserStack account settings.

#### `BROWSERSTACK_PROJECT_NAME`
Name of the BrowserStack project. Set to `plio`. It allows to name the build, which is useful for keeping track of test runs on the BrowserStack dashboard.

### Environment variables (only for Continuous Integration)
The following environment variables are only required for Continuous Integration environment. These are used to install and build the Frontend and Backend application. Set these up using GitHub secrets.
These are not needed locally as these are already set up in respective `.env` files for the Frontend and Backend projects.

#### `GOOGLE_OAUTH2_CLIENT_ID`
Google refresh token retrieved in the pre-requisites.

#### `GOOGLE_OAUTH2_CLIENT_SECRET`
Google client ID retrieved in the pre-requisites.

#### `GOOGLE_OAUTH2_REFRESH_TOKEN`
Google client secret retrieved in the pre-requisites.

#### `BACKEND_CONVERT_SOCIAL_AUTH_TOKEN_URL`
The convert token URL in the Plio backend repo that converts the Social Auth Token and returns a valid Auth Token. By default, the value is http://0.0.0.0:8001/auth/convert-token.

#### `BACKEND_DEFAULT_OAUTH2_CLIENT_ID`
The client id for Plio backend application.

#### `BACKEND_DEFAULT_OAUTH2_CLIENT_SECRET`
The client secret for Plio backend application.

#### `BACKEND_SECRET_KEY`
This variable sets the secret key for the backend application so that it can be installed properly.
