## Cypress
This guide aims to share how TestCafe is being used in Plio for performing E2E and integration tests.

### Pre-requisites
1. Run TestCafe for BrowserStack globally:
    ```sh
    npm i -g testcafe testcafe-browser-provider-browserstack
    ```

2. Add the following env variables to your `~/.bash_profile` or `~/.zshrc` file:
    ```sh
    export BROWSERSTACK_BASE_URL="http://localhost:8080"
    export BROWSERSTACK_USERNAME="" # Your BrowserStack username
    export BROWSERSTACK_ACCESS_KEY="" # Your BrowserStack access key
    export BROWSERSTACK_LOCAL_IDENTIFIER="TestCafe"
    export BROWSERSTACK_USE_AUTOMATE="1"
    export BROWSERSTACK_PROJECT_NAME="plio"
    export BROWSERSTACK_BUILD_ID="plio"
    ```

3. Once the env variables are added, restart your terminal or run one of the following command:
    ```sh
    source ~/.bash_profile
    # or
    source ~/.zshrc
    ```


### Environment variables
#### `BROWSERSTACK_BASE_URL`
The base url of the application to be registered with BrowserStack. Should be the frontend application URL.

#### `BROWSERSTACK_USERNAME`
Required to connect to your BrowserStack account. Get this information from your BrowserStack account settings.

#### `BROWSERSTACK_ACCESS_KEY`
Required to connect to your BrowserStack account. Get this information from your BrowserStack account settings.

#### `BROWSERSTACK_LOCAL_IDENTIFIER`
BrowserStack supports several End-to-End (E2E) testing environments. This variable is used to identify the environment. In our case, the value should be `TestCafe`.

#### `BROWSERSTACK_USE_AUTOMATE`
We're using BrowserStack Automate feature that allows for much longer tests execution time and additional features. This should be set to `1`.
[Click here](https://www.browserstack.com/docs/automate/selenium/getting-started/nodejs/testcafe#executing-tests-on-browserstack) for more details.

#### `BROWSERSTACK_PROJECT_NAME`
Name of the BrowserStack project. Set to `plio`. It allows to name the build, which is useful for keeping track of test runs on the BrowserStack dashboard.

#### `BROWSERSTACK_BUILD_ID`
Build id for the test execution. Set to `plio`. It allows to give a name to your build which helps to keep track of a test session.
