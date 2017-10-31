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
import java.util.List;
import java.util.ArrayList;
import java.util.Base64;

import com.github.flaxsearch.api.BKDNode;
import com.github.flaxsearch.api.PointsData;
import com.github.flaxsearch.util.ReaderManager;
import org.apache.lucene.index.LeafReader;
import org.apache.lucene.index.PointValues;
import org.apache.lucene.util.NumericUtils;
import org.apache.lucene.util.StringHelper;


@Path("/points/{field}")
@Produces(MediaType.APPLICATION_JSON)
public class PointsResource {

    private final ReaderManager readerManager;
    private final Base64.Encoder b64encoder;
    private final Base64.Decoder b64decoder;

    public PointsResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
        b64encoder = Base64.getEncoder();
        b64decoder = Base64.getDecoder();
    }

	public static class Value<T> {
    	public int docId;
    	public T value;

    	public Value() {}  // for unit tests

        public void setDocId(int docId) {
    	    this.docId = docId;
        }

        public void setValue(T value) {
    	    this.value = value;
        }

		public Value(int docId, T value) {
			this.docId = docId;
			this.value = value;
		}
	}

	@Path("/tree")
	@GET
	public PointsData getTree(@PathParam("field") String field,
							  @QueryParam("segment") Integer segment,
							  @QueryParam("encoding") String encoding)
	throws IOException {

		if (segment == null) {
			throw new WebApplicationException("You must pass in a segment to access points", Response.Status.BAD_REQUEST);
		}
		
		try {
			LeafReader reader = readerManager.getLeafReader(segment);
			PointValues points = reader.getPointValues();
	        if (points == null) {
				throw new WebApplicationException("No points data for field", Response.Status.NOT_FOUND);
	        }
	
	        final int numDims = points.getNumDimensions(field);
	        final int bytesPerDim = points.getBytesPerDimension(field);
	        checkEncoding(encoding, bytesPerDim);
	
	        BKDNode rootNode = buildBKDTree(points, field, numDims, bytesPerDim, encoding);
	        return new PointsData(numDims, bytesPerDim, rootNode);
		}
		catch (java.lang.IllegalArgumentException e) {
			throw new WebApplicationException("No points data for field", Response.Status.NOT_FOUND);			
		}
	}

	@Path("/values")
	@GET
	public List<Value> getValues(@PathParam("field") String field,
					 		     @QueryParam("segment") Integer segment,
							     @QueryParam("encoding") String encoding,
								 @QueryParam("min") String minValue,
								 @QueryParam("max") String maxValue)
			throws IOException {

		if (segment == null) {
			throw new WebApplicationException("You must pass in a segment to access points", Response.Status.BAD_REQUEST);
		}

        LeafReader reader = readerManager.getLeafReader(segment);
        PointValues points = reader.getPointValues();

        final int numDims = points.getNumDimensions(field);
        final int bytesPerDim = points.getBytesPerDimension(field);
        if (bytesPerDim != 4 && bytesPerDim != 8) {
            String msg = String.format("Points data for field %s has %d bytes per dimension",
                    field, bytesPerDim);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        checkEncoding(encoding, bytesPerDim);
        final byte[] minQueryValue = (minValue == null) ? null :
                parseUserValue(minValue, encoding, numDims, bytesPerDim);
        final byte[] maxQueryValue = (maxValue == null) ? null :
                parseUserValue(maxValue, encoding, numDims, bytesPerDim);

        final List values = new ArrayList<Value>(1024);

        points.intersect(field, new PointValues.IntersectVisitor() {

            @Override
            public void visit(int docID) throws IOException {
            }

            @Override
            public void visit(int docID, byte[] packedValue) throws IOException {
                if (isContained(packedValue)) {
                    if (encoding == null) {
                        values.add(new Value<>(docID, b64encoder.encodeToString(packedValue)));
                    } else if (encoding.equals("int")) {
                        values.add(new Value<>(docID, unpackInt(packedValue, numDims)));
                    } else if (encoding.equals("float")) {
                        values.add(new Value<>(docID, unpackFloat(packedValue, numDims)));
                    } else if (encoding.equals("long")) {
                        values.add(new Value<>(docID, unpackLong(packedValue, numDims)));
                    } else if (encoding.equals("double")) {
                        values.add(new Value<>(docID, unpackDouble(packedValue, numDims)));
                    } else {
                        values.add(new Value<>(docID, "invalid encoding"));
                    }
                }
            }

            @Override
            public PointValues.Relation compare(byte[] minPackedValue, byte[] maxPackedValue) {
                // FIXME
                return PointValues.Relation.CELL_CROSSES_QUERY;
            }

            private boolean isContained(byte[] thisValue) {
                for (int i = 0; i < numDims; i++) {
                    int offset = i * bytesPerDim;
                    boolean failsMin = minQueryValue != null && StringHelper.compare(
                            bytesPerDim, thisValue, offset, minQueryValue, offset) < 0;

                    boolean failsMax = maxQueryValue != null && StringHelper.compare(
                            bytesPerDim, thisValue, offset, maxQueryValue, offset) > 0;

                    if (failsMin || failsMax) return false;
                }
                return true;
            }

        });

        return values;
	}


	private BKDNode buildBKDTree(PointValues points, String field, int numDims,
                                 int bytesPerDim, String encoding) throws IOException {
		// use arrays to allow assignment in anonymous object below
		BKDNode[] currentNode = new BKDNode[1];
		BKDNode[] rootNode = new BKDNode[1];

		points.intersect(field, new PointValues.IntersectVisitor() {

			@Override
			public void visit(int docID) throws IOException {
			}

			@Override
			public void visit(int docID, byte[] packedValue) throws IOException {
				currentNode[0].valueCount++;
			}

			@Override
			public PointValues.Relation compare(byte[] minPackedValue, byte[] maxPackedValue) {
				BKDNode node = new BKDNode(minPackedValue, maxPackedValue,
                                           numDims, bytesPerDim, encoding);

				if (currentNode[0] == null) {
					currentNode[0] = rootNode[0] = node;
				}
				else {
					BKDNode parent = currentNode[0].findParentOf(node, numDims, bytesPerDim);
					node.setParent(parent);
					currentNode[0] = node;
				}
				return PointValues.Relation.CELL_CROSSES_QUERY;
			}

		});

		return rootNode[0];
	}

	private static void checkEncoding(String encoding, int bytesPerDim) {
		if (encoding == null) {
			return;
		}

		// check that the encoding param is valid
		if ((encoding.equals("int") || encoding.equals("float") ||
				encoding.equals("long") || encoding.equals("double")) == false) {
			throw new WebApplicationException("'encoding' must be one of 'int', 'float, 'long, or 'double'",
                    Response.Status.BAD_REQUEST);
		}

		if ((encoding.equals("int") || encoding.equals("float")) && bytesPerDim != 4) {
			throw new WebApplicationException("int or float encoding is only valid for 4 bytes per dim",
                    Response.Status.BAD_REQUEST);
		}

		if ((encoding.equals("long") || encoding.equals("double")) && bytesPerDim != 8) {
			throw new WebApplicationException("long or double encoding is only valid for 8 bytes per dim",
                    Response.Status.BAD_REQUEST);
		}
	}

    public Integer[] unpackInt(byte[] val, int numDims) {
        Integer[] ret = new Integer[numDims];
        for (int i = 0; i < numDims; i++) {
            ret[i] = NumericUtils.sortableBytesToInt(val, i * 4);
        }
        return ret;
    }

    public Float[] unpackFloat(byte[] val, int numDims) {
        Float[] ret = new Float[numDims];
        for (int i = 0; i < numDims; i++) {
            ret[i] = NumericUtils.sortableIntToFloat(
                    NumericUtils.sortableBytesToInt(val, i * 4));
        }
        return ret;
    }

    public Long[] unpackLong(byte[] val, int numDims) {
        Long[] ret = new Long[numDims];
        for (int i = 0; i < numDims; i++) {
            ret[i] = NumericUtils.sortableBytesToLong(val, i * 8);
        }
        return ret;
    }

    public Double[] unpackDouble(byte[] val, int numDims) {
        Double[] ret = new Double[numDims];
        for (int i = 0; i < numDims; i++) {
            ret[i] = NumericUtils.sortableLongToDouble(
                    NumericUtils.sortableBytesToLong(val, i * 8));
        }
        return ret;
    }

    public byte[] parseUserValue(String input, String encoding, int numDims, int bytesPerDim) {
        if (encoding == null) {
            return b64decoder.decode(input);
        }

        try {
            String[] bits = input.split("[, ]+");
            if (bits.length != numDims) {
                throw new WebApplicationException("points for this field have " + numDims +
                        " dimensions but supplied min or max has " + bits.length,
                        Response.Status.BAD_REQUEST);
            }

            byte[] ret = new byte[numDims * bytesPerDim];

            for (int i = 0; i < numDims; i++) {
                int offset = i * bytesPerDim;

                if (encoding.equals("int")) {
                    int val = Integer.parseInt(bits[i]);
                    NumericUtils.intToSortableBytes(val, ret, offset);
                } else if (encoding.equals("float")) {
                    int val = NumericUtils.floatToSortableInt(Float.parseFloat(bits[i]));
                    NumericUtils.intToSortableBytes(val, ret, offset);
                } else if (encoding.equals("long")) {
                    long val = Long.parseLong(bits[i]);
                    NumericUtils.longToSortableBytes(val, ret, offset);
                } else if (encoding.equals("double")) {
                    long val = NumericUtils.doubleToSortableLong(Double.parseDouble(bits[i]));
                    NumericUtils.longToSortableBytes(val, ret, offset);
                } else {
                    throw new WebApplicationException("'encoding' must be one of 'int', 'float, 'long, or 'double'",
                            Response.Status.BAD_REQUEST);
                }
            }
            return ret;
        }
        catch (NumberFormatException e) {
            throw new WebApplicationException("invalid number format \"" + input + "\"",
                    Response.Status.BAD_REQUEST);
        }
    }
}
