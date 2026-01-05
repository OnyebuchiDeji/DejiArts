#version 330 core

/**
    Date: Monday 2nd June, 2025


    Fractal Brownian Motion: FBM 2D Noise


    NOTE:

    FBM implemented in two dimensions to
    create a fractal-based noise pattern.
*/

// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;


float plot_line(vec2 st, float fct, float w)
{
    return smoothstep(fct - w, fct, st.y) - smoothstep(fct, fct + w, st.y);
}

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

vec2 norm_mouse2(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(mix(0.0, 1.0, og_mouse_coord.x / u_resolution.x), smoothstep(0.0, 1.0, mouse_y / u_resolution.y));
    return nm;
}

float random2D(in vec2 st)
{
    return fract(
        sin(
            dot(st.xy, vec2(12.9898, 78.233)
        )) * 43758.5453123
    );
}


//  Based on Morgan McGuire @morgan3d
//  https://www.shadertoy.com/view/4dS3Wd

float noise2D(in vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    //  Four corners in 2D of a tile
    float a = random2D(i);
    float b = random2D(i + vec2(1.0, 0.0));
    float c = random2D(i + vec2(0.0, 1.0));
    float d = random2D(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y
        * (1.0 - u.x) + (d - b) * u.x * u.y;
}

/**
    Octaves do just that: they decrease the amplitude every so slightly.
    I cannot describe hoe it affects tje frequency.

    Amplitude increases the brightness of every part. Brightening the grey spots 
    to create constrast with the dark parts.
    The lacunarity affects the division of the fractal noise space. So there are more
    repititions/unique parts.
*/

#define OCTAVES 5
float fbm(in vec2 st)
{
    //  Initial Values
    float y = 0.0;
    //  Initial Values
    float amp = 0.5;
    float freq = 1.0;

    // float lacunarity = 2.0;
    // float gain = 0.5;
    vec2 nm = norm_mouse2(u_mouse) * 3.0;
    float lacunarity = nm.x;
    float gain = nm.y;

    //  Loop of octaves
    for (int i=0; i < OCTAVES; i++){
        y += amp * noise2D(st);
        st *= lacunarity;
        amp *= gain;
    }

    return y;
}

/**
    Creates a 2D noise pattern like smoke
*/
void FBM_Noise_Impl1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    // st.x *= 20.0;
    // st.y *= 10.0;

    vec3 col = vec3(0.0);

    col += fbm(st * 3.0);

    gl_FragColor = vec4(col, 1.0);
}


void main()
{
    FBM_Noise_Impl1();
}