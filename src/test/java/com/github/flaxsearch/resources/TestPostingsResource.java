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

import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;

import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.GenericType;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

public class TestPostingsResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new PostingsResource(() -> reader))
            .build();

    @Test
    public void testWholeIndexPostings() {
        List<Map<String,Integer>> postings = resource.client().target("/postings/field3/field").request()
                .get(new GenericType<List<Map<String,Integer>>>(){});

        assertThat(postings).hasSize(1);
        assertThat(postings.get(0).get("docId")).isNotNull();
    }

    @Test
    public void testSegmentPostings() {
        try {
            resource.client().target("/postings/field-thats-not-there/text").request()
                    .get(new GenericType<List<Map<String,Integer>>>(){});
            fail("Request for postings on a non-existent field should fail.");
        } catch (NotFoundException e) {
            // Expected: HTTP 404 Not Found
        }

        try {
            resource.client().target("/postings/field3/term-thats-not-there").request()
                    .get(new GenericType<List<Map<String,Integer>>>(){});
            fail("Request for postings on a non-existent term should fail.");
        } catch (NotFoundException e) {
            // Expected: HTTP 404 Not Found
        }

        try {
            resource.client().target("/postings/field3/field&segment=0").request()
                    .get(new GenericType<List<Map<String,Integer>>>(){});
            fail("Request for postings on a non-existent segment should fail.");
        } catch (NotFoundException e) {
            // Expected: HTTP 404 Not Found
        }
    }
}
