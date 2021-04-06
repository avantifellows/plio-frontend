## Google OAuth
We use [vue3-google-oauth2](https://github.com/guruahn/vue3-google-oauth2) Vue package to get the Google sign-in functionality working. This document covers step by step details on how to get the sign-in functionality running.

### Set up Google OAuth Credentials
1. Log into the [Google Developer Console](https://console.developers.google.com/)
2. Click the `Select a Project` dropdown and select `New Project`
3. Enter the name of the project `Plio`
4. Once the project is created (takes a few seconds), use the project selector again and select `Plio`
5. Now you have to add available APIs. Select and open `Library` in the left menu.
6. Open and Enable `Google+ API` and `Google Analytics API`
7. Go to the `Credentials` tab, click on the `Create Credentials` popup and select `OAuth client ID` — Google also offers a wizard to help you make this decision if you'd like to use Google Auth in a different context
8. The API Dashboard opens, click `Credentials` on the left Nav and switch to the `OAuth Consent Screen` tab — provide an application name and an optional logo.
9. On the next screen select `Web application` as Application type and give it a name `Plio`
10. Add `http://localhost:8080` into the **Authorized JavaScript origins** and use `http://localhost:8080/callback` for the **Authorized redirect URIs** and click the `Create` button
11. Finally you will get a popup containing your `Client ID` and `Client Secret` copy those values.
12. Update your `.env` file and enter the Client ID copied in step above:
    ```sh
    VUE_APP_GOOGLE_CLIENT_ID='your_client_id'
    ```


### Backend setup
If you're using the Plio backend, make sure you follow the steps mentioned in the Backend API setup guide.
