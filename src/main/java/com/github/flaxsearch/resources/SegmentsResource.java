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
import java.util.ArrayList;
import java.util.List;

import com.github.flaxsearch.api.SegmentData;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.LeafReaderContext;

@Path("/segments")
@Produces(MediaType.APPLICATION_JSON)
public class SegmentsResource {

    private final ReaderManager readerManager;

    public SegmentsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public List<SegmentData> getSegmentData() {
        List<SegmentData> segmentData = new ArrayList<>();
        for (LeafReaderContext ctx : readerManager.getIndexReader().leaves()) {
            segmentData.add(new SegmentData(ctx));
        }
        return segmentData;
    }
}
