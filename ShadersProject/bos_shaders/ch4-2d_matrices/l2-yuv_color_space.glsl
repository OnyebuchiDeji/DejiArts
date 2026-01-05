#version 330 core

/**

    2D Matrices

    Learn how to move shapes using pre-defined matrices

    Date: Mon-23-Dec-2024

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

vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);

    return nm;
}


//  ---------------------------------------------------------------

/**
    Date: Mon-23-Dec-2024
    This is another use for matrices: YUV Color

    It is a color space utilized for analog encoding of photos and videos that consider
    the range of human perception to reduce the bandwidth of chrominance components.

    Below uses matrix operations in GLSL to transform colors from one mode to another
*/

//  YUV to RGB matrix
mat3 yuv2rgb = mat3( 1.0, 0.0, 1.13983,
                     1.0, -0.39465, -0.58060,
                     1.0, 2.03211, 0.0);

//  RGB to YUV matrix
mat3 rgb2yuv = mat3( 0.2126, 0.7152, 0.0722,
                    -0.09991, -0.33609, 0.43600,
                     0.615, -0.5586, -0.05639);

void draw()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  UV values goes from -1 to 1
    //  so we neeed to remap st (0.0 to 1.0)
    st -= 0.5;  //  becomes -0.5 to 0.5
    st *= 2.0;  //  becomes -1.0 to 1.0

    //  Pass st as the y & z values of a three-dimensional vector to be properly...
    //  multiplied by the 3x3 matrix...
    color = yuv2rgb * vec3(0.5, st.x, st.y);
    gl_FragColor = vec4(color, 1.0);
}



//------------------------------------------------


void main()
{
    draw();
}