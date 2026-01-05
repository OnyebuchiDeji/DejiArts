#version 330 core

/**
    Date: Monday-31-March-2025

    Implementation of 2D Noise.

    NOTE:
        The `mix` function performs a linear interpolation
        between x and y based on some weight, a between 0 and 1

        o = mix(x, y, a);
        = x * (1 - a) + y * a

    Reference: Book of Shaders --- Noise Chapter
*/

#define PI 3.1415926535
#define TWO_PI 6.28318530718
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;



/**
    1D Random Hash Function
*/
float rand(float x)
{
    return fract(sin(x) * 100000.0);
}

/**
    1D Noise
*/
float DNC(float x, float dx)
{
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand(i), rand(i + dx), u);
}

/**
    2D Random Hash Function
*/
float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

/**
    2D Noise:
        No longer involves interpolating between two points of a line:
            rand(x) and rand(x) + 1.0
        Instead, interpolate between four corners of the square area of a plane:
        (rand(st),
         rand(st) + vec2(1.0, 0.0),
         rand(st) + vec2(0.0, 1.0),
         rand(st) + vec2(1.0, 1.0))

    It subdivides the space into cells using floor and fract.
    The integer part and fractional parts are kept.
    Then the integer positions of the cells are used to calculate the four
    corners'coordinates and obtain a random value for each one.

    Then we interpolate between the 4 random values of the corners
    using the fractional positions stored, with a cubic interpolating formula/curve
    
*/


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

//------------------------------------------------

void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;    //  Preserve Aspect Ratio

    //  Scale the coordinate system to see noise action
    //  You will be able to see the squares of the grid
    //  the more you zoom out with a larger value
    vec2 pos = vec2(st * 5.0);

    //  Use the noise function
    float n = Noise2D(pos);

    gl_FragColor = vec4(vec3(n), 1.0);
}