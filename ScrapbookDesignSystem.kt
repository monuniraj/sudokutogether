package com.example.scrapbook.theme

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.drawscope.drawOutline
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Scrapbook Theme Design Tokens
 * 
 * Provides colors and configurations matching a clean, physical scrapbook aesthetic.
 */
object ScrapbookTheme {
    object Colors {
        // Base Canvas Background: Warm off-white paper tone
        val BaseCanvasBackground = Color(0xFFFDFBF7)
        
        // Accent Borders: Sharpie Charcoal Black
        val AccentBorders = Color(0xFF1E1E1E)
        
        // Paper Styles
        val MintGreen = Color(0xFFE6F4EA)
        val SkyBlue = Color(0xFFE0F2FE)
        val CanaryYellow = Color(0xFFFEF9C3)
        val Lavender = Color(0xFFF3E8FF)
    }
}

/**
 * Applies a thick inner 2dp pure white stroke line, enclosed perfectly by a
 * 2dp dark charcoal outer solid outline.
 */
fun Modifier.scrapbookBorder(shape: Shape = RectangleShape): Modifier = this
    .border(width = 2.dp, color = ScrapbookTheme.Colors.AccentBorders, shape = shape)
    .padding(2.dp)
    .border(width = 2.dp, color = Color.White, shape = shape)

/**
 * Applies a clean, completely solid offset drop-shadow (x = 4dp, y = 4dp)
 * using the dark charcoal outline color. Avoids soft digital blurs to achieve
 * a hard cutout paper drop-shadow aesthetic.
 */
fun Modifier.paperShadow(
    shape: Shape = RectangleShape,
    color: Color = ScrapbookTheme.Colors.AccentBorders,
    offsetX: Dp = 4.dp,
    offsetY: Dp = 4.dp
): Modifier = this.drawBehind {
    val dx = offsetX.toPx()
    val dy = offsetY.toPx()
    
    // Create the outline based on the specified shape and density/layout direction context
    val outline = shape.createOutline(size, layoutDirection, this)
    
    // Translate the canvas coordinates to render the solid cutout shadow offset
    drawContext.canvas.save()
    drawContext.canvas.translate(dx, dy)
    
    drawOutline(
        outline = outline,
        color = color
    )
    
    drawContext.canvas.restore()
}

/**
 * Applies a slight layout rotation modifier that tilts elements gently by
 * alternating between -1.0 and +1.0 degrees based on the provided index.
 */
fun Modifier.stickyNoteTilt(index: Int): Modifier {
    val degrees = if (index % 2 == 0) -1.0f else 1.0f
    return this.graphicsLayer {
        rotationZ = degrees
    }
}
