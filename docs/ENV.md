## Environment variables

This guide explains all the available configurations in your `.env` file so that you can configure your environments accordingly.

### Plio backend
#### `VUE_APP_BACKEND`
Base url for the backend REST API.

#### `VUE_APP_BACKEND_AUTH_URL`
Token related URL at backend repo which can be used to convert the OAuth2 token into Django access token or get a new access token from a refresh token

#### `VUE_APP_BACKEND_WEBSOCKET`
Base URL to connect to any configured websocket listeners on the backend


### Plio Backend API
Backend API credentials are used by frontend application to authorize that this server is allowed to make API calls to the backend server. If not present, the backend app won't allow auth tokens to be generated.

To interact more with backend API, see the [REST API setup guide](https://github.com/avantifellows/plio-backend/blob/master/docs/REST-API.md) at backend repository.

#### `VUE_APP_BACKEND_API_CLIENT_ID`
The client id for backend API application.

#### `VUE_APP_BACKEND_API_CLIENT_SECRET`
The client secret for backend API application.

### Frontend repository
#### `VUE_APP_FRONTEND`
The URL for the frontend repo.

### Localization
#### `VUE_APP_I18N_LOCALE`
Default localization language.

#### `VUE_APP_I18N_FALLBACK_LOCALE`
Fallback localization language in case any localization config is not found.

### Google
#### `VUE_APP_GOOGLE_CLIENT_ID`
OAuth2 client id from Google. Required for Google Sign in functionality.

### `VUE_APP_GOOGLE_API_KEY`
API Key for your Google Cloud project. Required for using the YouTube Data API. Create your credentials by visiting `APIs & Services` in your Google Cloud Console and then clicking on `Credentials` > `Create Credentials` > `API Key`. You are recommended to restrict the APIs that this API key can access and the list of websites that can use this API key for better security.

### Web server
#### `APP_PORT`
Port on which you want your docker app to run and expose.

### Mixpanel
Mixpanel is used for tracking user behaviour throughout the webapp.

#### `VUE_APP_MIXPANEL_PROJECT_TOKEN`
This is the project token for your mixpanel project which you can view in the Mixpanel Dashboard.
