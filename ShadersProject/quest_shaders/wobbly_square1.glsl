#version 330 core

/**
    Date: Mon-31-March-2025
    This was the solution from ChatGPT.
    It didn't work. But the concept was useful
    as well as the noise and hash functions.
*/

out vec4 FragColor;
in vec2 fragCoord;
uniform vec2 iResolution;
uniform float iTime;

// Simple 2D noise function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// Wobbly square function
float wobblySquare(vec2 uv, float size, float wobbleAmount) {
    uv = uv * 2.0 - 1.0;  // Normalize UV to range [-1, 1]
    uv.x *= iResolution.x / iResolution.y;  // Maintain aspect ratio

    float border = 0.05;  // Square border thickness
    float halfSize = size * 0.5;

    // Add noise-based wobble to each side of the square
    float n1 = noise(uv * 3.0 + iTime) * wobbleAmount;
    float n2 = noise(uv.yx * 3.0 + iTime) * wobbleAmount;

    float left   = -halfSize - n1;
    float right  =  halfSize + n1;
    float bottom = -halfSize - n2;
    float top    =  halfSize + n2;

    // Check if the point is inside the wobbly square
    float horz = smoothstep(border, 0.0, abs(uv.x - left)) * smoothstep(border, 0.0, abs(uv.x - right));
    float vert = smoothstep(border, 0.0, abs(uv.y - bottom)) * smoothstep(border, 0.0, abs(uv.y - top));

    return horz * vert;
}

void main() {
    vec2 uv = fragCoord.xy / iResolution.xy;
    float size = 0.5;            // Size of the square
    float wobbleAmount = 0.1;    // How wobbly the square is

    // Get wobbly square shape
    float shape = wobblySquare(uv, size, wobbleAmount);

    // Set color based on shape
    FragColor = mix(vec4(0.0), vec4(1.0, 0.5, 0.2, 1.0), shape);  // Orange color for the square
}
