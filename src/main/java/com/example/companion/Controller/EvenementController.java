package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.Model.Evenement;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
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
    private final ObservableList<Evenement> evenementList;

    public EvenementController() {
        this.evenementList = FXCollections.observableArrayList();
    }

    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
        loadEvenements();
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    @FXML
    public void initialize() {
        typeColumn.setCellValueFactory(new PropertyValueFactory<>("type"));
        locationColumn.setCellValueFactory(new PropertyValueFactory<>("location"));
        descriptionColumn.setCellValueFactory(new PropertyValueFactory<>("description"));

        // Custom cell value factory for date formatting
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

        startingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getStarting())));
        endingColumn.setCellValueFactory(cellData -> new javafx.beans.property.SimpleStringProperty(
                dateFormat.format(cellData.getValue().getEnding())));

        evenementTable.setItems(evenementList);
    }

    private void loadEvenements() {
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

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
