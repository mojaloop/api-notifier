# email-notifier
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/api-notifier.svg?style=flat)](https://github.com/mojaloop/api-notifier/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/api-notifier.svg?style=flat)](https://github.com/mojaloop/api-notifier/releases)
[![Docker pulls](https://img.shields.io/docker/pulls/mojaloop/api-notifier.svg?style=flat)](https://hub.docker.com/r/mojaloop/api-notifier)
[![CircleCI](https://circleci.com/gh/mojaloop/api-notifier.svg?style=svg)](https://circleci.com/gh/mojaloop/api-notifier)

Stand-alone email service that consumes messages from kafka topic, produced by the central-notifications service.
The central-notificattions repo is available [here](https://github.com/mojaloop/central-notifications/tree/master)

## Mac OS installation problems

If you have this or similar error during installation:

```
npm install
> node-gyp rebuild
clang: error: linker command failed with exit code 1
```

add the following environmental variables: 
```
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

## Config

Whole config is located [here](config/default.json)

The settings are: 

```json

```

Those can be passed as the following environment variables: 

```json

```


## Auditing Dependencies

We use `npm-audit-resolver` along with `npm audit` to check dependencies for vulnerabilities, and keep track of resolved dependencies with an `audit-resolv.json` file.

To start a new resolution process, run:
```bash
npm run audit:resolve
```

You can then check to see if the CI will pass based on the current dependencies with:
```bash
npm run audit:check
```

And commit the changed `audit-resolv.json` to ensure that CircleCI will build correctly.