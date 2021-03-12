# Clocklify

A simple time tracker interacting with clockify from terminal.

## Features

- [x] start new working entry
- [x] end working entry
- [x] toggle break
- [x] print current working status
- [x] dump ongoing working time

- [x] goal
- [x] log of working entries
- [x] monthly report
- [ ] change slack status

## How to install

Using [`npm`](https://www.npmjs.com):

```
npm install clocklify
```

Using [`yarn`](https://yarnpkg.com):

```
yarn install clocklify
```

## Getting started

Right after installation you are ready to go.

## Help

```
clocklify
    Usage :
         clock  <command>

    Commands :
         status                         prints working status
         start|in|go                    starts work
         stop|out|quit|exit|end|done    stops ongoing work
         break|pause|lunch              toggles break
         log [YYYY-MM-DD] [YYYY-MM-DD]  prints log work between entered range
         import [example.json]          imports entries from file
         goal [option]
             on      enables goal tracker
             off     disables goal tracker
             set     sets new goal for a certain workspace
             status  prints goal tracker status

    Flags :
         -t [HH:MM]    applicable with <start|in|go>, sets starting time to a certain value
         -d            applicable with <stop|out|quit|exit|end|done>, dumps ongoing working time
         -v, -version  prints current version
         -h, -help     prints help
```
