#version 330 core

//#ifdef GL_ES
precision mediump float;
//#endif

uniform vec2 u_resolution;
uniform float u_time;


// Simple hash for variation
float hash(float n) { return fract(sin(n) * 43758.5453123); }

// Road with perspective
float road(vec2 uv) {
    float vanish = 1.0 - uv.y;
    float halfRoad = 0.3 * vanish;
    return smoothstep(-halfRoad, -halfRoad + 0.01, uv.x) - 
           smoothstep(halfRoad - 0.01, halfRoad, uv.x);
}

// Building generator
float building(vec2 uv, float side) {
    float vanish = 1.0 - uv.y;
    float x = uv.x * side;
    if (x < 0.0) return 0.0;
    float width = 0.08 * vanish;
    float gap = 0.05 * vanish;
    float b = 0.0;
    for (int i = 0; i < 10; i++) {
        float bx = (width + gap) * float(i);
        float h = 0.3 + 0.2 * hash(float(i) + side * 100.0);
        if (x > bx && x < bx + width && uv.y < h * vanish) {
            b = 1.0;
        }
    }
    return b;
}

// Car shape near road, with optional light blinking
float car(vec2 uv, float side, out float lightStrength) {
    float vanish = 1.0 - uv.y;
    float baseX = (0.3 + 0.05) * side;
    float offset = mod(uv.y * 10.0, 1.0);
    float result = 0.0;
    lightStrength = 0.0;

    if (offset < 0.2) {
        float y = mod(uv.y * 5.0, 1.0);
        if (y < 0.05) {
            float carW = 0.04 * vanish;
            float carH = 0.02 * vanish;
            if (abs(uv.x - baseX) < carW && y < carH) {
                result = 1.0;
                // light blinking (pulse-like)
                lightStrength = 0.5 + 0.5 * sin(u_time * 2.0 + uv.y * 20.0);
                lightStrength *= smoothstep(0.01, 0.03, abs(uv.x - (baseX + side * carW)));
            }
        }
    }

    return result;
}

// Stylized dawn sun with rays
vec3 drawSun(vec2 uv, vec2 sunPos) {
    float d = length(uv - sunPos);
    float sunCore = smoothstep(0.05, 0.01, d);
    float sunGlow = smoothstep(0.2, 0.05, d);
    
    float rays = sin(atan(uv.y - sunPos.y, uv.x - sunPos.x) * 8.0 + u_time) * 0.02;
    float sunRay = smoothstep(0.05 + rays, 0.01 + rays, d);
    
    return vec3(1.0, 0.8, 0.5) * sunCore + vec3(1.0, 0.5, 0.3) * sunRay + vec3(0.1, 0.08, 0.05) * sunGlow;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.05, 0.05, 0.08); // base dark blue sky

    // Dawn gradient
    col += vec3(0.3, 0.2, 0.4) * (1.0 - uv.y);

    // Moving sun position
    vec2 sunPos = vec2(0.4 * sin(u_time * 0.05), 0.6 + 0.05 * cos(u_time * 0.1));
    col += drawSun(uv, sunPos);

    // Road
    float r = road(uv);
    col = mix(col, vec3(0.1, 0.1, 0.1), r);

    // Buildings
    float bL = building(uv, -1.0);
    float bR = building(uv, 1.0);
    col = mix(col, vec3(0.2, 0.2, 0.25), bL);
    col = mix(col, vec3(0.25, 0.2, 0.2), bR);

    // Cars and blinking lights
    float lLight, rLight;
    float cL = car(uv, -1.0, lLight);
    float cR = car(uv, 1.0, rLight);

    col = mix(col, vec3(0.6, 0.2, 0.1), cL);
    col = mix(col, vec3(0.2, 0.6, 0.1), cR);

    // Headlights as soft glow
    col += vec3(1.0, 0.9, 0.6) * lLight * 0.5;
    col += vec3(1.0, 0.9, 0.6) * rLight * 0.5;

    gl_FragColor = vec4(col, 1.0);
}