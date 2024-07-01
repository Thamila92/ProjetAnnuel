package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient ;
import com.example.companion.Model.Evenement;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.util.Callback;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public class PlanningController {

    @FXML
    private DatePicker datePicker;
    @FXML
    private TableView<Evenement> eventTable;
    @FXML
    private TableColumn<Evenement, String> nameColumn;
    @FXML
    private TableColumn<Evenement, String> typeColumn;
    @FXML
    private TableColumn<Evenement, String> dateColumn;

    private EvenementClient eventClient;
    private final ObservableList<Evenement> eventList;

    public PlanningController() {
        this.eventList = FXCollections.observableArrayList();
    }

    public void setEventClient(EvenementClient eventClient) {
        this.eventClient = eventClient;
        loadEventsForDate(LocalDate.now());
    }

    @FXML
    public void initialize() {
        nameColumn.setCellValueFactory(new PropertyValueFactory<>("name"));
        typeColumn.setCellValueFactory(new PropertyValueFactory<>("type"));
        dateColumn.setCellValueFactory(new PropertyValueFactory<>("date"));

        eventTable.setItems(eventList);
    }

    @FXML
    public void handleDateChange() {
        LocalDate selectedDate = datePicker.getValue();
        if (selectedDate != null) {
            loadEventsForDate(selectedDate);
        }
    }

    private void loadEventsForDate(LocalDate date) {
        try {
            List<Evenement> events = eventClient.getEventsForDate(date);
            if (events != null) {
                eventList.setAll(events);
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            showAlert("Error", "Unable to load events for the selected date.");
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
