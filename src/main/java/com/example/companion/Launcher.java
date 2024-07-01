package com.example.companion;

import com.example.companion.Manager.UpdateManager;

import static javafx.application.Application.launch;

public class Launcher {
    public static void main(String[] args) {
        try {
            if (UpdateManager.isUpdateAvailable()) {
                System.out.println("Mise à jour disponible.");
                UpdateManager.downloadUpdate();
                System.out.println("Mise à jour téléchargée. Redémarrage de l'application...");
                UpdateManager.restartApplication();
            } else {
                System.out.println("Aucune mise à jour disponible. Démarrage de l'application...");
                launch(args);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
