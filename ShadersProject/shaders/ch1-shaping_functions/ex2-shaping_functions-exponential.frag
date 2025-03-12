#version 330 core

/**
    Date: Wed-11-12-2024, Keele Days

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

/**
    Exponential Shaping Functions:

    *   Exponential Ease-in and Ease-out
    *   Double-Exponential Seat
    *   Double-Exponential Sigmoid
    *   The Logistic Sigmoid
*/

/**
    Exponential Ease and Out.

    In this implementation of an exponential shaping function,
    the control parameter a allows the designer to vary the
    function from an ease-out form to an ease-in form.

    Exponential Ease-in
        y = x ^(1/a), 0 < a <= 1
    Exponential Ease-out:
        y = x^a, 0 <= a <= 1

    According to the implementation below, when the mouse.x < 0.5, the ease-out 
    function is displayed. But when >= 0.5, it's ease-in
*/

float exponential_easing(float x, float a)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    a = max(min_param_a, min(max_param_a, a));

    if (a < 0.5)
    {
        //  emphasis --> ease-out
        a = 2.0 * a;
        float y = pow(x, a);
        return y;
    }else{
        //  de-emphasis --> ease-in
        a = 2/0 * (a - 0.5);
        float y = pow(x, 1.0 / (1 - a));
        return y;
    }
}

void draw_exponential_easing()
{
    vec2 st = (gl_FragCoord.xy / u_resolution - 0.5) * 4;
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x - 0.5, - (gl_FragCoord.y / u_mouse.y - 0.5));

    // float y = 1.0 - exponential_easing(st.x, norm_mouse.x);
    float y = -.3 + exponential_easing(st.x, norm_mouse.x);
    // float y = exponential_easing(st.x, norm_mouse.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1 - pct) * color + pct * vec3(0.95, 0.87, 0.13);

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(norm_mouse.x, norm_mouse.x, norm_mouse.x, 1.0);
}

/**
    Double-Exponential Seat

    A seat-shaped function can be created with a coupling of two exponential functions.
    It has more pleasant derivatives than the cubic function and more continuous
    control in some respects, though it uses more GPU cycles.

    The control parameter, a's range: [0...1]

    These equations are very similar to the Double Exponential Sigmoid soon to be done

    Formulas:
        x <= 0.5    :   y = (2x) ^a / 2
        x > 0.5     :   y = 1 - (2(1-x)) ^ a / 2
    
*/

float double_exponential_seat(float x, float a)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;

    a = min(max_param_a, max(min_param_a, a));

    float y = 0;
    if (x <= 0.5){
        y = (pow(2.0 * x, 1 - a)) / 2.0;
    }else{
        y = 1.0 - (pow(2.0 * (1.0 - x), 1 - a)) / 2.0;
    }

    return y;
}

void draw_double_exponential_seat()
{
    // vec2 st = (gl_FragCoord.xy / u_resolution -) * 4;
    // vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x - 0.5, - (gl_FragCoord.y / u_mouse.y - 0.5));
    // float y = 1.0 - double_exponential_seat(st.x, norm_mouse.x);

    //  Moves to -0.5 -> 0.5
    // vec2 st = (gl_FragCoord.xy / u_resolution - 0.5) * 4;
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;
    // float y = double_exponential_seat(st.x, norm_mouse.x);

    //  Best One
    vec2 st = (gl_FragCoord.xy / u_resolution) * 2;
    //  Did not do (gl_FragCoord.xy / u_mouse) * 2 because the double_exponential_seat()
    //  takes u_mouse coordinates, and they need to be between 0 and 1
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    float y = 0.5 + double_exponential_seat(st.x, norm_mouse.x);

    // float y = double_exponential_seat(st.x, norm_mouse.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1 - pct) * color + pct * vec3(0.95, 0.87, 0.13);

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(norm_mouse.x, norm_mouse.x, norm_mouse.x, 1.0);
}


/**
    Double-Exponential Sigmoid

    The same doubling-and-flipping scheme is used to create sigmoids from pairs of
    exponential functions.
    The advantage: the control parameter can be continously varied between 0 and 1; hence
    these functions are very useful as adjustable-contrast functions.

    However, they are more computationally tasking than the polynomial sigmoid
    flavors.
    The Double-Exponential Sigmoid approximates the Raised Inverted Cosine to within 1%
    when the parameter a is approximately 0.426

    Formulas:

        x <= 0.5    :   y = ((2x) ^ (1/a)) / 2    
        x > 0.5     :   y = 1 - (2(1 - x)) ^ (1/a) / 2
*/

float double_exponential_sigmoid(float x, float a)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    a = min(max_param_a, max(min_param_a, a));
    a = 1.0 - a;    //  For Sensible Results

    float y = 0;
    if (x <= 0.5){
        y = (pow(2.0 * x, 1.0 / a)) / 2.0;
    }else{
        y = 1.0 - (pow(2.0 * (1.0 - x), 1.0/a)) / 2.0;
    }
    return y;
}

void draw_double_exponential_sigmoid()
{
    vec2 st = (gl_FragCoord.xy / u_resolution) * 2;
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse;

    float y = 0.2 + double_exponential_sigmoid(st.x, norm_mouse.x);
    // float y = 0.5 + double_exponential_sigmoid(st.x, norm_mouse.x);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1 - pct) * color + pct * vec3(0.95, 0.87, 0.13);

    gl_FragColor = vec4(color, 1.0);
}

/**
    The Logistic Sigmoid

    Also called the "Logistic Curve". It is a such a sigmoid bespoken by scientists to best
    represent the growth of organic populations and many other natural phenomena 

    In Software Engineering, it's used often for weighting signal-response functions in neural
    networks.
    
    In this implementation, the parameter a regulates the slope or "growth rate" of the sigmoid
    during its rising portion.

    When a=0, this version of the Logistic function collapses to the identity function (y=x).
    The Logistic Sigmoid has very natural rates of change, but is expensive to calculate due to the use
    of many exponential functions.

    Formula:
        y = (A - B) / (C - B)
        A = 1 / (1 + e^(-2a(x-0.5)))
        B = 1 / (1 + e^a)
        C = 1 / (1 + e^-a)
*/

float logistic_sigmoid(float x, float a)
{
    //  n.b: This logistic Sigmid has been normalized

    float epsilon = 0.0001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    a = max(min_param_a, min(max_param_a, a));
    a = (1 / (1-a) - 1);

    float A = 1.0 / (1.0 + exp(0 - ((x - 0.5) * a * 2.0)));
    float B = 1.0 / (1.0 + exp(a));
    float C = 1.0 / (1.0 + exp(0 - a));
    float y = (A - B) / (C - B);
    return y;
}

void draw_logistic_sigmoid()
{
    vec2 st = (gl_FragCoord.xy / u_resolution) * 2;
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse;

    float y = 0.2 + logistic_sigmoid(st.x, norm_mouse.x);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1 - pct) * color + pct * vec3(0.95, 0.87, 0.13);

    gl_FragColor = vec4(color, 1.0);
}



void main()
{
    // draw_exponential_easing();
    // draw_double_exponential_seat();
    // draw_double_exponential_sigmoid();
    draw_logistic_sigmoid();

}