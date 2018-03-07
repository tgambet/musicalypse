# Akka-Http Angular

This project provides the seed for developing an Angular application backed by akka-http.
It is set up for deployment on Heroku.

The following documentation is being worked on.

## Dependencies

Node and npm

Sbt

## Install

Clone the repo & delete .git folder

git init && git add . && git commit -m "akka-http-angular seed"

npm install -g @angular/cli

npm install

## Run

sbt "ng build" run

or

ng serve

sbt run

## Configure

Logback.xml & reference.conf

custom configuration: config/application.conf

Backend host and port

## Develop

### Frontend

Angular-cli documentation

Angular documentation

### Backend

net.creasource.core package

net.creasource.http package

net.creasource.web package

Main file

## Stage

sbt compile stage

## Deploy

Buildpacks

The Procfile

Deploy on Heroku and configure

## Setup Intellij Idea (optional)

Add a web module

Add node_modules to ignored directories in root module

Run configurations

TsLint

## License

Unlicense