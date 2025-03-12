#version 330 core

/**
    Date: Fri-13-Dec-2024, Keele Days

    DONE! Fri-13-Dec-2024
    Algorithmic Drawing

    Advanced Shaping Functions

    References:
        Polynomial Shaping Functions:
            www.flong.com/archive/texts/code/shapers_poly
        Exponential Shaping Functions:
            www.flong.com/archive/texts/code/shapers_exp
        Cubic & Elliptical Shaping Functions:
            www.flong.com/archive/texts/code/shapers_circ
        Bezier And Other Parametric Shaping Functions:
            www.flong.com/archive/texts/code/shapers_bez

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
    /**
      This is to correct the coordinate mappings of the y value
      When taken from Pygame;
      pygame y is 0 (top), height (bottom)
      gl y is 0 (bottom), height (top)

        u_resolution.y is the height of screen
        The u_mouse.y is according to pygame
        So simply subtracted it from height to get the gl mapping

        E.g. Height = 600
        Pygame, y = 60 (close to screen top)
        GL, y = 600 - 60 (close to screen top), where top is 600
    */
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

    Bezier and Other Paramteric Shaping Functions

    *   Quadratic Bezier
    *   Cubic Bezier
    *   Cubic Bezier (Nearly) Through Two Given Points
*/

/**
    Quadratic Bezier

    This function defines a 2nd order (quadratic) Bezier curve with a single
    user-specified spline control point (at the coordinate a, b) in the unit square.
    This function is guaranteed to have the same entering and exiting slopes as the
    Double-Linear Interpolator.
    Put differently, this curce allows the user to precisely specify its rate of change at its
    endpoints in the unit square.

    Formula:
        t = A / B
            B = 1 - 2*a
            A = sqrt(a^2 + (B)*x - a)

        y = (1 - 2*b) * t^2 + 2 * b * t
*/

float quadratic_bezier(float x, float a, float b)
{
    //  adapted from Bezmath.PS (1993)
    //  by Don Lancaster, SYNERGETICS Inc.
    //  http://www.tinaja.com/text/bezmath.htl
    float epsilon = 0.00001;
    a = max(0, min(1, a));
    b = max(0, min(1, b));

    if (a == 0.5){
        a += epsilon;
    }

    //  solve t from x (an inverse operation)
    float om2a = 1 - 2 * a;
    float t = (sqrt(a*a + om2a*x) - a) / om2a;
    float y = (1 - 2*b) * (t*t) + (2*b)*t;
    return y;
}

void draw_quadratic_bezier()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec2 nm = norm_mouse();

    float y = quadratic_bezier(st.x, nm.x, nm.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}
//  -----------------------------------------------------------------

/**
    Cubic Bezier

    Prevalent in computer graphics, recognizable from Adobe Illustrator and
    other popular vector-based drawing programs.
    This curve is used as a signal-shaping function, which requires the user to
    specify two locations in the unit square (at coordinates a, b and c, d) as its
    control points.
    B setting the two control points (a, b) and (c, d) to various locations, the Bezier
    can be used to produce these:
        *   sigmoids
        *   seat-shaped functions
        *   Ease-ins and Ease-outs. 

    Bezier curves are customarily defined in such a way that y and x are both functions of
    another variable, t.
    So to obtain y as a function of x, one must solve for t using successive approximation, making
    the code longer than one might first expect.

    The implementation here is adapted from the Bezmath Postscript library by Don Lancaster.

    Formula:
        Not Specified
*/

//  Helper Functions

float slopeFromT(float t, float A, float B, float C)
{
    float dtdx = 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
    return dtdx;
}

float xFromT(float t, float A, float B, float C, float D)
{
    float x = A * (t*t*t) + B * (t*t) + C * t + D;
    return x;
}

float yFromT(float t, float E, float F, float G, float H)
{
    float y = E*(t*t*t) + F*(t*t) + G*t + H;
    return y;
}

//  -------------

float cubic_bezier(float x, float a, float b, float c, float d)
{
    float y0a = 0.00;   //  initial y
    float x0a = 0.00;   //  initial x

    float y1a = b;      //  1st influence y
    float x1a = a;      //  1st influence x
    float y2a = d;      //  2nd influence y
    float x2a = c;      //  2nd influence x
    float y3a = 1.00;   //  final y
    float x3a = 1.00;   //  final x

    float A = x3a - 3 * x2a + 3 * x1a - x0a;
    float B = 3 * x2a - 6 * x1a + 3 * x0a;
    float C = 3 * x1a - 3 * x0a;
    float D = x0a;

    float E = y3a - 3 * y2a + 3 * y1a - y0a;
    float F = 3 * y2a - 6 * y1a + 3 * y0a;
    float G = 3 * y1a - 3 * y0a;
    float H = y0a;

    //  Solve for t given x (using Newton-Raphelson), then solve for y given t.
    //  Assume for the first guess that t = x.
    float currentT = x;
    int nRefinementIterations = 5;
    for (int i = 0; i < nRefinementIterations; i++)
    {
        float currentX = xFromT (currentT, A, B, C, D);
        float currentSlope = slopeFromT (currentT, A, B, C);
        currentT -= (currentX - x) * currentSlope;
        //  Wonder what constrain does...
        //  turns out it's clamp
        currentT = clamp(currentT, 0, 1);
    }

    float y = yFromT(currentT, E, F, G, H);
    return y;
}

void draw_cubic_bezier()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    // vec2 nm = norm_mouse();
    vec2 nm_p1 =norm_mouse(u_mouse_click1);
    vec2 nm_p2 =norm_mouse(u_mouse_click2);
    float y = cubic_bezier(st.x, nm_p1.x, nm_p1.y, nm_p2.x, nm_p2.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//------------------------------------------------------------------------------------------------


/**
    Cubic Bezier (Nearly) Through Two Given Points

    This shaping function prompts the user to specify two points in the unit square.
    The algoithm then attempts to generate a curve which passes through these two points
    as closely as possible.
    The curves are not guaranteed to pass through the two points, but come quite close in most
    cases.
    The method is adapted from Don Lancaster
*/

//  Helper Functions

float B0(float t) {return (1-t) * (1-t) * (1-t);}

float B1 (float t) {return 3 * t * (1-t) * (1-t);}

float B2(float t) {return 3 * t * t * (1-t);}

float B3 (float t) {return t * t * t; }

float findx (float t, float x0, float x1, float x2, float x3)
{
    return x0 * B0(t) + x1 * B1(t) + x2 * B2(t) + x3 * B3(t);
}

float findy (float t, float y0, float y1, float y2, float y3)
{
    return y0 * B0(t) + y1 * B1(t) + y2 * B2(t) + y3 * B3(t);
}

//-------------------

float cubic_bezier_nearly_through_two_points(
    float x, float a, float b, float c, float d
){
    float y = 0;
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0 + epsilon;
    float max_param_b = 1.0 - epsilon;
    //  Goal to make sure the values are within 0 -> 1
    a = max(min_param_a, min(max_param_a, a));
    b = max(min_param_b, min(max_param_b, b));

    float x0 = 0;
    float y0 = 0;
    float x4 = a;
    float y4 = b;
    float x5 = c;
    float y5 = d;
    float x3 = 1;
    float y3 = 1;
    float x1, y1, x2, y2;   //  To be solved

    //  arbitrary but reasonable
    //  t-values for interior control points
    float t1 = 0.3;
    float t2 = 0.7;

    float B0t1 = B0(t1);
    float B1t1 = B1(t1);
    float B2t1 = B2(t1);
    float B3t1 = B3(t1);
    float B0t2 = B0(t2);
    float B1t2 = B1(t2);
    float B2t2 = B2(t2);
    float B3t2 = B3(t2);

    float ccx = x4 - x0 * B0t1 - x3 * B3t1;
    float ccy = y4 - y0 * B0t1 - y3 * B3t1;
    float ffx = x5 - x0 * B0t2 - x3 * B3t2;
    float ffy = y5 - y0 * B0t2 - y3 * B3t2;

    x2 = (ccx - (ffx * B1t1) / B1t2) / (B2t1 - (B1t1 * B2t2) / B1t2);
    y2 = (ccy - (ffy * B1t1) / B1t2) / (B2t1 - (B1t1 * B2t2) / B1t2);
    x1 = (ccx - x2 * B2t1) / B1t1;
    y1 = (ccy - y2 * B2t1) / B1t1;

    x1 = max(0 + epsilon, min(1-epsilon, x1));
    x2 = max(0 + epsilon, min(1-epsilon, x2));

    //  Note that this function also requires cubicBezier()!
    y = cubic_bezier(x, x1, y1, x2, y2);
    y = max(0, min(1, y));
    return y;
}

void draw_cubic_bezier_nearly_through_two_points()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 nm_p1 =norm_mouse(u_mouse_click1);
    vec2 nm_p2 =norm_mouse(u_mouse_click2);
    float y = cubic_bezier_nearly_through_two_points(st.x, nm_p1.x, nm_p1.y, nm_p2.x, nm_p2.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}



//-----------------------------------------------------------------------------------------------------

void main()
{
    //  Correct Normalized Mouse Test Worked
    // vec2 nm = norm_mouse();
    // gl_FragColor = vec4(nm.x, nm.x, nm.x, 1.0);

    // draw_quadratic_bezier();
    // draw_cubic_bezier();
    draw_cubic_bezier_nearly_through_two_points();

}