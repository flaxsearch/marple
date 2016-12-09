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

import java.nio.charset.Charset;
import java.util.Base64;
import java.util.Locale;
import java.util.function.Function;

import org.apache.lucene.util.BytesRef;
import org.apache.lucene.util.BytesRefBuilder;
import org.apache.lucene.util.LegacyNumericUtils;
import org.apache.lucene.util.NumericUtils;

public class BytesRefUtils {

    public static String encode(BytesRef data, String encoding) {
        Function<BytesRef, String> encoder = getEncoder(encoding);
        return encoder.apply(data);
    }

    public static BytesRef decode(String data, String encoding) {
        Function<String, BytesRef> decoder = getDecoder(encoding);
        return decoder.apply(data);
    }

    private static Function<String, BytesRef> getDecoder(String type) {
        switch (type.toLowerCase(Locale.ROOT)) {
            case "base64" :
                return s -> new BytesRef(Base64.getUrlDecoder().decode(s.getBytes(Charset.defaultCharset())));
            case "utf8" :
                return BytesRef::new;
            case "int" :
                return s -> {
                    BytesRefBuilder builder = new BytesRefBuilder();
                    LegacyNumericUtils.intToPrefixCoded(Integer.parseInt(s), 0, builder);
                    return builder.get();
                };
            case "long" :
                return s -> {
                    BytesRefBuilder builder = new BytesRefBuilder();
                    LegacyNumericUtils.longToPrefixCoded(Long.parseLong(s), 0, builder);
                    return builder.get();
                };
            case "float" :
                return s -> {
                    BytesRefBuilder builder = new BytesRefBuilder();
                    LegacyNumericUtils.intToPrefixCoded(NumericUtils.floatToSortableInt(Float.parseFloat(s)), 0, builder);
                    return builder.get();
                };
            case "double" :
                return s -> {
                    BytesRefBuilder builder = new BytesRefBuilder();
                    LegacyNumericUtils.longToPrefixCoded(NumericUtils.doubleToSortableLong(Double.parseDouble(s)), 0, builder);
                    return builder.get();
                };
            default :
                throw new IllegalArgumentException("Unknown decoder type: " + type);
        }
    }

    private static Function<BytesRef, String> getEncoder(String type) {
        switch (type.toLowerCase(Locale.ROOT)) {
            case "base64" :
                return b -> {
                	BytesRef b2 = BytesRef.deepCopyOf(b);
                	return new String(Base64.getUrlEncoder().encode(b2.bytes), Charset.defaultCharset());
                };
            case "utf8" :
                return BytesRef::utf8ToString;
            case "int" :
                return b -> Integer.toString(LegacyNumericUtils.prefixCodedToInt(b));
            case "long" :
                return b -> Long.toString(LegacyNumericUtils.prefixCodedToLong(b));
            case "float" :
                return b -> Float.toString(NumericUtils.sortableIntToFloat(LegacyNumericUtils.prefixCodedToInt(b)));
            case "double" :
                return b -> Double.toString(NumericUtils.sortableLongToDouble(LegacyNumericUtils.prefixCodedToLong(b)));
            default:
                throw new IllegalArgumentException("Unknown encoder type: " + type);
        }
    }

}
