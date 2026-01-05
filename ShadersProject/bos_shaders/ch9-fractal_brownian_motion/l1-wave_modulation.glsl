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



float plot_line(vec2 st, float fct, float w)
{
    return smoothstep(fct - w, fct, st.y) - smoothstep(fct, fct + w, st.y);
}


void DrawSimpleLinearWave_Impl1()
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) * 2.0) - vec2(1.0);
    st.x *= u_resolution.x / u_resolution.y;
    // st.x *= 15;
    // vec2 uv = fract(st);
    vec3 col = vec3(0.0);

    //  straight line
    float amplitude = 0.5;
    float frequency = 10.0;
    float y = amplitude * sin(st.x * frequency);

    float pct = plot_line(st, y, 0.02);
    col += (1.0 - pct) * col + pct * vec3(1.0, 1.0, 1.0);
    gl_FragColor = vec4(col, 1.0);

    //gl_FragColor = vec4(st.x, st.y, 0.0f, 1.0);
}

void DrawSimpleLinearWave_FrequencyAndAmplitudeModulation_Impl2()
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) * 2.0) - vec2(1.0);
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.0);

    //  First Version
    //float amplitude = 1.0 * max(1.0, pow(sin(u_time), 3)) - 0.25;
    //float frequency = 15.0 * pow(cos(u_time), 2);

    //  Second Version
    // float amplitude = 0.80 * sin(u_time) + pow(fract(st.x), 0.5);
    // float frequency = 15.0 + pow(cos(st.x) / sin(st.x), 2.0);
    // st.x += sin(u_time);

    //  Third Version
    // float amplitude = max(0.8, 0.80 * sin(u_time) + pow(fract(st.x), 0.5));
    // float frequency = 15.0 + cos(st.x * u_time);
    // st.x += sin(u_time);
    
    //  Forth Version
    float amplitude =  0.80 * sin(u_time + pow(st.x, 2.0));
    float frequency = 15.0 + cos(st.x * u_time);
    st.x += sin(u_time);
    
    float y = amplitude * sin(st.x * frequency);

    float pct = plot_line(st, y, 0.02);
    col += (1.0 - pct) * col + pct * vec3(1.0, 1.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
}


void main()
{
    // DrawSimpleLinearWave_Impl1();
    DrawSimpleLinearWave_FrequencyAndAmplitudeModulation_Impl2();
}