package com.example.companion.Request;

public class NoteRequest {
    private String name;
    private String content;

    // Constructors
    public NoteRequest() {
    }

    public NoteRequest(String name, String content) {
        this.name = name;
        this.content = content;
    }

    // Getters and Setters
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
}
