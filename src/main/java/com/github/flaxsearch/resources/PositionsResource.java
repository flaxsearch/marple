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
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.github.flaxsearch.api.DocTermData;
import com.github.flaxsearch.api.PositionData;
import com.github.flaxsearch.util.ReaderManager;
import com.github.flaxsearch.util.BytesRefUtils;
import org.apache.lucene.index.PostingsEnum;
import org.apache.lucene.index.TermsEnum;
import org.apache.lucene.util.BytesRef;

@Path("/positions/{field}/{term}/{docId}")
@Produces(MediaType.APPLICATION_JSON)
public class PositionsResource {

    private final ReaderManager readerManager;

    public PositionsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public DocTermData getDocTermData(@QueryParam("segment") Integer segment,
                                      @PathParam("field") String field,
                                      @PathParam("term") String term,
                                      @QueryParam("encoding") String encoding,
                                      @PathParam("docId") int docId) throws Exception {

        BytesRef decodedTerm = encoding == null ? new BytesRef(term) : BytesRefUtils.decode(term, encoding);
        TermsEnum te = readerManager.findTermPostings(segment, field, decodedTerm);
        PostingsEnum pe = te.postings(null, PostingsEnum.ALL);

        if (pe.advance(docId) != docId) {
            String seg = segment == null ? "" : " in segment " + segment;
            String msg = String.format(Locale.ROOT, "No document %d%s in index", docId, seg);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }
        List<PositionData> positions = new ArrayList<>();
        int remaining = pe.freq();
        while (remaining > 0) {
            remaining--;
            positions.add(new PositionData(pe));
        }

        return new DocTermData(docId, positions);
    }
}
