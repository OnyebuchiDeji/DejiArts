#version 330 core

/**
    Date: Fri-13-Dex-2024, Keele Days

    Algorithmic Drawing

    Advanced Shaping Functions

    Various Functions By Iñigo Quiles

    Reference:
        iquilezles.org/articles/Functions

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

    Various Functions and Identities, by Iñigo Quiles
*/

/**
    Almost Identity V1:

    Use this to modify a signal when it's value is zero or approaching zero but you don't want it to hit zero
    but for it to be replaced with a small positive constant.
    Instead of clamping the value, which introduces a discontinuity, smoothly blend the signal 
    into the desired clipped value.
    Let m = threshold (anything above m stays unchanged)
    Let n = the value *things* will take when the signal is zero.
    The below function does the soft clipping (in a cubic fashion)
*/

float almostIdentityV1(float x, float m, float n)
{
    if (x>m) return x;
    float a = 2.0 * n - m;
    float b = 2.0 * m - 3.0 * n;
    float t = x / m;
    return (a*t + b) * t * t + n;
}

void draw_almost_v1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec2 nm = norm_mouse();

    float y = almostIdentityV1(st.x, nm.x, nm.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

// ------------------------------------------------------------------

/**
    Almost Identity V2 / Almost abs()

    An alternative to achieve a near identity which uses the square root of a **biased square**.
    Seen first in a shader by user "omeometo" in Shadertoy.

    It's somewhat slower than the cubic method above, depending on the hardwarem but it
    is useful for "smooth mirroring" shapes, because it behaves almost like the absolute
    value of x.
    While it has zero derivative, it has a non-zero second derivative, so be careful
    lest it cause problems in your app.
*/
float almostIdentityV2(float x, float n)
{
    return sqrt(x*x + n*n);
}

void draw_almost_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec2 nm = norm_mouse();

    float y = almostIdentityV2(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  -------------------------------------------------------------------------

/**
    Smoothstep Integral

    Useful for a velocity signal, for example, to smoothly accelerate a stationary object
    into constant velocity motion.
    This involves integrating 'smoothstep()' over time to get the actual position of value
    of the animation.
    The below function shows this: the position of an object that accelerates with smoothstep.
    NOTE! ITs derivative is never > 1, so no decelerations occur.
*/

float intergralSmoothstep(float x, float T)
{
    if (x>T) return x - T/2.0;
    return x * x * x * (1.0 - x * 0.5/T) / T / T;
}

void draw_integral_smoothstep()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec2 nm = norm_mouse();

    float y = intergralSmoothstep(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  ---------------------------------------------------------------------------

/**
    Impulses

    Exponential Implse

    They are great for triggering behaviours or making envelopes for music or animation ---
    it's useful for everything that grows fast and then decays slowly.

    The following is an example of exponential impulse function.
    Use k to control the stretching of the function.

    Its maximum, which is 1, happens at exactly x = 1 / k
*/
float expImpulse(float x, float k)
{
    float h = k * x;
    return h * exp(1.0-h);
}

void draw_exp_impulse()
{
    vec2 st = gl_FragCoord.xy / u_resolution * 4;

    vec2 nm = norm_mouse() * 4;

    float y = expImpulse(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  -----------------------------------------------------------------------

/**
    Impulses

    Polynomial Impulse

    This impulse function doesn't use exponentials like the prior.
    It's designed with polynomials.

    Use k to control the falloff of the function.
    E.g. A quadratic can be used, which peaks at x = sqrt(1/k).
*/
float quaImpulse(float k, float x)
{
    return 2.0 * sqrt(k) * x / (1.0 + k*x*x);
}

void draw_qua_impulse()
{
    vec2 st = gl_FragCoord.xy / u_resolution * 4;

    vec2 nm = norm_mouse() * 4;

    float y = quaImpulse(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

/**
    One can even generalize it to other powers to get very different
    falloff shapes, where n is the degree of the polynomial.

    These generalized impulses peak at x = [k(n-1)]^(-1/n)
*/
float polyImpulse(float k, float n, float x)
{
    return (n / (n - 1.0)) * pow((n - 1.0) * k, 1.0 / n) * x / (1.0 + k * pow(x, n)); 
}

void draw_poly_impulse()
{
    vec2 st = gl_FragCoord.xy / u_resolution * 4;

    vec2 nm = norm_mouse() * 4;
    //  y increases the exponent
    //  x affects the falloff limit
    float y = polyImpulse(st.x, nm.y, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  ----------------------------------------------------------------------

/**
    Impulses

    Sustained Impulse

    Similar to polynomial impulses, but htis one allows control on the width of attack
    through the parameter, 'k' and the release (parameter 'f') independently.
    Also, the impulse releases at y = 1 instead of y = 0

    width of attack is the x width of its rising
    release is how high it rises before its peak.
*/

float expSustainedImpulse(float x, float f, float k)
{
    float s = max(x-f, 0.0);
    return min( x*x / (f*f), 1.0 + (2.0/f) * s * exp(-k * s));
}

void draw_exp_sustained_impulse()
{
    vec2 st = gl_FragCoord.xy / u_resolution * 4;

    vec2 nm = norm_mouse() * 4;
    float y = expSustainedImpulse(st.x, nm.x, nm.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}
//  ----------------------------------------------------------------------

/**
    Sinc Impulse

    A phase shifted *sin curve* can be useful if it starts at zero and ends at zero like
    for some bouncing behaviours (suggested by Hubert-Jan).
    give k different integer values to tweak the amount of bounces.
    The function's max value is 1.0, but it can take negative values, which make
    it unusable in some applications.
*/
float sinc(float x, float k)
{
    float a = PI * (k * x - 1.0);
    return sin(a) / a;
}
void draw_sinc_impulse()
{
    vec2 st = gl_FragCoord.xy / u_resolution * 4;

    vec2 nm = norm_mouse() * 4;

    float y = 0.5 + sinc(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  ----------------------------------------------------------------------

/**
    Falloff

    A quadratic falloff are like those in physically-based point lights, but these reach
    zero at a given distance 'm', rather than just asymptotically reaching it at infinity.
    It's great for range-controlled shadows, etc.

    Basically, from a max value, it falls down slowly to zero.
*/

float truncFalloff(float x, float m)
{
    x /= m;
    return (x - 2.0) * x + 1.0;
}

void draw_trunc_quad_falloff()
{
    float zoom = 1.0;
    float offset = 0.1;
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x -= offset;
    st *= zoom;

    vec2 nm = norm_mouse();
    st.x -= offset;
    nm *= zoom;

    float y = offset + truncFalloff(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  ----------------------------------------------------------------------

/**
    Unitary Remappings

    These functions remap the [0, 1] interval into the [0, 1] interval.
    They can be used to do these:
        *   adjust image contrasts
        *   shape terrain slopes
        *   modulate movements
        *   sculpt forms, etc.
    An example of such a function is the smoothstep()
*/

/**
    Almost Unit Identity

    This is a near-identity function that maps the unit interval into itself.
    It, just like smoothstep(), maps 0 to 0, 1 to 1, *and* has a 0 derivative
    at the origin (just like smoothstep).

    However, it does not have a 0 derivative at 1; it has a derivative of 1 at point y = 1...
    where y is it's output.
    It's equivalent to the Almost Identity defined above, with n = 0 and m = 1.
    Since it's cubic, just like smoothstep, it is very fast to evaluate:
*/
float almostUnitIdentity(float x)
{
    return x * x * (2.0 - x);
}

void draw_almost_unit_identity_mapping()
{
    //  Change to 4.0 to see full curve.
    //  But remember focus is between 0 and 1
    float zoom = 1.0;
    vec2 st = gl_FragCoord.xy / u_resolution * zoom;

    vec2 nm = norm_mouse() * zoom;

    float y = almostUnitIdentity(st.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  ----------------------------------------------------------------------

/**
    Gain

    The gain function can remap the unit interval into the unit interval by expanding the sides
    and compressing the center, and keeps 1/2 mapped to 1/2.
    This was common in RSL tutorials (the Renderman Shading Language).
    k = 1 is the identity curve.
    k < 1 produces the classic gain() shape.
    k > 1 produces "s" shaped curves.
    The curves are symmetric (and inverse) for k = a and k = 1/a respectively.
*/
float gainMapping(float x, float k)
{
    float a = 0.5 * pow(2.0 * ((x<0.5) ? x : 1.0 - x), k);
    return (x < 0.5) ? a : 1.0 - a;
}


void draw_gain_mapping()
{
    vec2 st = gl_FragCoord.xy / u_resolution * 1;

    vec2 nm = norm_mouse() * 1;

    float y = gainMapping(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}
//  ----------------------------------------------------------------------


/**
    Parabola

    It's useful in remapping [0...1] interval to [0...1] interval, such that the corners
    are mapped to 0 and the center to 1.
    Raise the parabol's power, k, to control its shape.
*/
float parabolaMapping(float x, float k)
{
    return pow(4.0 * x * (1.0 - x), k);
}

void draw_parabola_mapping()
{
    float zoom = 2.0;   //  Change to 4.0 to go through more values of k
    vec2 st = gl_FragCoord.xy / u_resolution * zoom;

    vec2 nm = norm_mouse() * zoom;

    float y = parabolaMapping(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}
//  ----------------------------------------------------------------------

/**
    Power Curve

    This is a generalization of the Parabola() above.
    It also maps the [0...1] interval into [0...1] by keeping the corners mapped
    to 0.
    in contrast, this generalization lets you control the shape on either side of the curve.
    This comes in handy when creating leaves, eyes, and many other cool shapes.

    NOTE! k is chosen such that pcurve() reaches exactly 1 at its maximum for
    illustration purposes; but in many applications, the curve needs to be scaled anyways so
    the slow computation of k can be simply avoided.
*/

float pcurve(float x, float a, float b)
{
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}

void draw_power_curve_mapping()
{
    float zoom = 2.0;
    vec2 st = gl_FragCoord.xy / u_resolution * zoom;

    vec2 nm = norm_mouse() * zoom;

    float y = pcurve(st.x, nm.x, nm.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}
//  ----------------------------------------------------------------------

/**
    Tonemap

    It maps the 0 to 0 and 1 to 1, while rising the middle tones upwards, similar to
    a power function with exponent smaller than 1.
    However, the numerator is not k + 1 but something else (usually larger).
    This function is often used as a color tonemapping transfer function (similar
    to the Reinhard tonemapper), hence the name.
    Usually, k > 0, but one can make it between 0 and -1 to bend the curves inwards like a positive
    power curve. 
*/
float tone(float x, float k)
{
    //  OG was (k + 1.0) / (1.0 + k * x);
    //  But below seems to fit the graph examples
    return 1- (k + 1.0) / (1.0 + k * x);
}

void draw_tone_mapping()
{
    float zoom = 1.0;
    //  Multiplied by -1 to bend curve inwards -- works with the correction
    //  in the function.
    // vec2 st = gl_FragCoord.xy / u_resolution * -zoom;
    vec2 st = gl_FragCoord.xy / u_resolution * zoom;

    vec2 nm = norm_mouse() * zoom;

    float y = tone(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

//  ----------------------------------------------------------------------


/**
    Pulses, Bumps, and Steps
*/

/**
    Cubic Pulse

    Remember we've done this:
        smoothstep(c-2, c, x) - smoothstep(c, c + 2, x)
    to select a region centered at c that goes from c - w to c + w.
    This inspired the cubic pulse.
    One can also use it as a replacement for a gaussian with local support
*/
float cubicPulse(float c, float w, float x)
{
    x = abs(x - c);
    if ( x > w) return 0.0;
    x /= w;
    return 1.0 - x * x * (2.0 - 2.0 * x);
}

void draw_cubic_pulse()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec2 nm = norm_mouse();

    //  X controls the center of the graph.
    //  Y controls the width.
    float y = cubicPulse(nm.x, nm.y, st.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}


/**
    Rational Bump

    This can also be a replacement for a gaussian sometimes, if you can do
    with infinite support, that is, this function never reaches exactly zero
    no matter how far you go in the real axis:

    k controls the width.
*/
float rationalBump(float x, float k)
{
    return 1.0 / (1.0 + k * x * x);
}

void draw_rational_bump()
{
    float zoom = 4.0;
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x -= 0.5;
    st *= zoom;

    vec2 nm = norm_mouse();
    nm.x -= 0.5;
    nm *= zoom;

    float y = 0.5 +  rationalBump(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Exponential Steps

    A natural attenuation is an exponential of a linearly decaying quantity:
        e.g, exp(-x).
    A gaussian is an exponential of a quadratically decaying quantity
        e.g, exp(-x^2) 
    I can generalize and keep increasing the powers, and get sharper and sharper s-shaped curves.
    For really high values of n, I can approximate a perfect step().

    in this example, a coefficient is added in front of the x^n term so that the curve passes
    through (1/2, 1/2).
    the coefficient is the '-exp2(n)'
*/
float expStep(float x, float n)
{
    return exp2( -exp2(n) * pow(x, n));
}

void draw_exp_step()
{
    float zoom = 2.0;
    vec2 st = gl_FragCoord.xy / u_resolution * zoom;

    vec2 nm = norm_mouse() * (zoom + 3.0);

    float y = expStep(st.x, nm.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(0.3, 1.0, 0.78);

    gl_FragColor = vec4(color, 1.0);
}
//  ----------------------------------------------------------------------


void main()
{
    // draw_almost_v1();
    // draw_almost_v2();
    // draw_integral_smoothstep();
    // draw_exp_impulse();
    // draw_qua_impulse();
    // draw_poly_impulse();
    // draw_exp_sustained_impulse();
    // draw_sinc_impulse();
    // draw_trunc_quad_falloff();

    // draw_almost_unit_identity_mapping();
    // draw_gain_mapping();
    // draw_parabola_mapping();
    // draw_power_curve_mapping();
    // draw_tone_mapping();
    // draw_cubic_pulse();
    // draw_rational_bump();
    draw_exp_step();
}