## Google OAuth2
We use [vue3-google-oauth2](https://github.com/guruahn/vue3-google-oauth2) Vue package to get the Google sign-in functionality working. This document covers step by step details on how to get the sign-in functionality running.

  - [Set up Google OAuth2 Credentials](#set-up-google-oauth2-credentials)
  - [Set up Plio Backend API](#set-up-plio-backend-api)
  - [Testing](#testing)
  - [In case of failure](#in-case-of-failure)
  - [Additional Help](#additional-help)

### Set up Google OAuth2 Credentials
1. Log into the [Google Developer Console](https://console.developers.google.com/)
2. Click the **Select a Project** dropdown and select **New Project**
3. Enter the name of the project **Plio**
4. Once the project is created (takes a few seconds), use the project selector again and select **Plio**
5. Now you have to add available APIs. Select and open **Library** in the left menu.
6. Open and Enable **Google+ API** and **Google Analytics API**
7. Go to the **Credentials** tab, click on the **Create Credentials** popup and select **OAuth client ID** — Google also offers a wizard to help you make this decision if you'd like to use Google Auth in a different context
8. The API Dashboard opens, click **Credentials** on the left Nav and switch to the **OAuth Consent Screen** tab — provide an application name and an optional logo.
9. On the next screen select **Web application** as Application type and give it a name **Plio**
10. Add `http://localhost:8080` into the **Authorized JavaScript origins** and use `http://localhost:8080/callback` for the **Authorized redirect URIs** and click the **Create** button
11. Finally you will get a popup containing your **Client ID** and **Client Secret**. Copy these values.
12. Update your `.env` file and enter the Client ID copied in step above:
    ```sh
    VUE_APP_GOOGLE_CLIENT_ID='your_client_id'
    ```


### Set up Plio Backend API

**Note**: If you're using the Plio backend, make sure you follow the steps mentioned in the Backend API setup guide.

After your Backend API is correctly configured, retrieve the client id and client secret. Please note that you will now have two pairs of client id and secret:
1. From Google Developer Console
2. From Plio Backend API

Update your `.env` file with the Plio backend client id and secret
```sh
VUE_APP_BACKEND_API_CLIENT_ID='plio_backend_client_id'
VUE_APP_BACKEND_API_CLIENT_SECRET='plio_backend_client_secret'
```

### Testing
Restart the frontend server and navigate to the login page. Now you should see the `Google Sign-in` functionality should be working as expected.


### In case of failure
You can check the brower console to check errors which occur during initialization. The most of errors are due to inproper setting of Google OAuth2 credentials setting in Google Developer Console. After changing the settings, you have to do hard refresh to clear your caches.

### Additional Help
1. [Google API Client Libraries : Methods and Classes](https://github.com/google/google-api-javascript-client)
2. If you are curious of how the entire Google sign-in flow works, please refer to the diagram below
![Google Sign-in Flow](https://developers.google.com/identity/sign-in/web/server_side_code_flow.png)
