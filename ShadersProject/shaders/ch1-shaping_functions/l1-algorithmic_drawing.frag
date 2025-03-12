#version 330 core

/**
    Algorithmic Drawing

    Shaping Functions

    Part 1:
        Visualize the normalized value of the x coordinate (st.x)
        using two ways:
            *   Brightness gradient from left to right
            *   A Line where x maps directly to y
*/


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

/**
    Consider this line function.
    Most shapes drawn with shaders use this function `smoothstep`

    Smoothstep is an interpolation from arg1 to arg2 (the edges) increasing with value arg3

    arg1: If increased, increases width of line
    arg2: If increased, inverts the colors such that the line
        shows the gradient, while the surrounding is made yellow -- like turning the line inside-out

        When 0.0, it's normal
        But when > 0.0, the more it is increased, the greater the width of the color-inverted line.
    
    arg3:
        By passing st.y-st.x, it uses the difference to replicate the function y = x.

        since y - x = v, where v is the float value outputed.

        So:
            at the bottom left of the screen, y - x = v = 0
            at every point where y = x, v = 0
            It is these points that are then colored yellow, unless arg2, the right-bound is increased.

    According to tests:
    1.
        return smoothstep(0.0, 0.0, abs(st.y - st.x)); = pct
        This returns 1.0 for every pixel, rather than 0.0
        which results in the whole screen colored yellow, since
            in color = (1.0 - pct) * color + pct * vec3(1.0, 1.0, 0.15);
            color = k1 + k2;
            k1 = (1.0 - 1.0) * color == always 0.0
            because pct is returned always as 1.0
            while k2 = 1.0 * yellow color
            so k1 + k2 adds vec3(0, 0, 0) to vec3(1.0, 1.0, 0.15) [yellow]
    2.  return smoothstep(0.02, 0.0, abs(st.y-st.x));
        Because the lower bound > upper bound, result is different; the results are inverted...
        any value v <= 0 will output 1.0 because v is less than or equal to the smaller edge.
        Whereas value v >= 0.02 will give 0.0 because v is greater than or equal to the larger edge.

        Whereas, normally, if v < lower bound, it returns  0.0 and if > upper bound, it returns 1.0.

        Consider this:
            y = x is the function...
            v = abs(y - x).

        Now, for those along the path, v = 0, hence output pct = 1.0
        Hence along the line path, pct or v = 1.0 instead of 0.0 because of the inversion.
        Hence along the line, in color = (1.0 - pct) * color + pct * vec3(1.0, 1.0, 0.15);
            color = k1 + k2;
            pixels along the line path where y = x result in v being closer to 1.0
            so in places closer to the line path...
            k1 = (1.0 - 1.0) * color = dark color.
            k2 = 1.0 * vec3(1.0, 1.0, 0.15)[yellow]
            hence, k1 + k2 => yellow color
        whereas, for places further from the line path, consider these:
            for pixels where y > x, abs(y - x) = v, where v > 0.0
            also, where y < x, abs(y - x) = v, where still v > 0.0...
            The output returned is hence 0.0 according to the rules.

            So...
            k1 = (1.0 - 0.0) * color
            k2 = 0.0 * vec3(yellow) = 0.0
            k1 + k2 => original color

    
*/
float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}


void main_v1()
{
    //  Normalized to move from 0->1 t=in both x and y axis
    
    vec2 st = gl_FragCoord.xy / u_resolution;
    
    //  This indicates the direction of the gradient.
    //  Now, it changes from left to right (dark -> light)
    //  But if it's specified as y = st.y, it will change from up to down (dark -> light)
    float y = st.x;
    vec3 color = vec3(y);

    //  Plot a Line
    float pct = plot(st);
    //  The below is a form of interpolation
    color = (1.0 - pct) * color + pct * vec3(1.0, 1.0, 0.15);
    // color += 0.02 * vec3(1.0, 1.0, 0.15);
    // gl_FragColor = vec4(pct, pct, pct, 1.0);
    gl_FragColor = vec4(color, 1.0);
}

float plot_exp(vec2 st, float pct)
{
    return smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.02, st.y);
}

void main_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    //  Makes the light-dark gradient match how the x coordinates
    //  change in an exponential function of type X^5
    // float y = pow(st.x, 5);
    // float y = pow(st.x, 0.5);    //  Inverts the curve like sqrt(st.x)
    // float y = pow(st.x, 22.0);
    // float y = pow(st.x, 1.0);   //  Draws a normal line
    // float y = pow(st.x,0.0);        //  Nice

    // float y = sqrt(st.x);
    float y = exp(st.x * 0.5);   // Just white

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

/**
    The step() interpolation receives two parameters
    p1: lower limit threshold
    p2: value to check or pass
    Hence any value under the lower limit returns 0.0
    Any above it will retun 1.0.
    It is a rigid interpolation function that returns either 0 or 1
*/
void main_v3_step()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    float y = step(0.5, st.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

/**
    smoothstep interpolate the value between the defined ranges specified
    by arg1 (beginning) and arg2 (end), and the value to interpolate is arg3.
*/

void main_v4_smoothstep()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    // float y = smoothstep(0.1, 0.9, st.x);
    float y = smoothstep(0.02, 0, st.x);

    // Below draws a parabola
    // float y = smoothstep(0.2, 0.5, st.x) - smoothstep(0.5, 0.8, st.x);

    // float y = smoothstep(0.0, 1.0, st.x(abs(sin(u_time))));  //  different because of abs

    // float y = smoothstep(0.2, 1.0, abs(sin(u_time)));        //  different because of abs

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

void main_v5_sine()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    // float y = sin(u_time + st.x);    //  Normal
    // float y = sin(u_time + PI * st.x);   //  Shrink Frequency
    // float y = sin(u_time * st.x);    //  Shrinking Phase Frequency
    // float y = sin(u_time * st.x) + 1.0;    //  Displaced Upward
    // float y = sin(u_time * st.x)  * 2;    //  Double Amplitude
    // float y = abs(sin(u_time * st.x));      //  Trace of bounding ball
    // float y = fract(sin(u_time * st.x));      //  Get the fractional part only.
    // float y = ceil(sin(u_time * st.x)) + floor(sin(u_time * st.x));      //  Get Digital Binary wave

    float y = fract(sin(u_time * st.x)) * ceil(sin(u_time * st.x)) + floor(sin(u_time * st.x));      //  Shanannigans

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    main_v1();
    // main_v2();
    // main_v3_step();
    // main_v4_smoothstep();
    // main_v5_sine();

    
}