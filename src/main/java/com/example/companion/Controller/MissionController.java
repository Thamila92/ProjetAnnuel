package com.example.companion.Controller;

import com.example.companion.ApiClient.MissionClient;
import com.example.companion.Model.Mission;
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
import java.util.stream.Collectors;

public class MissionController {

    @FXML
    private TableView<Mission> missionTable;
    @FXML
    private TableColumn<Mission, String> descriptionColumn;
    @FXML
    private TableColumn<Mission, String> startingColumn;
    @FXML
    private TableColumn<Mission, String> endingColumn;
    @FXML
    private TableColumn<Mission, String> skillsColumn;
    @FXML
    private TableColumn<Mission, String> usersColumn;

    private MissionClient missionClient;
    private final ObservableList<Mission> missionList;

    public MissionController() {
        this.missionList = FXCollections.observableArrayList();
    }

    public void setMissionClient(MissionClient missionClient) {
        this.missionClient = missionClient;
        loadMissions();
    }

    @FXML
    public void initialize() {
        descriptionColumn.setCellValueFactory(new PropertyValueFactory<>("description"));

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        startingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getStarting())));
        endingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getEnding())));

        skillsColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                cellData.getValue().getRequiredSkills().stream()
                        .map(skill -> skill.getName())
                        .collect(Collectors.joining(", "))));
        usersColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                cellData.getValue().getAssignedUsers().stream()
                        .map(user -> user.getEmail())
                        .collect(Collectors.joining(", "))));

        missionTable.setItems(missionList);
        missionTable.setRowFactory(tv -> {
            TableRow<Mission> row = new TableRow<>();
            ContextMenu contextMenu = new ContextMenu();

            MenuItem deleteItem = new MenuItem("Supprimer");
            deleteItem.setOnAction(event -> {
                Mission mission = row.getItem();
                handleDeleteMission(mission);
            });

            MenuItem editItem = new MenuItem("Modifier");
            editItem.setOnAction(event -> {
                Mission mission = row.getItem();
                handleEditMission(mission);
            });

            contextMenu.getItems().addAll(deleteItem, editItem);
            row.contextMenuProperty().bind(javafx.beans.binding.Bindings.when(row.emptyProperty()).then((ContextMenu) null).otherwise(contextMenu));
            return row;
        });
    }

    private void loadMissions() {
        try {
            List<Mission> missions = missionClient.getMissions();
            if (missions != null) {
                missionList.setAll(missions);
            }
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to load missions.");
            e.printStackTrace();
        }
    }

    @FXML
    private void handleDeleteMission(Mission mission) {
        try {
            missionClient.deleteMission(mission.getId());
            missionList.remove(mission);
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to delete mission.");
            e.printStackTrace();
        }
    }

    @FXML
    private void handleEditMission(Mission mission) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/editMission.fxml");
            if (fxmlLocation == null) {
                throw new IOException("Cannot find editMission.fxml");
            }

            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            EditMissionController editMissionController = loader.getController();
            editMissionController.setMissionClient(missionClient);
            editMissionController.setMissionController(this);
            editMissionController.setMission(mission);

            Stage stage = new Stage();
            stage.setTitle("Edit Mission");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the edit mission form.");
            e.printStackTrace();
        }
    }

    public void updateMissionInList(Mission mission) {
        int index = missionList.indexOf(mission);
        if (index != -1) {
            missionList.set(index, mission);
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
