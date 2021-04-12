## Installation

- [Pre-requisites](#pre-requisites)
  - [Development](#development)
- [Installation steps](#installation-steps)

### Pre-requisites
1. Install [nodeJs](https://nodejs.org/en/), [vue-cli](https://cli.vuejs.org/guide/installation.html) and [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable).

#### Development
1. Install pre-commit
    Use `pip` to install pre-commit
    ```sh
    pip install pre-commit
    ```

    Or using homebrew on macOS
    ```sh
    brew install pre-commit
    ```

    For more installation alternatives, check out [Pre-commit official documentation](https://pre-commit.com/#install).
2. Verify pre-commit installation
    ```sh
    pre-commit --version
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
4. Set up your `.env` file by copying `.env.example` file
    ```sh
    cp .env.example .env
    ```
5. Update environment variables in your `.env` file based on your environment. You can read the docs mentioned at [Contributing](../README.md#contributing) to understand more about the environment variables and their significance.
6. Run the vue ui
    ```sh
    vue ui
    ```
   This will start a local server from where the project can be served locally, or deployed to dev/staging.

   **NOTE** - The project will be up and running with this method but you'll have to start the backend service and the API layer service locally as well to get it working fully.
