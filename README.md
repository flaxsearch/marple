# marple

RESTful API for exploring Lucene indexes.

To build marple, run `mvn clean package`.

To run marple, run `./run_server <path to Lucene index>`


This is very much a work in progress, and pull requests are welcomed!

Available endpoints:
* `/api/index`
* `/api/fields?segment=0`
* `/api/terms/{field}?segment=0&count=20&from=apple`
* `/api/docvalues/{field}/{type}?segment=0&from=0&count=50`

TODO:
- postings list (`/postings/{field}/{term}`)
- positions, offsets and payloads (`/postings/{field}/{term}/{doc}`)
- term vectors
- Points API
- better docvalues representations
- improve String representations of binary data
- add regex filters to `/terms` endpoint
- add command-line explorer mode
