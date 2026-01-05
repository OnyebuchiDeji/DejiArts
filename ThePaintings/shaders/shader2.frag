#version 300 es
precision mediump float;


/**
*   This version differs from the previous
*   It adds these enhancements:
*       Use smoother noise (Perlin-style).
*       Add Sobel edge detection for enhanced lines before blurring.
*       Slight shimmer animation with u_time.
*/

uniform sampler2D texture1;
uniform vec2 u_resolution;
uniform vec2 u_image_size;
uniform float u_time;
in vec2 textureCoords;
out vec4 fragColor;

// --------------------- Noise Utilities ---------------------

// Smooth value noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// --------------------- Sobel Edge Detection ---------------------

/**
    Adds dark lines to texture to make it look more like a painting.
*/
float sobelEdge(vec2 uv) {
    float dx = 1.0 / u_resolution.x;
    float dy = 1.0 / u_resolution.y;
    
    /**
        Gaussian Distribution with Horizontal bias.
        Understand that it is for the pixels around the current pixel
        Note also that the pixels directly above and below do not contribute
        anything
    */
    mat3 Gx = mat3(
        -1.0, 0.0, 1.0,
        -2.0, 0.0, 2.0,
        -1.0, 0.0, 1.0
    );
    /**
        Likewise for this but Vertical bias.
        And the pixels directly left and right contribute nothing.
    */
    mat3 Gy = mat3(
        -1.0, -2.0, -1.0,
         0.0,  0.0,  0.0,
         1.0,  2.0,  1.0
    );

    //  For horizontal edges
    float edgeX = 0.0;
    //  For vertical edges
    float edgeY = 0.0;

    /*
    *   This performs a Gaussian blur algorithm around the current pixel, uv.
    *   This means it looks at the color value of the pixels around it by a 3x3 grid hence the 3x3 grid matrices.
    *   Consider the offsets: they offset from the current pixel, uv according to the index corresponding
    *   to the matrix array for all the pixels around that current pixel.
    *   Understand that dx and dy are = 1/u_resolution.x, 1/u_resolution.y because each pixel is actually
    *    1/u_resolution.x by 1/u_resolution.y in dimensions.
    *   So to properly offset from the current pixel, you need to offset by these factors, dx and dy.
    */
    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            vec2 offset = vec2(float(i) * dx, float(j) * dy);
            float luminance = dot(texture(texture1, uv + offset).rgb, vec3(0.299, 0.587, 0.114));
            edgeX += luminance * Gx[j+1][i+1];
            edgeY += luminance * Gy[j+1][i+1];
        }
    }

    return length(vec2(edgeX, edgeY));
}

// --------------------- Directional Blur ---------------------

/**
    Applies a blur effect that is biased to a certain direction.
    This direction, as will be seen below is gotten by random, using the smooth_noise (perlin) function
*/
vec3 directionalBlur(vec2 uv, vec2 direction) {
    vec3 color = vec3(0.0);
    float totalWeight = 0.0;

    for (float i = -4.0; i <= 4.0; i++) {
        float weight = 1.0 - abs(i) / 4.0;
        vec2 offset = direction * i / u_resolution;
        color += texture(texture1, uv + offset).rgb * weight;
        totalWeight += weight;
    }
    return color / totalWeight;
}

// --------------------- Main Shader ---------------------

void main() {
    vec2 uv = textureCoords;
    //  Fix UV Aspect Ratio

    // float aspectRatioFactor = max(u_image_size.x, u_image_size.y) / min(u_image_size.x, u_image_size.y);
    // uv.x *= aspectRatioFactor;
    
    // float k = (aspectRatioFactor - 1.0) / 2.0;

    float showFactor = 1.;
    // uv.x += 1.0 - k;

    // //  Use square border step but only horizontal
    // float left = step(1.0, uv.x);
    // float right = step(k, abs((aspectRatioFactor + 1.0-k)- uv.x));
    // showFactor = left * right;



    // Use animated smooth noise for direction
    float angle = smoothNoise(uv * 10.0 + u_time * 0.1) * 6.2831; // 2π
    vec2 dir = vec2(cos(angle), sin(angle)) * 2.0;

    // Get blurred color along noisy brush stroke direction
    vec3 blurCol = directionalBlur(uv, dir);

    // Add edge lines using Sobel operator
    float edge = sobelEdge(uv);
    blurCol -= edge * 0.3; // edge darkening

    // Add animated grain for a painterly texture
    float grain = (smoothNoise(uv * 200.0 + u_time * 0.5) - 0.5) * 0.08;
    blurCol += grain;

    // Quantize for stylized painty look
    blurCol = floor(blurCol * 24.0) / 24.0;

    fragColor = showFactor * vec4(blurCol, 1.0);
}
