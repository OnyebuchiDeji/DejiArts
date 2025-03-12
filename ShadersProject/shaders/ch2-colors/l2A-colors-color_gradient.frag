#version 330 core

/**
    Date: Fri-13-Dec-2024, Keele Days

    Colors --- Color Gradients

*/

#define PI 3.14159265359
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;


//  -------------------------------------------------------------------------
//          THE UTIL FUNCTIONS
//  -------------------------------------------------------------------------
float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}

float plot_line(vec2 st, float pct, float w)
{
    //  w is the width/thickness of the line -- choose 0.01 or 0.02
    return smoothstep(pct - w, pct, st.y) - smoothstep(pct, pct + w, st.y);
}

vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);

    return nm;
}

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

//  ---------------------------------------------------------------

/**
    Color Gradients 

    Done like seen in previous tasks, but these ones mix the colours also...
    done using the normalized x coordinate of each pixel being processed
    and using a line.

    The lines visualize the amount of colorA and colorB to mix per channel
*/


vec3 fade_flag(float x, vec3 pct)
{
    pct.r = smoothstep(0.0, 1.0, x);
    pct.g = sin(x * PI);
    pct.b = pow(x, 0.5);
    return pct;
}

vec3 flag_v1(float x, vec3 pct)
{
    //  Flag Of A Place
    //  upper limit, 0.5; so anything lower than 0 caps 0; any higher than 0.5, caps to 1.0
    pct.r = step(0.5, x);
    pct.g = step(0.5, x);
    pct.b = step(0.5, x);

    return pct;
}

void color_gradient_eg1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;    
    vec3 color = vec3(0.0);

    //  OG Pattern
    vec3 colorA = vec3(0.912, 0.121, 0.149);
    vec3 colorB = vec3(0.224, 0.149, 1.000);
    vec3 pct = vec3(st.x);
    color = mix(colorA, colorB, fade_flag(st.x, pct));


    //  Random Flag
    colorA = vec3(1.000, 0.00, 0.00);
    colorB = vec3(0.00, 0.00, 1.000);
    color = mix(colorA, colorB, fade_flag(st.x, pct));


    //  Ukraine Flag
    colorA = vec3(0.149, 0.141, 0.912);
    colorB = vec3(1.000, 0.833, 0.224);
    color = mix(colorA, colorB, flag_v1(st.x, pct));

    //  Plot transition lines for each channel

    //  This draws all the lines, showing how the value change across the screen by shape
    // color = mix(color, vec3(1.0, 0.0, 0.0), plot_line(st, pct.r, 0.01));
    // color = mix(color, vec3(0.0, 1.0, 0.0), plot_line(st, pct.g, 0.01));
    // color = mix(color, vec3(0.0, 0.0, 1.0), plot_line(st, pct.b, 0.01));

    //  This draws the lines, showing the value transition by shape, and also shows this
    //  in its color change
    color = mix(color, vec3(pct.r, 0.0, 0.0), plot_line(st, pct.r, 0.01));
    color = mix(color, vec3(0.0, pct.g, 0.0), plot_line(st, pct.g, 0.01));
    color = mix(color, vec3(0.0, 0.0, pct.b), plot_line(st, pct.b, 0.01));

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}

void main()
{
    // color_gradient_eg1();
}