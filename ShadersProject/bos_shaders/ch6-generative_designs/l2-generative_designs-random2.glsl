#version 330 core

/**
    Date: Fri-27-Dec-2024

    Chapter 6: Generative Designs; The use of Random

    Next Chapter: Noise
    This is better than ordinary use of random, adding correlation and thus natural aesthetics
    to the random values generated, as Noise stores memory of the previous state.

    Hence noise is a smooth and natural-looking way of creating computational chaos.
*/


// #define PI 3.14159265358979323846
#define PI 3.1415926535
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
    EG2: Applying Matrices on Patterns
        Author @patriciogv - 2015 (patriciogonzalezvivo.com) - 2015
    
    Shows how to transform the shapes rendered in each cell of the grid
    to make a unique pattern
*/

//---------------TRANSFORM FUNCTIONS-----------------/

vec2 rotate2D(vec2 _st, float _angle)
{
    _st -= 0.5;
    _st = mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 translate2D(vec2 _st, vec2 translate_v)
{
    _st += translate_v;
    return _st;
}

vec2 scale2D(vec2 _st, vec2 _scale)
{
    mat2 scale_mat = mat2(_scale.x, 0.0, 0.0, _scale.y);
    _st = scale_mat * _st;
    return _st;
}

//---------------------------------------------------

//----------------RANDOM FUNCTIONS--------------------/

float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

//---------------------------------------------------/

/**
    Date: Friday 27 December 2024
    Date Finished: Thurs-23-Jan-2025

    Master Random Exercises

    Consider Ryoji Ikeda's work. He's a Japanese electronic composer and
    visual artist.
    He has mastered the use of random.

    Thus, mesmerized by him (Ryoji), the author gave me (Ebenzer) some exercises:

    1.  Make rows od moving cells (in opposite directions) with random values.
    Only display the cells with brighter values. Make the velocity of the rows
    fluctuate over time.

    2.  Make several rows but each one with a different speed and direction. Hook the position of the
    mouse to the threshold of which cells to show
*/

/**
    The moving bar codes
*/
void exercise1_v1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= vec2(50, 2);

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    vec3 color = vec3(random(ipos));
    // vec3 color = vec3(random(fpos));

    gl_FragColor = vec4(color, 1.0);

}
void exercise1_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= vec2(50, 2);

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    ipos.x = (st - vec2(5.0)).x * (abs(sin(u_time*2.5)) * 5.0);
    // ipos.x += step(1.0, mod(st.y, 2.0)) * 0.2 * sin(u_time * PI * 50);
    // ipos.x += (1 - step(1.0, mod(st.y, 2.0))) * 0.2 * cos(u_time * PI * 50);

    vec3 color = vec3(random(ipos));
    // vec3 color = vec3(step(0.5, random(ipos)));
    // vec3 color = vec3(random(fpos));

    gl_FragColor = vec4(color, 1.0);

}

void exercise1_v3()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= vec2(50, 2);

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    // ipos.x = (st - vec2(5.0)).x * (abs(sin(u_time*2.5)) * 5.0);
    // ipos.x += step(1.0, mod(st.y, 2.0)) * 0.2 * sin(u_time);
    // ipos.x += (1 - step(1.0, mod(st.y, 2.0))) * 0.2 * cos(u_time * PI * 50);

    vec3 color = vec3(random(ipos));
    // vec3 color = vec3(step(0.5, random(ipos)));
    // vec3 color = vec3(random(fpos));

    gl_FragColor = vec4(color, 1.0);

}

void exercise1_v4()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    //  Here, I break the render area into a grid.
    int cols = 50;
    st *= vec2(cols, 2);

    //  ipos is the whole number index value representing a region
    vec2 ipos = floor(st);
    //  fpos is the fractional value of each pixel in each grid are
    vec2 fpos = fract(st);

    /**
    *   Elab:
    *   Goal is that the two rows' bars move in opposite directions.       
    *   So, check if the row is even, and move left hence, or if it's odd and move right hence
    *   Now, it uses u_time and floors it because the ipos values are whole numbers and act as value indices.
    *   Lastly, the modulo is used to ensure the value returned by u_time is converted to between 0 and 8, 8 excluded
    *   But this turned out to not be the best as it stopped the smooth flow
    *           // ipos.x -= float(int(floor(u_time * 0.5)) % cols);
    *           //ipos.x += float(int(floor(u_time * 0.5)) % cols);
    *   Multiplying by 0.5 slows it down
    */
    int iposYAsInt = int(ipos.y);
    if (iposYAsInt % 2 != 0){
        // ipos.x -= floor(u_time * 0.5);
        // ipos.x -= floor((sin(u_time) + cos(u_time)));
        // ipos.x -= floor(abs(sin(u_time) + cos(u_time)) );
        // ipos.x -= floor(2 + sin(u_time) + 1.0);
        // ipos.x -= floor(cols * sin(u_time) + u_time);   //  Huge Back and Forth Fluctuation
        // ipos.x -= floor(1.0 + sin(u_time) + u_time);
        ipos.x -= floor(1.0 + pow(sin(u_time), 2) + u_time);
    }
    else if (iposYAsInt % 2 == 0){
        // ipos.x += floor(u_time * 0.5);
        // ipos.x += floor((sin(u_time) + cos(u_time)));
        // ipos.x += floor(abs(sin(u_time) + cos(u_time)));
        // ipos.x += floor(2 + sin(u_time) + 1.0);
        // ipos.x += floor(cols * sin(u_time) + u_time);   //  Huge Back and Forth Fluctuation
        // ipos.x += floor(1.0 + sin(u_time) + u_time);
        ipos.x += floor(1.0 + pow(sin(u_time), 2) + u_time);
    }
    //ipos.x += sin(u_time) + cos(u_time);
    // ipos.x = (st - vec2(5.0)).x * (abs(sin(u_time*2.5)) * 5.0);
    // ipos.x += step(1.0, mod(st.y, 2.0)) * 0.2 * sin(u_time);
    // ipos.x += (1 - step(1.0, mod(st.y, 2.0))) * 0.2 * cos(u_time * PI * 50);

    vec3 color = vec3(random(ipos));
    // vec3 color = vec3(step(0.5, random(ipos)));
    //vec3 color = vec3(random(fpos));
    //vec3 color = vec3(fpos, 0.0);

    gl_FragColor = vec4(color, 1.0);

}

/**
    One can manipulate which cells should show based on their brightness
*/
void exercise1_v5A()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    int cols = 1000;
    int rows = 1000;
    st *= vec2(cols, rows);

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    int iposYAsInt = int(ipos.y);
    if (iposYAsInt % 2 != 0){
        ipos.x -= floor(u_time * 1.5);
    }
    else if (iposYAsInt % 2 == 0){
        ipos.x += floor(u_time * 1.5);
    }
    //ipos.x += sin(u_time) + cos(u_time);
    // ipos.x = (st - vec2(5.0)).x * (abs(sin(u_time*2.5)) * 5.0);
    // ipos.x += step(1.0, mod(st.y, 2.0)) * 0.2 * sin(u_time);
    // ipos.x += (1 - step(1.0, mod(st.y, 2.0))) * 0.2 * cos(u_time * PI * 50);
    float threshold = norm_mouse().y;
    float colVal = clamp(random(ipos), 0, 1);
    vec3 color = vec3(0.0);
    if (colVal > threshold){
        color = vec3(colVal);
    }
    // vec3 color = vec3(step(0.5, random(ipos)));
    //vec3 color = vec3(random(fpos));
    //vec3 color = vec3(fpos, 0.0);

    gl_FragColor = vec4(color, 1.0);

}

void exercise1_v5B()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    int cols = 100;
    int rows = 200;
    st *= vec2(cols, rows);

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    int iposYAsInt = int(ipos.y);
    if (iposYAsInt % 2 != 0){
        ipos.x -= floor(u_time * 1.5);
    }
    else if (iposYAsInt % 2 == 0){
        ipos.x += floor(u_time * 1.5);
    }
    //ipos.x += sin(u_time) + cos(u_time);
    // ipos.x = (st - vec2(5.0)).x * (abs(sin(u_time*2.5)) * 5.0);
    // ipos.x += step(1.0, mod(st.y, 2.0)) * 0.2 * sin(u_time);
    // ipos.x += (1 - step(1.0, mod(st.y, 2.0))) * 0.2 * cos(u_time * PI * 50);
    float threshold = norm_mouse().y;
    float colVal = clamp(random(ipos), 0, 1);
    vec3 color = vec3(0.0);
    if (colVal > threshold){
        color = vec3(colVal);
    }
    // vec3 color = vec3(step(0.5, random(ipos)));
    //vec3 color = vec3(random(fpos));
    //vec3 color = vec3(fpos, 0.0);

    gl_FragColor = vec4(color, 1.0);

}

void main()
{
    //exercise1_v1();
    //exercise1_v2();
    // exercise1_v3();
    // exercise1_v4();
    // exercise1_v5A();
    exercise1_v5B();
}