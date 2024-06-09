package com.example.companion.Response;

import com.example.companion.Model.Projet;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ProjetResponse {
    @JsonProperty("projets")
    private List<Projet> projets;

    @JsonProperty("totalCount")
    private int totalCount;

    // Getters and Setters
    public List<Projet> getProjets() {
        return projets;
    }

    public void setProjets(List<Projet> projets) {
        this.projets = projets;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
}
