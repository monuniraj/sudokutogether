package com.mologic.sudokusync;

import android.os.Build;
import android.os.Bundle;
import android.window.SplashScreenView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Completely eliminate Android 12+ native splash exit wipe / slide-down animation
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getSplashScreen().setOnExitAnimationListener(SplashScreenView::remove);
        }
    }
}
