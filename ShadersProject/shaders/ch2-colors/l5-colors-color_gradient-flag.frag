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




vec3 plot_rgb_lines(vec2 st, vec3 pct, vec3 canvas_color, float line_width)
{
    vec3 out_color = vec3(0);
    out_color = mix(canvas_color, vec3(1.0, 0.0, 0.0), plot_line(st, pct.r, line_width));
    out_color = mix(out_color, vec3(0.0, 1.0, 0.0), plot_line(st, pct.g, line_width));
    out_color = mix(out_color, vec3(0.0, 0.0, 1.0), plot_line(st, pct.b, line_width));

    return out_color;
}

float flag(float x, vec3 pct, float fct)
{
    pct.r = step(fct, x);
    pct.g = step(fct, x);
    pct.b = step(fct, x);

    return pct;
}

float smooth_flag(float x, vec3 pct, float fct)
{
    pct.r = smoothstep(0, fct, x);
    pct.g = smoothstep(0, fct, x);
    pct.b = smoothstep(0, fct, x);

    return pct;
}


void draw_flag_c2(bool isVertical, bool isSmooth, vec3 color1, vec3 color2)
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec3 color = vec3(st.x);

    float coord_choice = st.y; 
    if (isVertical)
    {
        coord_choice = st.x; 
    }

    vec3 pct = vec3(coord_choice);
    

    //  Flag Rainbow

    float ratio = 0.5;
    if (isSmooth)
    {
        color = mix(color1, color2, smooth_flag(coord_choice, pct, ratio));
    }else
    {
        color = mix(color1, color2, flag(coord_choice, pct, ratio));
    }

    gl_FragColor = vec4(color, 1.0);
}


void draw_flag_c3(bool isVertical, bool isSmooth, vec3 color1, vec3 color2, vec3 color3)
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec3 color = vec3(st.x);
    float coord_choice = st.y;

    if (isVertical)
    {
        coord_choice = st.x;
    }

    vec3 pct = vec3(coord_choice);


    //  Smooth Rainbow
    float ratio = 0.333333333;
    if (isSmooth)
    {
        color = mix(color1, color2, smooth_flag(coord_choice, pct, ratio));
        color = mix(color, color3, smooth_flag(coord_choice, pct, 2 * ratio));
    }
    else{
        color = mix(color1, color2, flag(coord_choice, pct, ratio));
        color = mix(color, color3, flag(coord_choice, pct, 2*ratio));
    }


    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    // color_gradient_eg1();
    
    // draw_flag(false);
    // draw_smooth_flag(true);
    vec3 green = vec3(0.0, 1.0, 0.0);
    vec3 white = vec3(1.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    vec3 orange = vec3(1.0, 0.645, 0.0);

    draw_flag_c3(true, false, green, white, green);

    // draw_flag_c2(false, false, blue, yellow);

    draw_flag_c3(false, false, orange, white, green);


}