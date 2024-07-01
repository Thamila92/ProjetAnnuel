package com.example.companion.Controller;

import com.example.companion.ApiClient.NoteClient;
import com.example.companion.Model.Note;
import com.example.companion.Request.NoteRequest;
import javafx.fxml.FXML;
import javafx.scene.control.ContextMenu;
import javafx.scene.control.Label;
import javafx.scene.control.MenuItem;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.VBox;

import java.io.IOException;
import java.util.List;

public class HomeController {

    @FXML
    private FlowPane notesContainer;

    private NoteClient noteClient;

    @FXML
    public void initialize() {
        // Initialize components if necessary
    }

    public void setNoteClient(NoteClient noteClient) {
        this.noteClient = noteClient;
        loadNotes();
    }

    private void loadNotes() {
        try {
            List<Note> notes = noteClient.getNotes();
            if (notes != null) {
                for (Note note : notes) {
                    addNoteToView(note);
                }
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void addNoteToView(Note note) {
        VBox noteBox = new VBox(10);
        noteBox.setStyle("-fx-background-color: #F1C40F; -fx-padding: 10px; -fx-border-radius: 5px; -fx-background-radius: 5px;");
        Label nameLabel = new Label(note.getName());
        nameLabel.setStyle("-fx-font-weight: bold;");
        Label contentLabel = new Label(note.getContent());
        contentLabel.setStyle("-fx-background-color: #FFF9C4; -fx-padding: 5px;");

        TextField nameField = new TextField(note.getName());
        TextField contentField = new TextField(note.getContent());
        nameField.setVisible(false);
        contentField.setVisible(false);

        noteBox.getChildren().addAll(nameLabel, contentLabel, nameField, contentField);

        noteBox.setOnMouseClicked(event -> {
            if (event.getClickCount() == 2) {
                nameLabel.setVisible(false);
                contentLabel.setVisible(false);
                nameField.setVisible(true);
                contentField.setVisible(true);
                nameField.requestFocus();
            }
        });

        nameField.setOnAction(event -> {
            note.setName(nameField.getText());
            note.setContent(contentField.getText());
            try {
                noteClient.updateNote(note.getId(), note);
                nameLabel.setText(note.getName());
                contentLabel.setText(note.getContent());
                nameLabel.setVisible(true);
                contentLabel.setVisible(true);
                nameField.setVisible(false);
                contentField.setVisible(false);
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        });

        contentField.setOnAction(event -> {
            note.setName(nameField.getText());
            note.setContent(contentField.getText());
            try {
                noteClient.updateNote(note.getId(), note);
                nameLabel.setText(note.getName());
                contentLabel.setText(note.getContent());
                nameLabel.setVisible(true);
                contentLabel.setVisible(true);
                nameField.setVisible(false);
                contentField.setVisible(false);
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        });

        // Add context menu for delete
        ContextMenu contextMenu = new ContextMenu();
        MenuItem deleteItem = new MenuItem("Delete");
        deleteItem.setOnAction(event -> handleDeleteNote(note, noteBox));
        contextMenu.getItems().add(deleteItem);
        noteBox.setOnContextMenuRequested(event -> contextMenu.show(noteBox, event.getScreenX(), event.getScreenY()));

        notesContainer.getChildren().add(noteBox);
    }

    @FXML
    private void handleAddNote() {
        NoteRequest newNoteRequest = new NoteRequest("New Note", "");
        try {
            Note newNote = noteClient.createNote(newNoteRequest);
            addNoteToView(newNote);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void handleDeleteNote(Note note, VBox noteBox) {
        try {
            noteClient.deleteNote(note.getId());
            notesContainer.getChildren().remove(noteBox);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
