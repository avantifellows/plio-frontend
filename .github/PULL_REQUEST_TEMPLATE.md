<!--
  Thanks for submitting a pull request!
  We appreciate you spending the time to work on these changes. Please provide enough information so that others can review your pull request.

  Before submitting a pull request, please make sure the following is done:

  1. Fork [the repository](https://github.com/avantifellows/plio-frontend) and create your branch from `master`.
  2. Run the installation steps from the project's [README.md](https://github.com/avantifellows/plio-frontend#readme).
  3. Please ensure coding standard and conventions are followed. You can find the details at https://vuejs.org/v2/style-guide/#Priority-A-Rules-Essential-Error-Prevention.
  4. Ensure that an issue has been created for the problem this PR attempts to solve and your Pull Request is linked to the issue. Read more how to link PR to an issue at https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue.

-->

Fixes #{issue id}

## Summary

<!-- Explain the **motivation** for making this change. What existing problem does the pull request solve? -->

## Test Plan

<!-- Demonstrate that the code is solid. Example: The exact commands you ran and their output, screenshots / videos if the pull request changes the user interface. -->
- [ ] Test Responsiveness
   - [ ] Laptop (1200px)
   - [ ] Tablet (760px)
   - [ ] Phone (320px)
- [ ] Cross-Browser Testing
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari (use BrowserStack)
- [ ] Local Language Support
- [ ] Hygiene and Housekeeping
   - [ ] Self-review
   - [ ] Comments have been added appropriately
   - [ ] Check for bundle size [here](https://bundlephobia.com/) if adding a package
   - [ ] Added relevant details like Labels/Projects/Milestones etc.
   - [ ] If adding or removing any new environment variable:
       - [ ] update `docs/ENV.md`
       - [ ] update Github Workflow files
       - [ ] update DockerFile
       - [ ] update the secrets for staging and production
- [ ] Testing
   - [ ] Wrote tests
   - [ ] Tested locally
   - [ ] Tested on staging
   - [ ] Tested on an actual physical phone
   - [ ] Tested on production
- [ ] Lighthouse Checks
   - [ ] Images have `alt` attributes
   - [ ] Any `<img>` tags have `width` and `height` specified
   - [ ] Any `target="_blank"` links have `rel="noopener"`
   - [ ] Only SVGs are used as images. If PNGs are used, their size has been optimised.
   - [ ] Any SVGs without text have their `aria-label` attributes set
