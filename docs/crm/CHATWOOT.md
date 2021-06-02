## Chatwoot
Plio uses [Chatwoot](https://github.com/chatwoot/chatwoot) as it's customer engagement suite. This document covers steps by step details on how to get the chatwoot app running and integrated into the frontend.

### Deploying the chatwoot app on Heroku
1. Use the [one click deploy button](https://www.chatwoot.com/docs/self-hosted/deployment/heroku#deploying-on-heroku) provided by the Chatwoot team to deploy the app on Heroku free of cost.

### Setting up an SMTP server (using SendGrid)
1. Once the app is deployed, set up a mailer service (eg. an SMTP server) to relay the emails between your app and your users. Please follow the [Email Configuration guide](https://www.chatwoot.com/docs/self-hosted/configuration/environment-variables#configure-emails) by ChatWoot.
2. Sign up on [SendGrid](https://www.sendgrid.com).
3. Head over to the **Sender Authentication** section inside **Settings** on your SendGrid homepage. Here you will need to authenticate your domain from which emails will be sent.
4. Select your DNS host. Plio uses *Cloudflare*. Enter your domain on the next screen. eg. `plio.in`
5. In the next screen, you'll be presented with a few records (key value pairs), depending on the DNS host you chose. Navigate to your DNS host's homepage and add these records. After this, your domain will be authenticated by SendGrid.
6. Navigate to your deployed app on the Heroku homepage, go to **Settings** then click on **Reveal config vars**. This will pop up a list of env variables. Add the following as an env variable
    ```
    MAILER_SENDER_EMAIL : <any-email>@<your-domain.com>
    ```
    Here, the domain should be the one that was authenticated by you for SendGrid.
7. Set up an API key so that the Chatwoot app can authorise and connect to the Sendgrid server. Navigate to **API Keys** in **Settings** tab on your SendGrid home. Click **Create API Key** on top right. You can name the key whatever you want. Clicking **Create and View** will create your api key and show you the key.
8. Copy the key and set it as an environment variable in your heroku app as shown below.
    ```
    SMTP_USERNAME=apikey
    SMTP_PASSWORD=<your Sendgrid API key>
    ```
9. Other environment variables can be configured as mentioned in the [Email Configuration guide](https://www.chatwoot.com/docs/self-hosted/configuration/environment-variables#configure-emails) by Chatwoot. The necessary variables are mentioned below
    ```
    SMTP_ADDRESS=smtp.sendgrid.net
    SMTP_AUTHENTICATION=plain
    SMTP_DOMAIN=<your verified domain>
    SMTP_ENABLE_STARTTLS_AUTO=true
    SMTP_PORT=587
    ```


### Setting up cloud storage

1. Follow [this](https://www.chatwoot.com/docs/self-hosted/deployment/storage/supported-providers) guide to set up a storage service for your app and update the environment variables in your deployed Heroku app.
    - **Is this really needed?** Heroku has an "ephemeral" hard disk. The files uploaded to Chatwoot would not persist after the application is restarted. By default, Chatwoot uses local disk as the upload destination. To overcome this problem, you will have to configure a cloud storage.

### Setting up the Chatwoot client
1. Head over to your deployed app eg. `xyz.herokuapp.com` and create a new account. This will be the Administrator account.
2. You will recieve a verification mail on your email id by which you created a new account with. Verify your account and set a new password.
3. On the homepage of your chatwoot application, Click the `+` button next to the **Inboxes** section on the left navigation pane.
4. Choose the **Website** channel on the next screen.
5. On the next screen, enter the details about your website and your welcome messages.
6. You will recieve a code snippet at the end of process which you can insert into your website's HTML and it will load up the Chatwoot bubble whenever someone visits your site.
