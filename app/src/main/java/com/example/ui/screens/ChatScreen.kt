package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ChatMessage
import com.example.model.DecisionBranch
import com.example.model.DecisionNode
import com.example.viewmodel.TrainerViewModel

@OptIn(Material3Api::class)
@Composable
fun ChatScreen(
    viewModel: TrainerViewModel,
    onEmergencyExitTriggered: () -> Unit,
    onShowEvaluationTriggered: () -> Unit
) {
    val messages by viewModel.allMessagesFlow.collectAsState(initial = emptyList())
    val activeScenario by viewModel.activeScenario.collectAsState()
    val modelMode by viewModel.modelMode.collectAsState()
    val useSearchGrounding by viewModel.useSearchGrounding.collectAsState()
    val rolePreset by viewModel.rolePreset.collectAsState()
    val mentorMode by viewModel.mentorMode.collectAsState()
    val isLoadingChat by viewModel.isLoadingChat.collectAsState()
    val apiError by viewModel.apiError.collectAsState()

    var textInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    // Auto-scroll list when message count changes
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    // Determine if we have an active CYOA crossroads at the current turn index
    val currentCyoaNode = remember(messages, activeScenario) {
        val scenario = activeScenario ?: return@remember null
        val tree = scenario.decisionTree ?: return@remember null
        val userTurnIndex = messages.filter { it.role == "user" }.size + 1
        tree.find { it.turnIndex == userTurnIndex }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = activeScenario?.title ?: "Conversational Hub",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (activeScenario != null) "Active Scenario Simulation" else "Role Preset: ${rolePreset.replace("_", " ").uppercase()}",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    // Safety Emergency Exit Button (Distress redirect)
                    if (activeScenario != null) {
                        Button(
                            onClick = {
                                viewModel.triggerEmergencyExit()
                                onEmergencyExitTriggered()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                            shape = RoundedCornerShape(100.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp),
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Text("EMERGENCY EXIT", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Complete / Finish Simulation Button
                    if (activeScenario != null && messages.size > 2) {
                        Button(
                            onClick = onShowEvaluationTriggered,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                            shape = RoundedCornerShape(100.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp)
                        ) {
                            Text("Complete", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
        ) {
            // Configuration controls bar (model selection, grounding, mentor toggle)
            ConfigControlsBar(viewModel)

            // API Error display banner
            apiError?.let { err ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                    shape = RoundedCornerShape(0.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = err,
                        color = Color(0xFFEF4444),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(12.dp),
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Chat Messages List
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                items(messages) { message ->
                    MessageBubble(message = message)
                }

                // Show typing / loading indicators
                if (isLoadingChat) {
                    item {
                        Box(
                            modifier = Modifier
                                .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(12.dp))
                                .padding(12.dp)
                                .widthIn(max = 240.dp)
                        ) {
                            Text("Bot is typing...", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                // Show CYOA Crossroads inline if matching turn index
                currentCyoaNode?.let { node ->
                    item {
                        CyoaCrossroadsCard(
                            node = node,
                            onBranchChosen = { branch ->
                                viewModel.handleCYOADecision(branch, node.nodeTitle, node.turnIndex)
                            }
                        )
                    }
                }
            }

            // Dialogue input area (disabled if CYOA choices are actively waiting)
            InputArea(
                textInput = textInput,
                onValueChange = { textInput = it },
                onSend = {
                    viewModel.sendMessage(textInput)
                    textInput = ""
                },
                enabled = !isLoadingChat && currentCyoaNode == null
            )
        }
    }
}

@Composable
fun ConfigControlsBar(viewModel: TrainerViewModel) {
    val modelMode by viewModel.modelMode.collectAsState()
    val useSearchGrounding by viewModel.useSearchGrounding.collectAsState()
    val mentorMode by viewModel.mentorMode.collectAsState()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Model Selection Dropdown indicator
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable {
                // Cycle model mode
                val nextMode = when (modelMode) {
                    "general" -> "complex"
                    "complex" -> "fast"
                    else -> "general"
                }
                viewModel.setModelMode(nextMode)
            }
        ) {
            Text(
                text = "Model: ${modelMode.uppercase()}",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }

        // Search Grounding Toggle
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable {
                viewModel.setUseSearchGrounding(!useSearchGrounding)
            }
        ) {
            Checkbox(
                checked = useSearchGrounding,
                onCheckedChange = { viewModel.setUseSearchGrounding(it) },
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text("Search Grounding", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
        }

        // Mentor Mode Toggle
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable {
                viewModel.setMentorMode(!mentorMode)
            }
        ) {
            Checkbox(
                checked = mentorMode,
                onCheckedChange = { viewModel.setMentorMode(it) },
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text("Mentor Feedback", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
fun MessageBubble(message: ChatMessage) {
    val isUser = message.role == "user"
    val bg = if (isUser) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface
    val textCol = if (isUser) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .background(bg, RoundedCornerShape(12.dp))
                .padding(12.dp)
                .widthIn(max = 280.dp)
        ) {
            Column {
                Text(
                    text = if (isUser) "YOU" else "BOT",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = textCol.copy(alpha = 0.6f)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = message.content,
                    fontSize = 13.sp,
                    color = textCol,
                    lineHeight = 18.sp
                )

                // Render Search Grounding web sources
                message.groundingSources?.let { sources ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Grounding Sources:", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    sources.forEach { source ->
                        Text("• ${source.title}", fontSize = 9.sp, color = MaterialTheme.colorScheme.primary)
                    }
                }

                // Render real-time Mentor Coaching Annotations
                message.mentorFeedback?.let { feedback ->
                    Spacer(modifier = Modifier.height(10.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "⭐ MENTOR COACHING",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .background(MaterialTheme.colorScheme.secondaryContainer, RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = feedback.toneRating.uppercase(),
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSecondaryContainer
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Technique: ${feedback.techniqueObserved}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = feedback.coachingInsight,
                                fontSize = 11.sp,
                                lineHeight = 15.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            feedback.suggestedAlternative?.let { alt ->
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Suggested phrasing:",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                                Text(
                                    text = "\"$alt\"",
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CyoaCrossroadsCard(
    node: DecisionNode,
    onBranchChosen: (DecisionBranch) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = "Fork",
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "CROSSROADS: ${node.nodeTitle}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Text(
                text = node.situationContext,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Divider()

            node.branches.forEach { branch ->
                OutlinedButton(
                    onClick = { onBranchChosen(branch) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(vertical = 4.dp)) {
                        Text(
                            text = branch.label,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Dialogue: \"${branch.userResponseText}\"",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InputArea(
    textInput: String,
    onValueChange: (String) -> Unit,
    onSend: () -> Unit,
    enabled: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = textInput,
            onValueChange = onValueChange,
            placeholder = { Text("Speak or type dialogue alternative...") },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(24.dp),
            enabled = enabled,
            maxLines = 3
        )
        Spacer(modifier = Modifier.width(12.dp))
        FloatingActionButton(
            onClick = { if (enabled && textInput.trim().isNotEmpty()) onSend() },
            containerColor = if (enabled && textInput.trim().isNotEmpty()) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            shape = RoundedCornerShape(100.dp),
            modifier = Modifier.size(48.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Send,
                contentDescription = "Send",
                tint = if (enabled && textInput.trim().isNotEmpty()) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
