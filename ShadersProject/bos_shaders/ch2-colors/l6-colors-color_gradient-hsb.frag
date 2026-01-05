#version 330 core

/**
    Date: Fri-13-Dec-2024, Keele Days

    Colors --- Color Gradients

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


//  --------------------------------------------------------------------------------
/**
    HSB:
        it's a unique color space, different from the use of the rgb channels/

    HSB: Hue, Saturation, and Brightness (or Value)
    Here the rgb2hsb() and hsb2rgb() functions do what their name implies.

    By mapping the position on the x axis to the Hue and position on the y axis to the
    Brightness, a pleasant spectrum of visible colors is seen.
    This spatial distribution of color is useful as it's more intuituive to pick a color with 
    HSB than with RGB.
*/

vec3 rgb2hsb(in vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

//  Function from Inigo Quiles
//  https://shadertoy.com/view/MsS3Wc
vec3 hsb2rgb(in vec3 c)
{
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 
                                    6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void draw_hsb2rgb()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  We map x (0.0 - 1.0) to the hue (0.0 - 1.0)
    //  And the y (0.0 - 1.0) to the brightness
    color = hsb2rgb(vec3(st.x, 1.0 ,st.y));

    gl_FragColor = vec4(color, 1.0);
}

/**
    HSB in polar coordinates

    This is the original form of presentation according to its design.
    it uses angle and radius rather than x and y.

    Hence the to map the HSB function to polar coordinates, the angle and distance
    from the center of the billboard to the pixel coordinate is needed

    This requires the `length()` function and atan(y, x)
    Now, atan() is the glsl version of the commonly used atan2()

    NOTE!   There are more built-in functions beside length, such as:
        *   distance(),     *   dot(),              *   cross(),
        *   normalize(),    *   faceforward()       *   reflect()
        *   refract()

    There are other vector relational functions as:
        *   lessThan(),     *   lessThanEqual(),    *   greaterThan(),
        *   greaterThan(),  *   greaterThanEqual(), *   equal(),
        *   notEqual()
    
    After getting the angle and length, 'normalize' the values to range [0..1]

    atan(y, x) will return an angle in radians between -PI and PI (-3.14 to 3.14)
    hence divide this number by TWO_PI to get values between -0.5 and 0.5
    and then add 0.5 to transform it to range 0.0 to 1.0.

    The radius will return a max of 0.5 since we are calculating the istance from the viewport
    center.
    Then double this range to get a max of 1.0

*/

void draw_polar_hsb2rgb()
{
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    //  Use polar coordiantes instead of cartesian

    //  This is the distance of each point from the center of the pixel space
    vec2 to_center = vec2(0.5) - st;
    float angle = atan(to_center.y, to_center.x);
    float radius = length(to_center) * 2.0;

    /**
      Map the angle (-PI to PI) to the Hue (from 0 to 1)
      and the saturation to the radius
    */
    color = hsb2rgb(vec3((angle/TWO_PI) + 0.5, radius, 1.0));

    gl_FragColor = vec4(color, 1.0);
}

void draw_spinning_polar_hsb2rgb()
{
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    //  Use polar coordiantes instead of cartesian

    //  This is the distance of each point from the center of the pixel space
    vec2 to_center = vec2(0.5) - st;

    float angle = atan(to_center.y, to_center.x);

    //  Some effects
    // float angle = atan(to_center.y * (sin(u_time)), to_center.x * (cos(u_time)));
    // float angle = atan(to_center.y * (cos(u_time)), to_center.x * (sin(u_time)));

    //  Modulating the spin
    // angle += (sin(u_time * PI) + cos(u_time * PI)) + 1.0;
    angle += u_time * PI;   //  the actual thing
    float radius = length(to_center) * 2.0;

    /**
      Map the angle (-PI to PI) to the Hue (from 0 to 1)
      and the saturation to the radius by dividing by TWO_PI
      and adding 0.5
    */
    color = hsb2rgb(vec3((angle/TWO_PI) + 0.5, radius, 1.0));

    gl_FragColor = vec4(color, 1.0);
}

float elasticInOut(float t)
{
    return t < 0.5 ?
           0.5 * sin(+13.0 * HALF_PI * 2.0 * t) *
                pow(2.0, 10.0 * (2.0 * t - 1.0)) :
           0.5 * sin(-13.0 * HALF_PI * ((2.0 * t - 1.0) + 1.0)) *
                pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
}

/**
    Using a shaping function together with the conversion
    function from HSB to RGB to expand a particular hue and shrink
    the rest.
    Now remember that hue varies with angle here.
    So something like a quadratic shaping function would
    make the hue for a certain pixel's angle value higher than for another
*/
void draw_hue_modulating_hsb2rgb()
{
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    //  Use polar coordiantes instead of cartesian

    //  This is the distance of each point from the center of the pixel space
    vec2 to_center = vec2(0.5) - st;

    float angle = atan(to_center.y, to_center.x);

    //  Modulating the spin
    // angle += u_time * PI;   //  the actual thing

    float radius = length(to_center) * 2.0;

    // float hue = angle/TWO_PI + 0.5;
    // float hue = pow(angle/TWO_PI + 0.5, 2);
    // float hue = pow(angle/TWO_PI + 0.5, 0.5);

    //  For example, this one increases the value of red
    // float hue = 1 -  pow(abs(angle/TWO_PI + 0.5), 3.5);

    //  This one green and blue
    // float hue = 1 -  pow(abs(angle/TWO_PI + 0.5), 0.5);
    
    // float hue = pow(cos((angle/TWO_PI + 0.5) / 2.0), 3.5);

    //  This one emphasizes red and pink
    float hue = pow(cos((angle/TWO_PI + 0.5) / 2.0), 1.5);
    
    color = hsb2rgb(vec3(hue, radius, 1.0));

    gl_FragColor = vec4(color, 1.0);
}


/**
    There is a form of the color wheel that uses a different spectrum according
    to the RYB color space.
    It causes the color opposite the red spectrum to be green.
    But in the normal implementation shown by draw_polar_hsb2rgb(), the
    opposite is be cyan.

    Make the RYB color space spectrum effect using shaping functions to affect the hue.
    It is as simple as spinning the wheel backward by some amount/angle.
*/
vec3 hsb2rgb_v2(in vec3 c)
{
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 
                                    6.0) - 3.0) - 1.0, 0.0, 1.0);
    // vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 
    //                                 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void draw_polar_ryb_hsb2rgb()
{
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    //  Use polar coordiantes instead of cartesian

    //  This is the distance of each point from the center of the pixel space
    vec2 to_center = vec2(0.5) - st;
    float angle = atan(to_center.y, to_center.x);
    float radius = length(to_center) * 2.0;

    // float hue = angle/TWO_PI + 0.5;
    //  For example, this one increases the value of red
    // float hue = pow(abs(angle/TWO_PI + 0.5), 3.5);

    //  This one green and blue
    float hue = 1 - pow(abs(angle/TWO_PI + 0.5), 0.5);
    // float hue = pow(abs(angle/TWO_PI + 0.5), -3.5);
    // float hue = 1 - pow(abs(angle/TWO_PI + 0.5), 0.5);

    color = hsb2rgb_v2(vec3(hue, radius, 1.0));

    gl_FragColor = vec4(color, 1.0);
}


//  -----------------------------------------------------------------------------


void main()
{
    // draw_hsb2rgb();
    // draw_polar_hsb2rgb();
    // draw_spinning_polar_hsb2rgb();
    // draw_hue_modulating_hsb2rgb();
    draw_polar_ryb_hsb2rgb();
}