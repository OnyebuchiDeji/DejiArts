#version 330 core

/**
    Date: Monday-31-March-2025

    After many trials, fidling with the ChatGPT
    example, I discovered how to apply
    the noise effects to the shapes using the
    original drawing method gotten from the
    BookOfShaders lessons.

*/


// #define PI 3.14159265358979323846
#define PI 3.1415926535
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

//  -------------------------------------------------------------------------


//  Simple Pseudo-Random Generator
float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.11, 311.7))) * 43758.5453123);
}

//  Simple 2D Noise Function
float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

//  Wobbly Square Function
/**
    Consider how this method of drawing the
    rectangle is also different so that it allows application of the
    noise value.
    It clearly defines the left, right, top, and bottom borders of
    the quad using the halfSize variable, half od the quad's size.

    Then it uses the smoothstep to draw only a bordered rectangle.
    The border width is 0.01
    If the current pixel's X value - the left border gives a value
    not less than border width and not greater than botder width + 0.001
    it returns 1.
    Likewise it does for the X value - right border.

*/
void wobblySquare(vec2 uv, float size, float wobbleAmount)
{
    uv = uv * 2.0 - 1.0;    //  Normalize UV to range [-1, 1]
    uv.x *= u_resolution.x / u_resolution.y;  //  Maintain Aspect Ratio
    float border = 0.0;    //  Square border thickness
    float halfSize = size * 0.5;


    //  Add noise-based wobble to each side of the square
    // float n1 = noise(uv * 3.0 + u_time) * wobbleAmount;
    // float n2 = noise(uv.yx * 3.0 + u_time) * wobbleAmount;
    float n1 = 0;
    float n2 = 0;

    float left = -halfSize - n1;
    float right = halfSize + n1;
    float bottom = -halfSize - n2;
    float top = halfSize + n2;

    //  Check if the point is inside the wobbly square
    // float horz = smoothstep(border, border + 0.001, abs(uv.x - left)) * 
    //     smoothstep(border, border + 0.001, abs(uv.x - right));
    // float vert = smoothstep(border, border + 0.001, abs(uv.y - bottom)) *
    //     smoothstep(border, border + 0.001, abs(uv.y - top));

    float diff = 0.00;
    float horz = smoothstep(border, border + diff, abs(uv.x - left)) * 
        smoothstep(border, border + diff, abs(uv.x - right));
        
    float vert = smoothstep(border, border + diff, abs(uv.y - bottom)) *
        smoothstep(border, border + diff, abs(uv.y - top));
    
    // return (horz * vert);

    // vec3 col = vec3(0.0) + (horz * vert);
    vec3 col = vec3(horz * vert);
    gl_FragColor = vec4(col, 1.0);
}


/**MY SOL*/
float box(in vec2 _st, in vec2 _size, float wobbleAmount)
{
    float n1 = noise(_st * 3.0 + u_time) * wobbleAmount;
    float n2 = noise(_st.yx * 3.0 + u_time) * wobbleAmount;

    float halfSize = _size.x * 0.5;
    halfSize = halfSize + n1 * n2;
    _size = vec2(0.5) - vec2(halfSize);

    vec2 uv = smoothstep(_size, _size + vec2(0.001), _st);
    uv *= smoothstep(_size, _size + vec2(0.001), vec2(1.0) - _st);
    return uv.x * uv.y;
}


void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution;
    // uv *= u_resolution.x / u_resolution.y;  //  fix aspect ratio.

    float size = 0.5;
    float wobbleAmount = 0.1;

    //  Get wobbly square shape
    // wobblySquare(uv, size, wobbleAmount);

    //  My SOL
    float col = box(uv, vec2(0.5), 0.3);
    gl_FragColor = vec4(vec3(col), 1.0);

}