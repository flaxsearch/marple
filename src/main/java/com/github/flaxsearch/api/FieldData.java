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
import org.apache.lucene.index.DocValuesType;
import org.apache.lucene.index.FieldInfo;
import org.apache.lucene.index.IndexOptions;

public class FieldData {

    public final String name;

    public final IndexOptions indexOptions;

    public final boolean hasPayloads;

    public final boolean hasNorms;

    public final DocValuesType docValuesType;

    public final int pointDimensionCount;
    
    public final boolean hasTerms;

    public FieldData(@JsonProperty("name") String name,
                     @JsonProperty("indexOptions") IndexOptions indexOptions,
                     @JsonProperty("hasNorms") boolean hasNorms,
                     @JsonProperty("hasPayloads")  boolean hasPayloads,
                     @JsonProperty("docValuesType") DocValuesType docValuesType,
                     @JsonProperty("pointDimensionCount") int pointDimensionCount,
    				 @JsonProperty("hasTerms") boolean hasTerms) {
        this.name = name;
        this.indexOptions = indexOptions;
        this.hasNorms = hasNorms;
        this.docValuesType = docValuesType;
        this.pointDimensionCount = pointDimensionCount;
        this.hasPayloads = hasPayloads;
        this.hasTerms = hasTerms;
    }

    public FieldData(FieldInfo fieldInfo, boolean hasTerms) {
        this.name = fieldInfo.name;
        this.indexOptions = fieldInfo.getIndexOptions();
        this.hasNorms = fieldInfo.hasNorms();
        this.docValuesType = fieldInfo.getDocValuesType();
        this.pointDimensionCount = fieldInfo.getPointDimensionCount();
        this.hasPayloads = fieldInfo.hasPayloads();
        this.hasTerms = hasTerms;
    }
}
