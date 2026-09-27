package com.example.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.example.viewmodel.TrainerViewModel

@Composable
fun MainScreen(viewModel: TrainerViewModel) {
    var selectedTab by remember { mutableStateOf(0) }
    var showEvaluation by remember { mutableStateOf(false) }

    val activeScenario by viewModel.activeScenario.collectAsState()
    val isEmergencyMode by viewModel.isEmergencyMode.collectAsState()

    if (isEmergencyMode) {
        EmergencyExitScreen(onClose = {
            viewModel.selectScenario(null)
        })
    } else if (showEvaluation && activeScenario != null) {
        EvaluationScreen(
            scenario = activeScenario!!,
            onSubmit = { realism, role, challenge, empathy, worked, robotic, improvement, adjustments ->
                viewModel.submitEvaluation(realism, role, challenge, empathy, worked, robotic, improvement, adjustments)
                showEvaluation = false
                selectedTab = 1 // Navigate to profile after submitting evaluation
            },
            onCancel = {
                viewModel.selectScenario(null)
                showEvaluation = false
                selectedTab = 0
            }
        )
    } else {
        Scaffold(
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        icon = { Icon(Icons.Default.Send, contentDescription = "Chat") },
                        label = { Text("Chat") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Icon(Icons.Default.List, contentDescription = "Library") },
                        label = { Text("Library") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 3,
                        onClick = { selectedTab = 3 },
                        icon = { Icon(Icons.Default.Star, contentDescription = "Milestones") },
                        label = { Text("Badges") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 4,
                        onClick = { selectedTab = 4 },
                        icon = { Icon(Icons.Default.Search, contentDescription = "History") },
                        label = { Text("Replays") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 5,
                        onClick = { selectedTab = 5 },
                        icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                        label = { Text("Settings") }
                    )
                }
            }
        ) { innerPadding ->
            Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
                when (selectedTab) {
                    0 -> ChatScreen(
                        viewModel = viewModel,
                        onEmergencyExitTriggered = {},
                        onShowEvaluationTriggered = { showEvaluation = true }
                    )
                    1 -> ProfileScreen(viewModel = viewModel)
                    2 -> ScenarioPickerScreen(
                        viewModel = viewModel,
                        onScenarioSelected = { selectedTab = 0 }
                    )
                    3 -> MilestonesScreen(viewModel = viewModel)
                    4 -> HistoryScreen(viewModel = viewModel)
                    5 -> SettingsScreen(viewModel = viewModel)
                }
            }
        }
    }
}
