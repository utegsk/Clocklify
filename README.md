Clocklify
=========
A simple time tracker interacting with clockify from terminal.

Features
--------
- [x] start new working entry
- [x] end working entry
- [x] toggle break
- [x] print current working status
- [x] dump ongoing working time


- [ ] goal
- [ ] log of working entries
- [ ] monthly report
- [ ] change slack status


How to install
--------------
Using [`npm`](https://www.npmjs.com):
```
npm install clocklify
```

Using [`yarn`](https://yarnpkg.com):
```
yarn install clocklify
```

Getting started
---------------
Right after installation you are ready to go.


Help
----
```
Usage:
  clock [command]

Available Commands:
  work [start|in] Strats wokring time
  work [stop|out] Ends wokring time
  delete          Deletes currently running working entry
  break           Toggles break status
  log [from] [to] List all the entries within specified dates range
  status          Current status of working time
  help            Help for Clocklify
  report          Table of statistics for the current month

Flags:
  -v, --version             Version of the command
  [command] -h, --help      Help about any command
  [command] -lm, --last     Applies command to the previous month

Use "clock [command] --help" for more information about a command.
```
