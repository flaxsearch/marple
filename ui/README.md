# Marple UI

This is a React-based web app which sits on top of the Marple JSON API. It is written in ES2015 with JSX, and uses build-time Babel transpilation to produce code which can be run in current browsers.

The UI app can be run in standalone mode using CORS (to make UI development faster) or served directly from the Marple app (at the root URL).

In either case, you will need to have [node.js] and [npm] installed locally.

Before running in either development mode or creating the production bundle, install the dependencies with:

```
$ npm install
```

Then, to start the [webpack] dev server, run:

```
$ npm start
```

This will watch for any code changes and make them live without any need to manually re-compile. The dev server runs on port 8090, so you can see the UI by pointing your browser at

```
http://localhost:8090/
```

To run the unit tests (such as they are), use:

```
$ npm test
```

To produce a Javascript bundle with all dependencies, and copy this (and CSS and index.html) to the resources directory of the main Marple app, run:

```
$ npm run-script bundle
```

This uses the webpack UglifyJS plugin to reduce the bundle size. Name mangling is currently disabled, as it produces a non-functional bundle. It is possible that excluding certain names from mangling would allow this to work, but so far I have not been able to identify which names should be excluded.

After creating the bundled assets, you will need to re-build the Marple app using Maven.


--

[node.js] https://nodejs.org/en/
[npm] https://www.npmjs.com/
[webpack] https://webpack.github.io/
