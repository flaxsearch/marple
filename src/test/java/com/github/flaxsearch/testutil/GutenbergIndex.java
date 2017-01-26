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
import java.util.Random;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.custom.CustomAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.BytesRef;


public class GutenbergIndex {

    public static final Random random = new Random();

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
            for (int i = 0; i < 250; i++) {
                Path p = source.resolve("document_" + i);
                byte[] data = ("this is document " + i).getBytes(Charset.defaultCharset());
                writer.addDocument(buildDocument(p, data));
                if (random.nextInt(25) == 0)
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
        
        document.add(new LegacyIntField("filesize_lint", data.length, Field.Store.YES));
        document.add(new LegacyDoubleField("filesize_ldouble", (double) data.length, Field.Store.YES)); 

        document.add(new SortedDocValuesField("dv_filepath", new BytesRef(filepath)));
        document.add(new BinaryDocValuesField("dv_filename", new BytesRef(filename)));
        document.add(new SortedNumericDocValuesField("dv_filesize_sorted", data.length));
        document.add(new SortedSetDocValuesField("dv_filename_set", new BytesRef(filename)));
        document.add(new SortedSetDocValuesField("dv_filename_set", new BytesRef(filepath)));
        document.add(new SortedSetDocValuesField("dv_filename_set", new BytesRef(fileparent)));

        document.add(new Field("payloads",
                payloadAnalyzer.tokenStream("payloads", "abc|abc def|def"), TextField.TYPE_NOT_STORED));

        return document;
    }

    private static Analyzer buildAnalyzer() {
        try {
            return CustomAnalyzer.builder()
                    .withTokenizer("whitespace")
                    .addTokenFilter("lowercase")
                    .addTokenFilter("delimitedpayload", "encoder", "identity")
                    .build();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static Analyzer payloadAnalyzer = buildAnalyzer();

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
