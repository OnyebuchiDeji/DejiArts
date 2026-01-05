
/**
    Shapes: Drawing the Zen Garden

    It utilizes the distance fields to draw a partiucular shape pattern, such as making
    smooth edges of that shape and or making multiple outlines.
    
    The zen garden shows multiple outlines

    First, the cordinate system is moved to the center and shrunk in half
    to remap the position values between -1 and 1.

    The distance field is visualised using a `fract()` to make it easy to see the 
    pattern that is created.

    The distance field repeats continually over and over like rings in a Zen garden.

    Consider the distnace field formula.... d = length(abs(st) - .3);
    It calculates the distance to the position (.3, .3) in all four quadrants.
    The abs() is what creates the 4 quadrants, along with the scaling/shrinking in half done

    In IMPL_2,the distances to the four points are being combined using the min() to zero...
    This pattern is unique.

    In IMPL_3, the same as above but with max(). It creates a rectangle with rounded corners.
    Consider how the rings of the distance field get smoother the further away they get from the center.
    
    Finish uncommenting the IMPLS to see different use cases of the distance field pattern.   
*/


void zen_garden()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    //  Fixing Aspect Ratio 
    st *= u_resolution.x / u_resolution.y;
    vec3 color = vec3(0.0);
    float d = 0.0;

    //  Remap the space -1. to 1.
    st = st * 2.0 -1.0;

    //  Make the distance field
    //  IMPL_1
    d = length( abs(st) - .3);
    
    //  IMPL_2
    // d = length( min(abs(st) - .3, 0));

    //  IMPL_3
    // d = length( max(abs(st) - .3, 0));

    //  Visualize the distance field

    // color = vec3(fract(d * 10.0));
    // gl_FragColor = vec4(color, 1.0);

    //  Drawing with the distance field
    //  IMPLS

    // color = vec3(step(.3, d));
    // gl_FragColor = vec4(color, 1.0);

    // color = vec3(step(.3, d) * step(d, .4));
    // gl_FragColor = vec4(color, 1.0);

    color = vec3(smoothstep(.3, .4, d) * smoothstep(.6, .5, d));
    gl_FragColor = vec4(color, 1.0);

    
}

void main()
{
    zen_garden();    
}

