#version 330 core

/**
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
    Polynomial Shaping Functions:

    *   Blinn-Wyvill Approximation to the Raised Inverted Cosine
    *   Double-Cubic Seat
    *   Double-Cubic Seat with Linear Blend
    *   Double-Odd-Polynomial Sigmoids
    *   Quadratic Through a Given Point
*/

/**
    The Blinn-Wyvill Approximation to the Raised Inverted Cosine.

    Because computing cos() and sin(), essential to the natural sciences, can be expensive
    to compute, for a situation that may require millions of trig operations per second...
    the use of an approximation will substantially improve speed optimizations.

    This Blinn-Wyvill polynomial approximation to the Raised Inverted Cosine is one that diverges
    from the authentic (scaled) trigonometric function by < 0.1% within the range [0...1]

    It also shares these properties of the Raised Inverted Cosine:
        1.  Flat derivatives at 0 and 1
        2.  Value 0.5 at x = 0.5 for f(x), whwere f(x) is the Blinn-Wyvill Approximation
    It's relatively efficient to compute as it is comprised exclusively from simple arithmetic operations
    and cacheable fractions.

    Unlike the OG Raised Inverted Cosine, it does not have infinite derivatives; but as it is a sixth-order
    function, this limitation is unlikely to be noticed in practice.

    It will be especially useful in small microprocessors like Adruino, which have limited speed and processing
    resources.

    Formula:
        y = (4/9) * x^6 - (17/9) * x^4 + (22/9)* x^2
*/

float bill_wyvill_cosine_approx(float x)
{
    float x2 = x * x;
    float x4 = x2 * x2;
    float x6 = x4 * x2;

    float fa = (4.0/9.0);
    float fb = (17.0/9.0);
    float fc = (22.0/9.0);

    float y = fa * x6 - fb * x4 + fc * x2;
    
    return y;
}

void draw_bill_wyville_cosine_approx_curve()
{
    //  Normalized Coordinates
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y = bill_wyvill_cosine_approx(st.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct) * color + pct * vec3(0.89, 0.23, 0.95);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Double-Cubic Seat
    
    It's a seat-shaped function formed by joining two 3rd-order polynomial (cubic) curves.
    These curves meet with a horizontal inflection point at the control coordinate (a, b) in
    the unit square.

    Formula:

    x <= a : y = b - b * (1 - (x/a)) ^ 3
    x > a:   y = b + (1-b)*((x-a)/(1-a))^3
*/

float double_cubic_seat(float x, float a, float b)
{
    float epsilon = 0.00001;
    //  These define the bounds of the inflexion point
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0;
    float max_param_b = 1.0;
    
    a = min(max_param_a, max(min_param_a, a));
    b = min(max_param_b, max(min_param_b, b));

    float y = 0;
    if (x <= a){
        y = b - b * pow(1-(x/a), 3.0);
    }else{
        y = b + (1 - b) * pow((x - a)/(1 - a), 3.0);
    }
    return y;
}

void draw_double_cubic_seat()
{
    //  Normalized Coordinates
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    //  Still the Best
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;
    // vec2 norm_mouse = (gl_FragCoord.xy / u_mouse - 0.5) * 4;

    float y = double_cubic_seat(st.x, norm_mouse.x, norm_mouse.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct) * color + pct * vec3(0.89, 0.23, 0.95);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Double-Cubic Seat with Linear Blend

    This version of the Double-Cubic Seat function uses a single variable to control the location of its
    inflexion point along the diagonal of the unit square.
    A second parameter is used to blend this curve with the identity Function (y=x)..

    Here, the variable b is used to controle the amount of this blend.
    This has an effect of tilting the slope of the curve's plateau in the area surrounding its inflexion point.
    The adjustable flattening around the inflexion point makes this a useful shaping function for lensing or
    magnifying evenly-spaced data.

    x <= a : y = bx  + (1 - b) * (a) * (1 - (1- x/a) ^ 3)
    x > a: y = bx + (1 - b) * (a + (1-a)* ((x-a)/(1-a))^3)  
*/
float double_cubic_seat_with_linear_blend(float x, float a, float b)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0;
    float max_param_b = 1.0;

    a = min(max_param_a, max(min_param_a, a));
    b = min(max_param_b, max(min_param_b, b));
    b = 1.0 - b;    //  reverse for intelligibility

    float y = 0;
    if (x <= a){
        y = b * x + (1-b) * a * (1-pow(1-x/a, 3.0));
    }else{
        y = b * x + (1-b) * (a + (1-a) * pow((x-a)/(1-a), 3.0));
    }

    return y;
}

void draw_double_cubic_seat_with_linear_blend()
{
    //  Normalized Coordinates
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    //  Still the best
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;
    // vec2 norm_mouse = (gl_FragCoord.xy / u_mouse - 0.5) * 4;
    float y = double_cubic_seat_with_linear_blend(st.x, norm_mouse.x, norm_mouse.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct) * color + pct * vec3(0.89, 0.23, 0.95);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Double-Odd-Polynomial Seat

    The Double-Cubix Seat function can be generalized to a form that uses ANY odd integer exponenet.

    This code demonstrates this: the parameter n controls the flatness or breadth of the plateau region
    in the vicinity of the point (a, b)

    A good working range for n is the set of whole numbers from 1 to 20

    Formula:
        x <= a : y = b - b * (1 - (x/a))^(2*n + 1)
        x > a : y = b + (1 - b) * ((x/a)/(1-a))^(2*n + 1)
    
    Odd-powered polynomials like cubics and quintics lend themselves very naturally to creating
    seat-shaped curves.
    This example is parametrically blended with the Identity Function (y=x) as regulated by the
    parameter al the shaping funcction passes through the corners of the unit square (0, 0) and (1, 1)
    and symmetrically through the midpoint (0.5, 0.5). It is also relatively efficient to compute.

    y = ax + (1 - a) * (0.5 + 0.5*(2 * (x - 0.5))^(2*n + 1))

*/

float double_odd_polynomial_seat(float x, float a, float b, int n)
{
    float epsilon = 0.00001;
    
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0;
    float max_param_b = 1.0;
    
    a = min(max_param_a, max(min_param_a, a));
    b = min(max_param_b, max(min_param_b, b));

    int p = 2*n + 1;
    float y = 0;
    if (x <= a){
        y = b - b * pow(1-(x/a), p);
    }else{
        y = b + (1 - b) * pow((x - a)/(1 - a), p);
    }
    return y;
}


//  Make n any odd number from 1->20
void draw_double_odd_polynomial_seat(int n)
{
    //  Normalized Coordinates
    vec2 st = (gl_FragCoord.xy / u_resolution - 0.5);

    //  Still the best
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;
    // vec2 norm_mouse = (gl_FragCoord.xy / u_mouse - 0.5) * 4;

    float y = double_odd_polynomial_seat(st.x, norm_mouse.x, norm_mouse.y, n) * 0.5;
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct) * color + pct * vec3(0.89, 0.23, 0.95);

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(norm_mouse.x, norm_mouse.x, norm_mouse.x, 1.0);
}

/**
    Symmetric Double-Polynomial Sigmoids
    
    Sigmoid patterns can be generated by joining a symmetric pair of polynomials at the center of the unit square.
    The exponents in these equations (controlled by the integer parameter, n) control the steepness of the wall separating
    the squelched values from the boosted ones.
    A suggested range for the whole number n is from 1 -> 10.
    Of these, the sigmoid created with a 2nd-order (Quadratic) exponent comes closest to the
    Raised Inverted Cosine, approzimating it to within 2.8%.

    The Symmetric Double-Polynomial Sigmoids here create an S-shape with flat tangents at 0 and 1, and with
    the special property that f(0.5) = 0.5.
    Sigmoids generated with even exponents require the following equations:

    Formula:
        x <= 0.5 : y = ((2*x) ^ (2*n)) / 2
        x > 0.5 : y = 1 - ((2*x) ^ (2*n)) / 2

        Odd exponents require slightly different pair of equations:
        x <= 0.5 : y = ((2x) ^ (2*n + 1)) / 2
        x > 0.5 : y = 1 + ((2*x - 2) ^ (2*n + 1)) / 2
*/

float double_polynomial_sigmoid(float x, float a, float b, int n)
{
    float y = 0;

    if (n % 2 == 0){
        //  Even Polynomial
        if (x <= 0.5){
            y = pow(2.0 * x, n) / 2.0;
        }else{
            y = 1.0 - pow(2*(x-1), n) / 2.0;
        }
    }
    else{
        //  Odd Polynomial
        if (x <= 0.5){
            y = pow(2.0 * x, n) / 2.0;
        }else{
            y = 1.0 + pow(2.0 * (x - 1), n) / 2.0;
        }
    }

    return y;
}

void draw_double_polynomial_sigmoid(int n)
{
    //  Normalized Coordinates
    vec2 st = (gl_FragCoord.xy / u_resolution - 0.5) * 2;

    //  Still the best
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;

    //  This
    float y = double_polynomial_sigmoid(st.x, norm_mouse.x, norm_mouse.y, n);
    //  Is same as this, because x and y have same value
    // float y = double_polynomial_sigmoid(st.x, norm_mouse.y, norm_mouse.x, n);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct) * color + pct * vec3(0.89, 0.23, 0.95);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Quadratic Through A Given Point

    This function defines an axis-aligned quadratic (parabola) which passes through
    a user-supplied point (a, b) in the unit square.
    NOTE: Not all points in the unit square will produce curves which pass through the loacations (0, 0)
    and (1, 1)

    Formula:
        y = ((1-b)/(1-a) - b/a) * x^2 - ((a^2 * ((1-b)/(1-a) - b/a) - b)/a) * x
*/

float quadratic_through_a_given_point(float x, float a, float b)
{
    float epsilon = 0.00001;
    
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0;
    float max_param_b = 1.0;
    
    a = min(max_param_a, max(min_param_a, a));
    b = min(max_param_b, max(min_param_b, b));

    float A = (1-b)/(1-a) - (b/a);
    float B = (A * (a * a) - b) / a;
    float y = A  * (x * x) - B * x;
    y = min(1, max(0, y));

    return y;
}

void draw_quadratic_through_a_given_point()
{
    //  Normalized Coordinates
    vec2 st = (gl_FragCoord.xy / u_resolution - 0.5);

    //  Still the best
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;

    float y = quadratic_through_a_given_point(st.x, norm_mouse.x, norm_mouse.y);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct) * color + pct * vec3(0.89, 0.23, 0.95);

    // gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(st.x, 0.0, st.y, 1.0);
    gl_FragColor = vec4(norm_mouse.x, 0.0, norm_mouse.y, 1.0);
    // gl_FragColor = vec4(0.1, 0.0, 0.1, 1.0);
}

void main()
{
    /**
        The gradient it creates is like a large doorway that goes deep such
        that it gets darker as one goes deeper.
    */
    // draw_bill_wyville_cosine_approx_curve();
    // draw_double_cubic_seat();
    // draw_double_cubic_seat_with_linear_blend();
    // draw_double_odd_polynomial_seat(9);
    // draw_double_polynomial_sigmoid(5);
    draw_quadratic_through_a_given_point();
}