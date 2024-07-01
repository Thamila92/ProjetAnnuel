package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.ApiClient.SkillClient;
import com.example.companion.Model.Evenement;
import com.example.companion.Request.EvenementRequest;
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
import java.time.LocalDateTime;
import java.util.List;
import java.time.format.DateTimeFormatter;

public class EvenementController {

    @FXML
    private TableView<Evenement> evenementTable;
    @FXML
    private TableColumn<Evenement, String> typeColumn;
    @FXML
    private TableColumn<Evenement, String> locationColumn;
    @FXML
    private TableColumn<Evenement, String> descriptionColumn;
    @FXML
    private TableColumn<Evenement, String> startingColumn;
    @FXML
    private TableColumn<Evenement, String> endingColumn;

    private EvenementClient evenementClient;
    private SkillClient skillClient;
    private final ObservableList<Evenement> evenementList;

    public EvenementController() {
        this.evenementList = FXCollections.observableArrayList();
    }

    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
        loadEvenements();
    }
    public void setSkillClient(SkillClient skillClient) {
        this.skillClient = skillClient;

    }
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    @FXML
    public void initialize() {
        typeColumn.setCellValueFactory(new PropertyValueFactory<>("type"));
        locationColumn.setCellValueFactory(new PropertyValueFactory<>("location"));
        descriptionColumn.setCellValueFactory(new PropertyValueFactory<>("description"));

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");

        startingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getStarting())));
        endingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getEnding())));

        evenementTable.setItems(evenementList);

        evenementTable.setRowFactory(tv -> {
            TableRow<Evenement> row = new TableRow<>();
            ContextMenu contextMenu = new ContextMenu();

            MenuItem editItem = new MenuItem("Modifier");
            editItem.setOnAction(event -> {
                Evenement evenement = row.getItem();
                handleEditEvenement(evenement);
            });

            MenuItem deleteItem = new MenuItem("Supprimer");
            deleteItem.setOnAction(event -> {
                Evenement evenement = row.getItem();
                handleDeleteEvenement(evenement);
            });

            MenuItem addMissionItem = new MenuItem("Ajouter mission");
            addMissionItem.setOnAction(event -> {
                Evenement evenement = row.getItem();
                handleAddMission(evenement);
            });

            contextMenu.getItems().addAll(editItem, deleteItem, addMissionItem);

            row.contextMenuProperty().bind(javafx.beans.binding.Bindings.when(row.emptyProperty())
                    .then((ContextMenu) null).otherwise(contextMenu));
            return row;
        });
    }

    public void loadEvenements() {
        try {
            List<Evenement> evenements = evenementClient.getEvenements();
            if (evenements != null) {
                evenementList.setAll(evenements);
            }
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to load events.");
            e.printStackTrace();
        }
    }

    @FXML
    public void handleAddEvenement() {
        // Open add event dialog
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/addEvenement.fxml");
            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            AddEvenementController addEvenementController = loader.getController();
            addEvenementController.setEvenementClient(evenementClient);
            addEvenementController.setEvenementController(this);

            Stage stage = new Stage();
            stage.setTitle("Add New Event");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the add event form.");
            e.printStackTrace();
        }
    }

    public void addEvenementToList(Evenement evenement) {
        evenementList.add(evenement);
    }
    private void handleEditEvenement(Evenement evenement) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/editEvenement.fxml");
            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            EditEvenementController editEvenementController = loader.getController();
            editEvenementController.setEvenementClient(evenementClient);
            editEvenementController.setEvenementController(this);
            editEvenementController.setEvenement(evenement);

            Stage stage = new Stage();
            stage.setTitle("Edit Event");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the edit event form.");
            e.printStackTrace();
        }
    }
    private void handleDeleteEvenement(Evenement evenement) {
        try {
            evenementClient.deleteEvenement(evenement.getId());
            evenementList.remove(evenement);
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to delete event.");
            e.printStackTrace();
        }
    }

    private void handleAddMission(Evenement evenement) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/addMission.fxml");
            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

            AddMissionController addMissionController = loader.getController();
            addMissionController.setEvenementClient(evenementClient);
            addMissionController.setSkillClient(skillClient);
            addMissionController.setEvenement(evenement);

            Stage stage = new Stage();
            stage.setTitle("Add New Mission");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
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
