package com.mologic.sudokusync;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(name = "NativeTTS")
public class NativeTTSPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private boolean isReady = false;
    private PluginCall pendingCall = null;

    @Override
    public void load() {
        super.load();
        tts = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            isReady = true;
            if (pendingCall != null) {
                PluginCall call = pendingCall;
                pendingCall = null;
                executeSpeak(call);
            }
        } else {
            isReady = false;
            if (pendingCall != null) {
                pendingCall.reject("TTS Initialization failed");
                pendingCall = null;
            }
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        if (text == null || text.trim().isEmpty()) {
            call.resolve();
            return;
        }

        if (tts == null) {
            pendingCall = call;
            tts = new TextToSpeech(getContext(), this);
            return;
        }

        if (!isReady) {
            pendingCall = call;
            return;
        }

        executeSpeak(call);
    }

    private void executeSpeak(PluginCall call) {
        String text = call.getString("text", "");
        String lang = call.getString("lang", "en-US");
        Float rate = call.getFloat("rate", 1.02f);
        Float pitch = call.getFloat("pitch", 1.08f);

        if (tts == null) {
            call.reject("TTS not available");
            return;
        }

        try {
            Locale locale = Locale.forLanguageTag(lang != null ? lang : "en-US");
            int result = tts.setLanguage(locale);
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(Locale.US);
            }
        } catch (Exception e) {
            tts.setLanguage(Locale.US);
        }

        tts.setSpeechRate(rate != null ? rate : 1.02f);
        tts.setPitch(pitch != null ? pitch : 1.08f);

        String utteranceId = UUID.randomUUID().toString();
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String id) {
                notifyListeners("ttsStart", new JSObject());
            }

            @Override
            public void onDone(String id) {
                notifyListeners("ttsEnd", new JSObject());
                call.resolve();
            }

            @Override
            public void onError(String id) {
                notifyListeners("ttsError", new JSObject());
                call.reject("TTS playback error");
            }
        });

        Bundle params = new Bundle();
        params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        pendingCall = null;
        if (tts != null) {
            tts.stop();
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        super.handleOnDestroy();
    }
}
