#version 330 core

//#ifdef GL_ES
precision mediump float;
//#endif

uniform vec2 u_resolution;
uniform float u_time;


// Hash for noise (for slight building/car variation)
float hash(float n) { return fract(sin(n) * 43758.5453123); }

// Line function
float line(vec2 uv, float x, float width) {
    return smoothstep(x - width, x, uv.x) - smoothstep(x, x + width, uv.x);
}

// Road perspective function
float road(vec2 uv) {
    float roadWidth = 0.3;
    float vanish = 1.0 - uv.y;
    float halfRoad = roadWidth * vanish;
    return smoothstep(-halfRoad, -halfRoad + 0.01, uv.x) - 
           smoothstep(halfRoad - 0.01, halfRoad, uv.x);
}

// Building blocks
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

// Cars (simple rectangles near the edge of the road)
float car(vec2 uv, float side) {
    float vanish = 1.0 - uv.y;
    float baseX = (0.3 + 0.05) * side;
    float offset = mod(uv.y * 10.0, 1.0);
    if (offset < 0.2) {
        float y = mod(uv.y * 5.0, 1.0);
        if (y < 0.05) {
            float carW = 0.04 * vanish;
            float carH = 0.02 * vanish;
            if (abs(uv.x - baseX) < carW && y < carH) return 1.0;
        }
    }
    return 0.0;
}

// Dawn sun with soft rays
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

    vec3 col = vec3(0.05, 0.05, 0.08); // dawn sky base color

    // Background gradient (dawn effect)
    col += vec3(0.3, 0.2, 0.4) * (1.0 - uv.y);

    // Sun
    vec2 sunPos = vec2(0.0, 0.6);
    col += drawSun(uv, sunPos);

    // Road
    float r = road(uv);
    col = mix(col, vec3(0.1, 0.1, 0.1), r);

    // Buildings
    float bL = building(uv, -1.0);
    float bR = building(uv, 1.0);
    col = mix(col, vec3(0.2, 0.2, 0.25), bL);
    col = mix(col, vec3(0.25, 0.2, 0.2), bR);

    // Cars
    float cL = car(uv, -1.0);
    float cR = car(uv, 1.0);
    col = mix(col, vec3(0.6, 0.2, 0.1), cL);
    col = mix(col, vec3(0.2, 0.6, 0.1), cR);

    gl_FragColor = vec4(col, 1.0);
}
