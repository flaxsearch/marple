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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
    public List<String> getTerms(@QueryParam("segment") Integer segment,
                                 @PathParam("field") String field,
                                 @QueryParam("from") String startTerm,
                                 @QueryParam("filter") String filter,
                                 @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        Fields fields = readerManager.getFields(segment);
        Terms terms = fields.terms(field);

        if (terms == null)
            return Collections.emptyList();

        TermsEnum te = getTermsEnum(terms, filter);
        System.out.println("te=" + te);
        List<String> collected = new ArrayList<>();

        boolean hasTerms = true;
        if (startTerm != null) {
            if (te.seekCeil(new BytesRef(startTerm)) == TermsEnum.SeekStatus.END)
                return Collections.emptyList();
        }
        else {
            if (te.next() == null) {
                hasTerms = false;
            }
        }

        if (hasTerms) {
            do {
                collected.add(te.term().utf8ToString());
            }
            while (te.next() != null && --count > 0);
        }

        return collected;
    }

    private TermsEnum getTermsEnum(Terms terms, String filter) throws IOException {
        if (filter == null)
            return terms.iterator();

        CompiledAutomaton automaton = new CompiledAutomaton(new RegExp(filter).toAutomaton());
        return automaton.getTermsEnum(terms);
    }

}
