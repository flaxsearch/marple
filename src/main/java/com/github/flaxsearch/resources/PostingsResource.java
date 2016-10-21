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

import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.*;
import org.apache.lucene.util.Bits;
import org.apache.lucene.util.BytesRef;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.*;

@Path("/postings/{field}")
@Produces(MediaType.APPLICATION_JSON)
public class PostingsResource {

    private final ReaderManager readerManager;

    public PostingsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public List<Map<String,Integer>> getPostings(@QueryParam("segment") Integer segment,
                                                 @PathParam("field") String field,
                                                 @QueryParam("term") String term,
                                                 @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        Fields fields = readerManager.getFields(segment);
        Terms terms = fields.terms(field);

        if (terms == null)
            return Collections.emptyList();

        TermsEnum te = terms.iterator();

        if (term != null) {
            if (!te.seekExact(new BytesRef(term)))
                return Collections.emptyList();
        } else {
            return Collections.emptyList();
        }

        Bits liveDocs = readerManager.getLiveDocs(segment);
        PostingsEnum pe = te.postings(null, PostingsEnum.ALL);

        List<Map<String,Integer>> postings = new ArrayList<>();
        int docId;
        while ((docId = pe.nextDoc()) != PostingsEnum.NO_MORE_DOCS && --count >= 0) {
            if (liveDocs != null && liveDocs.get(docId) == false) continue;
            for (int i = 0; i < pe.freq(); i++) {
                Map<String,Integer> posting = new LinkedHashMap<>();
                posting.put("docId", docId);
                posting.put("freq", pe.freq());
                posting.put("position", pe.nextPosition());
                posting.put("startOffset", pe.startOffset());
                posting.put("endOffset", pe.endOffset());
                postings.add(posting);
            }
        }
        return postings;
    }

}
