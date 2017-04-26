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
import static org.assertj.core.api.Assertions.assertThat;



public class TestPointsResource extends IndexResourceTestBase {

    @ClassRule
    public static final ResourceTestRule resource = ResourceTestRule.builder()
            .addResource(new PointsResource(() -> reader))
            .build();

    @Test
    public void testIntEncoding() throws Exception {
        // cannot deserialise to PointsData as the serialisation depends on the encoding
        // rather than creating custom classes to receive the result, test the JSON string
        String result = resource.client().target("/points/point/tree?segment=0&encoding=int").request()
                .get(String.class);

        assertThat(result).contains("\"numDims\":2");
        assertThat(result).contains("\"bytesPerDim\":4");
        assertThat(result).contains("\"min\":[0,1]");
        assertThat(result).contains("\"max\":[14,4]");
    }

}
