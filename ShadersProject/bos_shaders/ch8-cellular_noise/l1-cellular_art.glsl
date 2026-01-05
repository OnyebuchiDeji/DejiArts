
#version 330 core

/**
    Date: Sunday 1 June, 2025
*/

/**
    Cellular Noise

    It is a procedural texturing technique. It produces cellular-like textures/arts

    NOTES

    `For Loops` in glsl are unique in this:
    the conditions statement must check against a constant value. So the number
    of iterations must be fixed; no dynamic iterations.


    Cellular noise is based on distance fields; This distance is that from the current pixel
    to the closest Fixed Point of a set of Fixed Points that are randomly positioned.
    This minimum distance is used to determine the color of the pixel.


    Verbose Method:

    float min_dist = 100;   //  A variable to store the closest distance to a point

    min_dist = min(min_dist, distance(st, point_a));
    min_dist = min(min_dist, distance(st, point_b));
    min_dist = min(min_dist, distance(st, point_c));
    min_dist = min(min_dist, distance(st, point_d));
    col = vec3(min_dist);

    For Loop Method:

    float min_dist = 100; //    minimum distance
    for (int i=0; i < TOTAL_POINTS; i++){
        dloat dist = distance(st, points[i]);
        m_dist = min(m_dist, dist);
    }
    col = vec3(min_dist);
    

    Code by @patriciogv
    Title: 4 Cells DF
*/

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

void CellularNoise_Impl1()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);

    //  Cell positions
    vec2 points[5];
    points[0] = vec2(0.83, 0.75);
    points[1] = vec2(0.60, 0.07);
    points[2] = vec2(0.28, 0.64);
    points[3] = vec2(0.31, 0.26);
    // points[4] = u_mouse / u_resolution;
    points[4] = norm_mouse(u_mouse);
    
    float m_dist = 1;   //  minimum distance
    //  Iterate through the points
    for (int i=0; i<5; i++)
    {
        float dist = distance(st, points[i]);

        //  Keep the closer distance
        m_dist = min(m_dist, dist);
    }

    //  Draw the min distance (distance field)
    //  Note how it's += to prevent overwriting.
    col += m_dist;

    //  Show isolines
    //col -= step(0.7, abs(sin(50.0 * m_dist))) * 0.3;

    gl_FragColor = vec4(col, 1.0);
}

/**
    Create the 2d fixed points randomly.

    Create as many as you want with the last one with the mouse.
*/

float random(vec2 st)
{   
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

void CellularNoise_Impl2()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);

    vec2 seed = vec2(2109372.10938401, 91219982.923171);
    const int N = 20;
    vec2 points[N];
    float k1 = 84911038.21998019;
    float k2 = 77843762.93292971;

    //  Create the points randomly
    for (int i=0; i<N - 1; i++)
    {
        points[i] = vec2(random(seed + i * k1), random(seed + i * k2));
    }
    points[N-1] = norm_mouse(u_mouse);

    float m_dist = 1;   //  minimum distance

    //  Iterate through the points
    for (int i=0; i<N; i++)
    {
        float dist = distance(st, points[i]);

        //  Keep the closer distance
        m_dist = min(m_dist, dist);
    }

    //  Draw the min distance (distance field)
    //  Note how it's += to prevent overwriting.
    col += m_dist;

    //  Show isolines
    //col -= step(0.7, abs(sin(50.0 * m_dist))) * 0.3;

    gl_FragColor = vec4(col, 1.0);

}

void CellularNoise_Impl3()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);

    vec2 seed = vec2(2109372.10938401, 91219982.923171);
    const int N = 20;
    vec2 points[N];
    float k1 = 84911038.21998019;
    float k2 = 77843762.93292971;

    //  Create the points randomly
    for (int i=0; i<N - 1; i++)
    {
        points[i] = vec2(random(seed + i * k1), random(seed + i * k2));
    }
    points[N-1] = norm_mouse(u_mouse);

    float m_dist = 1;   //  minimum distance

    //  Iterate through the points and change their positions and size
    for (int i=0; i<N; i++)
    {
        float x = points[i].x;
        float y = points[i].y;

        //  Diagonal Motion
        //points[i].x = sin(u_time) * 0.05 + x;
        //points[i].y = sin(u_time) * 0.05 + y;

        //  Circular Motion
        //points[i].x = sin(u_time) * 0.05 + x;
        //points[i].y = cos(u_time) * 0.05 + y;
        
        //  Circular but each point changes properly
        //vec2 randDP = vec2(random(seed + i * 10 * k1 * k2),
        //                random(seed + i * 10 * k1 * k2));
        //points[i].x = sin(u_time) * randDP.x + x;
        //points[i].y = cos(u_time) * randDP.y + y;
        
        //  U-shaped motion path
        //vec2 randDP = vec2(random(seed + i * 10 * k1 * k2),
        //                random(seed + i * 10 * k1 * k2));
        //points[i].x = sin(u_time) * randDP.x + x;
        //points[i].y = cos(u_time) * cos(u_time) * randDP.y + y;


        //  Similar when you use just sin on both, but it is a shorter back and forth
        //  along the diagonal
        //vec2 randDP = vec2(random(seed + i * 10 * k1 * k2),
        //                random(seed + i * 10 * k1 * k2));
        //points[i].x = pow(sin(u_time),2) * randDP.x + x;
        //points[i].y = pow(cos(u_time), 2) * randDP.y + y;

        //  This is like the U motion; but it is triangular.
        vec2 randDP = vec2(random(seed + i * 10 * k1 * k2),
                    random(seed + i * 10 * k1 * k2));
        points[i].x = pow(sin(u_time),3) * randDP.x + x;
        points[i].y = pow(cos(u_time), 2) * randDP.y + y;
    }

    //  Iterate through the points
    for (int i=0; i<N; i++)
    {
        float dist = distance(st, points[i]);

        //  Keep the closer distance
        m_dist = min(m_dist, dist);
    }

    //  Draw the min distance (distance field)
    //  Note how it's += to prevent overwriting.
    col += m_dist;

    //  Show isolines
    //col -= step(0.7, abs(sin(50.0 * m_dist))) * 0.3;

    gl_FragColor = vec4(col, 1.0);

}

void main()
{
    // CellularNoise_Impl1();
    // CellularNoise_Impl2();
    CellularNoise_Impl3();
}
