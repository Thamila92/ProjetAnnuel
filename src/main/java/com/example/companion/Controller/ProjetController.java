package com.example.companion.Controller;

import com.example.companion.ApiClient.ProjetClient;
import com.example.companion.Model.Projet;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.util.Callback;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;

public class ProjetController {

    @FXML
    private TableView<Projet> projectTable;
    @FXML
    private TableColumn<Projet, String> descriptionColumn;
    @FXML
    private TableColumn<Projet, String> startingColumn;
    @FXML
    private TableColumn<Projet, String> endingColumn;
    @FXML
    private TableColumn<Projet, String> stepsColumn;

    private final ProjetClient projetClient;
    private final ObservableList<Projet> projectList;

    public ProjetController() {
        this.projetClient = new ProjetClient();
        this.projectList = FXCollections.observableArrayList();
    }

    @FXML
    public void initialize() {
        descriptionColumn.setCellValueFactory(new PropertyValueFactory<>("description"));

        // Custom cell value factory for date formatting
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

        startingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getStarting())));
        endingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getEnding())));

        // Custom cell value factory for steps
        stepsColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                cellData.getValue().getSteps().toString()));

        projectTable.setItems(projectList);
        loadProjects();
    }

    private void loadProjects() {
        try {
            List<Projet> projects = projetClient.getProjects();
            if (projects != null) {
                projectList.setAll(projects);
            }
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to load projects.");
            e.printStackTrace();
        }
    }

    @FXML
    public void handleAddProject() {
        // Logic to add a new project, e.g., open a new dialog to enter project details
        // Here, we'll just add a dummy project for demonstration
        Projet newProject = new Projet();
        newProject.setDescription("New Project");
        newProject.setStarting(new java.util.Date());
        newProject.setEnding(new java.util.Date());
        newProject.setSteps(List.of());  // Empty list of steps for now

        try {
            Projet createdProject = projetClient.createProject(newProject);
            projectList.add(createdProject);
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to add project.");
            e.printStackTrace();
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
