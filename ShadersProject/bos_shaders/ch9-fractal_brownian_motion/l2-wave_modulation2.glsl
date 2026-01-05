#version 330 core


/**
    Date: Monday 2nd June, 2025


    Fractal Brownian Motion: Wave Modulation
*/



uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;


vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

vec2 norm_mouse2(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(mix(0.0, 1.0, og_mouse_coord.x / u_resolution.x), smoothstep(0.0, 1.0, mouse_y / u_resolution.y));
    return nm;
}



float plot_line(vec2 st, float fct, float w)
{
    return smoothstep(fct - w, fct, st.y) - smoothstep(fct, fct + w, st.y);
}


/**
    Improved and better than previous
*/
void DrawModulatedWave()
{
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.x;
    st.x *= 20.0;
    st.y *= 10.0;
    vec3 col = vec3(0.0);

    float amp = 1.0;
    float freq = 1.0;

    float x = st.x;
    float y = sin(x * freq);

    float t = 0.01 * (-u_time * 130.0);
    y += sin(x * freq * 2.1 + t) * 4.5;
    y += sin(x * freq * 1.72 + t * 1.121) * 4.0;
    y += sin(x * freq * 2.221 + t * 0.437) * 5.0;
    y += sin(x * freq * 3.1122 + t * 4.269) * 2.5;
    y *= amp * 0.06;

    float pct = plot_line(st, y, 0.02);
    col += (1.0 - pct) * col + pct * vec3(1.0);
    gl_FragColor = vec4(col, 1.0);
}

void main()
{
    DrawModulatedWave();
}