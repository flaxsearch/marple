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

import javax.ws.rs.core.GenericType;
import java.util.List;

import com.github.flaxsearch.api.FieldData;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class TestFieldsResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new FieldsResource(() -> reader))
            .build();

    @Test
    public void testWholeIndexFieldsQuery() {
        List<FieldData> fields = resource.client().target("/fields").request()
                .get(new GenericType<List<FieldData>>() {});

        assertThat(fields).extracting("name").contains("field1", "field2", "field3");
    }

    @Test
    public void testIndividualSegmentFieldsQuery() {
        List<FieldData> fields = resource.client().target("/fields?segment=0").request()
                .get(new GenericType<List<FieldData>>() {});
        assertThat(fields).extracting("name").containsExactly("field1", "field2", "point");

        fields = resource.client().target("/fields?segment=1").request()
                .get(new GenericType<List<FieldData>>() {});
        assertThat(fields).extracting("name").containsOnly("field1", "field3", "field4");
    }

}
