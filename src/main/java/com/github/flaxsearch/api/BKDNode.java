package com.github.flaxsearch.api;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import org.apache.lucene.util.NumericUtils;
import org.apache.lucene.util.StringHelper;

import javax.xml.bind.DatatypeConverter;

@JsonSerialize(using = BKDNode.Serializer.class)
public class BKDNode {

    public final byte[] minPackedValue;
    public final byte[] maxPackedValue;

    public final int numDims;
    public final int bytesPerDim;
    public final String encoding;

    public BKDNode parent;
    public List<BKDNode> children = new LinkedList<>();
    public List<Value> values;
    public final int nodeId;

    public static class Value {

        final int docId;
        final byte[] value;

        public Value(int docId, byte[] value) {
            this.docId = docId;
            this.value = value;
        }
    }

    public BKDNode(int nodeId, byte[] minPackedValue, byte[] maxPackedValue,
                   int numDims, int bytesPerDim, String encoding) {
        this.nodeId = nodeId;
        this.minPackedValue = minPackedValue.clone();
        this.maxPackedValue = maxPackedValue.clone();

        this.numDims = numDims;
        this.bytesPerDim = bytesPerDim;
        this.encoding = encoding;
    }

    public void addDoc(int docID, byte[] packedValue) {
        if (values == null)
            values = new ArrayList<>();
        values.add(new Value(docID, packedValue.clone()));
    }

    public void setParent(BKDNode parent) {
        this.parent = parent;
        parent.children.add(this);
    }

    public BKDNode findParentOf(BKDNode node, int numDims, int bytesPerDim) {
        // go up the tree until we find a node which contains the supplied node
        BKDNode parent = this;
        while (parent.contains(node, numDims, bytesPerDim) == false) {
            parent = parent.parent;
        }
        return parent;
    }

    public boolean contains(BKDNode node, int numDims, int bytesPerDim) {
        for (int i = 0; i < numDims; i++) {
            int offset = i * bytesPerDim;
            int cMin = StringHelper.compare(bytesPerDim, minPackedValue, offset,
                                            node.minPackedValue, offset);
            int cMax = StringHelper.compare(bytesPerDim, maxPackedValue, offset,
                                            node.maxPackedValue, offset);
            if (cMin > 0 || cMax < 0) return false;
        }
        return true;
    }

    public BKDNode findNodeById(int nodeId) {
        if (this.nodeId == nodeId) {
            return this;
        }

        for (BKDNode child : children) {
            BKDNode found = child.findNodeById(nodeId);
            if (found != null) {
                return found;
            }
        }

        return null;
    }

    public BKDNode cloneToDepth(int depth) {
        BKDNode node = new BKDNode(this.nodeId, this.minPackedValue, this.maxPackedValue,
                                   this.numDims, this.bytesPerDim, this.encoding);
        if (depth > 0) {
            if (this.values != null) {
                for (Value value : this.values) {
                    node.addDoc(value.docId, value.value);
                }
            }

            for (BKDNode child : children) {
                BKDNode childClone = child.cloneToDepth(depth - 1);
                childClone.setParent(node);
            }
        }

        return node;
    }

    public String toString() {
        return "BKDNode[" +
                DatatypeConverter.printHexBinary(minPackedValue) + ":" +
                DatatypeConverter.printHexBinary(maxPackedValue) + "]";
    }

    public static BKDNode findRoot(BKDNode node) {
        while (node.parent != null) {
            node = node.parent;
        }
        return node;
    }

    static class Serializer extends StdSerializer<BKDNode> {

        protected Serializer() {
            super(BKDNode.class);
        }

        @Override
        public void serialize(BKDNode bkdNode, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
            jsonGenerator.writeStartObject();
            jsonGenerator.writeNumberField("id", bkdNode.nodeId);
            jsonGenerator.writeFieldName("min");
            writeValue(jsonGenerator, bkdNode.minPackedValue,
                    bkdNode.numDims, bkdNode.bytesPerDim, bkdNode.encoding);

            jsonGenerator.writeFieldName("max");
            writeValue(jsonGenerator, bkdNode.maxPackedValue,
                    bkdNode.numDims, bkdNode.bytesPerDim, bkdNode.encoding);

            if (bkdNode.values != null) {
                // leaf node
                jsonGenerator.writeFieldName("values");
                jsonGenerator.writeStartArray();
                for (Value value : bkdNode.values) {
                    jsonGenerator.writeStartObject();
                    jsonGenerator.writeNumberField("doc", value.docId);
                    if (bkdNode.encoding == null) {
                        jsonGenerator.writeBinaryField("value", value.value);
                    }
                    else {
                        jsonGenerator.writeFieldName("value");
                        writeValue(jsonGenerator, value.value,
                                bkdNode.numDims, bkdNode.bytesPerDim, bkdNode.encoding);
                    }
                    jsonGenerator.writeEndObject();
                }
                jsonGenerator.writeEndArray();
            }
            else if (bkdNode.children.size() > 0){
                jsonGenerator.writeFieldName("children");
                jsonGenerator.writeStartArray();
                for (BKDNode child : bkdNode.children) {
                    jsonGenerator.writeObject(child);
                }
                jsonGenerator.writeEndArray();
            }
            jsonGenerator.writeEndObject();
        }

        private void writeValue(JsonGenerator jsonGenerator, byte[] value,
                                int numDims, int bytesPerDim, String encoding)
                throws IOException
        {
            if (encoding == null) {
                // if we have no encoding specified, write the raw bytes
                jsonGenerator.writeBinary(value);
            }
            else {
                // FIXME return an array for 1-dim values for consistency - is this a good idea?
                jsonGenerator.writeStartArray();
                for (int d = 0; d < numDims; d++) {
                    int offset = d * bytesPerDim;
                    if (bytesPerDim == 4) {
                        int intval = NumericUtils.sortableBytesToInt(value, offset);
                        if (encoding.equals("int")) {
                            jsonGenerator.writeNumber(intval);
                        } else if (encoding.equals("float")) {
                            jsonGenerator.writeNumber(NumericUtils.sortableIntToFloat(intval));
                        } else {
                            // we shouldn't reach this due to checks in PointsResource
                            jsonGenerator.writeString("INVALID ENCODING");
                        }
                    } else if (bytesPerDim == 8) {
                        long longval = NumericUtils.sortableBytesToLong(value, offset);
                        if (encoding.equals("long")) {
                            jsonGenerator.writeNumber(longval);
                        } else if (encoding.equals("float")) {
                            jsonGenerator.writeNumber(NumericUtils.sortableLongToDouble(longval));
                        } else {
                            // we shouldn't reach this due to checks in PointsResource
                            jsonGenerator.writeString("INVALID ENCODING");
                        }
                    } else {
                        // we shouldn't reach this due to checks in PointsResource
                        jsonGenerator.writeString("INVALID ENCODING");
                    }
                }
                jsonGenerator.writeEndArray();
            }
        }
    }

}
