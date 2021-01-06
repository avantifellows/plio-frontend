# Plio Frontend

Plio is an open-source AI-based platform that enables personalized learning through free interactive
videos. 

This repo contains code for the frontend, in Vue.

It includes features for:

1. A player that overlays items (currently assumed to be questions) on top of any video (currently assumed to be from YouTube(
2. Recording the phone number of the user (currently without any authentication).

## Priorities

We are keeping the features *extremely* simple, because our target market is students from low-income backgrounds in India.
Some of them don't have their own phones and borrow from their families, and some of them have only KaiOS feature phones.

Hence, we have decided that the platform will:

#  Plio Frontend

  

Plio is an open-source AI-based platform that enables personalized learning through free interactive

videos.

  

This repo contains code for the frontend, in Vue.

  

It includes features for:

  

1. A player that overlays items (currently assumed to be questions) on top of any video (currently assumed to be from YouTube(

2. Recording the phone number of the user (currently without any authentication).

  

##  Priorities

  

We are keeping the features *extremely* simple, because our target market is students from low-income backgrounds in India.

Some of them don't have their own phones and borrow from their families, and some of them have only KaiOS feature phones.

  

Hence, we have decided that the platform will:

  

1. Recommend high-quality free video content in local languages,

2. Automatically build interactive lessons on top of these videos,

3. Work on feature phones,

4. Be freely available.

  

##  Issues

  

Please feel free to open a PR if you know how to solve any of these!

  

* Our code doesn't work on some low-end mobile browsers.

* We don't have much knowledge on cross-browser testing

* Our Vue architecture may not be state-of-the-art.

  

##  Testing

  

Our testing is powered by the open source plan of [BrowserStack](https://www.browserstack.com/)

## Get Started
Follow the steps below to set up the repo for development
1. Install [nodeJs](https://nodejs.org/en/), [vue-cli](https://cli.vuejs.org/guide/installation.html) and [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable). All these can be installed globally.
2. Clone the repo.
3. `cd` into the repo and run `npm install`.
4. Run the vue ui using the command `vue ui`
5. This will start a local server from where the project can be served locally, or deployed to dev/staging
**NOTE** - The project will be up and running with this method but you'll have to start the backend service and the API layer service locally as well to get it working fully.
1. Recommend high-quality free video content in local languages,
2. Automatically build interactive lessons on top of these videos,
3. Work on feature phones, 
4. Be freely available.

## Issues

Please feel free to open a PR if you know how to solve any of these!

* Our code doesn't work on some low-end mobile browsers.
* We don't have much knowledge on cross-browser testing
* Our Vue architecture may not be state-of-the-art. 

## Testing

Our testing is powered by the open source plan of [BrowserStack](https://www.browserstack.com/)
