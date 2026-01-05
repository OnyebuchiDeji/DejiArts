#version 330 core

/**
    Algorithmic Drawing

    Shaping Functions

    Reference: Kynd - www.flickr.com/photos/kynd/9546075099/, (2013)

    Doing 1.0 - the function flips it upside down.
*/


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}


float plot_exp(vec2 st, float pct)
{
    return smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.02, st.y);
}


void curve1_exp1()
{
    // vec2 st = gl_FragCoord.xy / u_resolution;    //  OG Normalized Coordinates
    // float y = 1.0 - pow(abs(st.x), 0.5); //  OG Function

    //  Modified the coordinates to show the full graph
    /**
        Did '- 0.5' to move coordinates from 0 -> 1 to -0.5 -> 0.5

        reduced from
            1.0 - pow(abs(st.x), 0.5);
        to
            0.2 - pow(abs(st.x), 0.5);
    */
    // vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 1;
    // float y =  0.2 - pow(abs(st.x), 0.5);

    // For this, modified the Normalized Coordinates to accommodate the whole graph...
    //  so no need for '0.2 - pow(abs(st.x), 0.5);'
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;
    float y =  1.0 - pow(abs(st.x), 0.5);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

void curve2_quads(float exponent)
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y =  1.0 - pow(abs(st.x), exponent);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

//  The Trig Bell Series
void curve3_trigs(float exponent)
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y =  pow(cos(PI * st.x / 2.0), exponent);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

//  The Increasing Top Broadness Trig Bell Series 
void curve4A_trigs(float exponent)
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y =  1.0 - pow(abs(sin(PI * st.x / 2.0)), exponent);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

void curve4B_trigs(float exponent)
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y =  pow(abs(sin(PI * st.x / 2.0)), exponent);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

//  The Trig Sharp Top Curves Series
void curve5_trigs(float exponent)
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y =  pow(min(cos(PI * st.x / 2.0), 1.0 - abs(st.x)), exponent);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}


//  The Trig Plateau Series
void curve6_trigs(float exponent)
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) - 0.5) * 4;

    float y =  1.0 - pow(max(0.0, abs(st.x) * 2.0 - 1.0), exponent);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);

    color = (1.0 - pct)*color + pct*vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

void main()
{
    //curve1_exp1();

    //  Inverted Bell Exponent
    // curve2_quads(0.5);


    //  Triangular
    // curve2_quads(1.0);
    //  Steep Bell
    // curve2_quads(1.5);
    // //  Smoother Bell
    // curve2_quads(2.0);
    // //  Broader Top 
    // curve2_quads(2.5);
    // //  Even Broader Top
    // curve2_quads(3.0);
    // //  Much Broader Top
    // curve2_quads(3.5);


    //  Trig Bell Series

    //  Trig Circular
    // curve3_trigs(0.5);
    // //  Trig Steep Bell
    // curve3_trigs(1.0);
    // //  Trig Smooth Slope Decent
    // curve3_trigs(1.5);
    // //  Trig Steeper Ascent Smooth Slope Decent
    // curve3_trigs(2.0);
    // //  Trig Even Steeper Ascent, Smoother Decent
    // curve3_trigs(2.5);
    // //  Trig Even Steeper Ascent, Smoother Decent, Smaller Width
    // curve3_trigs(3.0);
    // //  Trig Even Steeper Ascent, Smoother Decent, Even Smaller Width
    // curve3_trigs(3.5);


    //  The Increasing Top Broadness Trig Bell Series 
    //  float y =  1.0 - pow(abs(sin(PI * st.x / 2.0)), exponent);
    // curve4A_trigs(0.5);
    // curve4A_trigs(1.0);
    // curve4A_trigs(1.5);
    // curve4A_trigs(2.0);
    // curve4A_trigs(2.5);
    // curve4A_trigs(3.0);
    // curve4A_trigs(3.5);

    //  Strange Invention -- Book Opening Series
    //  float y =  pow(abs(sin(PI * st.x / 2.0)), exponent);
    curve4B_trigs(0.5);
    // curve4B_trigs(1.0);
    // curve4B_trigs(1.5);
    // curve4B_trigs(2.0);
    // curve4B_trigs(2.5);
    // curve4B_trigs(3.0);
    // curve4B_trigs(3.5);
    
    //  Steep Top Series
    //  float y =  pow(min(cos(PI * st.x / 2.0), 1.0 - abs(st.x)), exponent);
    
    // curve5_trigs(0.5);
    // curve5_trigs(1.0);
    // curve5_trigs(1.5);
    // curve5_trigs(2.0);
    // curve5_trigs(2.5);
    // curve5_trigs(3.0);
    // curve5_trigs(3.5);


    //  The Plateau Series:

    //   float y =  1.0 - pow(max(0.0, abs(st.x) * 2.0 - 1.0), exponent);
    // curve6_trigs(0.5);
    // curve6_trigs(1.0);
    // curve6_trigs(1.5);
    // curve6_trigs(2.0);
    // curve6_trigs(2.5);
    // curve6_trigs(3.0);
    // curve6_trigs(3.5);
    

    
}