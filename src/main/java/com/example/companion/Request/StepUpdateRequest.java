package com.example.companion.Request;


import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

public class StepUpdateRequest {
    private String state;
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date starting;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date ending;

    public StepUpdateRequest() {
    }

    public StepUpdateRequest(String state, String description, Date starting, Date ending) {
        this.state = state;
        this.description = description;
        this.starting = starting;
        this.ending = ending;
    }

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
}
