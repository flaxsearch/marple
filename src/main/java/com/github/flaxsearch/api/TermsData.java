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
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.lucene.index.Terms;

public class TermsData {

    public final long termCount;

    public final long docCount;

    public final String minTerm;

    public final String maxTerm;

    public final List<String> terms;

    public TermsData(Terms terms, List<String> termsList) throws IOException {
        this.termCount = terms.size();
        this.docCount = terms.getDocCount();
        this.minTerm = terms.getMin().utf8ToString();
        this.maxTerm = terms.getMax().utf8ToString();
        this.terms = termsList;
    }

    @JsonCreator
    public TermsData(@JsonProperty("termCount") long termCount,
                     @JsonProperty("docCount") long docCount,
                     @JsonProperty("minTerm") String minTerm,
                     @JsonProperty("maxTerm") String maxTerm,
                     @JsonProperty("terms") List<String> terms) {
        this.termCount = termCount;
        this.docCount = docCount;
        this.minTerm = minTerm;
        this.maxTerm = maxTerm;
        this.terms = terms;
    }
}
