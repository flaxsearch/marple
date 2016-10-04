package com.github.flaxsearch.resources;
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

import com.github.flaxsearch.testutil.Fixtures;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.store.Directory;
import org.junit.AfterClass;
import org.junit.BeforeClass;

public abstract class IndexResourceTestBase {

    protected static Directory directory;
    protected static IndexReader reader;

    @BeforeClass
    public static void setup() throws IOException {
        directory = Fixtures.openDirectory();
        reader = DirectoryReader.open(directory);
    }

    @AfterClass
    public static void teardown() throws IOException {
        reader.close();
        directory.close();
    }


}
