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
import java.util.List;

import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.BinaryDocValues;

@Path("/docvalues/{field}")
@Produces(MediaType.APPLICATION_JSON)
public class DocValuesResource {

    private final ReaderManager readerManager;

    public DocValuesResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @Path("/binary")
    @GET
    public List<String> getBinaryDocValues(@QueryParam("segment") Integer segment,
                                                  @PathParam("field") String field,
                                                  @QueryParam("from") @DefaultValue("0") int fromDoc,
                                                  @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<String> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        BinaryDocValues dv = readerManager.getBinaryDocValues(segment, field);

        for (int i = 0; i < count && i < maxDoc; i++) {
            values.add(dv.get(fromDoc + i).utf8ToString());
        }

        return values;

    }
}
