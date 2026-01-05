#version 330 core



uniform vec2 u_resolution;
uniform vec2 u_mouse;


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

//  ---------------------------------------------------------------


/**
    Shapes: Drawing Rectangles

    This uses the floor() function to draw the rectangles
*/

/**
    This version just displays the rectangle
    using the floor function based on the width and height

    Basically, what I want is that
    if the pixel's position falls
    within the square's area, the pixel should be white.

    But I need to do this without an if statement; it has to be
    done with the floor() function.

    Floor will return the nearest integer less than or equal to the value
*/
void draw_rectangle_floor_v1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);
    float w = 0.6;
    float h = 0.6;


    /**
        Explanation:
            Basically, the limits are a result of the width and height.
            screen_x_lim = screem_y_lim = screen_lim = 1.0

            Floor will give the nearest integer less than or equal to the value...
            So this is how I use it:
            if w = 0.6, and h = 0.6
            x_lim and y_lim = 0.2

            However, if the center of the rectangle is moved...
            the x_lim for the bottom-left is different from that
            of the top-right.
            This is implemented in version2

            For Bottom Left
            for a pixel P where P = 0.1, 0.1...
            if d1 = P.x - x_lim = 0.1 - 0.2 = -0.1
            floor(d1 + screen_lim) = floor(-0.1 + 1.0) = floor(0.9) = 0
            The same for P.y...

            For Top Right, the x_lim still applies by doing 1.0 - val
            Now when P = 0.9, 0.9
            d1P.x = 1 - P.x = 0.1...
            d1 = d1P.x - x_lim = 0.1 - 0.2 = -0.1 
            floor(d1 + screen_lim) = floor(0.9) = 0

    */
    vec2 center = vec2(0.5);
    vec2 bl = vec2(0.0);
    //  Added 0.2 for them both
    // float x_lim = 0.2;
    // float y_lim = 0.2;
    //  So depending on the width and height
    float x_lim = (1.0 - w) * 0.5;
    float y_lim = (1.0 - h) * 0.5;
    bl.x = floor((st.x - x_lim) + 1.0);
    bl.y = floor((st.y - y_lim) + 1.0);
    vec2 tr = vec2(0.0);
    tr.x = floor(((1.0 - st.x) - x_lim) + 1.0);
    tr.y = floor(((1.0 - st.y) - y_lim) + 1.0);

    float pct = bl.x * bl.y * tr.x * tr.y;
    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);
}

/**
    Thos version adds functionality to move the rectangle
*/
void draw_rectangle_floor_v2(float x, float y, float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);


    vec2 center = vec2(0.5);
    vec2 bl = vec2(0.0);
    
    float pos_diff_x = 0.5 - x;
    float pos_diff_y = 0.5 - y;
    float x_lim_bl = (1.0 - w) * 0.5 - pos_diff_x;
    float y_lim_bl = (1.0 - h) * 0.5 - pos_diff_y;

    bl.x = floor((st.x - x_lim_bl) + 1.0);
    bl.y = floor((st.y - y_lim_bl) + 1.0);

    float x_lim_tr = (1.0 - w) * 0.5 + pos_diff_x;
    float y_lim_tr = (1.0 - h) * 0.5 + pos_diff_y;
    vec2 tr = vec2(0.0);
    tr.x = floor(((1.0 - st.x) - x_lim_tr) + 1.0);
    tr.y = floor(((1.0 - st.y) - y_lim_tr) + 1.0);

    float pct = bl.x * bl.y * tr.x * tr.y;
    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);
}



void main()
{
    // draw_rectangle_floor_v1();
    // draw_rectangle_floor_v2(0.4, 0.5, 0.6, 0.6);
    // draw_rectangle_floor_v2(0.4, 0.4, 0.6, 0.6);
    vec2 nm = norm_mouse(); 
    draw_rectangle_floor_v2(nm.x, nm.y, 0.6, 0.6);
}