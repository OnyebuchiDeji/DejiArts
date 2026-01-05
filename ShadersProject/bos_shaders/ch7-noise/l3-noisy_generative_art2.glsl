#version 330 core

/**
    Date: Monday-31-March-2025

    L3: Using Noise in Generative Ideas

    Value Noise and Gradient Noise by Inigo Quilez
    This is not the full implementation
    
    Consider these links:
        Gradient Noise:
            https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
        Value Noise:
            https://thebookofshaders.com/edit.php#11/2d-vnoise.frag

            
*/

#define PI 3.1415926535
#define TWO_PI 6.28318530718
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;



vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

/**
    INFO:

    So far, the 1D and 2D implementations of nouse were
    interpolations between random values. This is called `Value Noise`
    
    Value Noise tends to be blocky.
    Hence the solution is Gradient Noise, developed by Ken Perlin.
    It interpolates between random *gradients* instead of values.

    THe gradients themselves are a sesult of a 2D random function that
    returns directionss instead of a single float value as has been done
    so far.

*/

/**
    Gradient Noise by Inigo Quilez -- V1
*/


/**
    This is the gradient noise random.
*/
vec2 random2D(vec2 st)
{
    st = vec2(dot(st, vec2(127.1, 311.7)),
        dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

/**
    This is the gradient noise implementation
*/
float grad_noise(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0*f);


    //  Note that the dot product is used. That's why its a gradient noise
    float m1 =  mix( 
        dot( random2D(i + vec2(0.0, 0.0) ), f - vec2(0.0, 0.0)),
        dot( random2D(i + vec2(1.0, 0.0) ), f - vec2(1.0, 0.0)), u.x);

    float m2 = mix(
        dot( random2D(i + vec2(0.0, 1.0) ), f - vec2(0.0, 1.0)),
        dot( random2D(i + vec2(1.0, 1.0) ), f - vec2(1.0, 1.0)), u.x);

    return mix(m1, m2, u.y);
}



void gradient_noise()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    vec2 pos = vec2(st * 10.0);

    col = vec3( noise(pos) * 0.5 + 0.5);

    gl_FragColor = vec4(col, 1.0);
}


/**
    This is the value noise random generator.

    Note it uses the dot product to return random gradient values.
*/
float random2D_v2(vec2 st)
{
    float k1 = 127.1;
    float k2 = 311.7;
    float k3 = 269.5;
    float k4 = 183.3;
    float k5 = 12.9898;
    float k6 = 78.233;
    float k7 = 43758.5453123;

    st = vec2( dot(st, vec2(k1, k2)),
        dot(st, vec2(k3, k4)));
    
    return -1.0 + 2.0 * fract( sin( dot(
        st.xy, vec2(k5, k6))) * k7);
}

/**
    This is the value noise implementation.
*/
float noise_v2(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    float m1 = mix(random2D_v2(i + vec2(0.0, 0.0)),
        random2D_v2(i + vec2(1.0, 0.0)), u.x);
    
    float m2 = mix(random2D_v2(i + vec2(0.0, 1.0)),
        random2D_v2(i + vec2(1.0, 1.0)), u.x);

    return mix(m1, m2, u.y);
}

void value_noise()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    vec2 pos = vec2(st * 10.0);

    col = vec3(noise_v2(pos) * 0.5 + 0.5);

    gl_FragColor = vec4(col, 1.0);
}


void main()
{
    // gradient_noise();
    value_noise();
}