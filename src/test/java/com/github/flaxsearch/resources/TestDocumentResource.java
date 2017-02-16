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

import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;
import com.github.flaxsearch.api.DocumentData;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

public class TestDocumentResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new DocumentResource(() -> reader))
            .build();

    @Test
    public void testDocumentResource() {
        DocumentData doc = resource.client().target("/document/0").request().get(DocumentData.class);
        assertThat(doc).isNotNull();
        assertThat(doc.complete).isTrue();
    }

    @Test
    public void testFieldLengthLimit() {
        DocumentData doc = resource.client().target("/document/0?maxFieldLength=8").request().get(DocumentData.class);
        Object[] val = doc.fields.get("field2").toArray();
        assertThat(val.length).isEqualTo(1);
        assertThat(val[0]).isEqualTo("here is ...");
        assertThat(doc.complete).isFalse();
    }

    @Test
    public void testFieldsLimit() {
        DocumentData doc = resource.client().target("/document/0?maxFields=1").request().get(DocumentData.class);
        assertThat(doc.fields.size()).isEqualTo(1);
        assertThat(doc.complete).isFalse();
    }

    @Test
    public void testNonExistantDocument() {
        try {
            resource.client().target("/document/999999").request().get(String.class);
            fail("Expected a 404 error");
        }
        catch (NotFoundException e) {
            // expected
        }
    }
}
