package com.github.flaxsearch;
/*
 *   Copyright (c) 2015 Lemur Consulting Ltd.
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

import com.github.flaxsearch.resources.DocValuesResource;
import com.github.flaxsearch.resources.FieldsResource;
import com.github.flaxsearch.resources.IndexResource;
import com.github.flaxsearch.resources.PostingsResource;
import com.github.flaxsearch.resources.TermsResource;
import com.github.flaxsearch.util.FSReaderManager;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

public class MarpleApplication extends Application<MarpleConfiguration> {
    @Override
    public void initialize(Bootstrap<MarpleConfiguration> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/assets", "/", "index.htm"));
        System.setProperty("dw.server.rootPath", "/api/");
    }

    @Override
    public void run(MarpleConfiguration marpleConfiguration, Environment environment) throws Exception {

        FSReaderManager df = new FSReaderManager(marpleConfiguration.getIndexPath());
        environment.lifecycle().manage(df);

        environment.jersey().register(new FieldsResource(df));
        environment.jersey().register(new TermsResource(df));
        environment.jersey().register(new PostingsResource(df));
        environment.jersey().register(new IndexResource(marpleConfiguration.getIndexPath(), df));
        environment.jersey().register(new DocValuesResource(df));
    }

    public static void main(String... args) throws Exception {
        new MarpleApplication().run(args);
    }
}
