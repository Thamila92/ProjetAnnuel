package com.example.companion.Manager;


import com.example.companion.Main;
import javafx.application.Platform;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

public class UpdateManager {
    private static final Logger LOGGER = Logger.getLogger(UpdateManager.class.getName());
    private static final String UPDATE_FILE_PATH = "update.jar";
    private static final String CURRENT_VERSION = "0.0.1";
    private static final String VERSION_URL = "https://github.com/Thamila92/companion-updates/blob/main/version.txt";
    private static final String UPDATE_URL = "https://github.com/Thamila92/companion-updates/blob/main/Companion.jar";

    public static boolean isUpdateAvailable() throws Exception {
        String latestVersion = fetchLatestVersion();
        return !CURRENT_VERSION.equals(latestVersion);
    }

    private static String fetchLatestVersion() throws IOException {
        URL url = new URL(VERSION_URL);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()))) {
            return reader.readLine();
        }
    }

    public static void downloadUpdate() throws Exception {
        URL url = new URL(UPDATE_URL);
        try (InputStream in = new BufferedInputStream(url.openStream());
             FileOutputStream fileOutputStream = new FileOutputStream(UPDATE_FILE_PATH)) {
            byte[] dataBuffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(dataBuffer, 0, 1024)) != -1) {
                fileOutputStream.write(dataBuffer, 0, bytesRead);
            }
        }
    }

    public static void loadAndRun(String jarPath, String className, String methodName, Class<?>... parameterTypes) throws Exception {
        URL jarUrl = new URL("file:" + jarPath);
        URL[] urls = { jarUrl };

        try (URLClassLoader loader = new URLClassLoader(urls, ClassLoader.getSystemClassLoader().getParent())) {
            LOGGER.log(Level.INFO, "Loading JAR from: " + jarPath);

            Class<?> clazz = loader.loadClass(className);
            LOGGER.log(Level.INFO, "Class loaded: " + clazz.getName());

            Method method = clazz.getMethod(methodName, parameterTypes);
            LOGGER.log(Level.INFO, "Method found: " + method.getName());

            try {
                method.invoke(null, (Object) new String[] {});
                LOGGER.log(Level.INFO, "Method invoked successfully.");
            } catch (InvocationTargetException e) {
                LOGGER.log(Level.SEVERE, "Error invoking method (InvocationTargetException): " + e.getTargetException().getMessage(), e);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error invoking method: " + e.getMessage(), e);
            }
        }
    }
    public static void restartApplication() {
        try {
            // Initialiser JavaFX si nécessaire
            if (!Platform.isFxApplicationThread()) {
                Platform.startup(() -> {
                    LOGGER.log(Level.INFO, "JavaFX platform initialized.");
                });
            }

            // Chemin vers le JAR mis à jour
            String pathToJar = "/Users/thamilaachat/Documents/projet-annuel-version/Companion.jar";
            URL jarUrl = new URL("file:" + pathToJar);
            URL[] urls = {jarUrl};

             try (URLClassLoader classLoader = new URLClassLoader(urls)) {
                String mainClass = "com.example.companion.Main";  // Assurez-vous que c'est la bonne classe principale
                Class<?> clazz = classLoader.loadClass(mainClass);
                Method mainMethod = clazz.getMethod("main", String[].class);

                 Platform.runLater(() -> {
                    try {
                        mainMethod.invoke(null, (Object) new String[] {});
                    } catch (Exception e) {
                        LOGGER.log(Level.SEVERE, "Failed to invoke main method: " + e.getMessage(), e);
                    }
                });
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error loading class: " + e.getMessage(), e);
            }

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in restarting application: " + e.getMessage(), e);
        }
    }



}

