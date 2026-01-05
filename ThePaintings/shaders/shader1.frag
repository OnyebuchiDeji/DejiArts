#version 300 es
precision mediump float;

/**
    This version works well. It makes the image look like a painting
    and causes the swirls to move with time.
*/

uniform sampler2D texture1;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_image_size;
in vec2 textureCoords;
// out vec4 fragColor;

// Simple random noise
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Value noise
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0 - 2.0*f); // Smooth interpolation

    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

// Directional blur (like a brush stroke)
vec3 directionalBlur(sampler2D tex, vec2 uv, vec2 direction) {
    vec3 col = vec3(0.0);
    float total = 0.0;

    for (float i = -4.0; i <= 4.0; i++) {
        float w = 1.0 - abs(i) / 4.0;
        vec2 offset = direction * i / u_resolution;
        col += texture(tex, uv + offset).rgb * w;
        total += w;
    }
    return col / total;
}

void main() {
    vec2 uv = textureCoords;
    //  Fix UV Aspect Ratio

    float aspectRatioFactor = max(u_image_size.x, u_image_size.y) / min(u_image_size.x, u_image_size.y);
    uv.x *= aspectRatioFactor;

    float k = (aspectRatioFactor - 1.0) / 2;

    uv.x += 1 - k;

    //  Use square border step but only horizontal
    float left = step(1, uv.x);
    float right = step(k, abs((aspectRatioFactor + 1-k)- uv.x));
    float showFactor = left * right;

    // Simulate brush direction using noise
    float angle = noise(uv * 10.0 + u_time) * 3.1415 * 2.0;
    vec2 direction = vec2(cos(angle), sin(angle)) * 2.0;

    // Apply directional blur
    vec3 blurred = directionalBlur(texture1, uv, direction);

    // Add grainy texture using noise
    float grain = noise(uv * 200.0 + u_time) * 0.05;

    // Color quantization
    blurred = floor(blurred * 6.0) / 6.0;

    gl_FragColor = showFactor * vec4(blurred + grain, 1.0);
}
