package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface AppDao {
    // --- MESSAGES ---
    @Query("SELECT * FROM messages ORDER BY timestamp ASC")
    fun getAllMessagesFlow(): Flow<List<MessageDbEntity>>

    @Query("SELECT * FROM messages WHERE scenarioId = :scenarioId ORDER BY timestamp ASC")
    suspend fun getMessagesForScenario(scenarioId: String): List<MessageDbEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageDbEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<MessageDbEntity>)

    @Query("DELETE FROM messages")
    suspend fun clearAllMessages()

    @Query("DELETE FROM messages WHERE scenarioId = :scenarioId")
    suspend fun clearMessagesForScenario(scenarioId: String)

    // --- PROFILES ---
    @Query("SELECT * FROM profiles WHERE id = 1 LIMIT 1")
    fun getProfileFlow(): Flow<ProfileDbEntity?>

    @Query("SELECT * FROM profiles WHERE id = 1 LIMIT 1")
    suspend fun getProfileSync(): ProfileDbEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: ProfileDbEntity)

    @Query("DELETE FROM profiles")
    suspend fun clearProfile()

    // --- SCENARIOS ---
    @Query("SELECT * FROM scenarios")
    fun getAllScenariosFlow(): Flow<List<ScenarioDbEntity>>

    @Query("SELECT * FROM scenarios WHERE isCustom = 1")
    suspend fun getCustomScenariosSync(): List<ScenarioDbEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScenario(scenario: ScenarioDbEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScenarios(scenarios: List<ScenarioDbEntity>)

    @Query("DELETE FROM scenarios WHERE id = :id")
    suspend fun deleteScenarioById(id: String)

    // --- EVALUATIONS ---
    @Query("SELECT * FROM evaluations ORDER BY timestamp DESC")
    fun getAllEvaluationsFlow(): Flow<List<EvaluationDbEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvaluation(evaluation: EvaluationDbEntity)

    // --- TRANSCRIPTS ---
    @Query("SELECT * FROM transcripts ORDER BY completedAt DESC")
    fun getAllTranscriptsFlow(): Flow<List<TranscriptDbEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTranscript(transcript: TranscriptDbEntity)

    @Query("DELETE FROM transcripts WHERE id = :id")
    suspend fun deleteTranscriptById(id: String)
}
