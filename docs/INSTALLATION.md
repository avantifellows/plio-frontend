## Installation


### Pre-requisites
1. Install [nodeJs](https://nodejs.org/en/), [vue-cli](https://cli.vuejs.org/guide/installation.html) and [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable).

#### Development only
1. Install pre-commit
    #### macOS
    Using homebrew
    ```sh
    brew install pre-commit
    ```

### Installation steps
Follow the steps below to set up the repo for development
1. Clone the repository and change the working directory
    ```sh
    git clone https://github.com/avantifellows/plio-frontend.git
    cd plio-frontend
    ```
2. Install the dependencies
    #### Development
    ```sh
    npm install
    ```

    #### Production
    ```sh
    npm install --production
    ```
3. For **development** only, run the following command to install pre-commit
    ```sh
    pre-commit install
    ```
4. Run the vue ui
    ```sh
    vue ui
    ```
   This will start a local server from where the project can be served locally, or deployed to dev/staging.

   **NOTE** - The project will be up and running with this method but you'll have to start the backend service and the API layer service locally as well to get it working fully.
