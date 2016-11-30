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
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

import com.github.flaxsearch.api.TermsData;
import com.github.flaxsearch.util.BytesRefUtils;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.Fields;
import org.apache.lucene.index.Terms;
import org.apache.lucene.index.TermsEnum;
import org.apache.lucene.util.BytesRef;
import org.apache.lucene.util.automaton.CompiledAutomaton;
import org.apache.lucene.util.automaton.RegExp;

@Path("/terms/{field}")
@Produces(MediaType.APPLICATION_JSON)
public class TermsResource {

    private final ReaderManager readerManager;

    public TermsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public TermsData getTerms(@QueryParam("segment") Integer segment,
                                 @PathParam("field") String field,
                                 @QueryParam("from") String startTerm,
                                 @QueryParam("filter") String filter,
                                 @QueryParam("encoding") @DefaultValue("utf8") String encoding,
                                 @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        Fields fields = readerManager.getFields(segment);
        Terms terms = fields.terms(field);

        if (terms == null)
            throw new WebApplicationException("No such field " + field, Response.Status.NOT_FOUND);

        TermsEnum te = getTermsEnum(terms, filter);
        List<String> collected = new ArrayList<>();
        Function<BytesRef, String> encoder = BytesRefUtils.getEncoder(encoding);

        if (startTerm != null) {
            BytesRef start = BytesRefUtils.getDecoder(encoding).apply(startTerm);
            if (te.seekCeil(start) == TermsEnum.SeekStatus.END)
                return new TermsData(terms, Collections.emptyList(), encoder);
        }
        else {
            if (te.next() == null) {
                return new TermsData(terms, Collections.emptyList(), encoder);
            }
        }

        do {
            collected.add(encoder.apply(te.term()));
        }
        while (te.next() != null && --count > 0);

        return new TermsData(terms, collected, encoder);
    }

    private TermsEnum getTermsEnum(Terms terms, String filter) throws IOException {
        if (filter == null)
            return terms.iterator();

        CompiledAutomaton automaton = new CompiledAutomaton(new RegExp(filter).toAutomaton());
        return automaton.getTermsEnum(terms);
    }

}
