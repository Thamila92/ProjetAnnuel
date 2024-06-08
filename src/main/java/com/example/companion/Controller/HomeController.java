package com.example.companion.Controller;


import javafx.fxml.FXML;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;

public class HomeController {

    @FXML
    private TextField searchField;

    @FXML
    private ListView<String> taskListView;

    @FXML
    public void initialize() {
        // Initialization code, if needed
    }


}
