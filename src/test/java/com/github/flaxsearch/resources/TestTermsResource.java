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

import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class TestTermsResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new TermsResource(() -> reader))
            .build();

    @Test
    public void testWholeIndexTerms() {
        List<String> terms = resource.client().target("/terms/field3?count=2&from=f").request()
                .get(new GenericType<List<String>>(){});

        assertThat(terms).hasSize(2);
        assertThat(terms).containsExactly("field", "more");
    }

    @Test
    public void testSegmentTerms() {
        List<String> terms = resource.client().target("/terms/field3?count=2&from=f&segment=0").request()
                .get(new GenericType<List<String>>(){});

        assertThat(terms).isEmpty();
    }

    @Test
    public void testTermsFilters() {
        List<String> terms = resource.client().target("/terms/field3?filter=value.1").request()
                .get(new GenericType<List<String>>() {});

        assertThat(terms).containsExactly("value11", "value21");
    }

    @Test
    public void testTermsSingleValueFilter() {
        List<String> terms = resource.client().target("/terms/field3?filter=value21").request()
                .get(new GenericType<List<String>>() {});
        assertThat(terms).containsExactly("value21");
    }

    @Test
    public void testTermsNoValueFilter() {
        List<String> terms = resource.client().target("/terms/field3?filter=nomatch").request()
                .get(new GenericType<List<String>>() {});
        assertThat(terms).isEmpty();
    }
}
