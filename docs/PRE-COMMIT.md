## Pre-commit
Plio utilizes the power of pre-commit to identify simple programming issues at the time of code check-in. This helps the reviewer to focus more on architectural and conceptual issues and reduce the overall time to market.

The pre-commit configurations are stored in [.pre-commit-config.yaml](../.pre-commit-config.yaml) file.

To know about the syntax, visit the [official documentation site](https://pre-commit.com/).

The pre-commit hook in this repository uses various plugins to run different kinds of checks.

1. [Pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks): Checks and fixes basic linting issues. All available hooks for pre-commit can be found [here](https://github.com/pre-commit/pre-commit-hooks#hooks-available).

2. [Prettier mirror](https://github.com/pre-commit/mirrors-prettier): Checks for code formatting issues within Javascript files and fixes if errors found, like indentation, extra lines and spaces, invalid syntax, etc .

#Installation
1.Install pre-commit package manager
    pip install pre-commit

2.For all the three repositories, run the command:
    pre-commit .