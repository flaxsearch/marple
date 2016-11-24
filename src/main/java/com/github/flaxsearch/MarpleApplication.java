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

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import java.util.EnumSet;

import com.github.flaxsearch.resources.*;
import com.github.flaxsearch.util.FSReaderManager;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import org.eclipse.jetty.servlets.CrossOriginFilter;

public class MarpleApplication extends Application<MarpleConfiguration> {
    @Override
    public void initialize(Bootstrap<MarpleConfiguration> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/assets", "/", "index.html"));
        System.setProperty("dw.server.rootPath", "/api/");
    }

    @Override
    public void run(MarpleConfiguration marpleConfiguration, Environment environment) throws Exception {

        FilterRegistration.Dynamic filter = environment.servlets().addFilter("CORSFilter", CrossOriginFilter.class);

        filter.addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), false, environment.getApplicationContext().getContextPath() + "*");
        filter.setInitParameter(CrossOriginFilter.ALLOWED_METHODS_PARAM, "GET,PUT,POST,OPTIONS");
        filter.setInitParameter(CrossOriginFilter.ALLOWED_ORIGINS_PARAM, "*");
        filter.setInitParameter(CrossOriginFilter.ALLOWED_HEADERS_PARAM, "X-Requested-With, Origin, Content-Type, Accept");
        filter.setInitParameter(CrossOriginFilter.ALLOW_CREDENTIALS_PARAM, "true");

        FSReaderManager df = new FSReaderManager(marpleConfiguration.getIndexPath());
        environment.lifecycle().manage(df);

        environment.jersey().register(new FieldsResource(df));
        environment.jersey().register(new TermsResource(df));
        environment.jersey().register(new PostingsResource(df));
        environment.jersey().register(new PositionsResource(df));
        environment.jersey().register(new DocumentResource(df));
        environment.jersey().register(new PointsResource(df));
        environment.jersey().register(new IndexResource(marpleConfiguration.getIndexPath(), df));
        environment.jersey().register(new DocValuesResource(df));
    }

    public static void main(String... args) throws Exception {
        new MarpleApplication().run(args);
    }
}
