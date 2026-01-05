
#version 330 core

/**
    Date: Sunday 1 June, 2025
*/

/**
    Cellular Noise: Tiling and iterations

    This finds another method for generating the cellular textures without iterating
    over several points.
    It's goal is optimization utilizing the parallel processing prowess of the GPU

    NOTE
    Divide the space into tiles.
    This way, not every pixel needs to check the distance to every single Fixed Point.
    Rather, only the pixels in the same cell as that point needs to check the distance to it.
    More also, since each cell will have its own point, and each cell is unique, there is no
    need for a for loop to generate the Fixed Points; they can be generated using the unique properties
    of that cell, like its integer part.

    Since each pixel runs in its own thread, by subdividing the space into cells of a grid,
    with each cell having one unique point to watch, the cellular pattern can be gotten.

    Also, to avoid uncool artifacts between cells, the distances to the fixed points of the neighbouring
    cells from the current cell are calculated. This idea was from Steven Worley.

    This means each pixel of a cell only needs to check the distance to nine other fixed points instead
    of all the fixed points that exist --- that is, the distance from that cell's pixels from the fixed point
    of that cell and the distance of its pixels from the fixed points of the 8 cells surrounding it.

    Now, the integer coordinate is usede to construct a random position of a point. Now, since the random function
    is pseudo-random, it generates the same output given the same input value.

    Hence, each tile will have one Feature (or Fixed) Point in a random position, and each pixel within that
    tile will check its distance to that random point.
    Then the distance of each cell's pixels from the feature points of its 8 neighbouring cells will also be calculated.
    So the neighbor tiles will need to be iterated through,
    So from -1 (left) to 1 (right) in the tile's x-axis and likewise -1 to 1 (bottom to top) for the tile's y-axis 

    A 3x3 region of 9 tiles is iterated through in total and can be done using a double for loop like this:

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  neighbor place in the grid
            vec2 neighbor = vec2(float(x), float(y));
        }
    } 

    Author: @patriciogvTitle: CellularNoise for the first one

    But the subsequent were by me.
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

/**
    The OG implementation
        -   motion of cells points, no mouse-controlled cell.
*/
void CellularNoise_TileMethod_Impl1()
{
    vec2 st = gl_FragCoord.xy / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    //  scale
    st *= 3;

    //  Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1; //    minimum distance

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  Neighbor area location in the grid
            vec2 neighbor = vec2(float(x), float(y));

            //  Random position from current + neighbor area in the grid
            vec2 point = random2(i_st + neighbor);

            //  Animate the Point
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

            //  Vector between the pixel and the point
            //  f_st is the pixel coordinate for the current cell in the grid.
            vec2 diff = neighbor + point - f_st;

            //  Distance to the point
            float dist = length(diff);

            //  Keep the closer distance
            m_dist = min(m_dist, dist);
        }
    }

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

/**
    Expanded space
    Computed extra point with mouse position.
*/
void CellularNoise_TileMethod_Impl2()
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

    /**
        To add a generated Cell or the effect but with the mouse
        position as the center; first get the mouse position
        and get the integer part. Then...
    */
    vec2 mp = norm_mouse(u_mouse) * 5;
    vec2 i_mp = floor(mp);
    //vec2 f_mp = floor(mp);   //  Not needed

    //vec2 point = vec2(0.0);
    //vec2 diff = vec2(0.0);

    for (int y = -1; y <= 1; y++){
        for (int x = -1; x <= 1; x++){
            //  Neighbor area location in the grid
            vec2 neighbor = vec2(float(x), float(y));

            float dist = 1; //  minimum distance

            if (i_mp != i_st)
            {
                vec2 point = random2(i_st + neighbor);
    
                //  Animate the Point
                point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

                vec2 diff = neighbor + point - f_st;

                //  Distance to the point
                float dist = length(diff);

                //  Keep the closer distance
                m_dist = min(m_dist, dist);
            }
            else{
                vec2 mp_point = random2(i_mp + neighbor);
                mp_point = 0.5 + 0.5 * cos(u_time + 6.2831 * mp_point);
                vec2 mp_diff = neighbor + mp_point - f_st;
                if (int(neighbor.x) == 0 && int(neighbor.y) == 0){
                    vec2 mp_point = mp + neighbor;
                    vec2 mp_diff = fract(mp_point) - f_st;
                }
                float dist = length(mp_diff);
                //  Keep the closer distance
                m_dist = min(m_dist, dist);
            }
            m_dist = min(m_dist, dist);

        }
    }

    
    /**
    */


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

/**
    Successfully Added the mouse-controlled cellular pattern.

    Fix:
    The mouse's test is done outside the loop. No need to check the neighbors.
    The reason the neighbors were checked for the others is because of the space subdivision
    into grids. The neighbors were needed to fix it.
*/
void CellularNoise_TileMethod_Impl3()
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

    /**
        Scale mouse coords also.
    */
    vec2 mp = norm_mouse(u_mouse) * 5.0;
    //vec2 i_mp = floor(mp);

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

    gl_FragColor = vec4(col, 1.0);

}

void main()
{
    //CellularNoise_TileMethod_Impl1();
    CellularNoise_TileMethod_Impl2();   //  Didn't work
    CellularNoise_TileMethod_Impl3();
}