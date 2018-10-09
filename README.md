# Marple
[![Build
Status](https://travis-ci.org/flaxsearch/marple.svg?branch=master)](https://travis-ci.org/flaxsearch/marple)


Marple is an app for exploring Lucene indexes. It is implemented as two main components:

 - a REST API implemented in Java/Dropwizard and exposing Lucene index data structures as JSON objects.

 - a UI implemented in React which runs in a browser and pulls data from the API.

This design provides simple platform independence and also means that the data provided by the API could be used by alternative UIs or other consumers.

Read a blog post about the first release of Marple here: http://www.flax.co.uk/blog/2017/02/24/release-1-0-marple-lucene-index-detective/

*Please note that the master branch currently targets Lucene version 6. There is a lucene-7 branch for version 7.*

## Prerequisites
In order to run Marple you will need a Java 8 JRE installed and a reasonably recent browser.

## Creating a package from source
To build marple, run `./package`.

## Running from a JAR
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
The terms view has three sections. First, at the top, there is a summary of the terms for the selected field. This shows the total number of terms (this is only available when a single segment has been selected, not when examining all segments), the number of documents which have terms, and the maximum and minimum terms.

Below this is a filter input box. This allows you to find terms by entering a regular expression (or partial term, since it includes an implicit trailing wildcard). For example, entering "luc" will select all terms beginning with that string. Filters are case-sensitive. Only terms matching the filter will be displayed.

To the right of the filter box is a dropdown to select the field encoding. Since terms are just a series of bytes in Lucene they can represent a range of data types. The dropdown allows you to select UTF-8 (by far the most common for text), base64 (useful for arbitrary binary types) and a number of numeric types. If you select a numeric type which is not valid for the field data, Marple will display an error message and default to UTF-8.

Note that any regexp entered in the filter box is interpreted as UTF-8, no matter what encoding has been selected in the encoding dropdown.

Terms are displayed below these controls, in standard Lucene terms sort order (which is equivalent to UTF-8 sorting). The *docFreq* (number of documents which contain the term) and *totalTermFreq* (total number of occurrences of the term across all documents) are displayed alongside the term.

Marple will display the first fifty terms in a field. If there are more terms, you can load them in fifty-term batches by clicking the **Load More** button at the bottom of the terms list.

Terms are clickable. When you click a term it will display a list of the documents in which the term occurs. Furthermore, clicking a document ID will display a list of positions where the term occurs in the document, together with the character offsets and payload, if applicable.

#### Doc values
Unlike terms, doc values have a type. The currently supported set of types (in Lucene 6) is *binary*, *numeric*, *sorted*, *sorted_numeric* and *sorted_set*. In Marple, the type of doc values for the selected field is displayed at the top left of the doc values display, and the rest of the view adapts appropriately to the type.

Numeric types are displayed as numbers, with no option to change the encoding. Other types can be displayed in one of a range of encodings chosen from a dropdown control, similar to terms display.

With *sorted* and *sorted_set*, you have the option of ordering displayed values by doc ID or by value (sorted the same way as terms). Other types of doc values can only be ordered by doc ID.

Below these controls is an input box. This allows you to restrict the view to a set of documents, identified by doc ID. You can enter several doc IDs, separated by commas, and use '-' to indicate a range, e.g.:

 `3`
 `10, 13, 15`
 `20-30`
 `5, 20-40, 55, 90-110`

When 'view by value' is selected (for appropriate types) the input box changes to support regular expressions, similar to the filter box for terms.

Doc values are displayed with their ord number and doc ID (when available). Like terms, up to fifty doc IDs will be loaded, and if there are more available then a **Load more** button is displayed.

### Documents
The documents UI is currently very simple, and lets you view the stored fields of one document. When you enter a document ID into the *docid* input box, Marple will fetch the fields and display them to the right. Field names are shown in grey italic font, followed by the data in JSON format.

In order to keep the UI responsive, the number and size of document fields fetched and displayed is limited by default (to 100 and 10K respectively). If the document size exceeds either of these limits, a **Load all** button will be displayed below the document data.

## API documentation
The API can be accessed at `http://localhost:8080/api/RESOURCE` where RESOURCE is one of:

#### `/index`
Returns general information about the index, including a list of segments.

#### `/fields`
Optional query string parameters:
  - `segment`: the segment ordinal. Omit for all segments.

Returns a list of fields in the index/segment, including various metadata.

#### `/fields/<field>`
Optional query string parameters:
  - `segment`: (as above)

Returns a single item from `/fields`.

#### `/terms/<field>`
Optional query string parameters:
  - `segment`: (as above)
  - `encoding`: the term encoding (utf8, base64, int, long, float or double)
  - `filter`: a regexp to filter the terms returned
  - `from`: a term (or partial term) defining the start point for returned terms
  - `count`: how many terms to return

Return terms for <field>.

#### `/postings/<field>/<term>`
  Optional query string parameters:
  - `segment`: (as above)
  - `encoding`: encoding of <term>
  - `offset`: offset in the postings list from which to return postings
  - `count`: how many postings to return

Return postings for <field> and <term>.

#### `/positions/<field>/<term>/<docid>`
  Optional query string parameters:
  - `encoding`: encoding of <term>
  - `segment`: (as above)

Return positions for <field>, <term> and <docid>.

#### `/docvalues/<field>`
  Optional query string parameters:
  - `segment`: (as above)
  - `encoding`: encoding to return doc values in
  - `docs`: a list of doc IDs and/or ranges to return doc values for

Return doc values ordered by doc ID for <field>.

#### `/docvalues/<field>/ordered`
  Optional query string parameters:
  - `segment`: (as above)
  - `encoding`: (as above)
  - `filter`: (as above)
  - `from`: (as above)
  - `offset`: (as above)
  - `count`: (as above)

Return doc values ordered by value for <field>.

#### `/document/<docid>`
  Optional query string parameters:
  - `segment`: (as above)
  - `maxFieldLength`: truncate any fields over this length
  - `maxFields`: don't return more fields than this

Return stored fields for <docid>.

All these endpoints return JSON. The format is hopefully self-explanatory.

## Developing Marple
This is very much a work in progress, and pull requests are welcomed!

If you want to contribute to this project and need some help starting, please contact @romseygeek or @noofherder.
