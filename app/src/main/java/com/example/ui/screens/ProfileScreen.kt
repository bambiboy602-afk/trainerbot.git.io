package com.example.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.PersonaProfile
import com.example.viewmodel.TrainerViewModel

@OptIn(Material3Api::class)
@Composable
fun ProfileScreen(viewModel: TrainerViewModel) {
    val scrollState = rememberScrollState()
    val profileState by viewModel.profileFlow.collectAsState(initial = null)
    val isAnalyzing by viewModel.isAnalyzingProfile.collectAsState()

    val profile = profileState ?: PersonaProfile()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Communication Profile", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface),
                actions = {
                    if (isAnalyzing) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp))
                    } else {
                        IconButton(onClick = { viewModel.triggerManualProfiling() }) {
                            Icon(imageVector = Icons.Default.Refresh, contentDescription = "Recalculate Profile")
                        }
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
                .padding(16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile Completeness Header Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "PROFILE COMPLETENESS",
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                fontSize = 11.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${profile.completenessScore}% Calibrated",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        // Custom radial indicator placeholder
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(100.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${profile.completenessScore}%",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = if (profile.overallSummary.isEmpty()) {
                            "Observe user dialogue to analyze traits. Send at least 3-4 responses in the chat or scenario simulations to generate your cognitive linguistic profile."
                        } else {
                            profile.overallSummary
                        },
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                        lineHeight = 18.sp
                    )
                }
            }

            if (profile.spectrums.isNotEmpty()) {
                // Traits Spectrums section
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text("Cognitive Communication Spectrums", fontWeight = FontWeight.Bold, fontSize = 15.sp)

                        profile.spectrums.forEach { spectrum ->
                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(spectrum.leftLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text(spectrum.rightLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(16.dp)
                                        .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(100.dp))
                                ) {
                                    // Colored progress thumb indicator
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth(spectrum.score.toFloat() / 100f)
                                            .fillMaxHeight()
                                            .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(100.dp))
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = spectrum.summary,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    lineHeight = 15.sp
                                )
                            }
                        }
                    }
                }

                // Dos and Donts Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Signature Communication Checklist", fontWeight = FontWeight.Bold, fontSize = 15.sp)

                        Row(modifier = Modifier.fillMaxWidth()) {
                            // DOs column
                            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("DOs (For Bot Replication)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF10B981))
                                profile.communicationDosAndDonts.dos.forEach { item ->
                                    Row(verticalAlignment = Alignment.Top) {
                                        Text("✓ ", color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                                        Text(item, fontSize = 12.sp, lineHeight = 16.sp)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.width(16.dp))

                            // DONTs column
                            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("DONTs (For Bot Replication)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFFEF4444))
                                profile.communicationDosAndDonts.donts.forEach { item ->
                                    Row(verticalAlignment = Alignment.Top) {
                                        Text("✗ ", color = Color(0xFFEF4444), fontWeight = FontWeight.Bold)
                                        Text(item, fontSize = 12.sp, lineHeight = 16.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                // Strengths and Growth Areas
                profile.socialGrowthFeedback?.let { feedback ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Empathetic & Social Growth Feedback", fontWeight = FontWeight.Bold, fontSize = 15.sp)

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                MetricScoreBox("Empathy Score", feedback.empathyScore ?: 50, Color(0xFF10B981))
                                MetricScoreBox("De-escalation Score", feedback.deEscalationScore ?: 50, Color(0xFF3B82F6))
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text("Observed Strengths", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF10B981))
                            feedback.strengths.forEach { str ->
                                Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(bottom = 4.dp)) {
                                    Icon(imageVector = Icons.Default.CheckCircle, contentDescription = "Strength", tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(str, fontSize = 12.sp, lineHeight = 16.sp)
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text("Growth & Calibration Directions", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFFF59E0B))
                            feedback.growthAreas.forEach { gr ->
                                Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(bottom = 4.dp)) {
                                    Icon(imageVector = Icons.Default.Info, contentDescription = "Growth", tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(gr, fontSize = 12.sp, lineHeight = 16.sp)
                                }
                            }
                        }
                    }
                }

                // Progress Snapshot History Chart (Custom Canvas!)
                if (profile.progressHistory.isNotEmpty()) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Communication Skills Trajectory", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text("Tracking your active calibration levels across sessions:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

                            // Chart Canvas
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(150.dp)
                                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                    .padding(8.dp)
                            ) {
                                val snapshots = profile.progressHistory
                                Canvas(modifier = Modifier.fillMaxSize()) {
                                    val w = size.width
                                    val h = size.height

                                    // Draw grid lines
                                    drawLine(Color.LightGray.copy(alpha = 0.5f), Offset(0f, 0f), Offset(w, 0f))
                                    drawLine(Color.LightGray.copy(alpha = 0.5f), Offset(0f, h / 2f), Offset(w, h / 2f))
                                    drawLine(Color.LightGray.copy(alpha = 0.5f), Offset(0f, h), Offset(w, h))

                                    if (snapshots.size > 1) {
                                        val stepX = w / (snapshots.size - 1)

                                        // Draw lines for Empathy (Green), Assertiveness (Blue), Clarity (Amber)
                                        val pathEmpathy = Path()
                                        val pathAssertive = Path()
                                        val pathClarity = Path()

                                        snapshots.forEachIndexed { index, snap ->
                                            val x = index * stepX
                                            val yEmpathy = h - (snap.empathy / 100f * h)
                                            val yAssert = h - (snap.assertiveness / 100f * h)
                                            val yClarity = h - (snap.clarity / 100f * h)

                                            if (index == 0) {
                                                pathEmpathy.moveTo(x, yEmpathy)
                                                pathAssertive.moveTo(x, yAssert)
                                                pathClarity.moveTo(x, yClarity)
                                            } else {
                                                pathEmpathy.lineTo(x, yEmpathy)
                                                pathAssertive.lineTo(x, yAssert)
                                                pathClarity.lineTo(x, yClarity)
                                            }

                                            // Draw dots
                                            drawCircle(Color(0xFF10B981), 4.dp.toPx(), Offset(x, yEmpathy))
                                            drawCircle(Color(0xFF3B82F6), 4.dp.toPx(), Offset(x, yAssert))
                                            drawCircle(Color(0xFFF59E0B), 4.dp.toPx(), Offset(x, yClarity))
                                        }

                                        drawPath(pathEmpathy, Color(0xFF10B981), style = Stroke(width = 2.dp.toPx()))
                                        drawPath(pathAssertive, Color(0xFF3B82F6), style = Stroke(width = 2.dp.toPx()))
                                        drawPath(pathClarity, Color(0xFFF59E0B), style = Stroke(width = 2.dp.toPx()))
                                    } else if (snapshots.isNotEmpty()) {
                                        // Single data point
                                        val snap = snapshots[0]
                                        val yEmpathy = h - (snap.empathy / 100f * h)
                                        val yAssert = h - (snap.assertiveness / 100f * h)
                                        val yClarity = h - (snap.clarity / 100f * h)

                                        drawCircle(Color(0xFF10B981), 6.dp.toPx(), Offset(w / 2f, yEmpathy))
                                        drawCircle(Color(0xFF3B82F6), 6.dp.toPx(), Offset(w / 2f, yAssert))
                                        drawCircle(Color(0xFFF59E0B), 6.dp.toPx(), Offset(w / 2f, yClarity))
                                    }
                                }
                            }

                            // Chart Legend
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                LegendItem("Empathy", Color(0xFF10B981))
                                LegendItem("Assertiveness", Color(0xFF3B82F6))
                                LegendItem("Clarity", Color(0xFFF59E0B))
                            }
                        }
                    }
                }
            } else {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(imageVector = Icons.Default.Info, contentDescription = "Pending Analysis", tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f), modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Analysis Pipeline Pending", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "Complete at least 1 roleplay session or exchange 3-4 conversational turns in the chat to kick off the automatic profile compilation.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RowScope.MetricScoreBox(label: String, score: Int, color: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.08f)),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.weight(1f)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = score.toString(), color = color, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun LegendItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .background(color, RoundedCornerShape(2.dp))
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
