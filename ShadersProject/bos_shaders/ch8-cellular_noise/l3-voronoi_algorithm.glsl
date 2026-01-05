/**
    Date: Monday 2nd June, 2025

    Cellular Noise: Voronoi Algorithm


    Before Note:
    The cellular noise algorithm can be interpreted from the perspective of the points and not the pixels.
    It can be described as:
        each point grows until it finds the growing area from another point.
        This mirrors some of the growth rules in nature.
    This is because living forms are shaped by the tension between an inner force to expand and grow,
    and an external limiting force.

    The algorithm that simulates this behavior, the Voronoi Algorithm, is named after Georgy Voronoi.


    Voroi Algorithm Note:

    Voronoi Algorithm consists of the Cellular Noise algorithm. The extra part in Voronoi is that
    extra information about the exact point that is the closest to the current pixel is kept.

    By storing this vector direction to the center of the closest point from the current pixel, one keeps
    a unique identifier of that point.

    //  Author: @patriciogv
    //  Title: 4 cells voronoi
*/

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

/**
    Fixed mouse normalization so that mapping of mouse position between 0 and 1 is linear.
    Now it gives the exact position of mouse between 0 and 1, according to how the position
    corresponds to the width and height of the screen.
*/
vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(mix(0.0, 1.0, og_mouse_coord.x / u_resolution.x), mix(0.0, 1.0, mouse_y / u_resolution.y));
    return nm;
}

vec2 random2(vec2 p)
{
    return fract(
        sin(
            vec2(dot(p, vec2(127.1, 311.7)),
            dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}


/**
    Voronoi Algorithm is exactly cellular noise.
    Addition is that it keeps the coordinate of the feature point and uses
    the vector to get a color.
*/
void VoronoiAlgo_Impl1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);

    //  Cell positions
    vec2 points[5];
    points[0] = vec2(0.83, 0.75);
    points[1] = vec2(0.60, 0.07);
    points[2] = vec2(0.28, 0.64);
    points[3] = vec2(0.31, 0.26);
    points[4] = norm_mouse(u_mouse);

    float m_dist = 1;   //  minimum distance
    vec2 m_point;       //  minimum position

    //  Iterate through the points
    for (int i = 0; i < 5; i++){
        float dist = distance(st, points[i]);

        if (dist < m_dist){
            //  Keep the closer distance
            m_dist = dist;

            //  Keep the position of the closer point
            m_point = points[i];
        }
    }

    //  Add distance field to closest point center
    col += m_dist * 2.0;

    //  tint according to the closest point position
    col.rg = m_point;

    //  Show isolines?
    col -= abs(sin(80.0 * m_dist)) * 0.07;

    //  Draw point center
    col += 1.0 - step(0.02, m_dist);

    gl_FragColor = vec4(col, 1.0);
}

void main()
{
    VoronoiAlgo_Impl1();
}