package com.github.flaxsearch.api;

public class AnyDocValuesResponse {
    private String type;
    private Object values;

    public AnyDocValuesResponse() {
        // required for unit test
    }

    public AnyDocValuesResponse(String type, Object values) {
        this.type = type;
        this.values = values;
    }

    public String getType() {
        return type;
    }

    public Object getValues() {
        return values;
    }
}
