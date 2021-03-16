# Plio Frontend
[![License: MIT](https://img.shields.io/github/license/avantifellows/plio-frontend?color=blue&style=flat-square)](LICENSE)
![GitHub issues](https://img.shields.io/github/issues-raw/avantifellows/plio-frontend?style=flat-square)
![Pre-commit checks](https://img.shields.io/github/workflow/status/avantifellows/plio-frontend/pre-commit/master?label=Pre-commit%20checks&style=flat-square)
[![Discord](https://img.shields.io/discord/717975833226248303.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat-square)](https://discord.gg/29qYD7fZtZ)

Plio is an open-source AI-based platform that enables personalized learning through free interactive videos.

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

## Installation
To set up this project, visit the [installation steps](docs/INSTALLATION.md).

## Deployment
Visit our [deployment guideline](docs/DEPLOYMENT.md) for setting up this repository on a production environment.

##  Testing
Our testing is powered by the open source plan of [BrowserStack](https://www.browserstack.com/)

## Contributing
- [Pre-commit](docs/PRE-COMMIT.md)
