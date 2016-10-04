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

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.LeafReaderContext;

@Path("/fields")
@Produces(MediaType.APPLICATION_JSON)
public class FieldsResource {

    private final ReaderManager readerManager;

    public FieldsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public List<String> getFields(@QueryParam("segment") Integer segment) throws IOException {

        Set<String> fields = new TreeSet<>();
        IndexReader reader = readerManager.getIndexReader();

        if (segment != null) {
            LeafReaderContext ctx = reader.leaves().get(segment);
            for (String field : ctx.reader().fields()) {
                fields.add(field);
            }
        }
        else {
            for (LeafReaderContext ctx : reader.leaves()) {
                for (String field : ctx.reader().fields()) {
                    fields.add(field);
                }
            }
        }

        List<String> results = new ArrayList<>();
        results.addAll(fields);
        return results;
    }

}
