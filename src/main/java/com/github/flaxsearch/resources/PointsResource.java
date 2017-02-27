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
import java.util.concurrent.atomic.AtomicReference;

import com.github.flaxsearch.api.BKDNode;
import com.github.flaxsearch.api.PointsData;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.LeafReader;
import org.apache.lucene.index.PointValues;

@Path("/points/{field}")
@Produces(MediaType.APPLICATION_JSON)
public class PointsResource {

    private final ReaderManager readerManager;

    public PointsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public PointsData getPointsData(@PathParam("field") String field,
                                    @QueryParam("segment") Integer segment) throws IOException {

        if (segment == null) {
            throw new WebApplicationException("You must pass in a segment to access points", Response.Status.BAD_REQUEST);
        }

        try {
	        LeafReader reader = readerManager.getLeafReader(segment);
	        PointValues points = reader.getPointValues();
	
	        final int numDims = points.getNumDimensions(field);
	        final int bytesPerDim = points.getBytesPerDimension(field);
	
	        AtomicReference<BKDNode> currentNode = new AtomicReference<>();
	        points.intersect(field, new PointValues.IntersectVisitor() {
	            @Override
	            public void visit(int docID) throws IOException {
	
	            }
	
	            @Override
	            public void visit(int docID, byte[] packedValue) throws IOException {
	                currentNode.get().addDoc(docID, packedValue);
	            }
	
	            @Override
	            public PointValues.Relation compare(byte[] minPackedValue, byte[] maxPackedValue) {
	                BKDNode node = new BKDNode(minPackedValue, maxPackedValue);
	                if (currentNode.get() == null) {
	                    currentNode.set(node);
	                }
	                else {
	                    node.setParent(currentNode.get().findParent(node, numDims, bytesPerDim));
	                    currentNode.set(node);
	                }
	                return PointValues.Relation.CELL_CROSSES_QUERY;
	            }
	
	        });
	
	        return new PointsData(numDims, bytesPerDim, BKDNode.findRoot(currentNode.get()));
        }
        catch (IllegalArgumentException e) {
        	String msg = String.format("No points data for field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }
    }
}
