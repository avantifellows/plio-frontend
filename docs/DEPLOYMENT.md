## Deployment
This document covers steps on setting up this repository on various cloud hosting providers.

  - [AWS](#aws)
    - [Pre-requisites](#pre-requisites)
    - [Deployment steps](#deployment-steps)

### AWS

#### Pre-requisites
- Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).
- Set up `plio-s3-bot` on your local.
    ```sh
    aws configure --profile plio-s3-bot
    ```

#### Deployment steps

##### Staging
```sh
yarn deploy-staging
```

##### Production
```sh
yarn deploy
```
