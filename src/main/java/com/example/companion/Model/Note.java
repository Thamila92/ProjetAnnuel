package com.example.companion.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Date;
@JsonIgnoreProperties(ignoreUnknown = true)
public class Note {
    private int id;
    private String name;
    private String content;
    private Date createdAt;

    // Constructors
    public Note() {}

    public Note(int id, String name, String content, Date createdAt) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getCreatedAt() {
        return createdAt;
    }


}
