package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Scenario
import com.example.viewmodel.TrainerViewModel

@OptIn(Material3Api::class)
@Composable
fun ScenarioPickerScreen(
    viewModel: TrainerViewModel,
    onScenarioSelected: () -> Unit
) {
    val scenarios by viewModel.allScenariosFlow.collectAsState(initial = emptyList())
    var selectedCategory by remember { mutableStateOf("all") }
    var selectedScenarioForDetails by remember { mutableStateOf<Scenario?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    val categories = listOf(
        "all" to "All Domains",
        "social_skills" to "Social Skills",
        "mental_health" to "Mental Health",
        "medical_clinical" to "Healthcare",
        "customer_relations" to "Customer Relations",
        "workplace_conflict" to "Workplace",
        "relationship_safety" to "Relationship Safety"
    )

    val filteredScenarios = remember(scenarios, selectedCategory) {
        if (selectedCategory == "all") {
            scenarios
        } else {
            scenarios.filter { it.category == selectedCategory }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Simulation Library", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface),
                actions = {
                    IconButton(onClick = { showCreateDialog = true }) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = "Create Custom Scenario")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
        ) {
            // Category Filter Bar
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categories) { (catId, catLabel) ->
                    val isSelected = selectedCategory == catId
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = catId },
                        label = { Text(catLabel) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        ),
                        shape = RoundedCornerShape(100.dp)
                    )
                }
            }

            if (filteredScenarios.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Empty",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No Scenarios in this Domain",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 16.sp
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredScenarios) { scenario ->
                        ScenarioCard(
                            scenario = scenario,
                            onClick = { selectedScenarioForDetails = scenario }
                        )
                    }
                }
            }
        }

        // Details Dialog
        selectedScenarioForDetails?.let { scenario ->
            ScenarioDetailsDialog(
                scenario = scenario,
                onDismiss = { selectedScenarioForDetails = null },
                onStart = {
                    viewModel.selectScenario(scenario)
                    selectedScenarioForDetails = null
                    onScenarioSelected()
                }
            )
        }

        // Create Custom Dialog
        if (showCreateDialog) {
            CreateScenarioDialog(
                onDismiss = { showCreateDialog = false },
                onCreate = { title, cat, desc, ai, user, obj, starter, focus, diff ->
                    viewModel.createCustomScenario(title, cat, desc, ai, user, obj, starter, focus, diff)
                    showCreateDialog = false
                }
            )
        }
    }
}

@Composable
fun ScenarioCard(scenario: Scenario, onClick: () -> Unit) {
    val diffColor = when (scenario.difficulty) {
        "Beginner" -> Color(0xFF10B981) // Green
        "Intermediate" -> Color(0xFFF59E0B) // Amber
        "Advanced" -> Color(0xFFEF4444) // Red
        else -> MaterialTheme.colorScheme.primary
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = scenario.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .background(diffColor.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = scenario.difficulty ?: "Beginner",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = diffColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = scenario.category.replace("_", " ").uppercase(),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = scenario.description,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 18.sp,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "🎯 Objective: ${scenario.objective}",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1
            )
        }
    }
}

@Composable
fun ScenarioDetailsDialog(
    scenario: Scenario,
    onDismiss: () -> Unit,
    onStart: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = onStart, shape = RoundedCornerShape(100.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Start")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Launch Simulation")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        title = { Text(scenario.title, fontWeight = FontWeight.Bold, fontSize = 16.sp) },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(scenario.description, fontSize = 13.sp, lineHeight = 18.sp)

                Divider()

                DetailRow("Your Role", scenario.userRole)
                DetailRow("Counterpart Role", scenario.aiRole)
                DetailRow("Learning Objective", scenario.objective)
                DetailRow("Observational Focus", scenario.learningFocus)

                if (scenario.safetyNotice == true) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "⚠️ DISTRESS SAFETY NOTICE",
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFEF4444),
                                fontSize = 11.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "This simulation models high-stakes situations. An immediate 'Emergency Exit' safety system is available on your dashboard at any time to de-escalate tension.",
                                fontSize = 11.sp,
                                color = Color(0xFF7F1D1D)
                            )
                        }
                    }
                }
            }
        }
    )
}

@Composable
fun DetailRow(label: String, value: String) {
    Column {
        Text(text = label, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
        Text(text = value, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.padding(top = 2.dp))
    }
}

@Composable
fun CreateScenarioDialog(
    onDismiss: () -> Unit,
    onCreate: (
        title: String,
        category: String,
        description: String,
        aiRole: String,
        userRole: String,
        objective: String,
        starterPrompt: String,
        learningFocus: String,
        difficulty: String
    ) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("social_skills") }
    var description by remember { mutableStateOf("") }
    var aiRole by remember { mutableStateOf("") }
    var userRole by remember { mutableStateOf("") }
    var objective by remember { mutableStateOf("") }
    var starterPrompt by remember { mutableStateOf("") }
    var learningFocus by remember { mutableStateOf("") }
    var difficulty by remember { mutableStateOf("Beginner") }

    val categories = listOf(
        "social_skills" to "Social Skills",
        "mental_health" to "Mental Health",
        "medical_clinical" to "Clinical / Medical",
        "customer_relations" to "Customer Service",
        "workplace_conflict" to "Workplace Friction",
        "relationship_safety" to "Relationship Safety"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = Modifier.fillMaxHeight(0.85f),
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotEmpty() && description.isNotEmpty() && starterPrompt.isNotEmpty()) {
                        onCreate(title, category, description, aiRole, userRole, objective, starterPrompt, learningFocus, difficulty)
                    }
                },
                shape = RoundedCornerShape(100.dp)
            ) {
                Text("Create Scenario")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        title = { Text("Design Custom Roleplay", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Scenario Title") }, modifier = Modifier.fillMaxWidth())

                Column {
                    Text("Select Domain", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(4.dp))
                    categories.forEach { (catId, catLabel) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { category = catId }
                                .padding(vertical = 4.dp)
                        ) {
                            RadioButton(selected = category == catId, onClick = { category = catId })
                            Text(catLabel, fontSize = 13.sp)
                        }
                    }
                }

                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Context & Background Story") }, modifier = Modifier.fillMaxWidth(), minLines = 2)
                OutlinedTextField(value = userRole, onValueChange = { userRole = it }, label = { Text("Your Role Name") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = aiRole, onValueChange = { aiRole = it }, label = { Text("Counterpart (Bot) Role Name") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = objective, onValueChange = { objective = it }, label = { Text("Dialogue Objective") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = learningFocus, onValueChange = { learningFocus = it }, label = { Text("Skills Observed (e.g. boundary, empathy)") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = starterPrompt, onValueChange = { starterPrompt = it }, label = { Text("Counterpart's Opening Line") }, modifier = Modifier.fillMaxWidth(), minLines = 2)

                Column {
                    Text("Difficulty", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Beginner", "Intermediate", "Advanced").forEach { diff ->
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { difficulty = diff }) {
                                RadioButton(selected = difficulty == diff, onClick = { difficulty = diff })
                                Text(diff, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    )
}
