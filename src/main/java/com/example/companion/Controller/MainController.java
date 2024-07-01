package com.example.companion.Controller;

import com.example.companion.ApiClient.*;
import com.example.companion.Model.Admin;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;

public class MainController {

    @FXML
    private BorderPane rootPane;
    @FXML
    private Button profileButton;
    @FXML
    private Button loginButton;
    @FXML
    private Button logoutButton;
    @FXML
    private Label userNameLabel;

    private ProjetClient projetClient;
    private EvenementClient evenementClient;
    private Admin loggedInUser;
    private MissionClient missionClient;
    private StepClient stepClient;
    private  NoteClient noteClient;
    private  SkillClient skillClient;
    @FXML
    public void initialize() {
        Platform.runLater(() -> {
            rootPane.getScene().getStylesheets().add(getClass().getResource("/com/example/companion/css/lightTheme.css").toExternalForm());
        });
    }

    public void setProjetClient(ProjetClient projetClient) {
        this.projetClient = projetClient;
    }

    public void setMissionClient(MissionClient missionClient) {
        this.missionClient = missionClient;
    }

    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
    }
    public void setSkillClient(SkillClient skillClient) {
        this.skillClient = skillClient;

    }

    public void setStepClient(StepClient stepClient) {
        this.stepClient = stepClient;
    }
    public void setNoteClient(NoteClient noteClient) {
        this.noteClient = noteClient;
    }

    public void setLoggedInUser(Admin loggedInUser) {
        this.loggedInUser = loggedInUser;
        if (loggedInUser != null) {
            profileButton.setVisible(true);
            loginButton.setVisible(false);
            logoutButton.setVisible(true);
            userNameLabel.setText(loggedInUser.getName());
        } else {
            profileButton.setVisible(false);
            loginButton.setVisible(true);
            logoutButton.setVisible(false);
            userNameLabel.setText("");
        }
    }

    @FXML
    public void handleHome() {
        loadPage("home.fxml");
    }

    @FXML
    public void handleProjects() {
        loadPage("projet.fxml");
    }

    @FXML
    public void handleEvents() {
        loadPage("evenement.fxml");
    }

    @FXML
    public void handleTasks() {
        loadPage("task.fxml");
    }

    @FXML
    public void handleSteps() {
        loadPage("step.fxml");
    }

    @FXML
    public void handleMissions() {
        loadPage("mission.fxml");
    }

    @FXML
    public void handleProfile() {
        loadPage("profile.fxml");
    }

    @FXML
    public void handleLogin() {
        loadPage("login.fxml");
    }
    @FXML
    public void handlePlanning() {
        loadPage("planning.fxml");
    }

    @FXML
    public void handleLogout() {
        setLoggedInUser(null);

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/example/companion/login.fxml"));
            Parent root = loader.load();
            Stage stage = (Stage) rootPane.getScene().getWindow();
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Error", "An error occurred while trying to load the login page.");
        }
    }

    public void loadPage(String page) {
        try {
            URL url = getClass().getResource("/com/example/companion/" + page);
            if (url == null) {
                throw new IOException("Cannot load resource: " + page);
            }

            FXMLLoader loader = new FXMLLoader(url);
            Parent root = loader.load();
            rootPane.setCenter(root);

            Object controller = loader.getController();
            if (controller instanceof ProjetController && "projet.fxml".equals(page)) {
                ((ProjetController) controller).setProjetClient(projetClient);
            } else if (controller instanceof EvenementController && "evenement.fxml".equals(page)) {
                ((EvenementController) controller).setEvenementClient(evenementClient);
                ((EvenementController) controller).setSkillClient(skillClient);
            } else if (controller instanceof ProfileController && "profile.fxml".equals(page)) {
                ((ProfileController) controller).setUserData(loggedInUser.getName(), loggedInUser.getEmail());
            } else if (controller instanceof MissionController && "mission.fxml".equals(page)) {
                ((MissionController) controller).setMissionClient(missionClient);
            } else if (controller instanceof StepController && "step.fxml".equals(page)) {
                ((StepController) controller).setStepClient(stepClient);
                ((StepController) controller).setSkillClient(skillClient);

            } else if (controller instanceof HomeController && "home.fxml".equals(page)) {
                ((HomeController) controller).setNoteClient(noteClient);
            }
        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Error", "An error occurred while trying to load the page: " + page);
        } catch (ClassCastException e) {
            e.printStackTrace();
            showAlert("Error", "Incorrect controller type for page: " + page);
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }


    @FXML
    private void handleChangeTheme() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Select Theme");
        ButtonType lightButton = new ButtonType("Light Theme");
        ButtonType darkButton = new ButtonType("Dark Theme");
        dialog.getDialogPane().getButtonTypes().addAll(lightButton, darkButton, ButtonType.CANCEL);

        dialog.setResultConverter(dialogButton -> {
            if (dialogButton == lightButton) {
                return ButtonType.OK;
            } else if (dialogButton == darkButton) {
                return ButtonType.NO;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(result -> {
            Scene scene = rootPane.getScene();
            if (result == ButtonType.OK) {
                scene.getStylesheets().removeAll(getClass().getResource("/com/example/companion/css/darkTheme.css").toExternalForm());
                scene.getStylesheets().add(getClass().getResource("/com/example/companion/css/lightTheme.css").toExternalForm());
            } else if (result == ButtonType.NO) {
                scene.getStylesheets().removeAll(getClass().getResource("/com/example/companion/css/lightTheme.css").toExternalForm());
                scene.getStylesheets().add(getClass().getResource("/com/example/companion/css/darkTheme.css").toExternalForm());
            }
        });
    }


}
