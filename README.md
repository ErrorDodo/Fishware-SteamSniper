# Steam Vanity URL Sniper

Note that I have not actually tested this, it should work logically. If you find any bugs, please open an issue or a pull request.

## What is this?

This is a simple script that will check if a vanity URL is available on Steam, you can set/edit the settings of the program (accounts to use, profiles to check and general app settings) in the `settings.json` and example of what it should look like can be found here [settings.example.json](./config/settings.example.json).

For an easier view of what the settings should look like, here is an example of what it should look like:

```json
{
  "profiles": [
    "someProfile",
    "anotherProfile",
    "onemoreProfile"
  ],
  "accounts": [
    {
      "username": "username1",
      "password": "password1"
    },
    {
      "username": "username2",
      "password": "password2"
    },
    {
      "username": "username3",
      "password": "password3"
    }
  ],
  "settings": {
    "ProfileCheckIntervalInSeconds": 5,
    "ConcurrentProfileChecks": 2
  }
}

```

## How to run

This program uses NodeJS to run, you can download it from here [NodeJS](https://nodejs.org/en/). Once you have NodeJS installed. After this I would suggest installing pnpm globally, you can do this by running `npm i -g pnpm`. Once you have pnpm installed, you can run `pnpm i` to install all the dependencies. Once you have all the dependencies installed, you can run `pnpm start` to start the program.

## TODO

Todos have been moved over to the issues tab
