#version 330 core

/**
    Date: Thurs-26-Dec-2024

    Patterns

    Here, these are covered:
        1.  Dividing the screen into grids such that each cell represents
            the whole normalized coordinate, thereby repeating a pattern 
            specified in the undivided normalized coordinate.
        2.  Viewing the replicated color space of the grid and drawing circles in each of these 
            color space's cells.
        3.  Drawing a Truchet Tile.
        4.  Implementing a kind of index for each cell of the grid to change what pattern
            is drawn in which cell.
*/


#define PI 3.14159265359
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
    EG1: Repeating Patterns
        Author @patriciogv - 2015
    
    It shows how to divide the coordinate space into repeating identical subspaces.
    Then circles are drawn into subspaces.
*/

//----------------SHAPE FUNCTIONS--------------------/
float circle(in vec2 _st, in float _radius)
{
    //  pixel distance from center
    vec2 pdfc = _st - vec2(0.5);

    //  Consider that taking the dot product of a vector on itself is
    //  essentially finding its length squared. Since v.v = mag(v)*mag(v)*cos(0)
    //  and cos(0) = 1, so v.v = (mag(v))^2
    return 1.0 - smoothstep(_radius - (_radius * 0.01),
            _radius+(_radius*0.01), dot(pdfc, pdfc) * 4.0);
}

/**
    This is basically a right angled triangle with the right-angled
    sides equal.

    It uses the y = x formula
    If y/x <= 1, then that identifies the that are in the Right-angled triangle.

    This way of drawing the triangle was made by me, Ebenezer Ayo-Metibemu (26-12-Dec-2024)

    But this is different from how it's done in the lesson;
    the lesson's method only applied transformations to the pixel space
    to make these triangles.
*/
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

//---------------------------------------------------/


void draw_pattern_eg1(float showCircles)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st *= 3.0;      //  Scale up the pixel space by 3
    st = fract(st); //  Wrap every pixel value around 1.0 by getting just its fractional part 

    //  Now, the screen is divided into 9 repeating spaces going from 0-1
    //  this is essentially a repitition of the normalised coordinate space
    color = vec3(st, 0.0);
    if (showCircles == 1.0)
    {
        color = vec3(circle(st, 0.5));
    }

    gl_FragColor = vec4(color, 1.0);
}

/**
    This version allows one to affect the zoom, as well as to test
    the effect of offsetting the pixels' positions by `pos_offset`

    But this simply offsets the normalised space and then repeats that.

    Version C is what I am trying to do.
*/
void draw_pattern_eg1B(float zoom, vec2 pos_offset, float showCircles)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  By offsetting the X and Y values,
    st += pos_offset;
    st *= zoom;
    st = fract(st);

    color = vec3(st, 0.0);
    if (showCircles == 1.0)
    {
        color = vec3(circle(st, 0.5));
    }

    gl_FragColor = vec4(color, 1.0);
}

/**
    Version C displays using different zoom values for the x and y
    It uses zoom_scale scales the zoom to different values for either the x or y of the pixel.
    Then zoom_offset to control added or subtracted offsets of the zoom value
    for either the x or y of the pixel.

    By affecting zoom_scale.x, you affect the number of columns of the tile grid.
    By affecting zoom_scale.y, you affect the number of rows of the tile grid.

    Zoom Offset will do the same, but the scales have to be proportional.
*/
void draw_pattern_eg1C(vec2 zoom_scale, vec2 zoom_offset, float showCircles)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st *= zoom_scale;
    st += zoom_offset;
    st = fract(st);

    color = vec3(st, 0.0);
    if (showCircles == 1.0)
    {
        color = vec3(circle(st, 0.5));
    }

    gl_FragColor = vec4(color, 1.0);
}

/**
    This Version D of EG1 finds a way to change the pattern of of a cell of the
    grid based on a kind of index value.
    The index's calculation is pretty neat, using the modulus function.
    It was not I who made it, though.
    The below way uses the pixel's x and y values
    to get indexes in the ragne [0..3], for 4 different patterns

*/
void draw_pattern_eg1D(vec2 zoom_scale, vec2 zoom_offset)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st *= zoom_scale;
    st += zoom_offset;
    // st = fract(st);  Must not get the fractional part before finding the indices of solution
    
    // st *= 3.0;
    // st = fract(st);
    // st *= 2.0;
    
    //  Index must be calculated before taking the fractional values of the
    //  pixels in the sapce.
    float index = 0.0;
    index += step(1.0, mod(st.x, 2.0));
    index += step(1.0, mod(st.y, 2.0)) * 2.0;

    st = fract(st);

    color = vec3(st, 0.0);
    // color = vec3(polygon(st, vec2(0.5), 3));
    // color = vec3(polygon(st, vec2(0.5), 3));

    //  Couldn't use switch statement because index is not signed or unsigned integer
    
    if (index == 0.0){
        color = vec3(truchet_triangle(st, 1.0, 1.0));
    }
    if (index == 1.0){
        color = vec3(polygon(st, vec2(0.5), 3));
    }
    else if (index == 2.0){
        color = vec3(polygon(st, vec2(0.5), 5));
    }
    else if(index == 3.0)
    {
        color = vec3(polygon(st, vec2(0.5), 6));
    }
    
    gl_FragColor = vec4(color, 1.0);
}

// -----------TILING REUSABLE FUNCTION--------------
//  Tiles the Pixel Space according to the zoom parameter 
vec2 tile(vec2 _st, float _zoom)
{
    _st *= _zoom;
    return fract(_st);
}


//------------------------------------------------


void main()
{
    //  Step to ensure that once mouse.x > 0.5, val is 1.0
    // draw_pattern_eg1(step(0.5, norm_mouse().x));

    // draw_pattern_eg1B(3, vec2(5.0, 0.0), step(0.5, norm_mouse().x));

    //  GIves a tile of 6 rows, 6 columns
    // draw_pattern_eg1C(vec2(6.0, 6.0), vec2(0.0, 0.0), step(0.5, norm_mouse().x));

    //  Gives a tile of 6 rows, 3 columns
    // draw_pattern_eg1C(vec2(3.0, 6.0), vec2(0.0, 0.0), step(0.5, norm_mouse().x));

    //  Fives a tile of 1 and half rows, and 1 and half columns
    // draw_pattern_eg1C(vec2(1.5, 1.5), vec2(0.0, 0.0), step(0.5, norm_mouse().x));

    draw_pattern_eg1D(vec2(6.0, 6.0), vec2(0.0, 0.0));
    
}