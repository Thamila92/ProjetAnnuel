package com.example.companion.Request;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

public class EvenementRequest {
    private String type;
    private String location;
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date starting;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date ending;

    public EvenementRequest (String type, String location, String description, Date starting, Date ending) {
        this.type = type;
        this.location = location;
        this.description = description;
        this.starting = starting;
        this.ending = ending;
    }
    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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
