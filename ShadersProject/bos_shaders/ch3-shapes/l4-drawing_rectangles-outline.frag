
/**
    Date: Fri-20-Dec-2024
    Shapes: Drawing Rectangles

    This draws only the rectangle's outline.

    I choose to use the step function to do this.
    This is the clearest way to define boundaries.

    Basically, define the outer and inner boundaries.
    Then for the inner, do 1 - pct_inner.
    This makes the pixels outside the inner square have value 1.0 (white)

    Then when you multiply (AND, *) the white inner pixels in the outer rect with the white
    pixels outside the inner rect, 1 * 1 = 1...
    hence the borders are defined!
*/

void draw_rectangle_border(float x, float y, float w, float h, float border_width)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float w_fct = (1 - w) * 0.5;
    float h_fct = (1 - h) * 0.5;

    float x_fct = (0.5 - x) * 0.5;
    float y_fct = (0.5 - y) * 0.5;

    float x_lim = 1;
    float y_lim = 1;

    //  Define boundaries of outer rectangle
    vec2 bl_out = vec2(0.0);
    bl_out.x = step(w_fct - x_fct, st.x);
    bl_out.y = step(h_fct - y_fct, st.y);

    vec2 tr_out = vec2(0.0);
    tr_out.x = step(w_fct + x_fct, 1.0 - st.x);
    tr_out.y = step(h_fct + y_fct, 1.0 - st.y);

    float pct_out = bl_out.x * bl_out.y * tr_out.x * tr_out.y;
    
    //  For Inner
    vec2 bl_in = vec2(0.0);
    bl_in.x = step(w_fct - x_fct + border_width, st.x);
    bl_in.y = step(h_fct - y_fct + border_width, st.y);

    vec2 tr_in = vec2(0.0);
    tr_in.x = step(w_fct + x_fct + border_width, 1.0 - st.x);
    tr_in.y = step(h_fct + y_fct + border_width, 1.0 - st.y);

    float pct_in = bl_in.x * bl_in.y * tr_in.x * tr_in.y;

    // color = vec3(1 - pct_in);
    // gl_FragColor = vec4(color, 1.0);

    float pct = pct_out * (1 - pct_in);
    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    // draw_rectangle_border(0.5, 0.5, 0.6, 0.6, 0.2);
    draw_rectangle_border(0.5, 0.5, 0.6, 0.6, 0.05);

}