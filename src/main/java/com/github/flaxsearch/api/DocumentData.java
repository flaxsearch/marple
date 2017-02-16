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

import com.google.common.collect.ImmutableMultimap;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexableField;

public class DocumentData {

    public final ImmutableMultimap<String, String> fields;
    public final long totalLengthInChars;
    public final boolean complete;

    public DocumentData() {
    	fields = null;
    	totalLengthInChars = 0;
    	complete = false;
    }

    public DocumentData(Document document, int maxFieldLength, int maxFields) {
    	long length = 0;
    	int fieldCount = 0;
    	boolean complete = true;
    	
        ImmutableMultimap.Builder<String, String> builder = ImmutableMultimap.builder();
        for (IndexableField field : document) {
        	String val = field.stringValue();
        	if (val != null) {
        		length += val.length();
        		if (fieldCount < maxFields) {
        			if (val.length() <= maxFieldLength) {
            			builder.put(field.name(), val);         				
        			}
        			else {
            			builder.put(field.name(), val.substring(0, maxFieldLength) + "...");
        				complete = false;
        			}
        		}
        		else {
        			complete = false;
        		}
        	}
        	fieldCount += 1;
        }
        this.fields = builder.build();
        this.totalLengthInChars = length;
        this.complete = complete;
    }
}
