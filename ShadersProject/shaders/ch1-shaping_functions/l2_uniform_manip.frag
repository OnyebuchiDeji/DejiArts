#version 330 core


//  Cannot redeclare this; it's already the built in one
//  It's the default output variable
// out vec4 gl_FragColor;


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main()
{
    /**
        Elab:
            The code iuses gl_FragCoord.
            THis built-in variable is the default input that holds
            the screen coordinates of the pixel or screen fragment that
            the fragment shader is currently working on...

            Now, because this object changes since the fragment shader processes
            one pixel after another, and hence the GPU uses this identifier
            to identify a pixel in different threads --- since it's different
            from thread to thread, it's called a varying

        What the code does:
            It uses gl_FragCoord to normalize the screen resolution uniform
            to fit into the Fragment SHader screen space 0 -> 1, 0 -> 1 for x and y

            Then it also normalizes the mouse position.

            Then uses u_time in a sin function to affect the screen colors being displayed. 

            Also, consifer adding or subtracting 0.5 from:
                vec2 st = gl_FragCoord.xy / u_resolution +(-) 0.5;
    */
    vec2 st = gl_FragCoord.xy / u_resolution + 0.5;
    // vec2 norm_mouse_pos = gl_FragCoord.xy / u_mouse ;
    float dt = abs(sin(u_time));
    // gl_FragColor = vec4(st.x * dt, st.y * dt, norm_mouse_pos.x, 1.0);
    gl_FragColor = vec4(st.x * dt, st.y * dt, 0.0, 1.0);
}