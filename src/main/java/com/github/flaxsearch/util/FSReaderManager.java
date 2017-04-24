package com.github.flaxsearch.util;
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

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import io.dropwizard.lifecycle.Managed;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.IOUtils;

public class FSReaderManager implements ReaderManager, Managed {

    private final Directory directory;
    private final IndexReader reader;

    public FSReaderManager(String indexPath) throws IOException {
        Path path = Paths.get(indexPath);
        if (Files.exists(path) == false)
            throw new FileNotFoundException("Path " + path + " does not exist");
        this.directory = FSDirectory.open(path);
        this.reader = DirectoryReader.open(directory);
    }

    @Override
    public IndexReader getIndexReader() {
        return reader;
    }

    @Override
    public void start() throws Exception {

    }

    @Override
    public void stop() throws Exception {
        IOUtils.close(reader, directory);
    }
}
