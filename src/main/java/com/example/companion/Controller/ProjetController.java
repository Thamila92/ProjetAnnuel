package com.example.companion.Controller;

import com.example.companion.ApiClient.ProjetClient;
import com.example.companion.Model.Projet;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.stage.Modality;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
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

    private ProjetClient projetClient;
    private final ObservableList<Projet> projectList;

    public ProjetController() {
        this.projectList = FXCollections.observableArrayList();
    }

    public void setProjetClient(ProjetClient projetClient) {
        this.projetClient = projetClient;
        System.out.println("ProjetClient set in ProjetController with token: " + projetClient.getToken());
        loadProjects();
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

        projectTable.setItems(projectList);
        projectTable.setRowFactory(tv -> {
            TableRow<Projet> row = new TableRow<>();
            ContextMenu contextMenu = new ContextMenu();

            MenuItem deleteItem = new MenuItem("Supprimer");
            deleteItem.setOnAction(event -> {
                Projet projet = row.getItem();
                handleDeleteProjet(projet);
            });

            MenuItem editItem = new MenuItem("Modifier");
            editItem.setOnAction(event -> {
                Projet projet = row.getItem();
                handleEditProjet(projet);
            });

            MenuItem addStepItem = new MenuItem("Ajouter étape");
            addStepItem.setOnAction(event -> {
                Projet projet = row.getItem();
                handleAddStep(projet);
            });

            contextMenu.getItems().addAll(deleteItem, editItem, addStepItem);

            row.contextMenuProperty().bind(javafx.beans.binding.Bindings.when(row.emptyProperty()).then((ContextMenu) null).otherwise(contextMenu));
            return row;
        });
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
    public void handleAddProjet() {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/addProjet.fxml");
            if (fxmlLocation == null) {
                throw new IOException("Cannot find addProjet.fxml");
            }

            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            AddProjetController addProjectController = loader.getController();
            addProjectController.setProjetClient(projetClient);
            addProjectController.setProjetController(this);

            System.out.println("Token passed to AddProjetController: " + projetClient.getToken());

            Stage stage = new Stage();
            stage.setTitle("Add New Project");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the add project form.");
            e.printStackTrace();
        }
    }

    public void addProjetToList(Projet projet) {
        projectList.add(projet);
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
    private void handleDeleteProjet(Projet projet) {
        try {
            projetClient.deleteProject(projet.getId());
            projectList.remove(projet);
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to delete project.");
            e.printStackTrace();
        }
    }

      private void handleEditProjet(Projet projet) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/editProjet.fxml");
            if (fxmlLocation == null) {
                throw new IOException("Cannot find editProjet.fxml");
            }

            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            EditProjetController editProjetController = loader.getController();
            editProjetController.setProjetClient(projetClient);
            editProjetController.setProjetController(this);
            editProjetController.setProjet(projet);

            Stage stage = new Stage();
            stage.setTitle("Edit Project");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the edit project form.");
            e.printStackTrace();
        }
    }

    public void updateProjetInList(Projet projet) {
        int index = projectList.indexOf(projet);
        if (index != -1) {
            projectList.set(index, projet);
        }
    }


    private void handleAddStep(Projet projet) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/addStep.fxml");
            if (fxmlLocation == null) {
                throw new IOException("Cannot find addStep.fxml");
            }

            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            AddStepController addStepController = loader.getController();
            addStepController.setProjetClient(projetClient);
            addStepController.setProjet(projet);

            Stage stage = new Stage();
            stage.setTitle("Add Step to Project");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the add step form.");
            e.printStackTrace();
        }
    }

}
