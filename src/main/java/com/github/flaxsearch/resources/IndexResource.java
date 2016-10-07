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
import javax.ws.rs.core.MediaType;

import java.io.IOException;

import com.github.flaxsearch.api.IndexData;
import com.github.flaxsearch.util.ReaderManager;

@Path("/index")
@Produces(MediaType.APPLICATION_JSON)
public class IndexResource {

    private final ReaderManager readerManager;
    private final String indexPath;

    public IndexResource(String indexPath, ReaderManager readerManager) {
        this.indexPath = indexPath;
        this.readerManager = readerManager;
    }

    @GET
    public IndexData getIndexData() throws IOException {
        return new IndexData(indexPath, readerManager);
    }
}
