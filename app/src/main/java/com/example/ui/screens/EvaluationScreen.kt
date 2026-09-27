package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.DesiredAdjustments
import com.example.model.Scenario

@OptIn(Material3Api::class)
@Composable
fun EvaluationScreen(
    scenario: Scenario,
    onSubmit: (
        realism: Int,
        rolePerf: Int,
        challenge: Int,
        empathyTesting: Int,
        workedWell: String,
        roboticFeel: String,
        improvement: String,
        adjustments: DesiredAdjustments
    ) -> Unit,
    onCancel: () -> Unit
) {
    val scrollState = rememberScrollState()

    // Ratings
    var realismRating by remember { mutableStateOf(4) }
    var rolePerformanceRating by remember { mutableStateOf(4) }
    var challengeRating by remember { mutableStateOf(3) }
    var empathyTestingRating by remember { mutableStateOf(4) }

    // Qualitative comments
    var whatWorkedWell by remember { mutableStateOf("") }
    var whatFeltRoboticOrArtificial by remember { mutableStateOf("") }
    var suggestionsForImprovement by remember { mutableStateOf("") }

    // Toggle adjustments
    var moreHumanVulnerability by remember { mutableStateOf(false) }
    var lessFormalOrAcademic by remember { mutableStateOf(false) }
    var higherDirectPushback by remember { mutableStateOf(false) }
    var moreNuancedSocialCues by remember { mutableStateOf(false) }
    var betterEmotionalDeEscalation by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scenario Complete Evaluation", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
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
            Text(
                text = "Thank you for completing the '${scenario.title}' simulation! Your feedback helps train and calibrate your custom bot profile.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )

            // Rating Section
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Session Performance Ratings", fontWeight = FontWeight.Bold, fontSize = 15.sp)

                    RatingRow("Bot Realism & Authenticity", realismRating) { realismRating = it }
                    RatingRow("Role Performance & Challenge", rolePerformanceRating) { rolePerformanceRating = it }
                    RatingRow("Calibration Pressure Level", challengeRating) { challengeRating = it }
                    RatingRow("Emotional Tension & Growth", empathyTestingRating) { empathyTestingRating = it }
                }
            }

            // Qualitative Section
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Qualitative Observations", fontWeight = FontWeight.Bold, fontSize = 15.sp)

                    OutlinedTextField(
                        value = whatWorkedWell,
                        onValueChange = { whatWorkedWell = it },
                        label = { Text("What communication technique felt effective?") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    OutlinedTextField(
                        value = whatFeltRoboticOrArtificial,
                        onValueChange = { whatFeltRoboticOrArtificial = it },
                        label = { Text("Did the bot use any robotic or repetitive phrases?") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    OutlinedTextField(
                        value = suggestionsForImprovement,
                        onValueChange = { suggestionsForImprovement = it },
                        label = { Text("General comments or adjustments...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )
                }
            }

            // Desired Profile Calibration Adjustments
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Desired Calibration Adjustments", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text("Select how the generated prompt profile should be calibrated based on this session's outcome:", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)

                    AdjustmentRow("Calibrate higher human vulnerability", moreHumanVulnerability) { moreHumanVulnerability = it }
                    AdjustmentRow("Lower formal or academic sentence structures", lessFormalOrAcademic) { lessFormalOrAcademic = it }
                    AdjustmentRow("Inject higher direct pushback or assertiveness", higherDirectPushback) { higherDirectPushback = it }
                    AdjustmentRow("Calibrate more nuanced social and tone cues", moreNuancedSocialCues) { moreNuancedSocialCues = it }
                    AdjustmentRow("Improve de-escalation emotional markers", betterEmotionalDeEscalation) { betterEmotionalDeEscalation = it }
                }
            }

            // Save Buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onCancel,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(100.dp)
                ) {
                    Text("Cancel & Discard")
                }

                Button(
                    onClick = {
                        onSubmit(
                            realismRating,
                            rolePerformanceRating,
                            challengeRating,
                            empathyTestingRating,
                            whatWorkedWell,
                            whatFeltRoboticOrArtificial,
                            suggestionsForImprovement,
                            DesiredAdjustments(
                                moreHumanVulnerability = moreHumanVulnerability,
                                lessFormalOrAcademic = lessFormalOrAcademic,
                                higherDirectPushback = higherDirectPushback,
                                moreNuancedSocialCues = moreNuancedSocialCues,
                                betterEmotionalDeEscalation = betterEmotionalDeEscalation
                            )
                        )
                    },
                    modifier = Modifier.weight(1.2f),
                    shape = RoundedCornerShape(100.dp)
                ) {
                    Text("Save & Submit")
                }
            }
        }
    }
}

@Composable
fun RatingRow(label: String, rating: Int, onRatingChanged: (Int) -> Unit) {
    Column {
        Text(text = label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
        Row(
            modifier = Modifier.padding(top = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            for (i in 1..5) {
                Icon(
                    imageVector = if (i <= rating) Icons.Default.Star else Icons.Outlined.Star,
                    contentDescription = "$i Stars",
                    tint = if (i <= rating) Color(0xFFFFB300) else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier
                        .size(28.dp)
                        .clickable { onRatingChanged(i) }
                )
            }
        }
    }
}

@Composable
fun AdjustmentRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
    }
}
