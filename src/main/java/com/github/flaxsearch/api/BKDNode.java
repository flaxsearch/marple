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

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.apache.lucene.util.StringHelper;

@JsonSerialize(using = BKDNode.Serializer.class)
public class BKDNode {

    public final byte[] minPackedValue;
    public final byte[] maxPackedValue;

    public BKDNode parent;
    public List<BKDNode> children = new LinkedList<>();
    public List<Value> values;

    public static class Value {

        final int docId;
        final byte[] value;

        public Value(int docId, byte[] value) {
            this.docId = docId;
            this.value = value;
        }
    }

    public BKDNode(byte[] minPackedValue, byte[] maxPackedValue) {
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

    public BKDNode findParent(BKDNode node, int numDims, int bytesPerDim) {
        // go up the tree until we find a node whose parent
        // contains this node
        BKDNode parent = this;
        while (parent.contains(node, numDims, bytesPerDim) == false) {
            parent = parent.parent;
        }
        return parent;
    }

    public boolean contains(BKDNode node, int numDims, int bytesPerDim) {
        boolean contains = true;
        for (int i = 0; i < numDims; i++) {
            int offset = i * bytesPerDim;
            contains &= (StringHelper.compare(bytesPerDim, minPackedValue, offset, node.minPackedValue, offset) > 0 &&
                    StringHelper.compare(bytesPerDim, maxPackedValue, offset, node.maxPackedValue, offset) < 0);
        }
        return contains;
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
            jsonGenerator.writeBinaryField("min", bkdNode.minPackedValue);
            jsonGenerator.writeBinaryField("max", bkdNode.maxPackedValue);
            if (bkdNode.values != null) {
                // lead node
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
            else {
                jsonGenerator.writeFieldName("cells");
                jsonGenerator.writeStartArray();
                for (BKDNode child : bkdNode.children) {
                    jsonGenerator.writeObject(child);
                }
                jsonGenerator.writeEndArray();
            }
        }
    }

}
