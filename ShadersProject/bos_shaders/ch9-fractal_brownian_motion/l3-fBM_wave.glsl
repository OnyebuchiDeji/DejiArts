#version 330 core

/**
    Date: Monday 2nd June, 2025


    Fractal Brownian Motion: FBM Waves


    README:

    The octaves, lacunarity and gain are related.

    By affecting the octaves, increasing them, since more
    additions are done, the higher the frequency but lower the
    wave's amplitude becomes.

    Now both lacunarity and gain are sensitive to an increase in the number
    of octaves.

    When an octave is increased and lacunarity is also increased, the wave becomes
    more sparse and increases greatly in frequency.

    For gain, the waves still become sparse but increase greatly in amplitude.

*/


uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;


float plot_line(vec2 st, float fct, float w)
{
    return smoothstep(fct - w, fct, st.y) - smoothstep(fct, fct + w, st.y);
}

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

float random1D(float x)
{
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    float v = dot(vec2(x), vec2(k1, k2));
    return fract(sin(v) * k3);
}

/**
    noise1D Gen
*/

float noise1D(float x)
{
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(random1D(i), random1D(i + 1.0), u);
}

/**
    Changing the octaves affects the size, of the waves.
    More specifically, the frequency.
*/

float fbm(in vec2 st)
{
    //  Properties
    float y = 0.0;
    const int octaves = 5;
    float lacunarity = 2.0;
    float gain = 0.5;

    //  Initial Values
    float amp = 0.5;
    float freq = 1.0;

    float x = st.x;

    //  Loop of octaves
    for (int i=0; i < octaves; i++){
        y += amp * noise1D(freq * x);
        freq *= lacunarity;
        amp *= gain;
    }

    return y;
}

/**
    Creates a cool noise pattern with vertical
    noise varying along the x axis.

    It uses 1D noise and 1D random/hash function
*/
void FBM_Wave_Impl1()
{
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    // st.x *= 20.0;
    // st.y *= 10.0;
    vec3 col = vec3(0.0);
    //vec2 nm = norm_mouse2(u_mouse);

   // gl_FragColor = vec4(nm.x, 0.0, 0.0, 1.0);

    float y = fbm(st * 3.0);
    col += (1.0 - y) * col + y * vec3(1.0);


    // float pct = plot_line(st, y, 0.02);
    // col += (1.0 - pct) * col + pct * vec3(1.0);

    gl_FragColor = vec4(col, 1.0);
}


/**
    This finally implements the Fractal Brownian Wave
*/
void FBM_Wave_Impl2()
{
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    st.x *= 10.0;
    st.y *= 5.0;
    vec3 col = vec3(0.0);

    float y = fbm(st * 3.0);
    float pct = plot_line(st, y, 0.02);
    col += (1.0 - pct) * col + pct * vec3(1.0);

    gl_FragColor = vec4(col, 1.0);
}

float fbm2(in vec2 st)
{
    //  Properties
    float y = 0.0;
    const int octaves = 5;
    float lacunarity = 2.0; //  was 2.0
    float gain = 0.5;   //  was 0.5

    //  Initial Values
    float amp = 0.5;
    float freq = 1.0;

    float x = st.x;

    float t = 0.01 * (-u_time * 130.0);

    //  Loop of octaves
    //  Added the Modulation to the wave.
    for (int i=0; i < octaves; i++){
        y += amp * noise1D(freq * x);
        y += sin(x * freq * 2.1 + t) * 4.5;
        y += sin(x * freq * 1.72 + t * 1.121) * 4.0;
        y += sin(x * freq * 2.221 + t * 0.437) * 5.0;
        y += sin(x * freq * 3.1122 + t * 4.269) * 2.5;
        y *= amp * 0.06;
        freq *= lacunarity;
        amp *= gain;
    }

    return y;
}

/**
    This adds some modulation to the wave.

    Some patterns form a band. Others do other cool stuff.

*/
void FBM_Wave_Impl3()
{
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    st.x *= u_resolution.x / u_resolution.y;
    st.x *= 10.0;
    st.y *= 5.0;
    vec3 col = vec3(0.0);

    /**
      Multiplying by f2 affects smoothness of wave.
      The f2 = 1.0 is cool, likewise 3.0.

      This is because it scales the X coordinates, which is used
      to compute the wave's y values.
    */
    float f2 = 1.0;
    float y = fbm2(st * f2);

    float pct = plot_line(st, y, 0.02);
    col += (1.0 - pct) * col + pct * vec3(1.0);

    gl_FragColor = vec4(col, 1.0);
}


void main()
{
    // FBM_Wave_Impl1();
    // FBM_Wave_Impl2();
    FBM_Wave_Impl3();
}