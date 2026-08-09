package com.example.sudoku.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.scrapbook.theme.ScrapbookTheme
import com.example.scrapbook.theme.scrapbookBorder
import com.example.scrapbook.theme.paperShadow
import com.example.scrapbook.theme.stickyNoteTilt
import com.example.sudoku.engine.BoardState
import com.example.sudoku.engine.SudokuCell

/**
 * Interactive 9x9 Sudoku board layout using Jetpack Compose.
 * Incorporates:
 * 1. An action command bar: Undo (curled marker line), Notes Mode (mechanical switch, highlighter ON), Hint (badge).
 * 2. 1 to 9 Input Pad: Chunky pop-comic buttons with responsive tactile compression.
 */
@Composable
fun InteractiveSudokuBoard(
    boardState: BoardState,
    onCellSelected: (row: Int, col: Int) -> Unit,
    onNumberEntered: (number: Int) -> Unit,
    onUndoPressed: () -> Unit,
    isNotesModeOn: Boolean,
    onNotesModeToggled: (Boolean) -> Unit,
    onClearPressed: () -> Unit,
    onSmartHintPressed: () -> Unit,
    modifier: Modifier = Modifier
) {
    val selectedRow = boardState.selectedRow
    val selectedCol = boardState.selectedCol

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ScrapbookTheme.Colors.BaseCanvasBackground)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Stats/Mistakes Banner
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .paperShadow(shape = RoundedCornerShape(4.dp))
                .background(Color.White)
                .scrapbookBorder(shape = RoundedCornerShape(4.dp))
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "STATUS: ACTIVE PLAY",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = ScrapbookTheme.Colors.AccentBorders
                )
                Text(
                    text = "Unique Solution Guard Enabled",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }

            // Fault indicators
            Box(
                modifier = Modifier
                    .background(Color(0xFFFEE2E2))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "${boardState.currentMistakesCount} / ${boardState.maxMistakesLimit} MISTAKES",
                    color = Color(0xFFDC2626),
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // 3x3 block quadrants structure
        // The 9x9 grid is rendered as a column of 3 grid rows, each containing 3 blocks
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            for (blockRow in 0..2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    for (blockCol in 0..2) {
                        val subGridIndex = blockRow * 3 + blockCol
                        
                        // Select different beautiful pastel tones for adjacent sticky quadrants
                        val blockBgColor = when (subGridIndex % 4) {
                            0 -> ScrapbookTheme.Colors.SkyBlue
                            1 -> ScrapbookTheme.Colors.MintGreen
                            2 -> ScrapbookTheme.Colors.CanaryYellow
                            else -> ScrapbookTheme.Colors.Lavender
                        }

                        // Each quadrant block is an independent sticky note cutout surface
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .stickyNoteTilt(index = subGridIndex)
                                .paperShadow(shape = RoundedCornerShape(8.dp))
                                .background(blockBgColor, shape = RoundedCornerShape(8.dp))
                                .scrapbookBorder(shape = RoundedCornerShape(8.dp))
                                .padding(4.dp)
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.SpaceEvenly
                            ) {
                                for (cellRowOffset in 0..2) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceEvenly
                                    ) {
                                        for (cellColOffset in 0..2) {
                                            val globalRow = blockRow * 3 + cellRowOffset
                                            val globalCol = blockCol * 3 + cellColOffset
                                            val cellData = boardState.grid[globalRow][globalCol]
                                            
                                            val isSelected = selectedRow == globalRow && selectedCol == globalCol
                                            val isRowSibling = selectedRow == globalRow
                                            val isColSibling = selectedCol == globalCol
                                            val isBoxSibling = selectedRow != null && selectedCol != null &&
                                                    (selectedRow / 3 == globalRow / 3) && (selectedCol / 3 == globalCol / 3)
                                            
                                            val inWatercolorInkCrosshair = (isRowSibling || isColSibling || isBoxSibling) && !isSelected

                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .aspectRatio(1f)
                                                    .padding(1.dp)
                                                    .clip(RoundedCornerShape(4.dp))
                                                    // Highlight cell with marker color overlays
                                                    .background(
                                                        color = when {
                                                            isSelected -> Color(0x33FFB300) // Active highlighter yellow
                                                            inWatercolorInkCrosshair -> Color(0x1210B981) // Translucent teal watercolor ink trace
                                                            else -> Color.Transparent
                                                        }
                                                    )
                                                    .clickable { onCellSelected(globalRow, globalCol) },
                                                contentAlignment = Alignment.Center
                                            ) {
                                                if (cellData.value != 0) {
                                                    Text(
                                                        text = cellData.value.toString(),
                                                        fontSize = 18.sp,
                                                        fontWeight = if (cellData.isOriginalClue) FontWeight.Bold else FontWeight.Light,
                                                        color = if (cellData.isOriginalClue) Color.Black else Color(0xFF1D4ED8),
                                                        fontFamily = if (cellData.isOriginalClue) FontFamily.Default else FontFamily.Cursive
                                                    )
                                                } else if (cellData.notes.isNotEmpty()) {
                                                    // Display penciled notes drafting list
                                                    Text(
                                                        text = cellData.notes.sorted().joinToString(""),
                                                        fontSize = 8.sp,
                                                        fontFamily = FontFamily.Monospace,
                                                        color = Color(0xFF7C3AED),
                                                        lineHeight = 9.sp,
                                                        textAlign = TextAlign.Center
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Control Actions Dashboard Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // 1. UNDO BUTTON
            val undoInteractionSource = remember { MutableInteractionSource() }
            val isUndoPressed by undoInteractionSource.collectIsPressedAsState()
            val undoScale by animateFloatAsState(targetValue = if (isUndoPressed) 0.93f else 1f, label = "undoScale")
            val undoShadow by animateFloatAsState(targetValue = if (isUndoPressed) 1f else 3f, label = "undoShadow")
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .graphicsLayer {
                        scaleX = undoScale
                        scaleY = undoScale
                    }
                    .paperShadow(shape = RoundedCornerShape(6.dp), offsetX = undoShadow.dp, offsetY = undoShadow.dp)
                    .background(Color.White, shape = RoundedCornerShape(6.dp))
                    .scrapbookBorder(shape = RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = undoInteractionSource,
                        indication = null,
                        onClick = onUndoPressed
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Canvas(modifier = Modifier.size(16.dp)) {
                        // Curved marker line
                        val path = Path().apply {
                            moveTo(size.width * 0.85f, size.height * 0.25f)
                            quadraticTo(
                                size.width * 0.85f, size.height * 0.85f,
                                size.width * 0.4f, size.height * 0.85f
                            )
                        }
                        drawPath(
                            path = path,
                            color = Color(0xFF1E1E1E),
                            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                        )
                        // Marker arrowhead tip
                        val arrowPath = Path().apply {
                            moveTo(size.width * 0.5f, size.height * 0.65f)
                            lineTo(size.width * 0.2f, size.height * 0.85f)
                            lineTo(size.width * 0.5f, size.height * 1.05f)
                        }
                        drawPath(
                            path = arrowPath,
                            color = Color(0xFF1E1E1E),
                            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                        )
                    }
                    Text(
                        text = "Undo",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E1E1E)
                    )
                }
            }

            // 2. NOTES MODE BUTTON (Acts as a mechanical pencil switch)
            val notesScale by animateFloatAsState(targetValue = if (isNotesModeOn) 0.94f else 1f, label = "notesScale")
            val notesShadow by animateFloatAsState(targetValue = if (isNotesModeOn) 1f else 3f, label = "notesShadow")
            val notesBgColor = if (isNotesModeOn) Color(0xFFFFF200) else Color.White // bright highlighter yellow overlay when ON

            Box(
                modifier = Modifier
                    .weight(1.2f)
                    .graphicsLayer {
                        scaleX = notesScale
                        scaleY = notesScale
                    }
                    .paperShadow(shape = RoundedCornerShape(6.dp), offsetX = notesShadow.dp, offsetY = notesShadow.dp)
                    .background(notesBgColor, shape = RoundedCornerShape(6.dp))
                    .scrapbookBorder(shape = RoundedCornerShape(6.dp))
                    .clickable(
                        onClick = { onNotesModeToggled(!isNotesModeOn) }
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isNotesModeOn) "✏️ Notes: ON" else "✎ Notes: OFF",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF1E1E1E),
                    textAlign = TextAlign.Center
                )
            }

            // 3. HINT BUTTON WITH COUNT BADGE
            val hintInteractionSource = remember { MutableInteractionSource() }
            val isHintPressed by hintInteractionSource.collectIsPressedAsState()
            val hintScale by animateFloatAsState(targetValue = if (isHintPressed) 0.93f else 1f, label = "hintScale")
            val hintShadow by animateFloatAsState(targetValue = if (isHintPressed) 1f else 3f, label = "hintShadow")

            Box(
                modifier = Modifier
                    .weight(1f)
                    .graphicsLayer {
                        scaleX = hintScale
                        scaleY = hintScale
                    }
                    .paperShadow(shape = RoundedCornerShape(6.dp), offsetX = hintShadow.dp, offsetY = hintShadow.dp)
                    .background(Color(0xFFE0F2FE), shape = RoundedCornerShape(6.dp)) // SkyBlue tint
                    .scrapbookBorder(shape = RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = hintInteractionSource,
                        indication = null,
                        onClick = onSmartHintPressed
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "💡 Hint",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0369A1)
                )

                // High-contrast Count Badge
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = 4.dp, y = (-4).dp)
                        .size(18.dp)
                        .background(Color(0xFF1E1E1E), shape = CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    val hintsLeft = maxOf(0, 3 - boardState.hintsCount)
                    Text(
                        text = hintsLeft.toString(),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }
            }
        }

        // 1 to 9 Input Pad with Custom Tactile Animation Tiles
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val paletteColors = listOf(
                    ScrapbookTheme.Colors.SkyBlue,
                    ScrapbookTheme.Colors.MintGreen,
                    ScrapbookTheme.Colors.CanaryYellow,
                    ScrapbookTheme.Colors.Lavender
                )

                for (number in 1..9) {
                    val tileColor = paletteColors[(number - 1) % paletteColors.size]
                    
                    PopComicInputTile(
                        number = number,
                        backgroundColor = tileColor,
                        onClick = { onNumberEntered(number) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Quick Operations Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                Button(
                    onClick = onClearPressed,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF3F4F6)),
                    modifier = Modifier.wrapContentWidth()
                ) {
                    Text(
                        text = "Clear Selected Square",
                        color = Color.Black,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

/**
 * Custom chunky pop-comic input tile with satisfying physics click compression.
 */
@Composable
fun PopComicInputTile(
    number: Int,
    backgroundColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    
    // Tactile deflection animations
    val scaleX by animateFloatAsState(targetValue = if (isPressed) 0.90f else 1.0f, label = "scaleX")
    val scaleY by animateFloatAsState(targetValue = if (isPressed) 0.90f else 1.0f, label = "scaleY")
    val shadowOffset by animateFloatAsState(targetValue = if (isPressed) 1.5f else 4.0f, label = "shadowOffset")

    Box(
        modifier = modifier
            .graphicsLayer {
                this.scaleX = scaleX
                this.scaleY = scaleY
            }
            .paperShadow(
                shape = RoundedCornerShape(8.dp),
                offsetX = shadowOffset.dp,
                offsetY = shadowOffset.dp
            )
            .background(backgroundColor, shape = RoundedCornerShape(8.dp))
            .scrapbookBorder(shape = RoundedCornerShape(8.dp))
            .clickable(
                interactionSource = interactionSource,
                indication = null, // Disable material default ripple for raw paper aesthetics
                onClick = onClick
            )
            .aspectRatio(1f),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = number.toString(),
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            color = ScrapbookTheme.Colors.AccentBorders
        )
    }
}
