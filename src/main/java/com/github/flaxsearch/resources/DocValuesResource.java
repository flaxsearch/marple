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
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;

import com.github.flaxsearch.util.ReaderManager;
import com.github.flaxsearch.api.AnyDocValuesResponse;
import com.github.flaxsearch.api.ValueWithOrd;
import com.github.flaxsearch.util.BytesRefUtils;

import org.apache.lucene.index.BinaryDocValues;
import org.apache.lucene.index.NumericDocValues;
import org.apache.lucene.index.SortedDocValues;
import org.apache.lucene.index.SortedNumericDocValues;
import org.apache.lucene.index.SortedSetDocValues;
import org.apache.lucene.index.DocValuesType;
import org.apache.lucene.index.FieldInfo;
import org.apache.lucene.index.TermsEnum;
import org.apache.lucene.index.AutomatonTermsEnum;
import org.apache.lucene.util.BytesRef;
import org.apache.lucene.util.automaton.CompiledAutomaton;
import org.apache.lucene.util.automaton.RegExp;


@Path("/docvalues/{field}")
@Produces(MediaType.APPLICATION_JSON)
public class DocValuesResource {

    private final ReaderManager readerManager;

    public DocValuesResource(ReaderManager readerManager) {
        this.readerManager = readerManager;
    }

    @GET
    public AnyDocValuesResponse getAnyTypeDocValues(@QueryParam("segment") Integer segment,
                                            @PathParam("field") String field,
                                            @QueryParam("encoding") @DefaultValue("utf8") String encoding,
                                            @QueryParam("docs") String docs)
                                            throws IOException {
    	AnyDocValuesResponse response = null;
        int maxDoc = readerManager.getMaxDoc(segment);
        Set<Integer> docset = parseDocSet(docs, maxDoc);
        FieldInfo fieldInfo = readerManager.getFieldInfo(segment, field);

        if (fieldInfo == null) {
            String msg = String.format("No such field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        DocValuesType dvtype = fieldInfo.getDocValuesType();
        try {
	        if (dvtype == DocValuesType.BINARY) {
	            BinaryDocValues dv = readerManager.getBinaryDocValues(segment, field);
	            Map<Integer,String> values = new HashMap<>(docset.size());
	            for (int docid : docset) {
	                values.put(docid, BytesRefUtils.encode(dv.get(docid), encoding));
	            }
	            response = new AnyDocValuesResponse("BINARY", values);
	        }
	        else if (dvtype == DocValuesType.NUMERIC) {
	            NumericDocValues dv = readerManager.getNumericDocValues(segment, field);
	            Map<Integer,Long> values = new HashMap<>(docset.size());
	            for (int docid : docset) {
	                values.put(docid, dv.get(docid));
	            }
	            response = new AnyDocValuesResponse("NUMERIC", values);
	        }
	        else if (dvtype == DocValuesType.SORTED_NUMERIC) {
	            SortedNumericDocValues dv = readerManager.getSortedNumericDocValues(segment, field);
	            Map<Integer,List<Long>> values = new HashMap<>(docset.size());
	            for (int docid : docset) {
	                dv.setDocument(docid);
	                List<Long> perDocValues = new ArrayList<>(dv.count());
	                for (int index = 0; index < dv.count(); ++index) {
	                    perDocValues.add(dv.valueAt(index));
	                }
	                values.put(docid, perDocValues);
	            }
	            response = new AnyDocValuesResponse("SORTED_NUMERIC", values);
	        }
	        else if (dvtype == DocValuesType.SORTED) {
	            SortedDocValues dv = readerManager.getSortedDocValues(segment, field);
	            Map<Integer,ValueWithOrd> values = new HashMap<>(docset.size());
	            for (int docid : docset) {
	                values.put(docid, new ValueWithOrd(BytesRefUtils.encode(dv.get(docid), encoding), dv.getOrd(docid)));
	            }
	            response = new AnyDocValuesResponse("SORTED", values);
	        }
	        else if (dvtype == DocValuesType.SORTED_SET) {
	            SortedSetDocValues dv = readerManager.getSortedSetDocValues(segment, field);
	            Map<Integer,List<ValueWithOrd>> values = new HashMap<>(docset.size());
	            for (int docid : docset) {
	                dv.setDocument(docid);
	                List<ValueWithOrd> perDocValues = new ArrayList<>((int)dv.getValueCount());
	                long ord;
	                while ((ord = dv.nextOrd()) != SortedSetDocValues.NO_MORE_ORDS) {
	                     perDocValues.add(new ValueWithOrd(BytesRefUtils.encode(dv.lookupOrd(ord), encoding), ord));
	                }
	                values.put(docid, perDocValues);
	            }
	            response = new AnyDocValuesResponse("SORTED_SET", values);
	        }
	        else {
	            String msg = String.format("No doc values for field %s", field);
	            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
	        }
        }
        catch (NumberFormatException e) {
            throw new WebApplicationException("Field " + field + " cannot be decoded as " + encoding, Response.Status.BAD_REQUEST);
        }

        return response;
    }

    @Path("/ordered")
    @GET
    public AnyDocValuesResponse getOrderedDocValues(@QueryParam("segment") Integer segment,
            										@PathParam("field") String field,
            										@QueryParam("from") String startTerm,
            										@QueryParam("offset") Integer offset,
            										@QueryParam("count") @DefaultValue("50") int count,
            										@QueryParam("filter") String filter,
            										@QueryParam("encoding") @DefaultValue("utf8") String encoding) 
    												throws IOException {

    	if (startTerm != null) {
        	if (offset != null) {
        		throw new WebApplicationException("Cannot have both 'from' and 'offset' parameters", Response.Status.FORBIDDEN);
        	}
        	if (filter != null) {
        		throw new WebApplicationException("Cannot have both 'from' and 'filter' parameters", Response.Status.FORBIDDEN);        		
        	}
    	}
    	
        FieldInfo fieldInfo = readerManager.getFieldInfo(segment, field);

        if (fieldInfo == null) {
            String msg = String.format("No such field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);    		
        }

        try {
            DocValuesType dvtype = fieldInfo.getDocValuesType();
            String type_s;
            TermsEnum te;

            if (dvtype == DocValuesType.SORTED) {
            	if (filter != null && filter.length() > 0) {
    	            te = readerManager.getSortedDocValues(segment, field).intersect(
    	            		new CompiledAutomaton(new RegExp(filter).toAutomaton()));
            		
            	} 
            	else {
            		te = readerManager.getSortedDocValues(segment, field).termsEnum();
            	}
	            type_s = "SORTED";
	        }
	        else if (dvtype == DocValuesType.SORTED_SET) {
            	if (filter != null && filter.length() > 0) {
            		te = readerManager.getSortedSetDocValues(segment, field).intersect(
    	            		new CompiledAutomaton(new RegExp(filter).toAutomaton()));
            	}
            	else {
            		te = readerManager.getSortedSetDocValues(segment, field).termsEnum();
            	}
	            type_s = "SORTED_SET";
	        }
	        else {
	        	throw new WebApplicationException("Field " + field + " cannot be viewed in value order", Response.Status.BAD_REQUEST);
	        }
            
	        List<ValueWithOrd> collected = new ArrayList<>();

            if (startTerm != null) {
                BytesRef start = BytesRefUtils.decode(startTerm, encoding);
                if (te.seekCeil(start) == TermsEnum.SeekStatus.END)
                    return new AnyDocValuesResponse(type_s, collected);
            } else {
                if (te.next() == null) {
                    return new AnyDocValuesResponse(type_s, collected);
                }
            }

            boolean hasMore = true;
            if (offset != null) {
            	for (int i = 0; i < offset; i++) {
            		if (te.next() == null) {
            			hasMore = false;
            			break;
            		}
            	}
            }

            if (hasMore) {
            	do {
            		collected.add(new ValueWithOrd(BytesRefUtils.encode(te.term(), encoding), te.ord()));
            	}
            	while (te.next() != null && --count > 0);
            }
            
            return new AnyDocValuesResponse(type_s, collected);
        }
	    catch (NumberFormatException e) {
	        throw new WebApplicationException("Field " + field + " cannot be decoded as " + encoding, Response.Status.BAD_REQUEST);
	    }    	
    }
    
    @Path("/binary")
    @GET
    public List<String> getBinaryDocValues(@QueryParam("segment") Integer segment,
                                            @PathParam("field") String field,
                                            @QueryParam("from") @DefaultValue("0") int fromDoc,
                                            @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<String> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        BinaryDocValues dv = readerManager.getBinaryDocValues(segment, field);
        if (dv == null) {
            String msg = String.format("No binary doc values on field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        for (int i = 0; i < count && i < maxDoc; i++) {
            values.add(dv.get(fromDoc + i).utf8ToString());
        }

        return values;
    }

    @Path("/numeric")
    @GET
    public List<String> getNumericDocValues(@QueryParam("segment") Integer segment,
                                            @PathParam("field") String field,
                                            @QueryParam("from") @DefaultValue("0") int fromDoc,
                                            @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<String> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        NumericDocValues dv = readerManager.getNumericDocValues(segment, field);
        if (dv == null) {
            String msg = String.format("No numeric doc values on field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        for (int i = 0; i < count && i < maxDoc; i++) {
            values.add(Long.toString(dv.get(fromDoc + i)));
        }

        return values;
    }

    @Path("/sortednumeric")
    @GET
    public List<List<String>> getSortedNumericDocValues(@QueryParam("segment") Integer segment,
                                                        @PathParam("field") String field,
                                                        @QueryParam("from") @DefaultValue("0") int fromDoc,
                                                        @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<List<String>> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        SortedNumericDocValues dv = readerManager.getSortedNumericDocValues(segment, field);
        if (dv == null) {
            String msg = String.format("No sorted numeric doc values on field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        for (int i = 0; i < count && i < maxDoc; i++) {
            dv.setDocument(fromDoc + i);
            List<String> perDocValues = new ArrayList<>(dv.count());
            for (int index = 0; index < dv.count(); ++index) {
                perDocValues.add(Long.toString(dv.valueAt(index)));
            }
            values.add(perDocValues);
        }

        return values;
    }

    @Path("/sorted")
    @GET
    public List<String> getSortedDocValues(@QueryParam("segment") Integer segment,
                                           @PathParam("field") String field,
                                           @QueryParam("from") @DefaultValue("0") int fromDoc,
                                           @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<String> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        SortedDocValues dv = readerManager.getSortedDocValues(segment, field);
        if (dv == null) {
            String msg = String.format("No sorted doc values on field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        for (int i = 0; i < count && i < maxDoc; i++) {
            values.add(dv.get(fromDoc + i).utf8ToString());
        }

        return values;
    }

    @Path("/sortedset")
    @GET
    public List<List<String>> getSortedSetDocValues(@QueryParam("segment") Integer segment,
                                             @PathParam("field") String field,
                                             @QueryParam("from") @DefaultValue("0") int fromDoc,
                                             @QueryParam("count") @DefaultValue("50") int count) throws IOException {

        List<List<String>> values = new ArrayList<>(count);
        int maxDoc = readerManager.getMaxDoc(segment);
        SortedSetDocValues dv = readerManager.getSortedSetDocValues(segment, field);
        if (dv == null) {
            String msg = String.format("No sorted set doc values on field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        for (int i = 0; i < count && i < maxDoc; i++) {
            dv.setDocument(fromDoc + i);
            List<String> perDocValues = new ArrayList<String>((int)dv.getValueCount());
            long ord;
            while ((ord = dv.nextOrd()) != SortedSetDocValues.NO_MORE_ORDS) {
                perDocValues.add(dv.lookupOrd(ord).utf8ToString());
            }
            values.add(perDocValues);
        }

        return values;
    }
    
    public static Set<Integer> parseDocSet(String docs, int maxDoc) {
    	Set<Integer> docset = new HashSet<>();
    	
    	if (docs == null) {
    		// return default set
    		for (int i = 0; i < 100 && i < maxDoc; i++) {
    			docset.add(i);
    		}
    	}
    	else {
	    	for (String chunk : docs.split(",")) {
	    		chunk = chunk.trim();
	    		if (chunk.contains("-")) {
	    			String[] range_s = chunk.split("-");
	    			if (range_s.length == 1) {
    					// handle "n-" gracefully
	    				int num = Integer.parseInt(range_s[0]);
	    				if (num < maxDoc) docset.add(num);
	    			}
	    			else if (range_s.length == 2) {
		    			try {
			    			int range_from = Integer.parseInt(range_s[0]);
			    			if (range_from < maxDoc) {
			    				if (range_s[1].equals("")) {
			    					// handle "n-" gracefully
			    					docset.add(range_from);
			    				}
			    				else {
			    					int range_to = Math.min(Integer.parseInt(range_s[1]), maxDoc - 1);
			    					if (range_from <= range_to) {
			    						for (int i = range_from; i <= range_to; i++) {
			    							docset.add(i);
			    						}
					    			}
			    				}
			    			}
		    			} 
		    			catch (NumberFormatException e) { }
	    			}
	    			else if (range_s.length > 2) {
	    				String msg = String.format("Incorrect range format \"%s\" in docs", chunk);
	    	            throw new WebApplicationException(msg, Response.Status.BAD_REQUEST);
	    			}
	    		}
	    		else {
	    			try {
	    				int num = Integer.parseInt(chunk);
	    				if (num < maxDoc) docset.add(num);
	    			} 
	    			catch (NumberFormatException e) { }
	    		}
	    	}
    	}
    	return docset;
    }
}
