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
    export BROWSERSTACK_PROJECT_NAME="plio"
    ```

3. Once the env variables are added, restart your terminal or run one of the following command:
    ```sh
    source ~/.bash_profile
    # or
    source ~/.zshrc
    ```
4. To run a test case locally, execute the following command from the project root folder:
    ```sh
    # chrome
    testcafe browser ./path/to/test.spec.js

    # example
    testcafe chrome ./tests/integration/integration/login/login-hi.spec.js
    ```
5. To list all the browsers available, run the following command:
    ```sh
    testcafe --list-browsers
    ```


### Environment variables
#### `BROWSERSTACK_BASE_URL`
The base url of the application to be registered with BrowserStack. Should be the frontend application URL.

#### `BROWSERSTACK_USERNAME`
Required to connect to your BrowserStack account. Get this information from your BrowserStack account settings.

#### `BROWSERSTACK_ACCESS_KEY`
Required to connect to your BrowserStack account. Get this information from your BrowserStack account settings.

#### `BROWSERSTACK_PROJECT_NAME`
Name of the BrowserStack project. Set to `plio`. It allows to name the build, which is useful for keeping track of test runs on the BrowserStack dashboard.
