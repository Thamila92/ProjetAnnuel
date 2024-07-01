package com.example.companion.Response;
import com.example.companion.Model.Step;

import java.util.List;

public class StepResponse {
    private List<Step> steps;
    private int totalCount;

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
}

