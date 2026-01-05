#version 330 core

/**
    Date: Thurs-26-Dec-2024

    Patterns; Offset Patterns
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

//----------------SHAPE FUNCTIONS--------------------/
float circle(in vec2 _st, in float _radius)
{
    //  pixel distance from center
    vec2 pdfc = _st - vec2(0.5);

    //  Consider that taking the dot product of a vector on itself is
    //  essentially finding its length squared. Since v.v = mag(v)*mag(v)*cos(0)
    //  and cos(0) = 1, so v.v = (mag(v))^2
    return 1.0 - smoothstep(_radius - (_radius * 0.01), _radius+(_radius*0.01),
                            dot(pdfc, pdfc) * 4.0);
}

float truchet_triangle(in vec2 _st, in float _width, in float _height)
{
    //  f => factor
    float wf = (1.0 - _width) * 0.5;
    float hf = (1.0 - _height) * 0.5;

    //  Define Bottom Right and Top Left Boundaries of Square
    vec2 bl = step(vec2(wf, hf), _st);
    vec2 tr = step(vec2(wf, hf), 1 - _st);
    float render_val = bl.x * bl.y * tr.x * tr.y;

    //  Now ensure the pixels obey y = x
    //  pixel_factor
    //  The smoothstep means, any pixel <= 1.0, is 1 (should be rendered)
    //  and any > 1.0 is 0 (should not be rendered)
    float pxf = step(1.0, smoothstep(1.01, 1.0,_st.y / _st.x));

    //  Multiply that value with the pixels that are 1.0 within the rectangle's bounds
    float p_out = render_val * pxf; //  output that gives if pixel is within right-angled triangle

    return 1.0 - p_out;
}

void draw_tuchet_triangle()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);
    float pct = truchet_triangle(st, 0.6, 0.6);
    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);
}

/**
    n is the number of sides of the polygon
*/
float polygon(in vec2 _st, vec2 _pos, int _n)
{
    float d = 0.0;

    //  Remap space according to x and y offset
    float x_diff = (_pos.x - 0.5) + 1.0;
    float y_diff = (_pos.y - 0.5) + 1.0;
    _st.x = _st.x * 2.0 - x_diff;
    _st.y = _st.y * 2.0 - y_diff;

    //  Number of Sides of Shape
    int N = _n;

    //  Angle and radius from the current pixel
    float a = atan(_st.x, _st.y) +  PI;
    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d = cos(floor(0.5 + a/r) * r - a) * length(_st);

    float p_out = 1.0 - smoothstep(.4, .41, d);
    
    return p_out;
}


float box(in vec2 _st, in vec2 _size, float _smoothEdges)
{
    _size = vec2(0.5) - _size*0.5;
    vec2 aa = vec2(_smoothEdges * 0.5);
    vec2 uv = smoothstep(_size, _size + aa, _st);
    uv *= smoothstep(_size, _size + aa, vec2(1.0) - _st);

    return uv.x * uv.y;
}

float curve_corner_square(in vec2 _st, in vec2 _size, float _smoothEdges, float cornerLength)
{
    vec2 size1 = vec2(0.5) - _size*0.5;
    vec2 aa = vec2(_smoothEdges * 0.5);
    vec2 uv1 = smoothstep(size1, size1 + aa, _st);
    uv1 *= smoothstep(size1, size1 + aa, vec2(1.0) - _st);
    
    //  normalize to between 0 and 1
    cornerLength = smoothstep(0.0, 1.0, cornerLength);

    vec2 size2 = vec2(0.5) - (_size + vec2(cornerLength))*0.5;
    _st = rotate2D(_st, PI * 0.25);
    
    vec2 uv2 = smoothstep(size2, size2 + aa, _st);
    uv2 *= smoothstep(size2, size2 + aa, vec2(1.0) - _st);
    // uv2 = vec2(1.0) - uv2;

    vec2 fuv = uv1 * uv2;

    return fuv.x * fuv.y;
}

//---------------------------------------------------/

// -----------TILING REUSABLE FUNCTION--------------
//  Tiles the Pixel Space according to the zoom parameter 
vec2 tile(vec2 _st, float _zoom)
{
    _st *= _zoom;
    return fract(_st);
}
//--------------------------------------------------


/**
    Offset Patterns

    The whole point is to offset a row.
    Firstly, we need to know if the row of our thread is an even or odd number,
    because we can use that to determine if we can use that to determine if we need  
    to offset the x in that row.
    
    For that we are going to use mod() of 2.0 and then see if the result in under 1.0
    or not.

    y = mod(2.0);
    y = mod(x, 2.0) < 1.0 ? 0. : 1.0;   // <-- ternary operator
    y = step(1.0, mod(x, 2.0));

    A ternary operator can be used to check if the mod() of 2.0 is < 1.0
    Likewise, one can use a step() function to do the same but faster.
    
    Now that the odd number formula is gotten, we can apply an offset to the odd
    rows to give a *brick* effect to our tiles. Here we use the function to detect
    odd rows and give them a half-unit offset on x.

    For even rows, the result of our function is 0.0, and multiplying 0.0 by the
    offset of 0.5 gives an offset of 0.0.
    But on odd rows, we multiply the result of our function, 1.0, by the offset of 0.5,
    which moves the x-acis of the coordinate system by 0.5.

    Now also consider the line that stretches the aspect ratio
    of the coordinate system to mimic that of a "modern brick wall"
*/

vec2 brickTile(vec2 _st, float _zoom)
{
    _st *= _zoom;
    //  Here is where the offset is happening
    _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5;
    return fract(_st);
}

//  Author @patriciogv (patriciogonzalezvivo.com) - 2015
void draw_brick_wall(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTile(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor==1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}

vec2 brickTileB(vec2 _st, float _zoom)
{
    _st *= _zoom;
    //  Here is where the offset is happening
    _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    return fract(_st);
}

void draw_brick_wall_animated(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileB(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}

vec2 brickTileC(vec2 _st, float _zoom)
{
    _st *= _zoom;

    //  Here is where the offset is happening
    // _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    _st.y += step(1.0, mod(_st.x, 2.0)) * 0.5 * cos(u_time);
    return fract(_st);
}

void draw_brick_wall_animatedB(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileC(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}


vec2 brickTileD(vec2 _st, float _zoom)
{
    _st *= _zoom;

    //  Here is where the offset is happening
    _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    _st.y += step(1.0, mod(_st.x, 2.0)) * 0.5 * cos(u_time);
    return fract(_st);
}

void draw_brick_wall_animatedC(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileD(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}

vec2 brickTileE(vec2 _st, float _zoom)
{
    _st *= _zoom;

    //  Here is where the offset is happening
    // _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    //  Moves the odd numbered grid cells left and right
    _st.x += step(0.001, smoothstep(1.0, 0.0, mod(_st.y, 2.0))) * 0.5 * cos(u_time);
    return fract(_st);
}

void draw_brick_wall_animatedD(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileE(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}

vec2 brickTileF(vec2 _st, float _zoom)
{
    _st *= _zoom;

    //  Here is where the offset is happening
    // _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    //  Moves the odd numbered grid cells left and right
    // _st.x += step(0.001, smoothstep(1.0, 0.0, mod(_st.y, 2.0))) * 0.5 * cos(u_time);
    _st.y += step(0.001, smoothstep(1.0, 0.0, mod(_st.x, 2.0))) * 0.5 * cos(u_time);
    return fract(_st);
}

void draw_brick_wall_animatedE(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileF(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}

vec2 brickTileG(vec2 _st, float _zoom)
{
    _st *= _zoom;

    //  Here is where the offset is happening
    _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    _st.y += step(1.0, mod(_st.x, 2.0)) * 0.5 * sin(u_time);
    //  Moves the odd numbered grid cells left and right
    _st.x += step(0.001, smoothstep(1.0, 0.0, mod(_st.y, 2.0))) * 0.5 * cos(u_time);
    _st.y += step(0.001, smoothstep(1.0, 0.0, mod(_st.x, 2.0))) * 0.5 * cos(u_time);
    return fract(_st);
}

void draw_brick_wall_animatedF(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileG(st, 5.0);

    color = vec3(box(st, vec2(0.9), 0.01));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}

vec2 brickTileH(vec2 _st, float _zoom)
{
    _st *= _zoom;

    //  Here is where the offset is happening
    _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5 * sin(u_time);
    // _st.y += step(1.0, mod(_st.x, 2.0)) * 0.5 * sin(u_time);
    //  Moves the odd numbered grid cells left and right
    // _st.x += step(0.001, smoothstep(1.0, 0.0, mod(_st.y, 2.0))) * 0.5 * cos(u_time);
    _st.y += step(0.001, smoothstep(1.0, 0.0, mod(_st.x, 2.0))) * 0.5 * cos(u_time);
    return fract(_st);
}

void draw_brick_wall_animatedG(float showColor)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Modern Metric bricl pf 215mm x 102.5mm x 65mm
    //  http://www.jaharrison.me.uk/Brickwork/Sizes.html

    // st /= vec2(2.15, 0.65) / 1.5;

    //  Apply the brick tiling
    st = brickTileH(st, 5.0);

    // color = vec3(box(st, vec2(0.9), 0.01));
    color = vec3(circle(st, 0.5));

    //  Uncomment to see the coordinates
    if (showColor == 1.0)
    {
        color = vec3(st, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    /**
        There is the static one.
        Then one that only moves rows of odd indices
        Then one that only moves columns of odd indices
        Then one that moves both rows and columns of odd inidices
        Then there's the one that moves rows of even indices.
        The same for columns of even inidices.
        Then the animated one.

        Then changed one to display circles.
    */
    // draw_brick_wall(step(0.5, norm_mouse().x));
    // draw_brick_wall_animated(step(0.5, norm_mouse().x));
    // draw_brick_wall_animatedB(step(0.5, norm_mouse().x));
    // draw_brick_wall_animatedC(step(0.5, norm_mouse().x));
    // draw_brick_wall_animatedC(step(0.5, norm_mouse().x));
    // draw_brick_wall_animatedD(step(0.5, norm_mouse().x));
    // draw_brick_wall_animatedE(step(0.5, norm_mouse().x));
    // draw_brick_wall_animatedF(step(0.5, norm_mouse().x));    //  Crazy motion of all
    draw_brick_wall_animatedG(step(0.5, norm_mouse().x));
}