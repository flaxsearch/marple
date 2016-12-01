package com.github.flaxsearch.util;
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

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.io.IOException;

import org.apache.lucene.index.*;
import org.apache.lucene.util.Bits;
import org.apache.lucene.util.BytesRef;

public interface ReaderManager {

    IndexReader getIndexReader();

    default Fields getFields(Integer segment) throws IOException {
        if (segment == null)
            return MultiFields.getFields(getIndexReader());
        return getLeafReader(segment).fields();
    }

    default FieldInfos getFieldInfos(Integer segment) throws IOException {
        if (segment == null)
            return MultiFields.getMergedFieldInfos(getIndexReader());
        return getLeafReader(segment).getFieldInfos();
    }

    default FieldInfo getFieldInfo(Integer segment, String fieldname) throws IOException {
        return getFieldInfos(segment).fieldInfo(fieldname);
    }

    default Bits getLiveDocs(Integer segment) throws IOException {
        if (segment == null)
            return MultiFields.getLiveDocs(getIndexReader());
        return getLeafReader(segment).getLiveDocs();
    }

    default LeafReader getLeafReader(Integer segment) {
        assert segment != null;
        return getIndexReader().leaves().get(segment).reader();
    }

    default BinaryDocValues getBinaryDocValues(Integer segment, String field) throws IOException {
        if (segment == null)
            return MultiDocValues.getBinaryValues(getIndexReader(), field);
        return getLeafReader(segment).getBinaryDocValues(field);
    }

    default NumericDocValues getNumericDocValues(Integer segment, String field) throws IOException {
        if (segment == null)
            return MultiDocValues.getNumericValues(getIndexReader(), field);
        return getLeafReader(segment).getNumericDocValues(field);
    }

    default SortedNumericDocValues getSortedNumericDocValues(Integer segment, String field) throws IOException {
        if (segment == null)
            return MultiDocValues.getSortedNumericValues(getIndexReader(), field);
        return getLeafReader(segment).getSortedNumericDocValues(field);
    }

    default SortedDocValues getSortedDocValues(Integer segment, String field) throws IOException {
        if (segment == null)
            return MultiDocValues.getSortedValues(getIndexReader(), field);
        return getLeafReader(segment).getSortedDocValues(field);
    }

    default SortedSetDocValues getSortedSetDocValues(Integer segment, String field) throws IOException {
        if (segment == null)
            return MultiDocValues.getSortedSetValues(getIndexReader(), field);
        return getLeafReader(segment).getSortedSetDocValues(field);
    }

    default int getMaxDoc(Integer segment) {
        if (segment == null)
            return getIndexReader().maxDoc();
        return getLeafReader(segment).maxDoc();
    }

    default TermsEnum findTermPostings(Integer segment, String field, String term) throws IOException {

        Fields fields = getFields(segment);
        Terms terms = fields.terms(field);

        if (terms == null) {
            String msg = String.format("No field %s", field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        TermsEnum te = terms.iterator();

        assert (term != null);
        if (!te.seekExact(new BytesRef(term))) {
            String msg = String.format("No term %s on field %s", term, field);
            throw new WebApplicationException(msg, Response.Status.NOT_FOUND);
        }

        return te;
    }
}
