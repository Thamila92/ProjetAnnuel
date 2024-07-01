package com.example.companion.Controller;

import com.example.companion.ApiClient.SkillClient;
import com.example.companion.ApiClient.StepClient;
import com.example.companion.Model.Evenement;
import com.example.companion.Model.Step;
import javafx.beans.property.SimpleStringProperty;
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

public class StepController {

    @FXML
    private TableView<Step> stepTable;
    @FXML
    private TableColumn<Step, String> stateColumn;
    @FXML
    private TableColumn<Step, String> descriptionColumn;
    @FXML
    private TableColumn<Step, String> startingColumn;
    @FXML
    private TableColumn<Step, String> endingColumn;
  private SkillClient skillClient;
    private StepClient stepClient;
    private final ObservableList<Step> stepList;

    public StepController() {
        this.stepList = FXCollections.observableArrayList();
    }

    public void setStepClient(StepClient stepClient) {
        this.stepClient = stepClient;
        loadSteps();
    }
    public void setSkillClient(SkillClient skillClient) {
        this.skillClient = skillClient;

    }
    @FXML

    public void initialize() {
        stateColumn.setCellValueFactory(new PropertyValueFactory<>("state"));
        descriptionColumn.setCellValueFactory(new PropertyValueFactory<>("description"));
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        startingColumn.setCellValueFactory(cellData -> new SimpleStringProperty(dateFormat.format(cellData.getValue().getStarting())));
        endingColumn.setCellValueFactory(cellData -> new SimpleStringProperty(dateFormat.format(cellData.getValue().getEnding())));

        stepTable.setItems(stepList);

        stepTable.setRowFactory(tv -> {
            TableRow<Step> row = new TableRow<>();
            ContextMenu contextMenu = new ContextMenu();

            MenuItem editItem = new MenuItem("Modifier");
            editItem.setOnAction(event -> handleEditStep(row.getItem()));

            MenuItem deleteItem = new MenuItem("Supprimer");
            deleteItem.setOnAction(event -> handleDeleteStep(row.getItem()));

            MenuItem addMissionItem = new MenuItem("Ajouter mission");
            addMissionItem.setOnAction(event -> handleAddMissionToStep(row.getItem()));

            contextMenu.getItems().addAll(editItem, deleteItem, addMissionItem);
            row.contextMenuProperty().bind(javafx.beans.binding.Bindings.when(row.emptyProperty()).then((ContextMenu) null).otherwise(contextMenu));
            return row;
        });
    }

    private void loadSteps() {
        try {
            List<Step> steps = stepClient.getSteps();
            if (steps != null) {
                stepList.setAll(steps);
            }
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to load steps.");
            e.printStackTrace();
        }
    }

    private void handleDeleteStep(Step step) {
        try {
            stepClient.deleteStep(step.getId());
            stepList.remove(step);
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to delete step.");
            e.printStackTrace();
        }
    }

    private void handleEditStep(Step step) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/editStep.fxml");
            if (fxmlLocation == null) {
                throw new IOException("Cannot find editStep.fxml");
            }

            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            EditStepController editStepController = loader.getController();
            editStepController.setStepClient(stepClient);
            editStepController.setStepController(this);
            editStepController.setStep(step);

            Stage stage = new Stage();
            stage.setTitle("Edit Step");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the edit step form.");
            e.printStackTrace();
        }
    }

    public void updateStepInList(Step step) {
        int index = stepList.indexOf(step);
        if (index != -1) {
            stepList.set(index, step);
        }
    }
    @FXML
    private void handleAddMissionToStep(Step step) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/example/companion/addMission.fxml"));
            Parent root = loader.load();
            AddMissionController addMissionController = loader.getController();
            addMissionController.setStep(step);
            addMissionController.setStepClient(stepClient);
            addMissionController.setSkillClient(skillClient);

            Stage stage = new Stage();
            stage.setTitle("Add Mission to Step");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.showAndWait();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the add mission form.");
            e.printStackTrace();
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
