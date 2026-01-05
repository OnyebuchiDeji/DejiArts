

/**
    Date: Sun-22-12-2024

    
    Combining Powers

    This uses polar coordinates, to use a specified number of edges for a polygon
    to construct the distances field for that polygon.

    Reference: 
        Andrew Baldwinl, http://thndl.com/square-shaped-shaders.html
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

vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);

    return nm;
}

//------------------------------------------------------------------------------

void combining_powers(int n)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);
    float d = 0.0;

    //  Remap space to -1.0 to 1.0
    st = st * 2.0 - 1.0;

    //  Number of Sides of Shape
    int N = n;

    //  Angle and radius from the current pixel
    float a = atan(st.x, st.y) + PI;
    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d = cos(floor(.5 + a/r) * r - a) * length(st);

    color = vec3(1.0 - smoothstep(.4, .41, d));

    //  color = vec3(d);

    gl_FragColor = vec4(color, 1.0);
}

void combining_powers_v2(vec2 pos, int n)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.0);
    float d = 0.0;

    //  Remap space to -1.0 to 1.0
    st = st * 2.0 - 1.0;

    //  Number of Sides of Shape
    int N = n;

    //  Angle and radius from the current pixel
    float a = atan(pos.x - st.x, pos.y - st.y) + PI;
    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d =cos(floor(.5 + a/r) * r - a) * length(st);
    // d = cos(floor(.5 + a/r) * r - a) * length(pos);

    color = vec3(1.0 - smoothstep(.4, .41, d));

    // color = vec3(d);

    gl_FragColor = vec4(color, 1.0);
}


void combining_powers_v3(vec2 pos, int n)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;


    vec3 color = vec3(0.0);
    float d = 0.0;

    //  Remap space to -1.0 to 1.0
    // st = st * 2.0 - 1.0;
    float x_diff = (pos.x - 0.5) + 1.0;
    float y_diff = (pos.y - 0.5) + 1.0;
    st.x = st.x * 2.0 - x_diff;
    st.y = st.y * 2.0 - y_diff;

    //  Number of Sides of Shape
    int N = n;

    //  Angle and radius from the current pixel
    float a = atan(st.x, st.y) +  PI;
    //     This made some wiggly animations when used with the mouse
    // float a = atan(st.x, st.y) + distance(st, pos);

    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d = cos(floor(0.5 + a/r) * r - a) * length(st);


    color = vec3(1.0 - smoothstep(.4, .41, d));

    // color = vec3(d);

    gl_FragColor = vec4(color, 1.0);
}



void combining_powers_v4(vec2 pos, int n)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;


    vec3 color = vec3(0.0);
    float d = 0.0;

    //  Remap space to -1.0 to 1.0
    // st = st * 2.0 - 1.0;
    float x_diff = (pos.x - 0.5) + 1.0;
    float y_diff = (pos.y - 0.5) + 1.0;
    st.x = st.x * 2.0 - x_diff;
    st.y = st.y * 2.0 - y_diff;

    //  Number of Sides of Shape
    int N = n;

    //  Angle and radius from the current pixel
    float a = atan(st.x, st.y) +  PI;

    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    //  OG:
    // d = cos(floor(0.5 + a/r) * r - a) * length(st);


    // d = min(cos(floor(0.5 + a/r) * r - a) * length(st), sin(floor(0.5 + a/r) * r - a) * length(st));


    //  Shuriken?
    // d = max(cos(floor(0.5 + a/r) * r - a) * length(st), sin(floor(0.5 + a/r) * r - a) * length(st));


    //  three legged triangle
    // d = min(cos(floor(0.5 + a/r) * r - a) * length(st), sin(pow(floor(0.5 + a/r) * r - a, 0.5)) * length(st));
    //  Another shuriken
    // d = max(cos(floor(0.5 + a/r) * r - a) * length(st), sin(pow(floor(0.5 + a/r) * r - a, 0.5)) * length(st));


    // float k1 = cos(floor(0.5 + a/r) * r - a);
    // float k2 = sin(pow(floor(0.5 + a/r) * r - a, 1.5));
    //  Cool Triangular logo
    // d = max(k1 * length(st), k2 * length(st));
    //  Like above, but sides are to infinity.
    // d = min(k1 * length(st), k2 * length(st));

    float k1 = cos(floor(0.5 + a/r) * r - a);
    float k2 = sin(pow(floor(0.5 + a/r) * r - a, 0.5)); //  Shuriken Triangles
    // d = min(k1 * length(st), k2 * length(st));

    //  Another Triangular Logo
    // k1 = cos(pow(floor(0.5 + a/r) * r - a, 2));
    // k2 = sin(pow(floor(0.5 + a/r) * r - a, 0.5));
    // d = max(k1 * length(st), k2 * length(st));

    //  Another Triangular Logo 2
    // k1 = cos(pow(floor(0.5 + a/r) * r - a, 2));
    // k2 = sin(pow(floor(0.5 + a/r) * r - a, 2));
    // d = max(k1 * length(st), k2 * length(st));

    //  Like Above
    // k1 = cos(pow(floor(0.5 + a/r) * r - a, 1.5));
    // k2 = sin(pow(floor(0.5 + a/r) * r - a, 1.5));
    // d = max(k1 * length(st), k2 * length(st));
    // d = min(k1 * length(st), k2 * length(st));   //  this is
    // d = min(k2 * length(st), k1 * length(st));   //  same as this.

    /**
        The flower series -- clovers and more
    */
    // k1 = cos(pow(floor(0.5 + a/r) * r - a, 1.5));
    // k1 = pow(cos(floor(0.5 + a/r) * r - a), -1.5);
    // k2 = pow(sin(floor(0.5 + a/r) * r - a), -1.5);
    k1 = pow(cos(floor(0.5 + a/r) * r - a), 4.5);
    k2 = pow(sin(floor(0.5 + a/r) * r - a), 4.5);
    // d = k1 * length(st);
    // d = k2 * length(st);
    // d = (k2 * k1) * length(st) ;
    // d = (k2 * k1) * length(st) ;
    d = min(k1 * length(st), k2 * length(st));
    // d = max(k1 * length(st), k2 * length(st));


    // k1 = pow(cos(floor(0.5 + a/r) * r - a), 4.5);
    // k2 = pow(sin(floor(0.5 + a/r) * r - a), 4.5);
    // // d = min(k1 * length(st), k2 * length(st));
    // d = max(k1 * length(st), k2 * length(st)) * 4.5;



    //  OG2
    // r = TWO_PI / float(N + 2);
    // d = min(cos(floor(0.5 + a/r) * r - a) * length(st), sin(floor(0.5 + a/r) * r - a) * length(st));
    // d = max(cos(floor(0.5 + a/r) * r - a) * length(st), sin(floor(0.5 + a/r) * r - a) * length(st));


    color = vec3(1.0 - smoothstep(.4, .41, d));

    // color = vec3(d);

    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    // polar_shapes(100);

    // combining_powers(3);
    //  Some Peach
    // combining_powers_v2(vec2(0.3, 0.5), 3);
    vec2 nm = norm_mouse();
    combining_powers_v3(vec2(nm.x, nm.y), 3);
    // combining_powers_v3(vec2(nm.x, nm.y), 4);
    // combining_powers_v3(vec2(nm.x, nm.y), 5);
}