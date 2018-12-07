# Musicalypse

Musicalypse is a modern audio player built with web technologies. 
It is available as an online or native version on main desktop platforms 
and provides a backend streaming server.

Developed in [Typescript](https://www.typescriptlang.org/) and [Scala](https://www.scala-lang.org/) using [Angular](https://angular.io/) and [akka](https://akka.io/).

Provided as a seemingly native application using [electron](https://electronjs.org/).

Find out more on [the official website](https://musicalypse.creasource.net).

## Features

* Supports mp3, ogg, and flac
* Streaming server for your local network or beyond
* Accessible by computer, tablets, or phones
* Playlists
* Favorites and recent tracks
* Multiple artists/albums selection
* Themes

[![Musicalypse_screenshot](https://musicalypse.creasource.net/img/musicalypse-ipad-4.png)](https://musicalypse.creasource.net)

## Build

### Dependencies

To build both the frontend and backend of Musicalypse you will need:

* Java JDK8
* sbt
* Node
* npm

### Run

To run Musicalypse from source use the following commands:

#### For the server

Run `npm run web:run` and connect to [http://localhost:8080](http://localhost:8080).

You can then serve Musicalypse behind a regular Web server (e.g. apache or nginx) and add authentication and SSL (Help wanted to document how to do that).

#### For the desktop

Run `npm run electron:run` and Musicalypse will launch inside electron.

### Develop

#### Frontend development

Run `npm run web:serve` and connect to [http://localhost:4200](http://localhost:4200).

You get hot reloading of the application on file modification.

If you work on electron-specific frontend features then run `npm run electron:serve`.

#### Backend development

In two consoles run:

* `sbt run`
* `npm run ng:serve`

And connect to [http://localhost:4200](http://localhost:4200).
 
*Note:* You have to manually close the server by pressing `Enter` and restart it whenever you change a source file (help wanted to get hot reloading with akka-http).

#### Electron development

To develop the electron integration run `npm run electron:build` once to build dependencies and then run `npm run electron:run:dev` every time you change an electron source file (in the `electron/` folder).

**TODO:** improve workflow if possible.

### Stage

#### For the server

* Expanded: `npm run web:stage`
* Zip: `npm run web:stage:zip`
* Tar: `npm run web:stage:tar` (linux only)

#### For the desktop 

Musicalypse is packaged with a JRE (Java Runtime Environment) so you need a copy of your JRE in your `target` folder.

You can get it easily by running `npm run electron:jre` and entering the path to your JRE.

##### Linux

`npm run electron:stage:linux`

*Note:* You should run this command on Linux only.

##### Windows

`npm run electron:stage:windows`

*Note:* You should run this command on Windows only.

### Privacy Policy

Musicalypse does not collect any personal information. 

For more information, please see [PRIVACY_POLICY](https://github.com/tgambet/musicalypse/blob/master/PRIVACY_POLICY.md).

## License

Licensed under the MIT License.

Copyright © Thomas Gambet

For more information, please see [LICENSE](https://github.com/tgambet/musicalypse/blob/master/LICENSE).
