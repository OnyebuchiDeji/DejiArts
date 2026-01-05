/**
    Date: Thurs-19-dec-2024

    Demonstrates drawing rectangles with step
*/



void draw_rect()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);
    /**
      Each Result will return 1.0 (white) or 0.0 (black)
      this is because step will return 1.0 for any value greater
      than the lower_limit/threshold (0.1 in this case)
    */
    float left = step(0.1, st.x);   //  Means if X > 0.1
    float bottom = step(0.1, st.y); //  Means if Y > 0.1
    /**
      The multiplication of left * bottom is similar to logical AND
      This ensures the color of that pixel is white (1.0) if its X and Y
      values used to get the left and bottom, are both greater than 0.1.

      The result is a square bounded by dark lines on the left and bottom sides.
    */
    color = vec3(left * bottom);
    gl_FragColor = vec4(color, 1.0);

}
/**
    Shorter concise code
*/
void draw_rect_v2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);


    vec2 borders = step(vec2(0.1), st);
    float pct = borders.x * borders.y;
  

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);

}

/**
    Draws a square bordered on all four sides
*/
void draw_rect_v3()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  bottom-left
    vec2 bl = step(vec2(0.1), st);
    float pct = bl.x * bl.y;


    // top-right
    /**
        Note how this does 1 - st
        this makes pixels toward the top right corner
        to give an output approaching 0.
        Hence if this output is < 0.1, step returns 0
        if > 0.1, step returns 1.0
        This makes the square shape.
    */
    vec2 tr = step(vec2(0.1), 1.0 - st);
  
    //  So all have to be multiplied together
    //  to check if it will be 1.0 for the pixel to be white
    pct *= tr.x * tr.y;

    color = vec3(pct);
    gl_FragColor = vec4(color, 1.0);
}

void main()
{
    // draw_rect();
    // draw_rect_v2();
    draw_rect_v3();
    
}