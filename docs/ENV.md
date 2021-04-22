## Environment variables

This guide explains all the available configurations in your `.env` file so that you can configure your environments accordingly.

### Plio backend
#### `VUE_APP_BACKEND`
Base url for the backend REST API.

#### `VUE_APP_BACKEND_AUTH_URL`
Convert token URL at backend repo that will convert the OAuth2 token into Django access token.

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

### Google OAuth2 credentials
#### `VUE_APP_GOOGLE_CLIENT_ID`
OAuth2 client id from Google. Required for Google Sign in functionality.


### Web server
#### `APP_PORT`
Port on which you want your docker app to run and expose.