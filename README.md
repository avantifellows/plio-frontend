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

1. Recommend high-quality free video content in local languages,
2. Automatically build interactive lessons on top of these videos,
3. Work on feature phones, 
4. Be freely available.

## Issues

Please feel free to open a PR if you know how to solve any of these!

* Our code doesn't work on some low-end mobile browsers.
* We don't have much knowledge on cross-browser testing
* Our Vue architecture may not be state-of-the-art. 
