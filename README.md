# Botisimo Loyalty API

This is the API for the Botisimo Loyalty system. It is a simple API that allows
you to create and manage loyalty systems for your users.

## Installation

**npm**

```
npm install @botisimo/loyalty-api
```

**yarn**

```
yarn add @botisimo/loyalty-api
```

## Getting started

You're going to need to sign up for a loyalty account. You can get started at
https://botisimo.com/teams

Once you have a loyalty account, you need to edit your [branding configuration]
and set **Custom URL Name**. That will be the name you pass into the api.

[branding configuration]: https://botisimo.com/team/branding

## Usage

```js
const { BotisimoLoyaltyApi } = require('@botisimo/loyalty-api');

// Create a new instance of the API with your team name. This should be the same
// as the Custom URL Name you set in your branding configuration.
const api = new BotisimoLoyaltyApi(teamName);

await api.login({ email: 'someone@example.com', password: '1234' });
await api.getUser();
```

If you're using this on a server, you'll need to provide a `fetch`
implementation

```js
const fetch = require('node-fetch');

const api = new BotisimoLoyaltyApi(teamName, { fetch });
```

You can also override the localStorage implementation in case you want to store
the token somewhere else.

```js
const api = new BotisimoLoyaltyApi(teamName, { localStorage: myLocalStorage });
```
