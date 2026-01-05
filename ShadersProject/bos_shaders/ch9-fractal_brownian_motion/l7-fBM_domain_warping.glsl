#version 330 core

/**
    Date: Monday 2nd June, 2025

    Fractal Brownian Motion Patterns: Domain Warping

*/

//  Author @patriciogv - 2015
//  http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random(in vec2 _st)
{
    return fract(
        sin(
            dot(_st.xy, vec2(12.9898, 78.233))
        ) * 43758.5453123
    );
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y *
        (1.0 - u.x) + (d - b) * u.x * u.y;
}


#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));

    for (int i = 0; i < NUM_OCTAVES; ++i) {
        //  modify value
        v += a * noise(_st);
        //  transform the frequency/shift phase
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy * 3.0;
    // st += st * abs(sin(u_time*0.1)*3.0);

    vec3 col = vec3(0.0);

    vec2 q = vec2(0.0);

    q.x = fbm(st + 0.00 * u_time);
    q.y = fbm(st + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm( st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
    r.y = fbm( st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

    float f = fbm(st + r);

    col = mix(vec3(0.101961, 0.619608, 0.666667),
            vec3(0.666667, 0.666667, 0.498039),
            clamp((f*f) * 4.0, 0.0, 1.0));
            
    col = mix(col, 
                vec3(0.0, 0.0, 0.164706),
                clamp(length(q), 0.0, 1.0));
                
    col = mix(col, vec3(0.666667, 1.0, 1.0),
            clamp(length(r.x), 0.0, 1.0));
    
    gl_FragColor = vec4((f * f * f + 0.6 * f * f + 0.5 * f) * col, 1.0);
}

/**
    Warping the texture coordinates with noise in this manner can be wuite useful.
    With it, you can produce a lot of cool effects.

    A useful use of this is to displace the coordinates with the derivative (gradient)
    of the noise.

    Some modern implementations of Perlin noise include a variant that computes both the function and
    its analytical gradient.

    If the `true` gradient is not available for a procedural function, you can always compute
    finite differences to approximate it, although this is less accurate and involves more work.
*/