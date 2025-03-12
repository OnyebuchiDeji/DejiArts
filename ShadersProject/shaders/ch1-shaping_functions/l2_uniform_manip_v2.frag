#version 330 core


//  Cannot redeclare this; it's already the built in one
//  It's the default output variable
// out vec4 gl_FragColor;


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main()
{

    vec2 st = gl_FragCoord.xy / u_resolution + 0.5;
    vec2 norm_mouse_pos = gl_FragCoord.xy / u_mouse ;
    float dt = abs(sin(u_time));
    gl_FragColor = vec4(st.x * dt, st.y * dt, norm_mouse_pos.x, 1.0);
}