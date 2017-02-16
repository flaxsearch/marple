# Marple
[![Build
Status](https://travis-ci.org/flaxsearch/marple.svg?branch=master)](https://travis-ci.org/flaxsearch/marple)


Marple is an app for exploring Lucene indexes. It is implemented as two main components:

 - a REST API implemented in Java/Dropwizard and exposing Lucene index data structures as JSON objects.

 - a UI implemented in React which runs in a browser and pulls data from the API.

This design provides simple platform independence and also means that the data provided by the API could be used by alternative UIs or other consumers.

## Prerequisites
In order to run Marple you will need a Java 8 JRE installed and a reasonably recent browser.

## Running from a distribution JAR
To run Marple, use the following command:

 `java -Ddw.indexPath=<path to lucene index> -jar <marple JAR> server`

 e.g.:

 `java -Ddw.indexPath=./gutenberg -jar marple-1.0.jar server`

A small Lucene index (of free books from gutenberg.org) is provided as a release download in case you do not currently have any Lucene indexes to run Marple against.

### Changing the default ports
By default, Marple binds to port 8080 for the application and 8090 for the Dropwizard admin interface. If you need to change either of these because of clashes with existing services, set the following Java properties:

 `-Ddw.server.applicationConnectors[0].port=<app port>`
or
 `-Ddw.server.adminConnectors[0].port=<app port>`

e.g. to change both from the defaults:

```
java -Ddw.server.applicationConnectors[0].port=8888 \
  -Ddw.server.adminConnectors[0].port=9999 \
  -Ddw.indexPath=./gutenberg -jar marple-1.0.jar server
```

## Interacting with the UI
With Marple running, point your browser to http://localhost:8080/ (or the appropriate port if you have overridden the default).

## API documentation
FIXME

## Developing Marple
This is very much a work in progress, and pull requests are welcomed!

### Prerequisites
FIXME

### Backend
FIXME

### UI
FIXME

`npm test`

### Creating a package
To build marple, run `./package`.

To run marple, run `./run-server <path to Lucene index>` and then point a web
browser to localhost:8080
