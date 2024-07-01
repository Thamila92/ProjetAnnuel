package com.example.companion.Controller;

import com.example.companion.ApiClient.NoteClient;
import com.example.companion.Model.Note;
import com.example.companion.Request.NoteRequest;
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

public class NoteController {
    @FXML
    private TableView<Note> noteTable;
    @FXML
    private TableColumn<Note, String> nameColumn;
    @FXML
    private TableColumn<Note, String> contentColumn;
    @FXML
    private TableColumn<Note, String> createdAtColumn;

    private NoteClient noteClient;
    private final ObservableList<Note> noteList;

    public NoteController() {
        this.noteList = FXCollections.observableArrayList();
    }

    public void setNoteClient(NoteClient noteClient) {
        this.noteClient = noteClient;
        loadNotes();
    }

    @FXML
    public void initialize() {
        nameColumn.setCellValueFactory(new PropertyValueFactory<>("name"));
        contentColumn.setCellValueFactory(new PropertyValueFactory<>("content"));

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        createdAtColumn.setCellValueFactory(cellData -> new SimpleStringProperty(
                dateFormat.format(cellData.getValue().getCreatedAt())));

        noteTable.setItems(noteList);

        noteTable.setRowFactory(tv -> {
            TableRow<Note> row = new TableRow<>();
            ContextMenu contextMenu = new ContextMenu();

            MenuItem editItem = new MenuItem("Edit");
            editItem.setOnAction(event -> {
                Note note = row.getItem();
                handleEditNote(note);
            });

            MenuItem deleteItem = new MenuItem("Delete");
            deleteItem.setOnAction(event -> {
                Note note = row.getItem();
               // handleDeleteNote(note);
            });

            contextMenu.getItems().addAll(editItem, deleteItem);

            row.contextMenuProperty().bind(javafx.beans.binding.Bindings.when(row.emptyProperty())
                    .then((ContextMenu) null).otherwise(contextMenu));
            return row;
        });
    }

    public void loadNotes() {
        try {
            List<Note> notes = noteClient.getNotes();
            if (notes != null) {
                noteList.setAll(notes);
            }
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to load notes.");
            e.printStackTrace();
        }
    }

    @FXML
    public void handleAddNote() {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/addNote.fxml");
            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

           /*
            AddNoteController addNoteController = loader.getController();
            addNoteController.setNoteClient(noteClient);
            addNoteController.setNoteController(this);
            */
            Stage stage = new Stage();
            stage.setTitle("Add New Note");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the add note form.");
            e.printStackTrace();
        }
    }

    private void handleEditNote(Note note) {
        try {
            URL fxmlLocation = getClass().getResource("/com/example/companion/editNote.fxml");
            FXMLLoader loader = new FXMLLoader(fxmlLocation);
            Parent root = loader.load();

           /*
            EditNoteController editNoteController = loader.getController();
            editNoteController.setNoteClient(noteClient);
            editNoteController.setNoteController(this);
            editNoteController.setNote(note);
            */
            Stage stage = new Stage();
            stage.setTitle("Edit Note");
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            showAlert("Error", "Unable to load the edit note form.");
            e.printStackTrace();
        }
    }

   /* private void handleDeleteNote(Note note) {
        try {
            noteClient.deleteNote(note.getId());
            noteList.remove(note);
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to delete note.");
            e.printStackTrace();
        }
    }*/

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
