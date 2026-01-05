#version 330 core

/**
    Date: Mon-31-March-2025

    Manipulating Shapes with Noise
*/
#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;



vec2 rotate2D(vec2 _st, float _angle)
{
    _st -= 0.5;
    _st = mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

float Noise2D(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    //  Four Corners in 2D of a Tile
    float a  = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    //  Smooth Interpolation

    //  Cubic Hermine Curve. Same as Smoothstep()
    vec2 u = f * f * (3.0 - 2.0 * f);
    //  OR
    //  vec2 u = smoothstep(0.0, 1.0, f);

    //  Mix 4 Corners' Percentages
    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

float random2d_val(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    
    return -1.0 + 2.0 * fract( sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float value_noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( random2d_val( i + vec2(0.0,0.0) ), 
                     random2d_val( i + vec2(1.0,0.0) ), u.x),
                mix( random2d_val( i + vec2(0.0,1.0) ), 
                     random2d_val( i + vec2(1.0,1.0) ), u.x), u.y);
}

vec2 random2_grad(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float grad_noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2_grad(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2_grad(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2_grad(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2_grad(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float polygon(in vec2 _st, vec2 _pos, int _n)
{
    float d = 0.0;

    // float d1 = Noise2D(st);
    // float d2 = value_noise(st * 10.);
    // float d3 = grad_noise(st * 10.);

    //  Remap space according to x and y offset
    float x_diff = (_pos.x - 0.5) + 1.0;
    float y_diff = (_pos.y - 0.5) + 1.0;
    _st.x = _st.x * 2.0 - x_diff;
    _st.y = _st.y * 2.0 - y_diff;

    //  Number of Sides of Shape
    int N = _n;

    //  Angle and radius from the current pixel
    float a = atan(_st.x, _st.y) +  PI;
    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d = cos(floor(0.5 + a/r) * r - a) * length(_st);

    d += Noise2D(_st * cos(u_time));

    float p_out = 1.0 - smoothstep(.4, .41, d);
    
    return p_out;
}

float circle(in vec2 _st, in float _radius)
{
    // float halfDist = 0.5;
    // float d1 = Noise2D(_st);
    // float d2 = value_noise(_st);
    // float d3 = grad_noise(_st);

    // halfDist += d1;
    
    //  pixel distance from center
    vec2 pdfc = _st - 0.5;

    _radius += Noise2D(_st);

    //  Consider that taking the dot product of a vector on itself is
    //  essentially finding its length squared. Since v.v = mag(v)*mag(v)*cos(0)
    //  and cos(0) = 1, so v.v = (mag(v))^2
    return 1.0 - smoothstep(_radius - (_radius * 0.01),
        _radius+(_radius*0.01), dot(pdfc, pdfc) * 4.0);
}

/**
    Understand what smoothstep does.
    smoothstep(e0, e1, v)

    genType t;  // Or genDType t;
    t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
    
    Given the normal smoothstep, where e1 > e0
    It returns 1 if v >= e1, but 0 if v <= e0.
    But if v > e0 and v < e1, v remains the same.
    This is the interpolation between e0 and e1.

    So the ring below has the difference between the 
    pixel distance from the circle's/screen's center
    and the radius of the circle.

    The reason why the blur is on both sides
    is because of the abs() on th difference.
    That's why it is midway into the ring that is the blackest.
*/
float ringed_circle(vec2 _st, float _radius, float width)
{
    float center = 0.5;
    vec2 pdfc = _st - center;

    float px_dist = dot(pdfc, pdfc);
    float r_dist = pow(_radius, 2);
    float diff = abs(r_dist - px_dist);

    float v = smoothstep(0.0, width, diff);
    // float v = step(width * 0.5, smoothstep(0.0, width, diff));
    
    return v;
}

float noisy_ringed_circle(vec2 _st, float _radius, float width)
{
    float center = 0.5;
    vec2 pdfc = _st - center;

    float wobbleAmount = 2.0;
    float n1 = Noise2D(vec2(_st * 3 + sin(u_time) + cos(u_time + TWO_PI))) * 2.;

    float px_dist = dot(pdfc, pdfc);
    float r_dist = pow(_radius * n1, 2);

    
    float diff = abs(r_dist - px_dist);

    // float v = smoothstep(0.0, width * n1, diff);

    float v = smoothstep(0.0, width, diff);
    
    return v;
}

float noisy_ringed_circle2(vec2 _st, float _radius, float width)
{
    float center = 0.5;
    // float n1 = Noise2D(vec2(_st * 3 + sin(u_time) + cos(u_time + TWO_PI))) * 2.;
    vec2 pdfc = _st - center;

    float wobbleAmount = 2.0;

    float n1 = Noise2D(_st + pow(sin(u_time), 2));

    float px_dist = dot(pdfc, pdfc);
    float r_dist = pow(_radius * n1, 2);

    
    float diff = abs(r_dist - px_dist);

    // float v = smoothstep(0.0, width * n1, diff);

    float v = smoothstep(0.0, width, diff);
    
    return v;
}

float noisy_polygon(in vec2 _st, vec2 _pos, int _n)
{
    float d = 0.0;

    // float d1 = Noise2D(st);
    // float d2 = value_noise(st * 10.);
    // float d3 = grad_noise(st * 10.);

    float n1 = Noise2D(vec2(_st.y) * _st.x * sin((u_time))) + 0.001;

    //  Remap space according to x and y offset
    float x_diff = (_pos.x - 0.5) + 1.0;
    float y_diff = (_pos.y - 0.5) + 1.0;
    _st.x = _st.x * 2.0 - x_diff;
    _st.y = _st.y * 2.0 - y_diff;

    //  Number of Sides of Shape
    int N = _n;

    //  Angle and radius from the current pixel
    float a = atan(_st.x, _st.y) +  PI;
    float r = TWO_PI * n1 / float(N);

    // vec2 i = floor(_st);
    // vec2 f = fract(_st);
    // vec2 u = f*f*(3.0-2.0*f);
    // r = mix(r, n1, u.x);

    //  Shaping Function that modulates the distance
    d = cos(floor(0.5 + a/r) * r - a) * length(_st);

    // d += Noise2D(_st * cos(u_time));

    float p_out = 1.0 - smoothstep(.4, .41, d);
    
    return p_out;
}

void main()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(0.0);

    // st *= 2.0; st -= 1.0;
    // st *= 1;

    // col = vec3(polygon(st + vec2(d1 * u_time), vec2(0.5), 3));

    // col = vec3(polygon(st, vec2(0.5), 2));

    // col = vec3(circle(st, 0.5));

    // col = vec3(ringed_circle(st, 0.2, 0.01));
    // col = vec3(noisy_ringed_circle(st, 0.2, 0.005));
    // col = vec3(noisy_ringed_circle2(st, 0.2, 0.005));

    col = vec3(noisy_polygon(st, vec2(0.5), 2));


    gl_FragColor = vec4(col, 1.0);
}