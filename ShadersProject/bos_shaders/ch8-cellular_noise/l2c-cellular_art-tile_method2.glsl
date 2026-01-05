/**
    Date: Monday 2 June, 2025

    Cellular Noise: Tiling and iterations

    This version inverts the structure, using max instead of min to change
    the pattern of the cells (the texture itself not grid cells.)

    Author: Ebenezer
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

vec2 random2(vec2 p)
{
    return fract(
        sin(
            vec2(dot(p, vec2(127.1, 311.7)),
            dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}



void CellularNoise_TileMethod2_Impl1()
{
    vec2 st = gl_FragCoord.xy / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    //  scale
    st *= 5;

    //  Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1; //    minimum distance

    //  Scale mouse coords also.
    vec2 mp = norm_mouse(u_mouse) * 5.0;

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  Neighbor area location in the grid
            vec2 neighbor = vec2(float(x), float(y));

            vec2 point = random2(i_st + neighbor);

            //  Animate the Point
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

            vec2 diff = neighbor + point - f_st;

            //  Distance to the point
            float dist = length(diff);

            //  Keep the closer distance
            m_dist = min(1.0 - m_dist, dist);
        }
    }

    vec2 mp_diff = mp - st;

    float mp_dist = length(mp_diff);

    m_dist = max(m_dist, mp_dist);


    //  Draw the min distance (distance field)
    col += m_dist;

    //  Draw cell center
    col += 1.0 - step(.02, m_dist);

    //  Draw Grid
    //col.r += step(.98, f_st.x) + step(.98, f_st.y);

    //  Show isolines?
    //col -= step(.7, abs(sin(27.0 * m_dist))) * 0.5;

    gl_FragColor = vec4(col, 1.0);

}
void CellularNoise_TileMethod2_Impl2()
{
    vec2 st = gl_FragCoord.xy / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    //  scale
    st *= 5;

    //  Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1; //    minimum distance

    //  Scale mouse coords also.
    vec2 mp = norm_mouse(u_mouse) * 5.0;

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  Neighbor area location in the grid
            vec2 neighbor = vec2(float(x), float(y));

            vec2 point = random2(i_st + neighbor);

            //  Animate the Point
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

            vec2 diff = neighbor + point - f_st;

            //  Distance to the point
            float dist = length(diff);

            //  Keep the closer distance
            m_dist = min(m_dist, dist);
        }
    }

    vec2 mp_diff = mp - st;

    float mp_dist = length(mp_diff);

    m_dist = max(m_dist, mp_dist);


    //  Draw the min distance (distance field)
    col += m_dist;

    //  Draw cell center
    col += 1.0 - step(.02, m_dist);

    //  Draw Grid
    //col.r += step(.98, f_st.x) + step(.98, f_st.y);

    //  Show isolines?
    //col -= step(.7, abs(sin(27.0 * m_dist))) * 0.5;

    gl_FragColor = vec4(col, 1.0);
}

void CellularNoise_TileMethod2_Impl3()
{
    vec2 st = gl_FragCoord.xy / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    //  scale
    st *= 5;

    //  Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1; //    minimum distance

    //  Scale mouse coords also.
    vec2 mp = norm_mouse(u_mouse) * 5.0;

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  Neighbor area location in the grid
            vec2 neighbor = vec2(float(x), float(y));

            vec2 point = random2(i_st + neighbor);

            //  Animate the Point
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

            vec2 diff = neighbor + point - f_st;

            //  Distance to the point
            float dist = length(diff);

            //  Keep the closer distance
            m_dist = min(m_dist, dist);
        }
    }

    vec2 mp_diff = mp - st;

    float mp_dist = length(mp_diff);

    m_dist = min(m_dist, mp_dist);


    //  Draw the min distance (distance field)
    col += m_dist;

    //  Draw cell center
    col += 1.0 - step(.02, m_dist);

    //  Draw Grid
    //col.r += step(.98, f_st.x) + step(.98, f_st.y);

    //  Show isolines?
    //col -= step(.7, abs(sin(27.0 * m_dist))) * 0.5;

    gl_FragColor = vec4(1.0 - col, 1.0);
}

void CellularNoise_TileMethod2_Impl4()
{
    vec2 st = gl_FragCoord.xy / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    //  scale
    st *= 5;

    //  Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1; //    minimum distance

    //  Scale mouse coords also.
    vec2 mp = norm_mouse(u_mouse) * 5.0;

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  Neighbor area location in the grid
            vec2 neighbor = vec2(float(x), float(y));

            vec2 point = random2(i_st + neighbor);

            //  Animate the Point
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

            vec2 diff = neighbor + point - f_st;

            //  Distance to the point
            float dist = length(diff);

            //  Keep the closer distance
            m_dist = min(m_dist, dist);
        }
    }

    vec2 mp_diff = mp - st;

    float mp_dist = length(mp_diff);

    m_dist = max(m_dist, mp_dist);


    //  Draw the min distance (distance field)
    col += m_dist;

    //  Draw cell center
    col += 1.0 - step(.02, m_dist);

    //  Draw Grid
    //col.r += step(.98, f_st.x) + step(.98, f_st.y);

    //  Show isolines?
    //col -= step(.7, abs(sin(27.0 * m_dist))) * 0.5;

    gl_FragColor = vec4(1.0 - col, 1.0);
}

void main()
{
    //CellularNoise_TileMethod2_Impl1();  //  Check it out
    CellularNoise_TileMethod2_Impl2();  //  Cooler. Inverted (not color), but with max not min for m_dist
    CellularNoise_TileMethod2_Impl3();  //  The normal version but inverted color.
    CellularNoise_TileMethod2_Impl4();  //  The inverted using max, but also color inverted.
}