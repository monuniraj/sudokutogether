package com.mologic.sudokusync;

import android.content.pm.ApplicationInfo;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppBuildInfo")
public class AppBuildInfoPlugin extends Plugin {

    @PluginMethod
    public void getBuildInfo(PluginCall call) {
        boolean isDebuggable = false;
        if (getContext() != null && getContext().getApplicationInfo() != null) {
            isDebuggable = (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        }
        JSObject result = new JSObject();
        result.put("isDebuggable", isDebuggable);
        call.resolve(result);
    }
}

