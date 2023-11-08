# Steam Vanity URL Sniper

Note that I have not actually tested this, it should work logically. If you find any bugs, please open an issue or a pull request.

## What is this?

This is a simple script that will check if a vanity URL is available on Steam, you can set/edit. [profiles.json](./config//profiles.example.json) is an example of what it would look like. It will check a list of words and see if they are available. If they are, it will claim them with accounts that you put in a file. [accounts.json](./config/accounts.example.json) is an example of what the file should look like.

For an easier view of the 2 json files needed:

```json
// accounts,json
[
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
]
```

```json
// profiles.json
[
    "tedlookatmyprofile", 
    "tedlookatmyprofile1", 
    "tedlookatmyprofile2"
]

```

## How to run

This program uses NodeJS to run, you can download it from here [NodeJS](https://nodejs.org/en/). Once you have NodeJS installed. After this I would suggest installing pnpm globally, you can do this by running `npm i -g pnpm`. Once you have pnpm installed, you can run `pnpm i` to install all the dependencies. Once you have all the dependencies installed, you can run `pnpm start` to start the program.

## TODO

Todos have been moved over to the issues tab
