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

import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.lucene.index.PostingsEnum;
import org.apache.lucene.util.BytesRef;

public class PositionData {

    public final int position;

    public final int startOffset;

    public final int endOffset;

    public final String payload;

    public PositionData(PostingsEnum pe) throws IOException {
        this.position = pe.nextPosition();
        this.startOffset = pe.startOffset();
        this.endOffset = pe.endOffset();
        this.payload = payloadToString(pe.getPayload());
    }

    public PositionData(@JsonProperty("position") int position,
                        @JsonProperty("startOffset") int startOffset,
                        @JsonProperty("endOffset") int endOffset,
                        @JsonProperty("payload") String payload) {
        this.position = position;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
        this.payload = payload;
    }

    static String payloadToString(BytesRef payload) {
        if (payload == null)
            return null;
        return payload.utf8ToString();
    }
}
