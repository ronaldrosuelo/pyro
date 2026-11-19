package com.myshop.admin;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Get FCM token and pass it to the WebView
        FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
            if (!task.isSuccessful()) return;
            String token = task.getResult();
            // Store token in localStorage via JavaScript
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "localStorage.setItem('fcm_token', '" + token + "');", null
                )
            );
        });
    }
}
