#version 330 core

/**
    Date: Thurs-26-Dec-2024

    Patterns
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

void test2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    st = translate2D(st, vec2(sin(u_time * PI), 1.0));
    float dt = sin(u_time * PI);
    
    // vec3 color = vec3(st, 0.0);
    vec3 color = vec3(st.x);
    gl_FragColor = vec4(color, 1.0);
    // mat3 translate_mat = mat3(1.0, 0.0, _dx, 0.0, 1.0, _dy, 0.0, 0.0, 0.0);
    // vec3 st_val = translate_mat * vec3(_st.x, _st.y, 1.0);
    // return vec2(st_val.x, st_val.y);
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

        // color = vec3(box(st, vec2(0.7), 0.01));
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


//------------------------------------------------

/**
    Because each subdivision or cell is a smaller version of the normalized
    coordinate system already being used, a matrix tnansform can be applied to it to
    translate, rotate, or scale the space inside

    The below eg1 shows a grid with each of its squares rotated by 45 degrees.
*/

void matrix_transformed_patterns_eg1(float showPattern)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st *= 4.0;

    float index = 0.0;
    index += step(1.0, mod(st.x, 2.0));
    index += step(1.0, mod(st.y, 2.0)) * 2.0;

    //  Divide space into 4x4 grid
    // st = tile(st, 4);
    st = fract(st);


    //  Use a matrix to rotate the space by 45 degrees
    st = rotate2D(st, PI * 0.25);

    st = translate2D(st, vec2(cos(u_time), 0));

    if (index == 0.0){
        //  Draw a square
        color = vec3(box(st, vec2(0.7), 0.01));
    }
    else if(index == 1.0){
        color = vec3(circle(st, 0.5));
    }
    else if (index == 2.0){
        color = vec3(polygon(st, vec2(0.5), 3));
    }
    else if (index == 3.0){
        color = vec3(polygon(st, vec2(0.5), 5));
    }
    else if(index == 4.0)
    {
        color = vec3(polygon(st, vec2(0.5), 6));
    }


    if (showPattern != 1.0)
    {
        color = vec3(st, 0.0);
    }

    //  Animate Color
    float col_t1 = sin(u_time * PI);
    float col_t2 = sin(u_time) * cos(u_time);
    float col_t3 = pow(sin(u_time), 2);
    color = (1 - color.x) * vec3(col_t1 * 0.02, col_t3 * 0.3, col_t2 * 0.01) + (color.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);

    gl_FragColor = vec4(color, 1.0);
}

void curved_corner_square_test()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st = tile(st, 4);

    color = vec3(curve_corner_square(st, vec2(0.97), 0.01, 0.25));

    color = (1 - color.x) * vec3(0.2, 0.23, 0.6) + color.x * vec3(0.6, 0.6, 0.6);

    gl_FragColor = vec4(color, 1.0);
}


//------------------------------------------------


void main()
{
    // matrix_transformed_patterns_eg1(step(0.5, norm_mouse().x));
    // test2();
    curved_corner_square_test();
}