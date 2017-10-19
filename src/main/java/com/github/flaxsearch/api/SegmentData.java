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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.lucene.index.LeafReaderContext;

public class SegmentData {

    public final int ord;
    public final int maxDoc;
    public final int numDocs;
    public final String sort;

    public SegmentData(LeafReaderContext ctx) {
        ord = ctx.ord;
        maxDoc = ctx.reader().maxDoc();
        numDocs = ctx.reader().numDocs();
        if (ctx.reader().getMetaData().getSort() == null) {
            sort = "none";
        }
        else {
            sort = ctx.reader().getMetaData().getSort().toString();
        }
    }

    @JsonCreator
    public SegmentData(@JsonProperty("ord") int ord, @JsonProperty("maxDoc") int maxDoc,
                       @JsonProperty("numDocs") int numDocs, @JsonProperty("sort") String sort) {
        this.ord = ord;
        this.maxDoc = maxDoc;
        this.numDocs = numDocs;
        this.sort = sort;
    }

}
