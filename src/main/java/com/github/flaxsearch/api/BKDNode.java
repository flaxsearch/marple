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
import java.util.LinkedList;
import java.util.List;
import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import org.apache.lucene.util.StringHelper;

import javax.xml.bind.DatatypeConverter;

@JsonSerialize(using = BKDNode.Serializer.class)
public class BKDNode {

    public final byte[] minPackedValue;
    public final byte[] maxPackedValue;

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

    public BKDNode(int nodeId, byte[] minPackedValue, byte[] maxPackedValue) {
        this.nodeId = nodeId;
        this.minPackedValue = minPackedValue.clone();
        this.maxPackedValue = maxPackedValue.clone();
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
        BKDNode node = new BKDNode(this.nodeId, this.minPackedValue, this.maxPackedValue);
        if (this.values != null) {
            for (Value value : this.values) {
                node.addDoc(value.docId, value.value);
            }
        }

        if (depth > 0) {
            for (BKDNode child : children) {
                BKDNode childClone = child.cloneToDepth(depth - 1);
                childClone.setParent(node);
            }
        }
        else {
            node.children = null;
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
            jsonGenerator.writeBinaryField("min", bkdNode.minPackedValue);
            jsonGenerator.writeBinaryField("max", bkdNode.maxPackedValue);
            if (bkdNode.values != null) {
                // leaf node
                jsonGenerator.writeFieldName("values");
                jsonGenerator.writeStartArray();
                for (Value value : bkdNode.values) {
                    jsonGenerator.writeStartObject();
                    jsonGenerator.writeNumberField("doc", value.docId);
                    jsonGenerator.writeBinaryField("bytes", value.value);
                    jsonGenerator.writeEndObject();
                }
                jsonGenerator.writeEndArray();
            }
            else if (bkdNode.children == null) {
                jsonGenerator.writeNullField("nodes");
            }
            else {
                jsonGenerator.writeFieldName("nodes");
                jsonGenerator.writeStartArray();
                for (BKDNode child : bkdNode.children) {
                    jsonGenerator.writeObject(child);
                }
                jsonGenerator.writeEndArray();
            }
            jsonGenerator.writeEndObject();
        }
    }

}
