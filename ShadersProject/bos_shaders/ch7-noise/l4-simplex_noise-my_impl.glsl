
#version 330 core

/**
    Date: Sundat 1 June, 2025
*/

/**
    Improved Noise. This only shows the grid.

    An improvement to Perlin's orgin non-simplex noise is
    the Simplex Noise.

    It replaces the cubic Hermite Curve 
    f(x) = 3x^ 2 - 2x^ 3, which is identical with smoothstep,
    with a quintic interpolation curve:
        f(x) = 6x^5 - 15x^4 + 10x^3
    It makes both ends of the curve more 'flat'
    so connections between borders are smoother.
    So better transition between gradient cells.

    Conside the formulas
*/
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;


float cubic_interpolation(float x)
{
    float y = x * x * (3.0 - 2.0*x);
    return y;
}

float quintic_interpoaltion(float x)
{
    float y = x*x*x * (x * (x * 6.0 - 15.0) + 10.0);
    return y;
}


/**
    Simplex Noise

    Benefits:
        An algoo with lower compuational complexity and better performance
        Noise that scales to higher dimensions with less computationalcost
        Noise without directional artifacts
        Noise with well-defined and continuous gradients that
        can be computad quite cheaply
        An algo easy to implement on hardware.
    
    How he improved the algorithm:

    Before, for two dimensions, he was interpolating 4 points (corners of a square)
    This means for three and four dimensions one will interpolate 8 and 16 points respectively.

    So for N dimensions, one would need to smoothly interpolate 2^N points.

    But Ken Perlin realized to use the simples 2D shape, the equilateral triangle instead
    of a square.

    Hence he replaces the squared grid (which we've been using) with a grid of equilateral triangles
    called a Simplex grid.

    The simplex shape for N dimensions is a shaoe with N + 1 corners.
    So 1 fewer corners are left to compute in 2D.
    And 4 fewer corners to compute in 4D. It's a huge improvement.

    In two dimensions, the interpolation happens like with regular noise,
    by interpolating the values of the corners of a section.
    But in this case, using a simplex grid, only 3 corners need to be interpolated through.

    How the Simplex Grid is made:
    It is made by subdividing the cells of a regular 4-cornered grid into two isosceles triangles
    and then skewing it until each triangle is equilateral.

    Note! Skew! It stretches the space of isosceles to make them equilateral. Cool! 

    Then by looking at the integer parts of the transformed coordinates (x, y) for the point
    to be evaluated, one can quickly determine which cell of two Simplices that contains the point.
    Also, by comparing the magnitudes of X and Y, one can determine whether the point is in the 
    upper or the lower simplex, and traverse the correct three corner points.
*/

float random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    
    return -1.0 + 2.0 * fract( sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( random2( i + vec2(0.0,0.0) ), 
                     random2( i + vec2(1.0,0.0) ), u.x),
                mix( random2( i + vec2(0.0,1.0) ), 
                     random2( i + vec2(1.0,1.0) ), u.x), u.y);
}


vec2 skew(vec2 st)
{
    vec2 r = vec2(0.0);
    r.x = 1.1547 * st.x;
    r.y = st.y + 0.5*r.x;
    return r;
}

/**
*   Dividing square grid into an equilateral triangle grid.
*/
vec3 simplexGrid(vec2 st)
{
    vec3 xyz = vec3(0.0);

    //  Skew the grid first
    vec2 p = fract(skew(st));
    /**
    *   First, is the x value greater than y.
    *   the `p.y - p.x` represents the inverse relationship between y and x.
    *   it forms the diagonal. This is for the lower triangle.
    *   Then similar is done for y > x, for the upper triangle.
    *   It forms the square divided by the diagonal into an isosceles.
    */
    if (p.x > p.y){
        xyz.xy = 1.0 - vec2(p.x, p.y-p.x);
    }else {
        xyz.yx = 1.0 - vec2(p.x - p.y, p.y);
        xyz.x = p.x;
    }
    return fract(xyz);
}

void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 col = vec3(0.0);

    //  Scale the space to see the grid
    st *= 10.0;

    //  Show the 2D grid
    //col.rg = fract(st);

    //  Show the skewed grid
    //col.rg = fract(skew(st));

    //  Subdivide the grid into equilateral triangles
    vec3 pos = simplexGrid(st);

    col = vec3( noise(pos.xy)*.5+.5 );

    gl_FragColor = vec4(col, 1.0);
}