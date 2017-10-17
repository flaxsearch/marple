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
import java.util.Comparator;
import java.util.List;

import com.github.flaxsearch.api.FieldData;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.FieldInfo;
import org.apache.lucene.index.FieldInfos;
import org.apache.lucene.index.Fields;
import org.apache.lucene.index.Terms;

@Path("/fields")
@Produces(MediaType.APPLICATION_JSON)
public class FieldsResource {

    private final ReaderManager readerManager;

    public FieldsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public List<FieldData> getFields(@QueryParam("segment") Integer segment) throws IOException {

        List<FieldData> fieldData = new ArrayList<>();
        FieldInfos fieldInfos = readerManager.getFieldInfos(segment);
        for (FieldInfo fieldInfo : fieldInfos) {
            Terms terms = readerManager.getTerms(segment, fieldInfo.name);
            fieldData.add(new FieldData(fieldInfo, (terms != null)));
        }

        fieldData.sort(Comparator.comparing(o -> o.name));
        return fieldData;
    }

    @GET
    @Path("{field}")
    public FieldData getField(@QueryParam("segment") Integer segment, @PathParam("field") String field) throws IOException {
        FieldInfo info = readerManager.getFieldInfo(segment, field);
        Terms terms = readerManager.getTerms(segment, field);
        return new FieldData(info, terms != null);
    }

}
