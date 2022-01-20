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
