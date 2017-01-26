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

import com.fasterxml.jackson.annotation.JsonProperty;

public class TermData {

    public final String term;

    public final int docFreq;

    public final long totalTermFreq;

    public TermData(@JsonProperty("term") String term,
                    @JsonProperty("docFreq") int docFreq,
                    @JsonProperty("totalTermFreq") long totalTermFreq) {
        this.term = term;
        this.docFreq = docFreq;
        this.totalTermFreq = totalTermFreq;
    }

}
