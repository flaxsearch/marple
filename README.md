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
### Segments
With Marple running, point your browser to `http://localhost:8080/` (or the appropriate port if you have overridden the default). Marple uses a basically hierarchical page layout, with increasing levels of specificity from left to right. The leftmost column displays a list of all the *segments* in the index, each with the number of documents and the number of deletions. You can choose to examine a single segment, or all segments.

Once you select a segment (or all) by clicking on it, Marple will display a two-item tabbed display to the right of the segments list. By default this will display a list of *fields* in the selected segment. Click on the *Docs* tab to view *documents* instead.

### Fields
Marple will display a list of all the fields in the segment/index, sorted alphabetically. To select a field to examine, click on it in the fields list. Marple currently allows you to view the *terms* and/or *doc values* for a selected field. These are displayed to the right on the field list, with tabs for each view. If the field has terms then the terms view will be selected by default, otherwise the doc values view will be selected.

#### Terms
The terms view has three sections. First, at the top, there is a summary of the terms for the selected field. This shows the total number of terms (if stored; not all Lucene codecs store this), the number of documents which have terms, and the maximum and minimum terms.

Below this is a filter input box. This allows you to find terms by entering a regular expression (or partial term, since it includes an implicit trailing wildcard). For example, entering "luc" will select all terms beginning with that string. Filters are case-sensitive.

To the right of the filter box is a dropdown to select the field encoding. Since terms are just a series of bytes in Lucene they can represent a range of data types. The dropdown allows you to select UTF-8 (by far the most common for text), base64 (useful for arbitrary binary types) and a number of numeric types. If you select a numeric type which is not valid for the field data, Marple will display an error message and default to UTF-8.

FIXME see https://github.com/flaxsearch/marple/issues/39

FIXME list

#### Doc values


### Documents

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
