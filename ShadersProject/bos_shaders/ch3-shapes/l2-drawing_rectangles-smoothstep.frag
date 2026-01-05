/**
    Date: Thurs-19-Dec-2024

    Demonstrates drawing rectangles but adding function
    to change the wdth and height as well as move the rectangles 

    Also added functionality that blurs edges of the rectangle.
    This is used to make the smooth edges on the sides.
*/



void draw_rectangle(float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    /**
        Intuitive enough to not need to explain.
        The width would specify how thick the bottom and left
        and top and right borders will be.
        This value will determine the threshold.
        When w_fct and h_fct were 0.1, 0.1...
        w and h were 0.8, 0.8.
        w = 1 - w_fct * 2 = 1 - 0.1 * 2
        h = 1 - h_fct * 2 = 1 - 0.1 * 2
    */
    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;

    vec2 bl = vec2(0.0);
    bl.x = step(w_fct, st.x);
    bl.y = step(h_fct, st.y);

    vec2 tr = vec2(0.0);
    tr.x = step(w_fct, 1.0 - st.x);
    tr.y = step(h_fct, 1.0 - st.y);

    float pct = bl.x * bl.y * tr.x * tr.y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}

//  Added X and Y coordinates within 0 and 1
void draw_rectangle_v2(float x, float y, float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;

    /**
        For x_fct and y_fct...
        Their displacement from center 0.5, 0.5 is calculated.
        E.g.:
        If x = 0.4, d = 0.5-0.4
        x_fct = d * 0.5.
        the left border limit is reduced by x_fct
        the right border limit is increased by x_fct
        to make the rectangle move to the left by 0.1.

    */
    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    vec2 bl = vec2(0.0);
    bl.x = step(w_fct - x_fct, st.x);
    bl.y = step(h_fct - y_fct, st.y);

    vec2 tr = vec2(0.0);
    tr.x = step(w_fct + x_fct, 1.0 - st.x);
    tr.y = step(h_fct + y_fct, 1.0 - st.y);

    float pct = bl.x * bl.y * tr.x * tr.y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}

/**
    This implementation uses smoothstep.
    The effect are blurred edges and smooth borders
    depending on the values.

    The implementation here was not correct.
    It is fixed in version2

    The issue here is the upper limit of the smoothstep that
    defines the borders
    This upper limit is meant to be equal to the width - border_width
    for the x values, and the height - border_height for y values.

*/
void draw_rectangle_smooth(float x, float y, float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;


    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    vec2 bl = vec2(0.0);
    bl.x = smoothstep(w_fct - x_fct, 1.0, st.x);
    bl.y = smoothstep(h_fct - y_fct, 1.0, st.y);

    vec2 tr = vec2(0.0);
    tr.x = smoothstep(w_fct + x_fct, 1.0, 1.0 - st.x);
    tr.y = smoothstep(h_fct + y_fct, 1.0, 1.0 - st.y);

    // float pct = smoothstep(0, 1, bl.x * bl.y * tr.x * tr.y);
    // float pct = smoothstep(0, 2, bl.x * bl.y + tr.x * tr.y);
    // float pct = smoothstep(0, 0.1, bl.x * bl.y * tr.x * tr.y);
    float pct_bl_x = smoothstep(0, 0.21, bl.x);
    float pct_bl_y = smoothstep(0, 0.21, bl.y);
    float pct_tr_x = smoothstep(0, 0.21, tr.x);
    float pct_tr_y = smoothstep(0, 0.21, tr.y);
    // float pct = smoothstep(0, 0.42, pct_bl * pct_tr);
    float pct = pct_bl_x * pct_bl_y * pct_tr_x * pct_tr_y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}
/**
    This tests affecting the borders

    It shows the fix to the code that defines the borders.
    
    After fixing this, the next part worked:
        float pct_bl_x = smoothstep(0, 0.21, bl.x);
        float pct_bl_y = smoothstep(0, 0.21, bl.y);
        float pct_tr_x = smoothstep(0, 0.21, tr.x);
        float pct_tr_y = smoothstep(0, 0.21, tr.y);

    with this, the edge blurs could be correctly defined.
*/
void draw_rectangle_smooth_v2(float x, float y, float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;


    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    float x_lim = w - w_fct;
    float y_lim = h - h_fct;

    // float x_lim = 0.8;
    // float y_lim = 0.8;

    /**
        When the upper limits are set to 1.0, the display
        by float pct = bl.x * bl.y * tr.x * tr.y;
        is black because all the values are lower than 1.0.
        So when multiplied they become smaller...

        But when x_lim and y_lim are defined as above.
        if w = 0.6 and h = 0.6, w_fct = 0.2 and h_fct = 0.2
        x_lim = y_lim = 0.4
        So for any pixel P for bl where bl.x > x_lim and bl.y > y_lim, it returns 1.0
        and for that same pixel, where tr.x (1 - P.x) > x_lim and tr.y (1 - P.x) > y_lim
        it returns 1.0.

        When pct = bl.x * bl.y * tr.x * tr.y is multiplied, it gives 1.0
        This is why when the above is done for pct here, like this:
                float pct = bl.x * bl.y * tr.x * tr.y;
        toward the center, the square is white... because toward the center
        bot bl and tr become > 0.4.

    */
    // float x_lim = 1;
    // float y_lim = 1;

    vec2 bl = vec2(0.0);
    bl.x = smoothstep(w_fct - x_fct, x_lim, st.x);
    bl.y = smoothstep(h_fct - y_fct, y_lim, st.y);


    vec2 tr = vec2(0.0);
    tr.x = smoothstep(w_fct + x_fct, x_lim, 1.0 - st.x);
    tr.y = smoothstep(h_fct + y_fct, y_lim, 1.0 - st.y);

    // float pct = smoothstep(0, 1, bl.x * bl.y * tr.x * tr.y);
    // float pct = smoothstep(0, 2, bl.x * bl.y + tr.x * tr.y);
    // float pct = smoothstep(0, 0.1, bl.x * bl.y * tr.x * tr.y);

    //  IMPL_P2
    // float pct_bl_x = smoothstep(0, 0.21, bl.x);
    // float pct_bl_y = smoothstep(0, 0.21, bl.y);
    // float pct_tr_x = smoothstep(0, 0.21, tr.x);
    // float pct_tr_y = smoothstep(0, 0.21, tr.y);

    //  This does something freaky IMPL_P3 nope!
    // float blur = 0.9;
    // float pct_bl_x = smoothstep(1.1, blur, bl.x);
    // float pct_bl_y = smoothstep(1.1, blur, bl.y);
    // float pct_tr_x = smoothstep(1.1, blur, tr.x);
    // float pct_tr_y = smoothstep(1.1, blur, tr.y);

    float blur = 0.9;
    float pct_bl_x = smoothstep(1.1, blur, bl.x);
    float pct_bl_y = smoothstep(1.1, blur, bl.y);
    float pct_tr_x = smoothstep(1.1, blur, tr.x);
    float pct_tr_y = smoothstep(1.1, blur, tr.y);

    /**
        This shows the actual smoothstep output with the borders
        defined correctly
    */
    float pct = bl.x * bl.y * tr.x * tr.y;
    //  The below shows the output for IMPL_P2 that controls the blurs on the edges
    // float pct = pct_bl_x * pct_bl_y * pct_tr_x * pct_tr_y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}


/**
    This method is the best one.
    There was never any issue with the formula that creates the borders
    even though the upper limit was 1.0.

    It correctly set the borders. However, because the values were below 1.0
    when they were multiplied together, the result approaches 0.0 more and more...
    so it made the pixel output of pct black
    The reason why the latter solution that uses the value
            // float x_lim = w - w_fct;
            // float y_lim = h - h_fct;
     =such that x_lim = y_lim = 4.0 worked is that...
     the smoothstep would make some of the outputs of bl.x, bl.y, tr.x, tr.y
     be clamped to 1.0...
     So when they were multiplied, the pixel color dd not become so small that it approaches 0.0.

     Hence why it worked.

*/
void draw_rectangle_smooth_v3(float x, float y, float w, float h)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;


    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    // float x_lim = w - w_fct;
    // float y_lim = h - h_fct;

    // float x_lim = 0.8;
    // float y_lim = 0.8;


    float x_lim = 1;
    float y_lim = 1;

    vec2 bl = vec2(0.0);
    bl.x = smoothstep(w_fct - x_fct, x_lim, st.x);
    bl.y = smoothstep(h_fct - y_fct, y_lim, st.y);


    vec2 tr = vec2(0.0);
    tr.x = smoothstep(w_fct + x_fct, x_lim, 1.0 - st.x);
    tr.y = smoothstep(h_fct + y_fct, y_lim, 1.0 - st.y);

    // float pct = smoothstep(0, 1, bl.x * bl.y * tr.x * tr.y);
    // float pct = smoothstep(0, 2, bl.x * bl.y + tr.x * tr.y);
    // float pct = smoothstep(0, 0.1, bl.x * bl.y * tr.x * tr.y);

    //  IMPL_P2
    // float pct_bl_x = smoothstep(0, 0.21, bl.x);
    // float pct_bl_y = smoothstep(0, 0.21, bl.y);
    // float pct_tr_x = smoothstep(0, 0.21, tr.x);
    // float pct_tr_y = smoothstep(0, 0.21, tr.y);

    //  IMPL_P3 turned out to be it!
    float blur_val1 = 0.8;
    float blur_val2 = 0.7;
    float pct_bl_x = smoothstep(blur_val1, blur_val2, bl.x);
    float pct_bl_y = smoothstep(blur_val1, blur_val2, bl.y);
    float pct_tr_x = smoothstep(blur_val1, blur_val2, tr.x);
    float pct_tr_y = smoothstep(blur_val1, blur_val2, tr.y);

    /**
        This shows the actual smoothstep output with the borders
        defined correctly
    */
    // float pct = bl.x * bl.y * tr.x * tr.y;
    //  The below shows the output for IMPL_P2 that controls the blurs on the edges
    float pct = pct_bl_x * pct_bl_y * pct_tr_x * pct_tr_y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}


/**
    This is the final function
*/
void draw_rectangle_smooth_v4(float x, float y, float w, float h, float blur_offset)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;

    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    float x_lim = 1;
    float y_lim = 1;

    vec2 bl = vec2(0.0);
    bl.x = smoothstep(w_fct - x_fct, x_lim, st.x);
    bl.y = smoothstep(h_fct - y_fct, y_lim, st.y);


    vec2 tr = vec2(0.0);
    tr.x = smoothstep(w_fct + x_fct, x_lim, 1.0 - st.x);
    tr.y = smoothstep(h_fct + y_fct, y_lim, 1.0 - st.y);


    //  This does something freaky IMPL_P3 nope!
    float blur_val1 = w + w_fct;
    float blur_val2 = blur_val1 - blur_offset;
    float pct_bl_x = smoothstep(blur_val1, blur_val2, bl.x);
    float pct_bl_y = smoothstep(blur_val1, blur_val2, bl.y);
    float pct_tr_x = smoothstep(blur_val1, blur_val2, tr.x);
    float pct_tr_y = smoothstep(blur_val1, blur_val2, tr.y);


    //  The below shows the output for IMPL_P3 that controls the blurs on the edges
    float pct = pct_bl_x * pct_bl_y * pct_tr_x * pct_tr_y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    // draw_rectangle(0.2, 0.7);
    // draw_rectangle(0.6, 0.6);
    // draw_rectangle_v2(0.5, 0.7, 0.6, 0.6);
    // draw_rectangle_smooth(0.5, 0.5, 0.6, 0.6);
    // draw_rectangle_smooth_v2(0.5, 0.5, 0.6, 0.6);
    // draw_rectangle_smooth_v3(0.5, 0.5, 0.6, 0.6);
    draw_rectangle_smooth_v4(0.5, 0.5, 0.6, 0.6, 0.02);
}