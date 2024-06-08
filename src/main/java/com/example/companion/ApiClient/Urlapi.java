package org.example.ApiClient;

public enum Urlapi {
    BASE_URL("http://localhost:3000/");

    private final String url;


    Urlapi(String url) {
        this.url = url;
    }

     public String getUrl() {
        return url;
    }

}