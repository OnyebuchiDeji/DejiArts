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
    Returning a float for every pixel
    that is within the circle.

    It also makes a gradient such that the further
    it is from the center, the higher the output float
    is so that the result color tends toward the colorB in mix
    the mix, for e.g. 

    outout = mix(colorA, colorB, circle);
*/
float circle_v1_cross(vec2 st, vec2 center, float r)
{
    float lim_x_pstv = center.x + r;
    float lim_x_ngtv = center.x - r;
    float lim_y_pstv = center.y + r;
    float lim_y_ngtv = center.y - r;

    if (((st.x < lim_x_ngtv) || (st.x > lim_x_pstv)) && ((st.y < lim_y_ngtv) || (st.y > lim_y_pstv)))
    {
        return -1;
    }

    //  If within circle
    //  Note calculations don't find square root to keep performance
    float dist_limit = pow(r, 2);
    float dist_btw_center_n_p = pow(st.x - center.x, 2) + pow(st.y - center.y, 2);

    //  This uses the dist_Limit as the upper limit, and then maps
    //  the value 'dist_btw_center_n_p' to be its corresponding between 0 and 1
    float dist = smoothstep(0, dist_limit, dist_btw_center_n_p);
    return dist;
}

/**
  Draws the actual circle; but because the screen is rectangular, and this
  just uses the normal screen pixels without modifying, the appearance of
  the circle is like an oval because of the aspect ratio of the pixels' posittions
  used directly.

  Fix:
    1.  For when a pixel is not positioned within the circle, return 0.0, not -1.0
        This didn't really affect much. 0.0 makes the original background color stay the same
        -1.0 modifies it, making it slightly darker.

    2.  Main Fix: when the pixel coordinate is within circle:
            return 1.0 - dist , not return dist;

        This is essential, as it makes the orange color brighter from the center
        and less bright toward the outside.
        Though it defeats the main point that it should become brighter as it
        goes further from the center.
        This is why the cross pattern is all yellow, because it returns 1.0...
        since the distance of those pixels are past the radius square limit

    Also, the cross pattern is an issue with the screen pixel filtering logic

    More fixes in _v3

*/
float circle_v2(vec2 st, vec2 center, float r)
{
    float lim_x_pstv = center.x + r;
    float lim_x_ngtv = center.x - r;
    float lim_y_pstv = center.y + r;
    float lim_y_ngtv = center.y - r;

    //  screen pixel filtering logic
    if (((st.x < lim_x_ngtv) || (st.x > lim_x_pstv)) && ((st.y < lim_y_ngtv) || (st.y > lim_y_pstv)))
    {
        return 0.0;
    }

    //  If within circle
    //  Note calculations don't find square root to keep performance
    float dist_limit = pow(r, 2);
    float dist_btw_center_n_p = pow(st.x - center.x, 2) + pow(st.y - center.y, 2);

    //  This uses the dist_Limit as the upper limit, and then maps
    //  the value 'dist_btw_center_n_p' to be its corresponding between 0 and 1
    float dist = smoothstep(0, dist_limit, dist_btw_center_n_p);
    // return 1 - dist;
    return dist;
}

/**
    Fixed exclusion logic from AND (&&)  to OR (||)

    This fixed the drawing of the cross pattern seen in the recent previous
    one _v2 when it 'return dist'.

    In this one, though it return dist, it's in a square
*/
float circle_v3(vec2 st, vec2 center, float r)
{
    float lim_x_pstv = center.x + r;
    float lim_x_ngtv = center.x - r;
    float lim_y_pstv = center.y + r;
    float lim_y_ngtv = center.y - r;

    //  This is the correct way.
    if (((st.x < lim_x_ngtv) || (st.x > lim_x_pstv)) || ((st.y < lim_y_ngtv) || (st.y > lim_y_pstv)))
    {
        return 0.0;
    }
    /**
        Same as:

        if (((st.x < lim_x_ngtv) || (st.x > lim_x_pstv)))
        {
            return 0.0;
        }
        if ((st.y < lim_y_ngtv) || (st.y > lim_y_pstv)))
        {
            return 0.0;
        }
    */

    //  If within circle
    //  Note calculations don't find square root to keep performance
    float dist_limit = pow(r, 2);
    float dist_btw_center_n_p = pow(st.x - center.x, 2) + pow(st.y - center.y, 2);

    //  This uses the dist_Limit as the upper limit, and then maps
    //  the value 'dist_btw_center_n_p' to be its corresponding between 0 and 1
    float dist = smoothstep(0, dist_limit, dist_btw_center_n_p);
    // return 1 - dist;
    return dist;
}

/**
    Fixed the square issue. Now though it 'return dist', it still gives a circle
    It was fixed by changing the conditions to calculate the distance for that point.

    That distance must fall between the max distance r^2 to properly check that only points
    that fall within the circle's radius are considered.

    Now, whether 'return dist' or 'return 1 - dist', it still gives a circle.

    Now, return dist does not give the color pattern I desire.
    I want the inside to be a darker yellow; for the colorB in the mix function
    it gives a brighter form of that colorB the further from the circle's center.

    But that's beyond this functin's scope...
    so return 1.0 is cool; it's the colorB in the center, and fades into the background
    the further from the center.
*/
float circle_v4(vec2 st, vec2 center, float r)
{
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

    //  This uses the dist_Limit as the upper limit, and then maps
    //  the value 'dist_btw_center_n_p' to be its corresponding between 0 and 1
    float dist = smoothstep(0, dist_limit, dist_btw_center_n_p);
    // float p_dist = min(max(0.85, dist), 1.0);
    // float p_dist = min(max(0.85, 1 - dist), 1.0);
    // float p_dist = min(max(0.85, clamp(1 - dist, 0.9, 1)), 1.0);
    float p_dist = min(max(0.95, clamp(1 - dist, 0.9, 1)), 1.0);
    return p_dist;
    // return dist;
    // return 1 - dist;
    // return dist + 1.5;
    // return clamp(1 - dist, 0.98, 1);
    // return smoothstep(1.2, 1, 1 - dist);
    // return clamp(smoothstep(1, 0.5, 1 - dist), 0.8, 1);
    // return clamp(smoothstep(0, 1, 1 - dist)), 0.5, 1,;
}


//  V4 Explained
float circle_v4(vec2 st, vec2 center, float r)
{
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

    //  This uses the dist_Limit as the upper limit, and then maps
    //  the value 'dist_btw_center_n_p' to be its corresponding between 0 and 1
    float dist = smoothstep(0, dist_limit, dist_btw_center_n_p);

    /**
        These are close to what I want... to show that fading of the light rays.
        They don't so much show the gradient, though.
    */
    //  This one makes the rays outside the circumference brighter than the sun circle.
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

    //  Hollow inside, the sun color brightens in proportion radially
    // return dist;
    // return dist + 1.5;

    //  Filled inside, the sun color blends radially or dims in proportion radially
    //  so it fades as dist increases.
    // return 1 - dist;

    //  Fills the sun circle with no blending or fading / color gradient
    // return clamp(1 - dist, 0.98, 1);

    //  Does same: fills with no gradient.
    //  It works because smoothstep(lower_lim, upper_lim, val)
    /**
        Because lower_lim > upper_lim, output is swapped so that
        if val <= upper_lim, output = 1.0
        if val >= lower_lim, output = 0.0
        if val > upper_lim and val < lower_lim, the transition is reversed: it's
        output decreases from 1.0 to 0.0
        so as val moves from lower_lim to upper_lim, the output interpolates smoothly
        from 1.0 to 0.0.
    */
    //  This just returns 1 for every thing because '1 - dist' results in from 1 -> 0
    //  hence every result is <= upper_lim (1), hence it returns 1.0
    // return smoothstep(1.2, 1, 1 - dist);

    //  This is close to what I want...
    /**
        Basically, it is a hollow circle, with the inside not colored with the sun color...
        that is, it returns 0.0 for pixels closer to its radius because of the smoothstep
        below.
        But for pixels in the circle where '1 - dist' tends to 0, it returns 1.0

        for the pixels, let val = '1 - dist'
        for those pixels where val >= lower_lim (0.98), 0.0 is returned...
        for those where val <= upper_lim (0.8), 1.0 is returned
        for those where val > (upper lim) 0.8 and val < (lower_lim) 0.98, it returns values decreasing
        from 1.0 to 0.0
    */
    // return smoothstep(0.98, 0.8, 1 - dist);
    // return smoothstep(0.48, 0.3, 1 - dist);

    /**
        Hence the below ensures that where val = 1 - dist
        for that pixel if val >= 0.2 meaning it's far from the center, it returns 0.0
        if the pixel <= 0.1, it returns 1 -- resulting in a thin bordered circle.
    
    */
    // return smoothstep(0.2, 0.1, 1 - dist);
    // return smoothstep(0.3, 0.1, 1 - dist);

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


void william_turret_sunset_gradient_v1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Deepblue: 135, 206, 235
    //  Orange: 255, 165, 0

    // vec3 pct = vec3(st.x);
    vec3 pct = vec3(st.x, 0.180, 1.0 - st.x);

    pct.r = 0.8 * smoothstep(0.0, 1.0, st.x);
    // pct.g = sin(st.x * PI);
    pct.b = pow(st.x, 1.3);

    vec3 colorA = vec3(1.000, 0.647, 0.180); //  Orange
    vec3 colorB = vec3(0.729, 0.180, 0.921); //  Deepblue

    //  colorA will be at left; colorB at right
    color = mix(colorB, colorA, pct);

    /**
        Color Mixing allows one to add color artifacts to the canvas
    */
    // color = mix(color, vec3(1.00, 0.700, 0.12), circle_v1_cross(st, vec2(0.6, 0.2), 0.05));
    // color = mix(color, vec3(1.00, 0.700, 0.12), circle_v2(st, vec2(0.6, 0.2), 0.05));
    // color = mix(color, vec3(1.00, 0.700, 0.12), circle_v3(st, vec2(0.6, 0.2), 0.05));
    color = mix(color, vec3(1.00, 0.700, 0.12), circle_v4(st, vec2(0.6, 0.2), 0.05));

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

vec3 william_turret_effect(vec2 st)
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
        g_weight = 0.1;
    }
    //  Right side of canvas
    else if ((st.x >  vert_divide_left_lim))
    {
        r_weight += pow(st.x + 0.35, 4);
        b_weight += pow(st.x - 0.35, 2.5);
        g_weight = 0.1;
    }

    float horizon_divide_upper_lim =  horizon + horizon_divide_range;
    float horizon_divide_lower_lim =  horizon - horizon_divide_range;

    //  Within horizontal center
    if ((st.y > horizon_divide_lower_lim) && (st.y < horizon_divide_upper_lim))
    {
        //  Increase blue
        b_weight += pow(st.x + 0.35, 4);
        r_weight = smoothstep(0.0, 1.0, st.x) * 0.15;
        g_weight += 0.01;
    }
    // below horizon -- ocean
    else if ((st.y < horizon_divide_lower_lim))
    {
        //  Increase red due to the sunset
        //  more red in general
        r_weight += pow(st.x + 0.35, 4);
        b_weight = smoothstep(0.0, 1.0, st.x) * 0.15;
        //  but more green on left side
        g_weight += sin(st.x * PI + 0.95) * 1.5;
    }
    //  above horizon
    else if ((st.y > horizon_divide_upper_lim))
    {
        //  don't change much -- just redder tint
        r_weight += mix(r_weight, 1, 0.25);
        b_weight = b_weight;
        g_weight = g_weight;
    }

    return vec3(r_weight, g_weight, b_weight);
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

void william_turret_sunset_gradient_v3()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Deepblue: 135, 206, 235
    //  Orange: 255, 165, 0

    vec3 pct = vec3(st.x);
    // vec3 pct = vec3(st.x, 0.180, 1.0 - st.x);

    // pct.r = 0.8 * smoothstep(0.0, 1.0, st.x);
    // pct.g = sin(st.x * PI + 0.95) * 1.5;
    // pct.b = pow(st.x + 0.35, 4);

    // pct = william_turret_effect(st);
    pct = william_turret_effect_v2(st);
    
    vec3 colorA = vec3(1.000, 0.647, 0.180); //  Orange
    vec3 colorB = vec3(0.529, 0.180, 0.921); //  Deepblue

    //  colorA will be at left; colorB at right
    color = mix(colorB, colorA, pct);

    /**
        Color Mixing allows one to add color artifacts to the canvas
    */
    color = mix(color, vec3(1.00, 0.700, 0.12), circle_v4(st, vec2(0.6, 0.25), 0.05));

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

void main()
{
    // color_gradient_eg1();
    // william_turret_sunset_gradient();
    // william_turret_sunset_gradient_v1();
    william_turret_sunset_gradient_v2();
}