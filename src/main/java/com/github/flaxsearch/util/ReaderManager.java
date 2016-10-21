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

import java.io.IOException;

import org.apache.lucene.index.*;
import org.apache.lucene.util.Bits;

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
}
