#version 330 core

/**
    Date: Fri-13-Dex-2024, Keele Days

    Algorithmic Drawing

    Advanced Shaping Functions
*/


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;

#define PI 3.14159265359

float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}


float plot_exp(vec2 st, float pct)
{
    return smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.02, st.y);
}

vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;
    /**
        Old way of normalizing was wrong, as it used the current pixel being
        processed. It was not getting the actual mouse value.
        This affected the previous tasks and exercises I did.
    */
    // vec2 nm = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    /**
      Again, thought it was the below with smoothstep, but no.
      This is because for smoothstep, any value higher than the upper limit
      is capped to the upper limit.
      And those below lower lim, capped to lower lim 
      It does not return the proportion of that value v from within the ragne 0->1
      where
      smoothstep(lower_lim, upper_lim, v)
      Below:
    */
    // vec2 nm = vec2(smoothstep(0.0, 1.0, u_mouse.x), smoothstep(0.0, 1.0, mouse_y));

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);


    return nm;
}

//  To normalize mouse uniforms, specifically made for the clicked mouse ones
vec2 norm_mouse(vec2 og_mouse_coord)
{
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}
/**
    Date: Fri-13-12-2024, Keele Days

    Some Various Functions and their Graphs

    They've been gone through and their effects, I remember.
*/

void draw()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    // st *= 4;
    //  Render Divider
    // float y = mod(st.x, 0.5);   //  return x modulo of 0.5

    //  Also Render Divider
    // float y = fract(st.x);   //  return onlt fractional part of a number
    
    //  Color Changing Ladder
    // float y = ceil(st.x);   //  return nearest integer that is >= x

    //  Also a Color Changing Ladder
    // float y = floor(st.x);   //  return nearest integer <= x

    //  Straight line, represents sign of x
    // float y = sign(st.x);   //  extracts the sign of x

    //  y = x +ve identity line
    // float y = abs(st.x);   //  return the absolute value of x

    // Clamps values between 0 and 1 -- still gives y = x graph
    // float y = clamp(st.x, 0.0, 1.0);   //  constrain x to lie between 0.0 and 1.0

    //  Returns 0.0 and hence line is at 0.0
    // float y = min(0.0, st.x);   //  return the lesser of x and 0.0

    //  Returns y = x because all values of st.x are > 0.0
    float y = max(0.0, st.x);   //  return the greater of x and 0.0

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.75, 0.96, 0.15);
    gl_FragColor = vec4(color, 1.0); 
}

void main()
{
    draw();
}