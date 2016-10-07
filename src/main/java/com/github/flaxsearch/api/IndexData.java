package com.github.flaxsearch.api;
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
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.LeafReaderContext;

public class IndexData {

    public final String indexpath;

    public final long generation;

    public final List<SegmentData> segments;

    public IndexData(String indexpath, ReaderManager readerManager) throws IOException {
        this.indexpath = indexpath;
        DirectoryReader reader = (DirectoryReader) readerManager.getIndexReader();
        this.generation = reader.getIndexCommit().getGeneration();

        segments = new ArrayList<>();
        for (LeafReaderContext ctx : readerManager.getIndexReader().leaves()) {
            segments.add(new SegmentData(ctx));
        }
    }

    public IndexData(@JsonProperty("indexPath") String indexPath,
                     @JsonProperty("generation") long generation,
                     @JsonProperty("segments") List<SegmentData> segments) {
        this.indexpath = indexPath;
        this.generation = generation;
        this.segments = segments;
    }

}
