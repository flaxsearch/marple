#!/bin/bash

DEST="../src/main/resources/assets"

if [ ! -d "$DEST" ]; then
  mkdir -p $DEST
fi

cp -r bundle.js index.html css fonts img $DEST
