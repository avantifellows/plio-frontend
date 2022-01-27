## GitHub workflows
Plio development ensures the best coding standards are followed and proper checks are measured when a code change gets published.

Here's a summary of all the GitHub workflows (or GitHub actions) this repository contains:

  - [Pre-commit](#pre-commit)
  - [Test cases](#test-cases)
  - [End-to-end testing](#end-to-end-testing)


### Pre-commit
The `pre-commit` job inside the [CI GitHub Action](../.github/workflows/ci.yml) checks for basic linting and coding errors on anything that got merged or is proposed to merge (through Pull Request) into the `master` branch.

For more details about pre-commit action, visit [pre-commit/action](https://github.com/pre-commit/action)

For more details on GitHub actions, visit [GitHub Actions docs](https://docs.github.com/en/actions)


### Test cases
The `test-cases` job inside the [CI GitHub Action](../.github/workflows/ci.yml) runs the test cases within the codebase. After the test cases have been executed, it then also uploads the coverage report to [CodeCov](https://codecov.io/gh/avantifellows/plio-frontend).


### End-to-End testing
Plio uses TestCafe + BrowserStack to run end-to-end tests. Full details about how it works has been documented in [End-to-End Testing guide](./END-TO-END-TESTING.md).

End-to-End testing requires the Plio apps to be running and available at their respective localhost URLs. To set up Plio applications (Frontend, Backend and Analytics), we do the following:
1. Clone the Plio Frontend and switch to the branch that triggered the workflow
2. Configure environment variables using GitHub secrets
3. Run `docker-compose` command
4. Repeat steps 1-3 for the Plio Backend and Plio Analytics

After the docker containers are up & running, the TestCafe BrowserStack plugin is installed and then run the end-to-end tests.
