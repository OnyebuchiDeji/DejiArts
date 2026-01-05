#version 330 core

/**

    Shapes
    Learn how to draw simple shapes in a parallel procedural way.

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
float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}

float plot_line(vec2 st, float pct, float w)
{
    //  w is the width/thickness of the line -- choose 0.01 or 0.02
    return smoothstep(pct - w, pct, st.y) - smoothstep(pct, pct + w, st.y);
}

vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);

    return nm;
}

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

//  ---------------------------------------------------------------

/**
    This involves mapping the cartesian plane/coordinates to the polar plane/coordinates...
    by calculating the radius and angles of each pixel with the following formula:
        vec2 pos = vec2(0.5) - st;
        float r = length(pos) * 2.0;    //  radius length
        float a = atan(pos.y, pos.x);   //  Angle

    Each pixel on the x and y plane is mapped to by the length of the radius and its angle


    Part of this was used in the formula for drawing circles.

    Using the Polar coordinates technique, although restrictive, is very simple.

*/

//--------------------------------------------
//          SHAPING FUNCTIONS
//--------------------------------------------


float almostUnitIdentity(float x)
{
    return x * x * (2.0 - x);
}

float gainMapping(float x, float k)
{
    float a = 0.5 * pow(2.0 * ((x<0.5) ? x : 1.0 - x), k);
    return (x < 0.5) ? a : 1.0 - a;
}

float parabolaMapping(float x, float k)
{
    return pow(4.0 * x * (1.0 - x), k);
}
//----------------------------------------

void polar_shapes(int mode)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    vec2 pos = vec2(0.5) - st;

    float r = length(pos) * 2.0;
    float a = atan(pos.y, pos.x);
    a += u_time * 0.5;

    float f = 0;
    switch(mode)
    {
        case 0:
            f = cos(a * 3);break;

        case 100:
            // f = cos(1/pow(a, 2));
            f = cos(a * 3);
            f *= 1 - cos(a * 3) * 0.05;

            //  SOME CREATURE
            // f = cos(a * 3);
            // f += 1 - step(cos(a * 3) * 0.25, f);
            // f = sin(a * 3);
            // f = mix(f, almostUnitIdentity(st.x), 0.5);
            // f = mix(f, almostUnitIdentity(a), 0.5);
            // f = mix(f, gainMapping(a, 1), 0.2);
            // f = mix(f, gainMapping(st.x, 1), 0.2);
            // f = mix(f, parabolaMapping(st.x, 2), 0.2);
            // f = mix(f, parabolaMapping(st.x, a), 0.2);
            // f = mix(f, parabolaMapping(a, a), 0.2);

            // f = cos(pow(a, 2));
            // f = cos(pow(a, 0.15));
            // f = cos(pow(a, -0.15));
            
            //  Some Kind of Flower 1
            // f = cos(a * a) * sin(a * a);

            //  Another Thing 2
            // f = cos(a * a * a) * sin(a * a);
            //  Another Thing 3
            // f = cos(pow(a, 2.5)) * sin(pow(a, 1.5));

            // f = cos(pow(a, 2.5)) * sin(pow(a, 1.5)) * smoothstep(pow(f, 0.1), pow(f, 5), pow(f, 2 * cos(a*a)));



            //  Some Bug 1
            // f = smoothstep(pow(f, 0.3), pow(f, 5), pow(a, f));

            //  Half Dragon Fly

            // f = smoothstep(pow(f, 0.1), pow(f, 5), pow(f, a));
            // f = smoothstep(pow(f, 0.1), pow(f, 5), pow(1 - f, a));

            // float g = 1 - cos(a * 3);
            // f = smoothstep(pow(g, 0.1), pow(g, 5), pow(g, a));
            // f = smoothstep(pow(f, 0.3), pow(f, 5), pow(f, st.x * 1/st.y));

            break;
        case 1:
            f = abs(cos(a * 3.)); break;
        case 2:
            f = abs(cos(a * 2.5)) * .5 + .3; break;
        case 3:
            f = abs(cos(a * 12.) * sin(a * 3.)) * .8 + .1; break;
        case 4:
            f = smoothstep(-0.5, 1.0, cos(a * 10.)) * 0.2 + 0.5;break;
        case 5:
            f = cos(a * 3);
            f = pow(f, 0.5) * 1 - pow(f, 3.5);
            break;
        case 6:
            f = cos(a * 3);
            f = 1 - pow(f, 0.5) * 1 - pow(f, 0.5);
            break;
        case 7:
            f = cos(a * 3);
            f = smoothstep(pow(f, 0.5), pow(f, 2), f);
            break;
        case 8:
            f = cos(a * 3);
            f = smoothstep(pow(f, 0.1), pow(f, 2.5), pow(f, st.x));
            break;
        case 10:
            float k = 1.5;
            f = cos(a * 3)  * k * sin(a);
            break;

        //  BUNNY:
        case 21:
            f = cos(a * a);
            break;
        //  FRUITS:
        case 41:
            f = cos(pow(a, 1.5));break;
        
        case 42:
            f = cos(pow(a, 2.));break;

        //  Half Heart
        case 43:
            f = cos(pow(a, 0.5));break;

        //  Following 2 are same
        case 44:
            f = cos(pow(a, 0.35));break;
        case 45:
            f = cos(pow(a, 0.4));break;

        //  EXOTIC FRUITS
        case 51:
            f = cos(pow(a, -1.5));break;
        case 52:
            f = cos(pow(a, -2.5));break;
        case 53:
            f = cos(pow(a, -3.5));break;
        case 54:
            f = cos(pow(a, -4.5));break;

            //  TRUE HEART
        case 55:
            f = cos(pow(a, -0.25));break;

        //  Mantis Like
        case 130:
            f = cos(a * 3);
            f = smoothstep(pow(f, 0.3), pow(f, 5), pow(f, st.x * 1/st.y));
            break;
        //  Mantis Series
        case 131:
            f = cos(a * 3);
            // f = smoothstep(pow(f, 2.5), pow(f, 5), pow(f, st.x * 1/st.y));
            // f = smoothstep(pow(f, 1.5), pow(f, 5), pow(f, st.x * 1/st.y));
            // f = smoothstep(pow(f, 0.05), pow(f, 5), pow(f, st.x * 1/st.y));
            // f *= smoothstep(pow(f, 0.05), pow(f, 5), pow(f, st.x * 1/st.y));
            f += smoothstep(pow(f, 0.05), pow(f, 5), pow(f, st.x * 1/st.y));

        //  Circle Cases from Step
        case 190:
            f = cos(a * 3);
            f = step(pow(f, 0.1), pow(f, st.x));
            break;
        case 191:
            f = cos(a * 3);
            f = step(pow(f, 0.5), pow(f, st.x));
            break;
        default:
            f = 0;break;
    }

    color = vec3( 1.0 - smoothstep(f, f + 0.02, r));
    // color = vec3( 1.0 - step(f, r));

    gl_FragColor = vec4(color, 1.0);
}


//------------------------------------------------

void main()
{
    // polar_shapes(100);
}