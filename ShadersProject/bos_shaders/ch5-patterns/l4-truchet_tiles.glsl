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

//  This one was is mine.
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
    Truchet Tiles

    Now that it can be determined whether the cell is in an odd or even row
    one can reuse a single design element depending on its position:
    The Truchet Tiles where a single design element can be presented in four different
    ways by rotating it.
    By changing te pattern across tiles, it's possible to contruct an infinite set of complex designs.

    In the below code, consider the function `rotateTilePattern()` which subdivides the space into
    four cells and assigns an angle of rotation to each one.

    Consider that it is the step() function here:
        gl_FragColor = vec4(vec3(step(st.x, st.y)), 1.0);
    that creates the right-angled triangles.

*/

vec2 rotateTilePattern(vec2 _st)
{
    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1.0, mod(_st.x, 2.0));
    index += step(1.0, mod(_st.y, 2.0)) * 2.0;

    //      |       
    //  2   |   3
    //      |
    //---------------
    //      |
    //  0   |   1
    //      |
    //  Make each cell between 0.0 - 1.0
    _st = fract(_st);

    //  Rotate each cell according to the index
    if (index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st, PI * 0.5);
    }else if (index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st, PI * -0.5);
    }else if (index == 3.0){
        //  Rotate cell 3.0 by 180 degrees
        _st = rotate2D(_st, PI);
    }

    return _st;
}

void draw_tuchet_tile()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    // st = rotateTilePattern(st);

    //  Make more interesting combinations
    // st = tile(st, 2.0);
    // st = rotate2D(st, -PI * u_time * 0.25);
    // st = rotateTilePattern(st * 2.0);
    // st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    gl_FragColor = vec4(vec3(step(st.x, st.y)), 1.0);
}

void draw_tuchet_tile_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    // st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    st = rotate2D(st, -PI * u_time * 0.25);
    st = rotateTilePattern(st * 2.0);
    st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    gl_FragColor = vec4(vec3(step(st.x, st.y)), 1.0);
}

void draw_tuchet_tile_v3()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    // st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    st = rotate2D(st, -PI * u_time * 0.25);
    // st = rotateTilePattern(st * 2.0);
    // st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    gl_FragColor = vec4(vec3(step(st.x, st.y)), 1.0);
}

void draw_tuchet_tile_v4()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    // st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    // st = rotate2D(st, -PI * u_time * 0.25);
    st = rotateTilePattern(st * 2.0);
    // st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    gl_FragColor = vec4(vec3(step(st.x, st.y)), 1.0);
}

//  This adds some color to the tile
void draw_tuchet_tile_v5()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    // st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    st = rotate2D(st, -PI * u_time * 0.25);
    st = rotateTilePattern(st * 2.0);
    st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    //  CHECK OUT THE COLOR THOUGH!
    vec3 pct = vec3(step(st.x, st.y));
    //  Both pct.x and pct.y are same
    vec3 color = (1 - pct.y) * vec3(0.2, 0.23, 0.6) + pct.y * vec3(0.6, 0.6, 0.6);
    gl_FragColor = vec4(color, 1.0);
}


/**
    Animated tiles, colours, etc
*/
void draw_tuchet_tile_v6()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    // st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    st = rotate2D(st, -PI * u_time * 0.25);
    st = rotateTilePattern(st * 2.0);
    st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    vec3 pct = vec3(step(st.x, st.y));
    //  Both pct.x and pct.y are same
    float col_t1 = sin(u_time * PI);
    float col_t2 = sin(u_time) * cos(u_time);
    float col_t3 = pow(sin(u_time), 2);
    // vec3 color = (1 - pct.y) * vec3(0.2, 0.23, 0.6) + pct.y * vec3(0.6, 0.6, 0.6);
    //  CHECK THESE OUT:
    // vec3 color = (1 - pct.x) * vec3(col_t1 * 0.02, col_t3 * 0.3, col_t2 * 0.01) + (pct.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);
    //  OR:
    vec3 color = (1 - pct.x) * vec3(col_t1 * 0.02 + 0.2, col_t3 * 0.3 + 0.23, col_t2 * 0.01 + 0.6) + (pct.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);
    gl_FragColor = vec4(color, 1.0);
}

void draw_tuchet_tile_v7(int pattern)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st = tile(st, 3.0);
    st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    st = rotate2D(st, -PI * u_time * 0.25);
    st = rotateTilePattern(st * 2.0);
    st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    vec3 pct = vec3(0.0);
    if (pattern == 0)
    {
        pct = vec3(step(st.x, st.y));
    }
    else if (pattern == 1){
        pct = vec3(polygon(st, vec2(0.5), 3));
    }
    else if (pattern == 2){
        pct = vec3(polygon(st, vec2(0.5), 5));
    }

    //  Both pct.x and pct.y are same
    float col_t1 = sin(u_time * PI);
    float col_t2 = sin(u_time) * cos(u_time);
    float col_t3 = pow(sin(u_time), 2);
    // vec3 color = (1 - pct.y) * vec3(0.2, 0.23, 0.6) + pct.y * vec3(0.6, 0.6, 0.6);
    //  CHECK THESE OUT:
    // vec3 color = (1 - pct.x) * vec3(col_t1 * 0.02, col_t3 * 0.3, col_t2 * 0.01) + (pct.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);
    //  OR:
    vec3 color = (1 - pct.x) * vec3(col_t1 * 0.02 + 0.2, col_t3 * 0.3 + 0.23, col_t2 * 0.01 + 0.6) + (pct.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);
    gl_FragColor = vec4(color, 1.0);
}

void draw_tuchet_tile_v8(int pattern)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 3.0;
    float index = 0.0;
    index = step(1.0, mod(st.x, 2.0));
    index = step(1.0, mod(st.y, 2.0)) * 2.0;

    st = fract(st);
    // st = tile(st, 3.0);
    st = rotateTilePattern(st);

    //  Make more interesting combinations
    st = tile(st, 2.0);
    st = rotate2D(st, -PI * u_time * 0.25);
    st = rotateTilePattern(st * 2.0);
    st = rotate2D(st, PI * u_time * 0.25);

    //  step(st.x, st.y) just makes a b&w triangles
    //  but you can use whatever design you want...
    vec3 pct = vec3(0.0);
    if (pattern == 0)
    {
        pct = vec3(step(st.x, st.y));
    }
    else if (pattern == 1){
        pct = vec3(polygon(st, vec2(0.5), 3));
    }
    else if (pattern == 2){
        pct = vec3(polygon(st, vec2(0.5), 5));
    }

    if (index == 0.0)
    {
        // scale2D(pct.xy, vec2(10.0));
        // pct = vec3(0.0);
    }
    // else if (index == 1.0)
    // {
    //     rotate2D(st, PI * 0.25);
    // }
    // else if (index == 2.0)
    // {
    //     rotate2D(st, -PI * 0.25);
    // }

    //  Both pct.x and pct.y are same
    float col_t1 = sin(u_time * PI);
    float col_t2 = sin(u_time) * cos(u_time);
    float col_t3 = pow(sin(u_time), 2);
    // vec3 color = (1 - pct.y) * vec3(0.2, 0.23, 0.6) + pct.y * vec3(0.6, 0.6, 0.6);
    //  CHECK THESE OUT:
    // vec3 color = (1 - pct.x) * vec3(col_t1 * 0.02, col_t3 * 0.3, col_t2 * 0.01) + (pct.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);
    //  OR:
    vec3 color = (1 - pct.x) * vec3(col_t1 * 0.02 + 0.2, col_t3 * 0.3 + 0.23, col_t2 * 0.01 + 0.6) + (pct.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);
    gl_FragColor = vec4(color, 1.0);
}

void main()
{
    // draw_tuchet_tile();
    // draw_tuchet_tile_v2();
    // draw_tuchet_tile_v3();
    // draw_tuchet_tile_v4();
    // draw_tuchet_tile_v5();
    // draw_tuchet_tile_v6();

    //  The integer changes the pattern/shape used.
    // draw_tuchet_tile_v7(0);
    // draw_tuchet_tile_v7(1);
    // draw_tuchet_tile_v7(2);

    draw_tuchet_tile_v8(0);
    // draw_tuchet_tile_v8(1);
    // draw_tuchet_tile_v8(2);
}