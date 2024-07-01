package com.example.companion.Request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class StepRequest {
    private String state;
    private String description;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date starting;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date ending;
    private int projetId;


    public StepRequest(String state, String description, Date starting, Date ending, int projetId ) {
        this.state = state;
        this.description = description;
        this.starting = starting;
        this.ending = ending;
        this.projetId = projetId;

    }

    // Getters and setters
    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getStarting() {
        return starting;
    }

    public void setStarting(Date starting) {
        this.starting = starting;
    }

    public Date getEnding() {
        return ending;
    }

    public void setEnding(Date ending) {
        this.ending = ending;
    }

    public int getProjetId() {
        return projetId;
    }

    public void setProjetId(int projetId) {
        this.projetId = projetId;
    }


}
