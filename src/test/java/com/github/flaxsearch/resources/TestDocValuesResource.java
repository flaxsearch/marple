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

import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.GenericType;
import java.util.List;
import java.util.Map;

import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import com.github.flaxsearch.api.AnyDocValuesResponse;

public class TestDocValuesResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new DocValuesResource(() -> reader))
            .build();

    @Test
    public void testBinaryDocValues() {
        List<String> docValues = resource.client().target("/docvalues/field1/binary").request()
                .get(new GenericType<List<String>>() {});

        assertThat(docValues).containsExactly("", "some bytes");

        try {
            resource.client().target("/docvalues/field-thats-not-there/binary").request()
                .get(new GenericType<List<String>>() {});
            fail("Request for binary doc values on a non-existent field should fail.");
        } catch (NotFoundException e) {
            // Expected: HTTP 404 Not Found 
        }
    }
    
    @Test
    public void testAnyDocValues() {
        AnyDocValuesResponse response = resource.client().target("/docvalues/field1").request()
                .get(new GenericType<AnyDocValuesResponse>() {});
    	assertThat(response.getType()).isEqualTo("BINARY");
    	assertThat(response.getValues()).isInstanceOf(Map.class);
    	Map<String,String> values = (Map<String,String>) response.getValues();
    	assertThat(values.get("0")).isEqualTo("");
    	assertThat(values.get("1")).isEqualTo("some bytes");
    }

    @Test
    public void testAnyDocValuesEncoding() {
        AnyDocValuesResponse response = resource.client().target("/docvalues/field1?encoding=base64").request()
                .get(new GenericType<AnyDocValuesResponse>() {});
    	assertThat(response.getType()).isEqualTo("BINARY");
    	assertThat(response.getValues()).isInstanceOf(Map.class);
    	Map<String,String> values = (Map<String,String>) response.getValues();
    	assertThat(values.get("0")).isEqualTo("");
    	assertThat(values.get("1")).isEqualTo("c29tZSBieXRlcw==");
    }

}
