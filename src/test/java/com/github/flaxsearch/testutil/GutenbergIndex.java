package com.github.flaxsearch.testutil;
/*
 *   Copyright (c) 2016 Lemur Consulting Ltd.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.BytesRef;


public class GutenbergIndex {

    public static void main(String... args) throws IOException {

        Path source = Paths.get("src/test/resources/gutenberg");
        Path index = Paths.get("src/test/resources/index");

        clearDirectory(index);
        try (Directory directory = FSDirectory.open(index);
             IndexWriter writer = new IndexWriter(directory, new IndexWriterConfig())) {
            writeDocuments(writer, source);
        }

    }

    public static void writeDocuments(IndexWriter writer, Path source) throws IOException {
        int count = 0;
        try (DirectoryStream<Path> directory = Files.newDirectoryStream(source)) {
            for (Path file : directory) {
                byte[] data = Files.readAllBytes(file);
                writer.addDocument(buildDocument(file, data));
                if (count++ % 7 == 0)
                    writer.commit();
            }
        }
    }

    public static Document buildDocument(Path source, byte[] data) {
        String filename = source.getFileName().toString();
        String filepath = source.toString();
        String fileparent = source.getParent().toString();

        Document document = new Document();
        document.add(new TextField("text", new String(data, Charset.defaultCharset()), Field.Store.YES));
        document.add(new StringField("source", filepath, Field.Store.YES));
        document.add(new IntPoint("filesize", data.length));
        document.add(new NumericDocValuesField("filesize", data.length));

        document.add(new SortedDocValuesField("dv_filepath", new BytesRef(filepath)));
        document.add(new BinaryDocValuesField("dv_filename", new BytesRef(filename)));
        document.add(new SortedNumericDocValuesField("dv_filesize_sorted", data.length));
        document.add(new SortedSetDocValuesField("dv_filename_set", new BytesRef(filename)));
        document.add(new SortedSetDocValuesField("dv_filename_set", new BytesRef(filepath)));
        document.add(new SortedSetDocValuesField("dv_filename_set", new BytesRef(fileparent)));

        return document;
    }

    public static void clearDirectory(Path path) throws IOException {
        if (Files.exists(path) == false)
            return;
        Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }
            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }

}
