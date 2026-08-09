package com.example.sudoku.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

// Delegate to instantiate DataStore on Context
val Context.sudokuPrefsStore: DataStore<Preferences> by preferencesDataStore(name = "sudoku_preferences")

/**
 * Advanced configuration variables and runtime hint inventory.
 * Utilizes Jetpack DataStore for thread-safe asynchronous preference persistence.
 */
data class SudokuPreferences(
    val isNumberFirstInputMode: Boolean,
    val isAutoRemoveNotesEnabled: Boolean,
    val isPreventMistakeNotesEnabled: Boolean,
    val rewardedHintInventoryCount: Int
)

class SudokuPreferencesManager(private val context: Context) {

    companion object {
        val KEY_NUMBER_FIRST_INPUT_MODE = booleanPreferencesKey("number_first_input_mode")
        val KEY_AUTO_REMOVE_NOTES = booleanPreferencesKey("auto_remove_notes")
        val KEY_PREVENT_MISTAKE_NOTES = booleanPreferencesKey("prevent_mistake_notes")
        val KEY_REWARDED_HINT_COUNT_INVENTORY = intPreferencesKey("rewarded_hint_count_inventory")
    }

    /**
     * Flow emitting the player preferences asynchronously
     */
    val preferencesFlow: Flow<SudokuPreferences> = context.sudokuPrefsStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            SudokuPreferences(
                isNumberFirstInputMode = preferences[KEY_NUMBER_FIRST_INPUT_MODE] ?: false,
                isAutoRemoveNotesEnabled = preferences[KEY_AUTO_REMOVE_NOTES] ?: true,
                isPreventMistakeNotesEnabled = preferences[KEY_PREVENT_MISTAKE_NOTES] ?: true,
                rewardedHintInventoryCount = preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] ?: 3
            )
        }

    /**
     * Set if Number-First input pad selection locks the designated key
     */
    suspend fun setNumberFirstInputMode(enabled: Boolean) {
        context.sudokuPrefsStore.edit { preferences ->
            preferences[KEY_NUMBER_FIRST_INPUT_MODE] = enabled
        }
    }

    /**
     * Remove pencil candidate note string digits inside Row/Col/3x3 quad on a correct value input
     */
    suspend fun setAutoRemoveNotes(enabled: Boolean) {
        context.sudokuPrefsStore.edit { preferences ->
            preferences[KEY_AUTO_REMOVE_NOTES] = enabled
        }
    }

    /**
     * Prevent clashes during draft pencil typing
     */
    suspend fun setPreventMistakeNotes(enabled: Boolean) {
        context.sudokuPrefsStore.edit { preferences ->
            preferences[KEY_PREVENT_MISTAKE_NOTES] = enabled
        }
    }

    /**
     * Adds free hints awarded after watching sponsored video streams
     */
    suspend fun addRewardedHints(count: Int) {
        context.sudokuPrefsStore.edit { preferences ->
            val current = preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] ?: 3
            preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] = current + count
        }
    }

    /**
     * Consumes one hint representation
     */
    suspend fun spendHint() {
        context.sudokuPrefsStore.edit { preferences ->
            val current = preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] ?: 3
            if (current > 0) {
                preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] = current - 1
            }
        }
    }
}
