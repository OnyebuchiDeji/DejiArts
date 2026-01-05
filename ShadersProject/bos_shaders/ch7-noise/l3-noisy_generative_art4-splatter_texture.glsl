#version 330 core

/**
    Date: Monday-31-March-2025

    Drawing Splatter Patterns.
*/

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;



vec2 rotate2D(vec2 _st, float _angle)
{
    _st -= 0.5;
    _st = mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

float Noise2D(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    //  Four Corners in 2D of a Tile
    float a  = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    //  Smooth Interpolation

    //  Cubic Hermine Curve. Same as Smoothstep()
    vec2 u = f * f * (3.0 - 2.0 * f);
    //  OR
    //  vec2 u = smoothstep(0.0, 1.0, f);

    //  Mix 4 Corners' Percentages
    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

float random2d_val(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    
    return -1.0 + 2.0 * fract( sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float value_noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( random2d_val( i + vec2(0.0,0.0) ), 
                     random2d_val( i + vec2(1.0,0.0) ), u.x),
                mix( random2d_val( i + vec2(0.0,1.0) ), 
                     random2d_val( i + vec2(1.0,1.0) ), u.x), u.y);
}

vec2 random2_grad(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float grad_noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2_grad(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2_grad(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2_grad(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2_grad(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


/**
    Distance Field Designs
*/
void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    st *= 2.0; st -= 1.0;
    st *= 1;

    float d = 0;

    //  Order of multiplication doesn't matter
    // st = rotate2D(st, Noise2D(st)) * st;
    //  Same as
    // st *= rotate2D(st, Noise2D(st));    //  Normal Value Noise
    
    //  Using Inigo Quilez Value Noise
    // st *= rotate2D(st, value_noise(st));

    //  Using Gradient Noise
    // st *= rotate2D(st, grad_noise(st));

    float d1 = Noise2D(st * 10.);
    float d2 = value_noise(st * 10.);
    float d3 = grad_noise(st * 10.);

    //  Check Out their Differences;
    // d = d1;
    // d = d2;
    d = d3;
    // d = d1 + d2 + d3;
    // d = d1 + d2 * d3;
    // d = d1 * d2 + d3;
    // d = d1 * d3 + d2;

    col += smoothstep(.15, .2, d);    //  Black Splatter
    col -= smoothstep(.35, .4, d);    //  Holes on Splatter
    

    gl_FragColor = vec4(col, 1.0);
}