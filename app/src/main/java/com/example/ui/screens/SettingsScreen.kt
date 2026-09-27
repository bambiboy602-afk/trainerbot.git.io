package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.viewmodel.TrainerViewModel

@OptIn(Material3Api::class)
@Composable
fun SettingsScreen(viewModel: TrainerViewModel) {
    val scrollState = rememberScrollState()
    val apiKey by viewModel.apiKey.collectAsState()
    var inputKey by remember { mutableStateOf(apiKey) }
    var showDialog by remember { mutableStateOf(false) }

    LaunchedEffect(apiKey) {
        inputKey = apiKey
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Credentials", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Security Warning Card
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)), // amber light
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp)) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Security Notice",
                        tint = Color(0xFFD97706) // Amber dark
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "SECURITY & PRIVACY DIRECTIVE",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF92400E),
                            fontSize = 11.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "APKs can be decompiled. In keeping with developer best practices, your credentials remain local to your SQLite database. NEVER share your key.",
                            fontSize = 12.sp,
                            color = Color(0xFF92400E),
                            lineHeight = 18.sp
                        )
                    }
                }
            }

            // API Key Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Gemini API Key Configuration", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(
                        "Configure your personal Google AI Studio Gemini API Key to enable the roleplay simulations and profile analysis.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )

                    OutlinedTextField(
                        value = inputKey,
                        onValueChange = { inputKey = it },
                        label = { Text("Gemini API Key") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            viewModel.updateApiKey(inputKey)
                        },
                        shape = RoundedCornerShape(100.dp),
                        modifier = Modifier.align(Alignment.End)
                    ) {
                        Text("Save Credentials")
                    }
                }
            }

            // Clear Data Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Local Data Management", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(
                        "Erase all local databases, custom scenarios, transcripts, and cached profile analysis.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )

                    Button(
                        onClick = { showDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                        shape = RoundedCornerShape(100.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Refresh, contentDescription = "Reset")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Reset & Wipe App Data")
                        }
                    }
                }
            }
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Erase All Data?") },
            text = { Text("This will permanently delete all scenario chats, transcripts, submitted evaluations, custom scenarios, and your generated communication profile. This is irreversible.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.clearAllData()
                        inputKey = ""
                        showDialog = false
                    }
                ) {
                    Text("YES, WIPE ALL", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
