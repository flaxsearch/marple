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

import com.github.flaxsearch.api.TermsData;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.fail;

public class TestTermsResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new TermsResource(() -> reader))
            .build();

    @Test
    public void testWholeIndexTerms() {
        TermsData terms = resource.client().target("/terms/field3?count=2&from=f").request()
                .get(TermsData.class);

        assertThat(terms.terms).hasSize(2);
        assertThat(terms.terms).containsExactly("field", "more");
    }

    @Test
    public void testSegmentTerms() {
        try {
            resource.client().target("/terms/field3?count=2&from=f&segment=0").request()
                    .get(TermsData.class);
            fail("Expected a 404 on non-existent field");
        }
        catch (NotFoundException e) {

        }

    }

    @Test
    public void testTermsFilters() {
        TermsData terms = resource.client().target("/terms/field3?filter=value.1").request()
                .get(TermsData.class);

        assertThat(terms.terms).containsExactly("value11", "value21");
    }

    @Test
    public void testTermsSingleValueFilter() {
        TermsData terms = resource.client().target("/terms/field3?filter=value21").request()
                .get(TermsData.class);
        assertThat(terms.terms).containsExactly("value21");
    }

    @Test
    public void testTermsNoValueFilter() {
        TermsData terms = resource.client().target("/terms/field3?filter=nomatch").request()
                .get(TermsData.class);
        assertThat(terms.terms).isEmpty();
    }
}
