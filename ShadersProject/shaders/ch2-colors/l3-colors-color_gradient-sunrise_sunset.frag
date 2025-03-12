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
    //  upper limit, 0.3; so anything lower than 0 caps 0; any higher than 0.3, caps to 1.0
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


void william_turret_sunset_gradient()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Skyblue: 135, 206, 235
    //  Orange: 255, 165, 0

    // vec3 pct = vec3(st.x, st.x * 0.647, st.y);
    vec3 pct = vec3(st.x);
    // vec3 pct = vec3(st.x, 0.18, 1.0 - st.x * 0.5);

    // vec3 pct = vec3(st.x, 0.18, 1.0 - st.x);
    // vec3 pct = vec3(st.x, 0.013, st.y);

    // pct.r = 1.0 - smoothstep(0.0, 1.0, st.x);
    // pct.g = sin(st.x * PI);
    // pct.b = 0.5 + pow(st.x, 0.5);

    vec3 colorA = vec3(1.000, 0.047, 0.180);
    vec3 colorB = vec3(0.529, 0.180, 0.921);



    // gl_FragColor = vec4(st.x, 0.1, 0.1, 1.0);
    gl_FragColor = vec4(pct, 1.0);

}

/**
    
    Fixed Aspect Ratio effect on Circle that uses normal screen coordinates
    Not Yet
*/
float circle_v5(vec2 st_og, vec2 center, float r)
{
    vec2 st = st_og;
    float lim_x_pstv = center.x + r;
    float lim_x_ngtv = center.x - r;
    float lim_y_pstv = center.y + r;
    float lim_y_ngtv = center.y - r;

    /**
        Combining these two filters reduces amount of computation...
    */
    if (((st.x < lim_x_ngtv) || (st.x > lim_x_pstv)) || ((st.y < lim_y_ngtv) || (st.y > lim_y_pstv)))
    {
        return 0.0;
    }
    /**
        because calculating the square distance of each screen pixel is not good.
        so it's better to check the distance of the select pixels within the square
        to ensure only those in the circle within the square are allowed.
    */

    //  If within square
    //  Note calculations don't find square root to keep performance
    float dist_limit = pow(r, 2);
    float dist_btw_center_n_p = pow(st.x - center.x, 2) + pow(st.y - center.y, 2);

    //  Filter for only those within the circle
    if (dist_btw_center_n_p > dist_limit)
    {
        return 0.0;
    }


    float dist = smoothstep(0, dist_limit, dist_btw_center_n_p);

    // float p_dist = min(max(0.85, dist), 1.0);

    //  this fixes above, making the inside brighter than the outside rays -- partial gradient
    // float p_dist = min(max(0.85, 1 - dist), 1.0);

    //  This improves the gradient:
    /**
        Using clamp makes it that the val = 1 - dist is between 0.9 and 1
        this makes sure pixels' colors will always sure, but only those closer to the center
        such that val is between 0.9 and 1 to be the brightest.

        It highlights the sun's core, though
    */
    // float p_dist = min(max(0.85, clamp(1 - dist, 0.9, 1)), 1.0);
    //  Variations of above
    // float p_dist = min(max(0.9, clamp(1 - dist, 0.95, 1)), 1.0);
    // float p_dist = min(max(0.95, clamp(1 - dist, 0.9, 1)), 1.0);


    // return p_dist;

    /**
        This is what like I want; an inverted version of above
    */
    
    // return 1 - smoothstep(0.98, 0.8, 1 - dist);
    // return 1 - smoothstep(0.48, 0.3, 1 - dist);
    // return 1 - smoothstep(0.2, 0.1, 1 - dist);
    // return 1 - smoothstep(0.3, 0.1, 1 - dist);

    // return clamp(smoothstep(1, 0.5, 1 - dist), 0.8, 1);

    //  This is the best one
    return clamp(smoothstep(0, 1, 1 - dist), 0.3, 1);
}


vec3 william_turret_effect_v2(vec2 st)
{

    float horizon = 0.20;
    float horizon_divide_range = 0.1;
    float vertical_divide = 0.5;
    float vert_divide_range = 0.15;

    float r_weight = 0;
    float g_weight = 0.0;
    float b_weight = 0.0;

    float vert_divide_left_lim = vertical_divide - vert_divide_range;
    float vert_divide_right_lim = vertical_divide + vert_divide_range;
    //  Wihin vertical center
    if ((st.x > vert_divide_left_lim) && (st.x < vert_divide_right_lim))
    {
        r_weight += smoothstep(0.0, 1.0, st.x) + 0.15;
        g_weight += pow(st.x + 0.35, 4);
        b_weight += pow(st.x + 0.35, 4);
    }
    //  Left side of canvas
    else if ((st.x <  vert_divide_left_lim))
    {
        b_weight += pow(st.x + 0.35, 4);
        r_weight += 0.015;
        g_weight += 0.1;
    }
    //  Right side of canvas
    else if ((st.x >  vert_divide_left_lim))
    {
        r_weight += pow(st.x + 0.35, 4);
        b_weight += pow(st.x - 0.35, 2.5);
        g_weight += 0.1;
    }

    float horizon_divide_upper_lim =  horizon + horizon_divide_range;
    float horizon_divide_lower_lim =  horizon - horizon_divide_range;

    //  Within horizontal center
    if ((st.y > horizon_divide_lower_lim) && (st.y < horizon_divide_upper_lim))
    {
        //  Increase blue
        b_weight += pow(st.x + 0.35, 4);
        r_weight += smoothstep(0.0, 1.0, st.x) * 0.15;
        g_weight += 0.01;
    }
    // below horizon -- ocean
    else if ((st.y < horizon_divide_lower_lim))
    {
        //  Increase red due to the sunset
        //  more red in general
        r_weight += pow(st.x + 0.35, 4);
        b_weight += smoothstep(0.0, 1.0, st.x) * 0.15;
        //  but more green on left side
        g_weight += sin(st.x * PI + 0.95) * 1.5;
    }
    //  above horizon
    else if ((st.y > horizon_divide_upper_lim))
    {
        //  don't change much -- just redder tint
        r_weight += mix(r_weight, 1, 0.25);
        b_weight += b_weight;
        g_weight += g_weight;
    }

    return vec3(r_weight, g_weight, b_weight);
}

void william_turret_sunset_gradient_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Deepblue: 135, 206, 235
    //  Orange: 255, 165, 0

    vec3 pct = vec3(st.x);
    // vec3 pct = vec3(st.x, 0.180, 1.0 - st.x);

    // pct.r = 0.8 * smoothstep(0.0, 1.0, st.x);
    // pct.r = 1 - sin(st.x * PI) * 0.5;
    pct.r = 1 - sin(st.x * PI) * 0.5;
    pct.g = sin(st.x * PI + 0.95) * 1.5;
    pct.b = pow(st.x + 0.35, 4);

    // pct = william_turret_effect(st);
    // pct = william_turret_effect_v2(st);
    
    vec3 colorA = vec3(1.000, 0.647, 0.180); //  Orange
    vec3 colorB = vec3(0.529, 0.180, 0.921); //  Deepblue

    //  colorA will be at left; colorB at right
    color = mix(colorB, colorA, pct);

    /**
        Color Mixing allows one to add color artifacts to the canvas
    */
    color = mix(color, vec3(1.00, 0.700, 0.12), circle_v5(st, vec2(0.6, 0.25), 0.05));

    color = mix(color, vec3(1.0, 0.0, 0.0), plot_line(st, pct.r, 0.01));
    color = mix(color, vec3(0.0, 1.0, 0.0), plot_line(st, pct.g, 0.01));
    color = mix(color, vec3(0.0, 0.0, 1.0), plot_line(st, pct.b, 0.01));
    // color = mix(color, vec3(pct.r, 0.0, 0.0), plot_line(st, pct.r, 0.01));
    // color = mix(color, vec3(0.0, pct.g, 0.0), plot_line(st, pct.g, 0.01));
    // color = mix(color, vec3(0.0, 0.0, pct.b), plot_line(st, pct.b, 0.01));
    
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(st.x, 0.1, 0.1, 1.0);
    // gl_FragColor = vec4(pct, 1.0);

}

vec3 plot_rgb_lines(vec2 st, vec3 pct, vec3 canvas_color, float line_width)
{
    vec3 out_color = vec3(0);
    out_color = mix(canvas_color, vec3(1.0, 0.0, 0.0), plot_line(st, pct.r, line_width));
    out_color = mix(out_color, vec3(0.0, 1.0, 0.0), plot_line(st, pct.g, line_width));
    out_color = mix(out_color, vec3(0.0, 0.0, 1.0), plot_line(st, pct.b, line_width));

    return out_color;
}

vec3 sun_effect(vec2 st, vec2 sun_coord, float sun_rad)
{
    /**
      This is the sun's color... #ffc922 or [100.0% red, 78.82% green and 13.33% blue]
      the rays will give a slightly darker color closer to the sun
      but that becomes lighter and blends more as it goes out radially.

    */
    vec3 sun_color = mix(vec3(1.00, 0.78 * (0.95 * sun_coord.y), 0.13), vec3(1.00, (0.78 * 1.2) + sun_coord.y * 0.22, (0.13 * 1.2) + sun_coord.y * 0.87), sun_coord.y * 0.85);
    // vec3 sun_color = vec3(1.00, 0.78, 0.13);
    float sun_rad_square= pow(sun_rad, 2);
    float max_ray_rad = pow(sun_rad * 10, 2);

    // vec3 sky_color = vec3(0.529, 0.180, 0.921); // Deepblue

    float horizon_height = 0.2;

    vec3 pct = vec3(0.0);

    vec3 out_color = sun_color;

    float pix_dist = pow(st.x - sun_coord.x, 2) + pow(st.y - sun_coord.y, 2);
    if (pix_dist > sun_rad_square)
    {
        // pct.r = 1 - smoothstep(0, max_ray_rad, pix_dist);
        // pct.g = 1 - smoothstep(0, max_ray_rad, pix_dist);
        // pct.b = 1 - smoothstep(0, max_ray_rad, pix_dist);
        pct.r = 1 - smoothstep(0, max_ray_rad, pix_dist);
        pct.g = 1 - smoothstep(0, max_ray_rad, pix_dist);
        pct.b = 1 - smoothstep(0, max_ray_rad, pix_dist);
    }

    out_color = mix(sun_color * 0.7, out_color, pct);

    out_color = mix(out_color, sun_color, circle_v5(st, sun_coord, sun_rad));
    // out_color = plot_rgb_lines(st, pct, out_color, 0.01);


    return out_color;
}

float quadraticInOut(float t)
{
    float p = 2.0 * t * t;
    return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

void sun_rise_n_set()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    // st.x /= gl_FragCoord.y;
    // st *= (u_resolution.y / u_resolution.x);

    //  The 0.95 affects the amplitude
    // vec2 sun_coord = vec2(0.5, 0.95 abs(sin(PI * u_time * 0.05));
    
    //  Like rise and set, right?
    float t = u_time * 0.05;
    t = abs(fract(t) * 2.0 - 1.0);
    vec2 sun_coord = vec2(0.5, quadraticInOut(t));
    
    float sun_rad = 0.05;
    vec3 color = sun_effect(st, sun_coord, sun_rad);


    gl_FragColor = vec4(color, 1.0);
}


/**
    Theory is that depending on the height of the sun above the horizon...
    the reflection cone on the water's span is proportional to the height above the horizon.
*/
vec3 color_ocean(vec2 st, float horizon_height, vec2 sun_coord, vec3 current_color)
{
    //  Ensure that it only processes pixels with height below horizon
    //  so only sea pixels
    if (st.y > horizon_height) { return vec3(current_color); }


    // vec3 pct = vec3(0);
    vec3 pct = vec3(1.0 * 0.5 * current_color.x, (1 - st.x) - 0.5,  current_color.b * (0.557 * 0.13));
    vec3 out_color = vec3(0);
    
    //  locust swamp green: (172, 181, 142) -> (0.675, 0.710, 0.557)
    // vec3 swamp_green = vec3(0.675, 0.710, 0.557);
    //  swamp green: (0.682, 0.690, 0.506);
    vec3 swamp_green = vec3(0.682, 0.690, 0.506);

    vec3 sun_color = vec3(1.00, 0.78, 0.13);
    vec3 dark_sun_color = sun_color * 0.5;

    //  For sun reflection on water
    float alpha = 30;
    float h = sun_coord.y - horizon_height;
    float sun_x_coord_range = h * tan(alpha/2);
    float sun_line_left_lim = sun_coord.x - sun_x_coord_range;
    float sun_line_right_lim = sun_coord.x + sun_x_coord_range;
    if ((st.x > sun_line_left_lim) && (st.x < sun_line_right_lim))
    {
        float pixel_dist = abs(st.x - sun_coord.x); 
        pct.r = 1 - smoothstep(0, sun_x_coord_range, pixel_dist);
    }

    // pct.r += sin(st.x * PI);
    pct.b = pow(st.y * 0.35, 4);
    pct.g = sin(st.x * PI + 1.5) * 1.5;

    out_color.r = mix(dark_sun_color.r, current_color.r, pct.r);
    out_color.gb = mix(out_color.gb, swamp_green.gb, pct.gb);
    out_color = mix(current_color, out_color, pct);

    out_color = plot_rgb_lines(st, pct, out_color, 0.01);

    return out_color;
}

void sun_rise_n_set_with_ocean()
{
    vec2 st = (gl_FragCoord.xy / u_resolution);
    // st *= (u_resolution.y / u_resolution.x);

    //  The 0.95 affects the amplitude
    // vec2 sun_coord = vec2(0.5, 0.95 abs(sin(PI * u_time * 0.05)));
    
    //  Like rise and set, right?
    float t = u_time * 0.05;
    t = abs(fract(t) * 2.0 - 1.0);
    vec2 sun_coord = vec2(0.5, quadraticInOut(t));
    
    float sun_rad = 0.05;
    vec3 color = sun_effect(st, sun_coord, sun_rad);
    color = color_ocean(st, 0.2, sun_coord, color);


    gl_FragColor = vec4(color, 1.0);
}

void main()
{
    // color_gradient_eg1();
   
    // william_turret_sunset_gradient_v2();
    sun_rise_n_set();
    // sun_rise_n_set_with_ocean();
}