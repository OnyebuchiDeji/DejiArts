#version 330 core

/**
    Date: Fri-13-Dec-2024, Keele Days

    Colors --- Color Mixing

*/

#define PI 3.14159265359
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;


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
    Demonstrates Swizzle with colors, leveraging the vec structs
    and their value-accessing capabilities
*/
void colors_eg1()
{

    vec3 yellow, magenta, cyan;

    //  Making Yellow
    yellow.rg = vec2(1.0);
    // yellow.b or yellow.y 
    yellow[2] = 0.0;

    //  Making magenta: since g is 1.0, this switches it so that
    //  the value of b for magenta is that of the green for yellow
    magenta = yellow.rbg;

    //  Making Cyan
    cyan.rgb = yellow.bgr; 

    // gl_FragColor = vec4(yellow, 1.0);
    // gl_FragColor = vec4(magenta, 1.0);
    gl_FragColor = vec4(cyan, 1.0);
    
}

/**
    Demonstrates mixing colors with mix function
    It allows one to mix to values in percentages -- from 0->1
*/
void colors_eg2()
{
    vec3 colorA = vec3(0.149, 0.531, 0.912);
    vec3 colorB = vec3(0.94, 0.43, 0.51);

    vec3 color = vec3(0.0);
    float pct = abs(sin(u_time));

    //  Mix with pct (a value from 0-->1) to mix the two colors
    //  It mixes them according to the percentage specified by pct.
    //  It uses interpolation between the colors, something like this:

    /**
        color = (1 - pct) * colorA + pct * colorB -- Check it!
    */
    // color = mix(colorA, colorB, pct);
    //  Above is same as:
    // color = (1 - pct) * colorA + pct * colorB;

    gl_FragColor = vec4(color, 1.0);
}
//--------------------------------------------------------------------


/**
    Demonstrates mixing different color channels using various mixing functions
    to modulate how the percentages by which they are mixed (pct) change.

    Here are various shaping functions, specifically Ease-in and Ease-out transition
    functions developed b Robert Penner, which I'm going to take.

    I might also make my own -- yh.

    Ref: Robert Penner's easing functions in GLSL
    https://github.com/stackgl/glsl-easings

    Source also at: https://thebookofshaders.com/edit.php#06/easing.frag
*/

float linear(float t)
{
    // float pt = abs(sin(t));

    return t;
}

/**
    This is a generalization of the binary modulation sin graph.
    when count = 1, the values produced are only between 0 and 1.

    But the higher count is, the more the graph approximates to a sine graph.

    the count represents the no. of bits.
    count = 0 -- two values, 0 and 1 
    count = 2 -- 4 values, 0, 1, 2, 3
    count = 3 -- 8 values...
    and thus.

    Ref: Javidx9
*/
float steps_n(float t, int count)
{
    float pt = abs(sin(t));

    float k = pow(2, count) - 1;

    float y  = round(k * pt) / k;
    return y;
}

/**
    Formula:
        2*A / PI * (arcsin(sin(f * 2 * PI * x)));
    
    Making the return value abs ensures no values below 0 are produced
    it makes the triangular sin wave racket up down, with a slope
    that increases according to a linear form.

    Ref: Javidx9
*/
float triangular(float t, bool isAbs)
{
    if (isAbs)
        return abs(2 / PI * (asin(sin(2 * t * PI))));

    return 2 / PI * (asin(sin(2 * t * PI)));
}

/**
    Saw-tooth wave.
    It works by adding N amount of the multiples of a particular
    frequency of a sin wave.
    This results in a wave y = f(x), such that y= f(0) < 0
    then y rises with a wavy slope until f(PI), y = 0 and rises until f(2*PI) towards which it rapidly
    decreases to 0 to repeat its scycle
    The higher N is, the more linear the wavy slope from the negative toward the
    positive becomes, hence the reason it's called sawtooth

    Formula: 
        ((2 * A) / PI) * (SIGMA[n=1] ( -(sin(n * f * 2 * PI * x)) / n ))
    
    Ref: Javidx9
    
*/
float sawTooth(float t, int N, float freq)
{
    float A = 1.0;  //  amplitude
    float k1 = 2 * A / PI;
    float y = 0;
    for (int n = 1; n < N; n++)
    {
        y += -(sin(n * freq * 2 * PI * t)) / n;
    }
    return y * k1;
}

/**
    Saw-tooth hack using the mod function to use computer-rounding
    integer mathematics to simulate the addition of the sine waves to
    make the wavy slope of the saw-tooth straight.
    This is more efficient than the prior, as this bypasses adding up the results
    of various sine waves.
    It gives a perfect piecewise linear approximation.

    Formula:
        y = ((2 * A) / PI) * (f * PI * mod(x, 1.0 / f) - PI/2);
*/
float sawToothMod(float t, float freq)
{
    float A = 1.0;
    float k1 = 2*A / PI;
    float y = k1 * (freq * PI * mod(t, 1.0/freq) - PI/2);
    return y;
}

/**
    Like prior sawToothMod but without '-PI/2'
*/
float sawToothMod2(float t, float freq)
{
    float A = 1.0;
    float k1 = 2*A / PI;
    float y = k1 * (freq * PI * mod(t, 1.0/freq));
    return y;
}

float exponentialIn(float t)
{
    return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

float exponentialOut(float t)
{
    return t == 0.0 || t == 1.0 ? 
                       t : (t < 0.5) ? +0.5 * pow(2.0 ,(20.0 * t) - 10.0)
                                     : -0.5 * pow(2.0, 10.0 - (20.0 * t))
                                     + 1.0;
}

float sineIn(float t){
    return sin((t-1.0) * HALF_PI) + 1.0;
}

float sineOut(float t)
{
    return sin(t * HALF_PI);
}

float sineInOut(float t)
{
    //  The -1 is to phase-shift the cosine by 90 to make it a sine wave
    return -0.5 * (cos(PI * t) - 1.0);
}

float qinticIn(float t)
{
    return pow(t, 5.0);
}

float qinticOut(float t)
{
    return 1.0 - pow(t, 5.0);
}

float qinticInOut(float t)
{
    return t < 0.5 ?
        +16.0 * pow(t, 5.0) :
        -0.5 * pow(2.0  * t - 2.0, 5.0) + 1.0;
}

float quarticIn(float t)
{
    return pow(t, 4.0);
}
float quarticOut(float t)
{
    return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
}

float quarticInOut(float t)
{
    return t < 0.5 ?
             +8.0 * pow(t, 4.0) :
             -8.0 * pow(t - 1.0, 4.0) + 1.0;
}

float quadraticInOut(float t)
{
    float p = 2.0 * t * t;
    return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

float quadraticIn(float t)
{
    return t * t;
}

float quadraticOut(float t)
{
    return -t * (t - 2.0);
}

float cubicIn(float t)
{
    return t * t * t;
}

float cubicOut(float t)
{
    float f = t - 1.0;
    return f * f * f + 1.0;
}

float cubicInOut(float t)
{
    return t < 0.5 ?
           4.0 * t * t * t :
           0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

float elasticIn(float t)
{
    return sin(13.0 * t * HALF_PI) * pow(2.0, 10.0 * (t - 1.0));
}

float elasticOut(float t)
{
    return sin(-13.0 * (t + 1.0) * HALF_PI)
            * pow(2.0, -10.0 * t) + 1.0;
}

float elasticInOut(float t)
{
    return t < 0.5 ?
           0.5 * sin(+13.0 * HALF_PI * 2.0 * t) *
                pow(2.0, 10.0 * (2.0 * t - 1.0)) :
           0.5 * sin(-13.0 * HALF_PI * ((2.0 * t - 1.0) + 1.0)) *
                pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
}

float circularIn(float t)
{
    return 1.0 - sqrt(1.0 - t * t);
}

float circularOut(float t)
{
    return sqrt((2.0 - t) * t);
}

float circularInOut(float t)
{
    return t < 0.5 ?
           0.5 * (1.0 - sqrt(1.0 - 4.0 * t * t)) :
           0.5 * (sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);
}


float bounceOut(float t)
{
    const float a = 4.0 / 11.0;
    const float b = 8.0 / 11.0;
    const float c = 9.0 / 10.0;

    const float ca = 4356.0 / 361.0;
    const float cb = 35442.0 / 1805.0;
    const float cc = 16061.0 / 1805.0;

    float t2 = t * t;

    return t < a ?
            7.5625 * t2 :
           t < b ?
            9.075 * t2 - 9.9 * t + 3.4 :
           t < c ?
            ca * t2 - cb * t + cc :
            10.8 * t * t - 20.52 * t + 10.72;
}

float bounceIn(float t)
{
    return 1.0 - bounceOut(1.0 - t);
}

float bounceInOut(float t)
{
    return t < 0.5 ?
           0.5 * (1.0 - bounceOut(1.0 - t * 2.0)) :
           0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
}

float backIn(float t)
{
    return pow(t, 3.0) - t * sin(t * PI);
}

float backOut(float t)
{
    float f = 1.0 - t;
    return 1.0 - (pow(f, 3.0) - f * sin(f * PI));
}

float backInOut(float t)
{
    float f = t < 0.5 ?
              2.0 * t :
              1.0 - (2.0 * t - 1.0);
    float g = pow(f, 3.0) - f * sin(f * PI);

    return t < 0.5 ? 0.5 * g : 0.5 * (1.0 - g) + 0.5;
}



void colors_eg3()
{
    vec3 colorA = vec3(0.149, 0.131, 0.912);
    vec3 colorB = vec3(0.94, 0.131, 0.149);

    vec3 color = vec3(0.0);

    float t = u_time * 0.5;
    // float pct = steps_n(t, 1);  //  arg2 is a value to increase approx to sine graph
    // float pct = triangular(t, false);      //  A triangular function -- like a sine but straight linear slopes
    // float pct = sawTooth(t, 32, 0.44);
    // float pct = sawToothMod(t, 0.44);
    // float pct = sawToothMod2(t, 0.44);

    //  Have to do this to transform the t value so they
    //  are within the range that the functions can work with
    //  to produce values between 0 and 1
    t = abs(fract(t) * 2.0 - 1.0);
    // float pct = linear(t);
    // float pct = exponentialIn(t);
    // float pct = exponentialOut(t);
    // float pct = exponentialInOut(t);
    // float pct = sineIn(t);
    // float pct = sineOut(t);
    // float pct = sineInOut(t);
    // float pct = qinticIn(t);
    // float pct = qinticOut(t);
    // float pct = qinticInOut(t);
    // float pct = quarticIn(t);
    // float pct = quarticOut(t);
    // float pct = quarticInOut(t);
    // float pct = quadraticIn(t);
    // float pct = quadraticOut(t);
    // float pct = quadraticInOut(t);
    // float pct = cubicIn(t);
    // float pct = cubicOut(t);
    // float pct = cubicInOut(t);
    // float pct = elasticIn(t);
    // float pct = elasticOut(t);
    float pct = elasticInOut(t);
    // float pct = circularIn(t);
    // float pct = circularOut(t);
    // float pct = circularInOut(t);
    // float pct = bounceIn(t);
    // float pct = bounceOut(t);
    // float pct = bounceInOut(t);
    // float pct = backIn(t);
    // float pct = backOut(t);
    // float pct = backInOut(t);

    color = mix(colorA, colorB, pct);

    //  Use color mix to visualize
    // gl_FragColor = vec4(color, 1.0);

    //  Use black and white to visualize
    //  Used for linear, triangular, sawTooth, sawToothMod, sawToothMod2
    gl_FragColor = vec4(pct, pct, pct, 1.0);

}

//--------------------------------------------------------------------------

void main()
{
    // colors_eg1();
    // colors_eg2();
    colors_eg3();
}