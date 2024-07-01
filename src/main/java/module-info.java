module com.example.companion {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.web;

    requires org.controlsfx.controls;
    requires com.dlsc.formsfx;
    requires net.synedra.validatorfx;
    requires org.kordamp.ikonli.javafx;
    requires org.kordamp.bootstrapfx.core;
    //requires eu.hansolo.tilesfx;
    requires java.logging;
    requires com.almasb.fxgl.all;
    requires java.net.http;
    requires com.fasterxml.jackson.databind;
    opens com.example.companion.Controller to javafx.fxml;
    opens com.example.companion.Model to com.fasterxml.jackson.databind;
    opens com.example.companion to javafx.fxml;
    exports com.example.companion;
    exports com.example.companion.Model;
    exports com.example.companion.ApiClient;
    exports com.example.companion.Controller;
    opens com.example.companion.Error to com.fasterxml.jackson.databind;
    exports com.example.companion.DateUtils;
    exports com.example.companion.Response to com.fasterxml.jackson.databind;
    exports com.example.companion.Request;
    opens com.example.companion.Request to com.fasterxml.jackson.databind;

}

