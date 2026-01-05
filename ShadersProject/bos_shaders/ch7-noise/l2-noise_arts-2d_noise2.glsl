#version 330 core

/**
    Date: Monday-31-March-2025

    Implementation of 2D Noise.
    Part 2: Shows fulfilling various tasks

    The last task, to imitate a Mark Rothko painting wasn't finished.

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


vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}



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

//  Offset is ideally 1.0. So no need for this version 2
float Noise2D_v2(vec2 st, float off)
{
    vec2 i = floor(st); vec2 f = fract(st);

    //  Four Corners in 2D of a Tile
    float a  = random(i);
    float b = random(i + vec2(off, 0.0));
    float c = random(i + vec2(0.0, off));
    float d = random(i + vec2(off, off));

    //  Smooth Interpolation

    //  Cubic Hermine Curve. Same as Smoothstep()
    vec2 u = f * f * (3.0 - 2.0 * f);

    //  Mix 4 Corners' Percentages
    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}
//------------------------------------------------


/**
    Task1: Change the space multiplier / animate it

    At larger levels of zoom, the noise gradient starts looking
    like a random noise map.
*/
void view_noise_space()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;    //  Preserve Aspect Ratio

    //  Scale the coordinate system to see noise action
    //  You will be able to see the squares of the grid
    //  the more you zoom out with a larger value
    float zoom = 30.0 + sin(u_time) + cos(u_time);
    vec2 pos = vec2(st * zoom);

    //  Use the noise function
    float n = Noise2D(pos);

    gl_FragColor = vec4(vec3(n), 1.0);
}

/**
    Task2:
    Hook up noise function to mouse coordinates
*/
void manip_noise_space()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;    //  Preserve Aspect Ratio

    //  Scale the coordinate system to see noise action
    //  You will be able to see the squares of the grid
    //  the more you zoom out with a larger value
    float zoom = 50.0 + sin(u_time) + cos(u_time);
    vec2 pos = vec2(st * zoom);

    //  Use the noise function
    float n = Noise2D(pos + norm_mouse(u_mouse) * 3.0);

    gl_FragColor = vec4(vec3(n), 1.0);
}

/**
    Task3:
    Treat gradient of the noise as a distance field.
*/
void noisy_distance_field()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);
    float d = 0.0;

    //  Remap Space to [-1, 1].
    st = st * 2.0 - 1.0;
    st *= 10;
    
    //  Make distance field.
    //  From ch3-shapes, l6:zen_garden

    //  NORMAL
    // d = length(abs(st) - 0.3);

    //  USING NOISE
    // d = Noise2D(st);    //  Cool1

    // d = Noise2D(st) * Noise2D(st);

    // d = pow(Noise2D(st), 5);    //  Splendid few

    //  Forever repeating maze because it scales/zooms out
    // d = Noise2D(st * u_time);  
    // d = Noise2D(vec2(u_time) * st);

    // d = Noise2D(st + u_time);   //  Pans


    //  Very Cool Patterns!
    // d = Noise2D(vec2(st.x * st.y) * u_time);

    // d = Noise2D(vec2(pow(st.y, st.x)) * u_time);

    //  Vert Awesome One!
    // float f = fract(Noise2D(st));
    // float u = f * f * (3.0 - 2.0 * f);
    // d = mix(Noise2D(st), Noise2D(st * u_time), u);


    float f = fract(Noise2D(st));
    float u = f * f * (3.0 - 2.0 * f);
    d = mix(Noise2D(st), Noise2D(vec2(pow(st.y * st.x, u_time))), u);

    col = vec3(smoothstep(.3, .4, d) * smoothstep(.6, .5, d));
    gl_FragColor = vec4(col, 1.0);

}


void noisy_distance_field_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);
    float d = 0.0;

    //  Remap Space to [-1, 1].
    st = st * 2.0 - 1.0;
    st *= 50;

    // d = Noise2D(vec2(Noise2D(st)));
    // d = Noise2D(vec2(Noise2D(st * 1 / u_time)));

    //  after st *= 50
    // float f = fract(Noise2D(st));
    // float u = f * f * (3.0 - 2.0 * f);
    // d = mix(Noise2D(st * 0.5), Noise2D(st * 0.05), u);

    float f = fract(Noise2D(st));
    float u = f * f * (3.0 - 2.0 * f);
    d = mix(Noise2D(st * 0.5), Noise2D(vec2(st.x * st.y)), u);

    col = vec3(smoothstep(.3, .4, d) * smoothstep(.6, .5, d));
    gl_FragColor = vec4(col, 1.0);

}

/**
    Task4: A composition of rectangles, colors, and noise
    that resembles some complexity of the Mark Rothko painting
*/

float box(in vec2 _st, in vec2 _size, float wobbleAmount)
{
    float n1 = Noise2D(_st * 3.0) * wobbleAmount;
    float n2 = Noise2D(_st.yx * 3.0) * wobbleAmount;

    float halfSize = _size.x * 0.5;
    halfSize = halfSize + n1 * n2;
    _size = vec2(0.5) - vec2(halfSize);

    vec2 uv = smoothstep(_size, _size + vec2(0.001), _st);
    uv *= smoothstep(_size, _size + vec2(0.001), vec2(1.0) - _st);
    return uv.x * uv.y;
}

float box_v2(in vec2 _st, in vec2 _size, float wobbleAmount, float zoom)
{
    float n1 = Noise2D(_st * zoom) * wobbleAmount;
    float n2 = Noise2D(_st.yx * zoom) * wobbleAmount;

    float halfSize = _size.x * 0.5;
    halfSize = halfSize + n1 * n2;
    _size = vec2(0.5) - vec2(halfSize);

    vec2 uv = smoothstep(_size, _size + vec2(0.001), _st);
    uv *= smoothstep(_size, _size + vec2(0.001), vec2(1.0) - _st);
    return uv.x * uv.y;
}
void noise_art_composition()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);
    float d = 0.0;

    col = vec3(box(st, vec2(0.5), 0.3));
    col.gb *= vec2(0.0);

    //  Remap Space to [-1, 1].
    st = st * 2.0 - 1.0;
    st *= 3.0;

    
    // float f = fract(Noise2D(st));
    // float u = f * f * (3.0 - 2.0 * f);
    // d = mix(Noise2D(st * 0.5), Noise2D(vec2(st.x * st.y)), u);

    // d = Noise2D(st);
    // d = Noise2D_v2(st, 1.0);
    // d = Noise2D_v2(st, 0.5);
    // d = Noise2D_v2(st, 2.);
    // d = Noise2D(vec2(st.x * st.y));

    float f = fract(Noise2D(st));
    float u = f * f * (3.0 - 2.0 * f);

    //  Cool flow effect
    // float d1 = Noise2D(st);
    // float d1 = Noise2D(mix(st, vec2(Noise2D(st)), u));
    // float d2 = Noise2D(vec2(st.x * st.y) + u_time);
    // d =  mix(d1, d2, u);

    //  Another cool one!
    // d = Noise2D(vec2(pow(st.y, st.x)) * u_time);



    // col *= d;

    gl_FragColor = vec4(col, 1.0);
}

void noise_art_composition_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);
    float d = 0.0;

    col = vec3(box_v2(st, vec2(0.5), 0.3, ));
    col.gb *= vec2(0.0);

    //  Remap Space to [-1, 1].
    st = st * 2.0 - 1.0;
    st *= 3.0;

    d = Noise2D(st);

    col *= d;

    gl_FragColor = vec4(col, 1.0);
}

void main()
{
    // view_noise_space();
    // manip_noise_space();
    // noisy_distance_field();
    // noisy_distance_field_v2();
    // noise_art_composition();
    noise_art_composition_v2();
}