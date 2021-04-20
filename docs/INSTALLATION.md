## Installation

- [Pre-requisites](#pre-requisites)
  - [Docker](#docker)
  - [Pre-commit](#pre-commit)
- [Installation steps](#installation-steps)

### Pre-requisites
#### Docker
Download docker for your operating system: https://docs.docker.com/get-docker/

#### Pre-commit
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
2. Make sure Docker Desktop application is running and docker version is giving a proper output.
    ```sh
    docker --version
    ```
3. Set up your `.env` file by copying `.env.example` file
    ```sh
    cp .env.example .env
    ```
4. Update environment variables in your `.env` file based on your environment. For all available settings, see our [Environment variables guide](ENV.md).
5. Build the docker image and run the containers using just one command:
    ```sh
    docker-compose up -d --build
    ```
6. For **development** only, run the following command to install pre-commit
    ```sh
    pre-commit install
    ```
7.  Your frontend app should be accessible at http://localhost:8080.

    **NOTE** - The project will be up and running with this method but you'll have to start the backend service and the API layer service locally as well to get it working fully.
