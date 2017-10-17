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

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;

import com.github.flaxsearch.util.BytesRefUtils;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.PostingsEnum;
import org.apache.lucene.index.TermsEnum;
import org.apache.lucene.util.Bits;
import org.apache.lucene.util.BytesRef;

@Path("/postings/{field}/{term}")
@Produces(MediaType.APPLICATION_JSON)
public class PostingsResource {

    private final ReaderManager readerManager;

    public PostingsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public int[] getPostings(@QueryParam("segment") Integer segment,
                                @PathParam("field") String field,
                                @PathParam("term") String term,
                                @QueryParam("encoding") String encoding,
                                @QueryParam("offset") @DefaultValue("0") int offset,
                                @QueryParam("count") @DefaultValue("1000000") int count) throws IOException {

        BytesRef decodedTerm = encoding == null ? new BytesRef(term) : BytesRefUtils.decode(term, encoding);
        TermsEnum te = readerManager.findTermPostings(segment, field, decodedTerm);
        Bits liveDocs = readerManager.getLiveDocs(segment);
        PostingsEnum pe = te.postings(null, PostingsEnum.NONE);

        int docFreq = te.docFreq();

        int size = ((docFreq - offset) < count) ? (docFreq - offset) : count;
        if (size < 1) {
            return new int[0];
        }
        
        int[] postings = new int[size];
        int docId;
        int i = 0;
        while ((docId = pe.nextDoc()) != PostingsEnum.NO_MORE_DOCS && i < (offset + count)) {
            if (liveDocs != null && liveDocs.get(docId) == false) continue;
            if (i >= offset) {
                postings[i - offset] = docId;
            }
            i++;
        }
        return postings;
    }

}
