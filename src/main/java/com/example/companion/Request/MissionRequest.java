package com.example.companion.Request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;
import java.util.List;

public class MissionRequest {

    private String description;
    private int eventId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date starting;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date ending;
    private int stepId;
    private List<SkillRequest> skills;
    private List<String> adminIds;

    public MissionRequest(Date starting, Date ending, String description, int eventId, int stepId, List<SkillRequest> skills) {
        this.starting = starting;
        this.ending = ending;
        this.description = description;
        this.eventId = eventId;
        this.skills = skills;
        this.stepId=stepId;

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
// Getters and setters

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getEventId() {
        return eventId;
    }

    public void setEventId(int eventId) {
        this.eventId = eventId;
    }
}
