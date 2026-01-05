#version 330 core

/**
    Date: Fri-27-Dec-2024

    Chapter 6: Generative Designs; The use of Random

    Next Chapter: Noise
    This is better than ordinary use of random, adding correlation and thus natural aesthetics
    to the random values generated, as Noise stores memory of the previous state.

    Hence noise is a smooth and natural-looking way of creating computational chaos.
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



//---------------------------------------------------/

/**
    Date: Friday 27 December 2024

    Generative Designs

    They leverage the concept of Randomness.

    Randomness is a maximal expression of entropy, and the key lies in generating it.

    Consider:
        `y = fract(sin(x) * 1.0);`
    This formula extracts the fractional content of a sine wave.
    The sin() values that fluctuate between -1.0 and 1.0 have been chopped behind the floating point
    (only the fractional values are taken, including no signs), returning all positive values between 
    but not including 0.0 and 1.0 (0..1).
    This effect can be used to get 'pseudo-random' values because it breaks the sine wave into smaller
    pieces.
    The larger the number the resultant of sin(x) multiplies, the more pseudo-random pieces are generated.

    So make this:
        `y = fract(sin(x) * 100'000);`
    Doing this breaks the sine() wave up so much that it cannot be distinguished anymore; this results
    from the granularity of the fractional part which corrupts the flow of the sine wave into pseudo-random
    chaos.
*/

/**
    Controlling Chaos

    Two issues with using 'random':
        +   Can be too chaotic.
        +   Sometimes not random enough 
    
    Hence, the author explains, a 'rand()' function is implemented exactly as what
    is described above.

    If the graph od it is looked at, you will see the sin() wave's crest at -1.5707 and 1.5707
    which are where the maximum and minimum of the sine wave occur.

    Also, considering the random distribution, one would not that there is more concentration
    around the wave's middle compared to edges.

    Now also consider these:
        y = rand(x);
        y = rand(x) * rand(x);
        y = sqrt(rand(x));
        y = pow(rand(x), 5.);
    
    Now, this 'rand()' function is deterministic random, also called pseudo-random.
    This means, for example, rand(1.0) is always going to return the same value.

    but the ActionScript function Math.random() is non-deterministic; every call returns a different
    value.
*/

/**
    2D Random

    This is applying randomness in two dimensions, on the x and y axes.
    This requires transforming a 2D vector into a 1D floating point value.

    The dot() function is prevalently used in this case; it returns a single float
    value between 0.0 and 1.0 depending on the alignment of two vectors.

    Consider the Below Code:
*/
//  Author @patriciogv - 2015
//  http://patriciogonzalezvivo.com

float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

void noise_eg1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float rnd = random(st);
    gl_FragColor = vec4(vec3(rnd), 1.0);
}

//  Hooked to time value
void noise_eg2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float rnd = random(st*(u_time));
    gl_FragColor = vec4(vec3(rnd), 1.0);
}

/**
    From hooking it with the mouse position...
    The noise changes... I ken how it works; of course, the
    higher the value the more the output becomes random
*/
void noise_eg3()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float rnd = random(st*norm_mouse());
    gl_FragColor = vec4(vec3(rnd), 1.0);
}

void noise_eg4()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float rnd = random(st*vec2(norm_mouse()));
    gl_FragColor = vec4(vec3(rnd), 1.0);
}

//-------------------------------------------------

/**
    Using the Chaos

    Random in two dimensions looks very much like TV noise.
    It's a cool raw material to make any image. 

    Firstly, apply a grid to the image; by using the 'floor()' function
    an integer table of cells will be generated.

    Consider the code below
*/

void random_grid_image_eg1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    st *= 10.0; //  Scale the coordinate system by 10.0
    vec2 ipos = floor(st);  //  get the integer coords
    vec2 fpos = fract(st);  //  get the fractional coords

    //  Assign a random value based on the integer coorrd
    vec3 color = vec3(random(ipos));
    
    /**
        When the fpos is used, it generates the same random noise as in the previous
        examples. This is most likely because of how the fractional part changes
        depending on the pixel position.
        But the integer part is common for a region of pixels -- specifically the pixel region
        of a single cell of the grid.
        Hence the common integer is used to get the random value for that area.
        Now, because the random function used here is deterministic,the random value returned
        will be constant (same) for all the pixels in that cell.
        Such deterministic random functions are good when you want to always generate
        a specific pattern of grid-cell colors.
    */
    // vec3 color = vec3(random(fpos));

    //  Uncomment to see the subdivided grid
    /**
        Notice how this floating-point part of the coordinate system is preserved so that
        it is still possible to draw insife each cell.
    */
    // color = vec3(fpos, 0.0);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Combining the two values --- the integer part and fractional parts of the coordinate --- allow
    one to mix variation and order.

    Consider this GLSL port of the famous maze generating code:
        `
            10 PRINT CHR$(205.5+RND(1)); :GOTO 10
        ` 
*/
vec2 truchet_pattern(in vec2 _st, in float _index)
{

    _index = fract(((_index-0.5) * 2.0));
    if (_index > 0.75){
        _st = vec2(1.0) - _st;
    }
    else if (_index > 0.5){
        _st = vec2(1.0 - _st.x, _st.y);
    }
    else if (_index > 0.25){
        _st = vec2(1.0) - vec2(1.0 - _st.x, _st.y);
    }
    return _st;
}

void truchet_maze()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 10.0;
    //  st = (st - vec2(5.0)) * (abs(sin(u_time*0.2)) * 5.0);
    //  st.x += u_time * 3.0;

    vec2 ipos = floor(st);  //  integer
    vec2 fpos = fract(st);  //  fraction

    vec2 tile = truchet_pattern(fpos, random(ipos));

    float color = 0.0;

    //  Maze
    color = smoothstep(tile.x - 0.3,tile.x, tile.y) - smoothstep(tile.x, tile.x + 0.3, tile.y);

    //  Circles
    // color = (step(length(tile), 0.6) - step(length(tile), 0.4)) +
    //                         (step(length(tile - vec2(1.0)), 0.6) -
    //                         step(length(tile-vec2(1.0)), 0.4));

    //  Trucher (2 Triangles)
    // color = step(tile.x, tile.y);

    gl_FragColor = vec4(vec3(color), 1.0);
}
void truchet_maze_v2(float offset, int mode)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 10.0;
    // st = (st - vec2(5.0)) * (abs(sin(u_time*0.2)) * 5.0);
    // st.x += u_time * 3.0;

    vec2 ipos = floor(st);  //  integer
    vec2 fpos = fract(st);  //  fraction

    vec2 tile = truchet_pattern(fpos, random(ipos));

    float color = 0.0;

    if (mode == 0){
        //  Maze
        //  This uses the random values of the cells to draw a line in one direction or the other
        color = smoothstep(tile.x - offset,tile.x, tile.y) - smoothstep(tile.x, tile.x + offset, tile.y);
    }
    else if(mode == 1)
    {
        //  Circles
        float val = offset;
        float neg_val = 1 - offset;
        color = (step(length(tile), neg_val) - step(length(tile), val)) +
                                (step(length(tile - vec2(1.0)), neg_val) -
                                step(length(tile-vec2(1.0)), val));
    }
    else if (mode == 2)
    {
        //  Trucher (2 Triangles)
        /**
            This is the easiest way to create the Truchet (Double) Triangles
        */
        color = step(tile.x, tile.y);
    }
    gl_FragColor = vec4(vec3(color), 1.0);
}


void main()
{
    // noise_eg1();
    // noise_eg2();
    // noise_eg3();
    // noise_eg4();
    // random_grid_image_eg1();
    // truchet_maze();
    truchet_maze_v2(norm_mouse().x, 1);
}
