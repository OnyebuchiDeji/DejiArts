#version 330 core

/**

    Shapes
    Learn how to draw simple shapes in a parallel procedural way.

*/


#define PI 3.14159265359
#define TWO_PI 6.28318530718
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
    Date: Fri-20-Dec-2024
    Shapes: Drawing Circles


*/


vec3 draw_rectangle_border(float x, float y, float w, float h, float border_width, vec3 in_color)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;

    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    float x_lim = 1;
    float y_lim = 1;

    //  Define boundaries of outer rectangle
    vec2 bl_out = vec2(0.0);
    bl_out.x = step(w_fct - x_fct, st.x);
    bl_out.y = step(h_fct - y_fct, st.y);

    vec2 tr_out = vec2(0.0);
    tr_out.x = step(w_fct + x_fct, 1.0 - st.x);
    tr_out.y = step(h_fct + y_fct, 1.0 - st.y);

    float pct_out = bl_out.x * bl_out.y * tr_out.x * tr_out.y;
    
    //  For Inner
    vec2 bl_in = vec2(0.0);
    bl_in.x = step(w_fct - x_fct + border_width, st.x);
    bl_in.y = step(h_fct - y_fct + border_width, st.y);

    vec2 tr_in = vec2(0.0);
    tr_in.x = step(w_fct + x_fct + border_width, 1.0 - st.x);
    tr_in.y = step(h_fct + y_fct + border_width, 1.0 - st.y);

    float pct_in = bl_in.x * bl_in.y * tr_in.x * tr_in.y;

    // color = vec3(1 - pct_in);
    // gl_FragColor = vec4(color, 1.0);

    float pct = pct_out * (1 - pct_in);
    // color = vec3(pct);
    color = vec3(1 - pct) * in_color;
    // gl_FragColor = vec4(color , 1.0);
    return color;
}
void piet_mondriean()
{
    vec3 color = vec3(0.0);
    //  border width
    float bw = 0.01;
    color = draw_rectangle_border(-0.4, 1.45, 0.07, 0.1, bw, vec3(1.0, 0.0, 0.12));
    color *= draw_rectangle_border(-0.52, 1.45, 0.07, 0.1, bw, vec3(1.0, 0.0, 0.12));
    color *= draw_rectangle_border(-0.4, 1.27, 0.07, 0.1, bw, vec3(1.0, 0.0, 0.12));
    color *= draw_rectangle_border(-0.52, 1.27, 0.07, 0.1, bw, vec3(1.0, 0.0, 0.12));

    color *= draw_rectangle_border(-0.26, 1.45, 0.5, 0.1, bw, vec3(0.78, 0.65, 0.22));
    color *= draw_rectangle_border(-0.26, 1.45, 0.5, 0.1, bw, vec3(0.78, 0.65, 0.22));


    // color *= draw_rectangle_border(0.45, 0.8, 0.5, 0.2, bw, vec3(0.80, 0.80, 0.6));
    // color *= draw_rectangle_border(0.45, 0.6, 0.5, 0.2, bw, vec3(0.80, 0.80, 0.6));

    // color *= draw_rectangle_border(0.8, 0.8, 0.2, 0.2, bw, vec3(0.80, 0.80, 0.6));
    // color *= draw_rectangle_border(0.8, 0.6, 0.2, 0.2, bw, vec3(0.80, 0.80, 0.6));

    // color *= draw_rectangle_border(0.9, 0.8, 0.2, 0.2, bw, vec3(1.0, 1.0, 0.12));
    // color *= draw_rectangle_border(0.9, 0.6, 0.2, 0.2, bw, vec3(1.0, 1.0, 0.12));
    
    // color *= draw_rectangle_border(0.1, 0.55, 0.1, 0.6, bw, vec3(1.0, 1.0, 0.12));
    // color *= draw_rectangle_border(0.9, 0.6, 0.2, 0.2, bw, vec3(1.0, 1.0, 0.12));
    // color *= draw_rectangle_border(0.9, 0.8, 0.2, 0.2, bw, vec3(1.0, 1.0, 0.12));
    // color *= draw_rectangle_border(0.9, 0.6, 0.2, 0.2, bw, vec3(1.0, 1.0, 0.12));

    gl_FragColor = vec4(color, 1.0);
}


void draw_rectangle_v2(float x, float y, float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;

    /**
        For x_fct and y_fct...
        Their displacement from center 0.5, 0.5 is calculated.
        E.g.:
        If x = 0.4, d = 0.5-0.4
        x_fct = d * 0.5.
        the left border limit is reduced by x_fct
        the right border limit is increased by x_fct
        to make the rectangle move to the left by 0.1.

    */
    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    vec2 bl = vec2(0.0);
    bl.x = step(w_fct - x_fct, st.x);
    bl.y = step(h_fct - y_fct, st.y);

    vec2 tr = vec2(0.0);
    tr.x = step(w_fct + x_fct, 1.0 - st.x);
    tr.y = step(h_fct + y_fct, 1.0 - st.y);

    float pct = bl.x * bl.y * tr.x * tr.y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}

void main()
{
    // vec2 nm = norm_mouse();
    // vec3 rect = draw_rectangle_border(nm.x, nm.y, 0.15, 0.15, 0.01, vec3(0.8, 0.8, 0.12));
    // gl_FragColor = vec4(rect, 1.0);
    piet_mondriean();
    // gl_FragColor = vec4(nm.x, nm.x, nm.x, 1.0);
    // draw_rectangle_v2(nm.x, nm.y, 0.15, 0.15);
    // draw_rectangle_v2(0.5, 0.5, 0.15, 0.15);
    // draw_rectangle_v2(0.0, 0.5, 0.15, 0.15);
    // draw_rectangle_v2(-0.3, 0.5, 0.5, 0.5);
}