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
import org.apache.lucene.index.NumericDocValues;
import org.apache.lucene.index.SortedDocValues;
import org.apache.lucene.index.SortedNumericDocValues;
import org.apache.lucene.index.SortedSetDocValues;

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

    @Path("/numeric")
    @GET
    public List<String> getNumericDocValues(@QueryParam("segment") Integer segment,
                                            @PathParam("field") String field,
                                            @QueryParam("from") @DefaultValue("0") int fromDoc,
                                            @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<String> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        NumericDocValues dv = readerManager.getNumericDocValues(segment, field);

        for (int i = 0; i < count && i < maxDoc; i++) {
            values.add(Long.toString(dv.get(fromDoc + i)));
        }

        return values;

    }

    @Path("/sortednumeric")
    @GET
    public List<List<String>> getSortedNumericDocValues(@QueryParam("segment") Integer segment,
                                                        @PathParam("field") String field,
                                                        @QueryParam("from") @DefaultValue("0") int fromDoc,
                                                        @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<List<String>> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        SortedNumericDocValues dv = readerManager.getSortedNumericDocValues(segment, field);

        for (int i = 0; i < count && i < maxDoc; i++) {
            dv.setDocument(fromDoc + i);
            List<String> perDocValues = new ArrayList<>(dv.count());
            for (int index = 0; index < dv.count(); ++index) {
                perDocValues.add(Long.toString(dv.valueAt(index)));
            }
            values.add(perDocValues);
        }

        return values;

    }

    @Path("/sorted")
    @GET
    public List<List<String>> getSortedDocValues(@QueryParam("segment") Integer segment,
                                           @PathParam("field") String field,
                                           @QueryParam("from") @DefaultValue("0") int fromDoc,
                                           @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<List<String>> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        SortedDocValues dv = readerManager.getSortedDocValues(segment, field);

        for (int i = 0; i < count && i < maxDoc; i++) {
            // TODO pull out all doc values for this doc
        }

        return values;

    }

    @Path("/sortedset")
    @GET
    public List<List<String>> getSortedSetDocValues(@QueryParam("segment") Integer segment,
                                             @PathParam("field") String field,
                                             @QueryParam("from") @DefaultValue("0") int fromDoc,
                                             @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<List<String>> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        SortedSetDocValues dv = readerManager.getSortedSetDocValues(segment, field);

        for (int i = 0; i < count && i < maxDoc; i++) {
            // TODO pull out all doc values for this doc
        }

        return values;

    }
}
