## GitHub workflows
Plio development ensures the best coding standards are followed and proper checks are measured when a code change gets published.

Here's a summary of all the GitHub workflows (or GitHub actions) this repository contains:

  - [Pre-commit](#pre-commit)
  - [Test cases](#test-cases)
  - [End-to-end testing](#end-to-end-testing)


### Pre-commit
The `pre-commit` job inside the [CI GitHub Action](../.github/workflows/ci.yml) checks for basic linting and coding errors on anything that got merged or is proposed to merge (through Pull Request) into the `main` branch.

For more details about pre-commit action, visit [pre-commit/action](https://github.com/pre-commit/action)

For more details on GitHub actions, visit [GitHub Actions docs](https://docs.github.com/en/actions)


### Test cases
The `test-cases` job inside the [CI GitHub Action](../.github/workflows/ci.yml) runs the test cases within the codebase. After the test cases have been executed, it then also uploads the coverage report to [CodeCov](https://codecov.io/gh/avantifellows/plio-frontend).


### End-to-End testing
Plio uses Playwright for browser-level end-to-end journeys. Frontend pull requests,
scheduled runs, and manual runs enter through
[`e2e-pr.yml`](../.github/workflows/e2e-pr.yml), which calls the reusable
[`e2e.yml`](../.github/workflows/e2e.yml) workflow. The backend repository calls
the same reusable workflow for its pull requests.

Each run resolves the matching sibling branch or falls back to `main`, starts a
fresh frontend/backend stack, seeds it, runs four Playwright shards, and enforces
the committed 9/9 journey manifest. See the
[End-to-End Testing guide](./END-TO-END-TESTING.md) for local and CI usage.
