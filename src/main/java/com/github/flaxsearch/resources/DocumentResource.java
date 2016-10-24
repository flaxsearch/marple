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

import com.github.flaxsearch.api.DocumentData;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexReader;

@Path("/document/{docId}")
@Produces(MediaType.APPLICATION_JSON)
public class DocumentResource {

    private final ReaderManager readerManager;

    public DocumentResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public DocumentData getDocument(@QueryParam("segment") Integer segment, @PathParam("docId") int doc) throws IOException {

        IndexReader reader = segment == null ? readerManager.getIndexReader() : readerManager.getLeafReader(segment);

        if (doc < 0 || doc > reader.maxDoc()) {
            throw new WebApplicationException("Unknown document " + doc, Response.Status.NOT_FOUND);
        }

        Document document = reader.document(doc);
        return new DocumentData(document);
    }

}
