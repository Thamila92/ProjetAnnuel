package com.example.companion.Model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Admin {
    private String email;
    private String password;
    private String name;
    private String key;

    public Admin(@JsonProperty("email") String email, @JsonProperty("password") String password, @JsonProperty("name") String name, @JsonProperty("key") String key) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.key = key;
    }

    public Admin(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters et setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
