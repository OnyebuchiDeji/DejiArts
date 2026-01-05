#version 330 core

//  Ep7 - "How to texture a procedural object"
/**
    Consider the GL_WRAP settings: GL_REPEAT and GL_CLAMP

    GL_REPEAT makes the texture be repeated when the uv is less than or
    greater than the 0->1 range. This is what I often use!

    GL_CLAMP on the other hand, once past the 0->1 range in both X and Y axis,
    it "clamps" the value at the limit of that range, repeating the last row and column
    of pixels.
        GL_CLAMP is most useful for textures with a transparent background. You's want
        that transparent pixel to repeat 
    
    Then consider GL_FILTER options: GL_NEAREST vs GL_LINEAR vs GL_MIPMAP

    The Filter determines how missing pixels are filled in from the texels
    E.g. when a Texture is zoomed in, the orginal image does not have enough information
    for the extent of the zoom
    So the GL_FILTER determines how the missing pixel information will be filled in

    GL_NEAREST: This makes it that for every pixel in the screen, it checks the general/local
    area *where* in the texture that pixel falls, which texel is the closest to that location
    and takes that color.

    GL_LINEAR: It will interpolate between colors. it slowly fades to the color of the neighbouring
    box.
        Also, the interpolation is Bilinear, meaning interpolation can occur in a diagonal line.
        It can also cause linear-directional artefacts

        For a smoother kind of filtering, you might have to implement it yourself.

    GL_MIPMAP: Mipmaps are smallere versions of the same texture that automatically get sampled
    based on how big the texture appears on the screen.

        Hence, when the texture is zoomed-out of, such that it repeats by the GL_WRAP
        it can be seen that when the GL_FILTER is MIPMAP, the result is better, less blurry
        as it samples the texture from the downsampled version!
*/

// in vec2 v_TextureCoords;

uniform sampler2D u_Texture0;
uniform sampler2D u_Texture1;
uniform sampler2D u_Texture2;

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 1e-3;

mat2 Rot(float a)
{
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k)
{
    float h = clamp( 0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    t = clamp(t, 0.0, 1.0);

    vec3 c = a + t * ab;

    return length(p - c) - r;
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap ) / dot(ab, ab);
    // t = clamp(t, 0.0, 1.0);  //  no clamping of t

    vec3 c = a + t * ab;

    float x = length(p - c) - r;
    float y = (abs(t - 0.5) - 0.5) * length(ab);
    float e = length(max(vec2(x, y), 0.0));
    float i = min(max(x, y), 0);    //  for inside distance correction

    return e + i;
}

float sdTorus(vec3 p, vec2 r)
{
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
}

float sdBox(vec3 p, vec3 s)
{
    p = abs(p) - s;
    return length(max(p, 0.0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

void TransformCube(inout vec3 p)
{
    p.xy *= Rot(u_time * 0.4);
    p.xz *= Rot(u_time * 0.2);
}

void TransformSphere(inout vec3 p)
{
    p.xy *= Rot(u_time * 0.4);
    p.xz *= Rot(u_time * 0.2);
}
void TransformSphere2(inout vec3 p)
{
    // p.xy *= Rot(u_time * 0.4);
    // p.xz *= Rot(u_time * 0.2);
    p = p;  //  have to do this because it's inout
}

void TransformShape(inout vec3 p)
{
    // p.xy *= Rot(u_time * 0.4);
    // p.xz *= Rot(u_time * 0.2);
    p = p;
}

float GetDistCube(vec3 p)
{
    float bd = sdBox(p, vec3(1.0));

    float d = bd;
    
    return d;
}

float GetDistSphere(vec3 p)
{
    //  Sphere
    float d = length(p) - 1.5;
    
    return d;
}

float GetDistSphereDisplacement(vec3 p)
{
    float d = length(p) - 1.5;
    //  procedural displacement / modifying the distance!
    d += sin(p.y * 5.0 + u_time) * 0.1;
    return d;
}

float GetDist(vec3 p)
{
    // float bd = sdBox(p, vec3(1.0));

    float d = length(p) - 1.5;

    //  Adding Bump Maps!
    vec2 uv = vec2(atan(-p.x, p.z) / 6.2832, 1.0 * p.y / 3.0) + 0.5;
    //  Bum Maps from Texture 2
    float disp = texture(u_Texture2, uv).r;

    //  fade out top and bottom
    disp *= smoothstep(1.4, 1.0, abs(p.y));

    d -= disp * 0.03; //  Original from episode

    // d += disp * 0.1; //   mine

    return d * 0.4;
}

float RayMarchCube(vec3 ro, vec3 rd)
{
    float dO = 0.0;
    for (int i=0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + rd * dO;
        //  Make Cube Rotate and Yet the Texture
        //  doesn't rotate normally unless the same transformation
        //  is done below in the `if (d < MAX_DIST)` block
        TransformCube(p);
        
        float dS = abs(GetDistCube(p));
        dO += dS;
        if (dO > MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    return dO;
}

float RayMarchSphere(vec3 ro, vec3 rd)
{
    float dO = 0.0;
    for (int i=0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + rd * dO;
        //  Make Cube Rotate and Yet the Texture
        //  doesn't rotate normally unless the same transformation
        //  is done below in the `if (d < MAX_DIST)` block
        TransformSphere(p);
        
        float dS = abs(GetDistSphere(p));
        dO += dS;
        if (dO > MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    return dO;
}

float RayMarchSphere2(vec3 ro, vec3 rd)
{
    float dO = 0.0;
    for (int i=0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + rd * dO;
        //  Make Cube Rotate and Yet the Texture
        //  doesn't rotate normally unless the same transformation
        //  is done below in the `if (d < MAX_DIST)` block
        TransformSphere2(p);
        
        float dS = abs(GetDistSphere(p));
        dO += dS;
        if (dO > MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    return dO;
}

float RayMarch(vec3 ro, vec3 rd)
{
    float dO = 0.0;
    for (int i=0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + rd * dO;
        //  Make Cube Rotate and Yet the Texture
        //  doesn't rotate normally unless the same transformation
        //  is done below in the `if (d < MAX_DIST)` block
        TransformShape(p);
        
        float dS = abs(GetDist(p));
        dO += dS;
        if (dO > MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    return dO;
}

vec3 GetNormal(vec3 p)
{
    float d = GetDist(p);
    vec2 e = vec2(1e-3, 0);
    return normalize(
        d - vec3(
            GetDist(p - e.xyy),
            GetDist(p - e.yxy),
            GetDist(p - e.yyx)
        )
    );
}

float GetLight(vec3 p)
{
    vec3 lightPos = vec3(3.0, 5.0, 4.0);
    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p);
    //  diffuse lighting values moved to be
    //  between range 0.0 -> 1.0
    float dif = clamp(dot(n, l) * 0.5 + 0.5, 0.0, 1.0);
    float d = RayMarch(p + n * SURF_DIST * 2.0, l);
    if (p.y < 0.01 && d < length(lightPos - p)) dif *= 0.5;
    return dif;
}


vec3 CamViewRays(vec2 uv, vec3 p, vec3 l, float z)
{
    vec3 f = normalize(l - p),
        r = normalize(cross(vec3(0.0, 1.0, 0.0), f)),
        u = cross(f, r),
        c = p + f * z,
        i = c + uv.x * r + uv.y * u,
        d = normalize(i - p);
    return d;
}

void ViewTextureNormally(inout vec3 col)
{
    // col = texture(u_Texture0, v_TextureCoords.xy * 2).rgb;
    vec2 uv = gl_FragCoord.xy / u_resolution;
    col = texture(u_Texture0, uv * 2).rgb;
}

void ViewTextureAsThoughCubeIsTranparent(inout vec3 col)
{
    //  View Texture as Though Cube is Transparent
    vec2 uv = gl_FragCoord.xy / u_resolution;
    col = texture(u_Texture0, uv).rgb;
}

void MainTexturedCube()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y; //  flip mouse y coordinates due to pygame's coord system
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0.0);

    vec3 ro = vec3(0.0, 3.0, -3.0);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);

    vec3 rd = CamViewRays(uv, ro, vec3(0.0), 1.0);

    float d = RayMarchCube(ro, rd);

    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        TransformCube(p);
        vec3 n = GetNormal(p);

        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1.0, 2.0, 3.0))) * 0.5 + 0.5;
        col += dif * dif;   //  or col = vec3(dif * dif)

        // ViewTextureAsThoughCubeIsTranparent(col);

        //  Convert the point of the Cube Face into a vec2 position
        //  Without 0.5, the below shows a repitition,
        //  this is because the box goes from -1 to 1 in both x and y direcitons
        //  So simply move the below to space 0 -> 1 using * 0.5 + 0.5
        // uv = p.xy * 0.5 + 0.5;
        // col = texture(u_Texture0, uv).rgb;

        //  Now to get the texture for the other faces:
        vec3 colXZ = texture(u_Texture0, p.xz * 0.5 + 0.5).rgb;
        vec3 colYZ = texture(u_Texture0, p.yz * 0.5 + 0.5).rgb;
        vec3 colXY = texture(u_Texture0, p.xy * 0.5 + 0.5).rgb;

        // col = COLXZ 
        //  Look at normal!
        // col = abs(n);   //  Abs is not needed here since GetDist already implements abs

        //  Use normal to blend the colors
        //  Note it's alway multiplied to the perpendixular
        //  to the plane specified by colAB
        //  E.g. colXZ -> Y, Y is perpendicular to the XZ plane
        col = colXZ * n.y + colYZ * n.x + colXY * n.z;
        
    }

    // ViewTextureNormally(col);

    col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void MainSphereTextureMapping_Triplanar_Technique()
{
     vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y; //  flip mouse y coordinates due to pygame's coord system
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0.0);

    vec3 ro = vec3(0.0, 3.0, -3.0);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);

    vec3 rd = CamViewRays(uv, ro, vec3(0.0), 1.0);

    float d = RayMarchSphere(ro, rd);

    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        TransformSphere(p);
        vec3 n = GetNormal(p);

        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1.0, 2.0, 3.0))) * 0.5 + 0.5;
        col += dif * dif;   //  or col = vec3(dif * dif)

        //  Consider that this same technique is called Triplanar Mapping

        n = abs(n); //  now essential for the sphere

        //  Do this to make the values close to 1 stay close to 1, ut values close to 0
        //  to become even closer to 0
        //  By doing this, the lines separating the planes become more pronounced
        //  becoming darker because the n.x, n.y, n.z pixels become
        //  so small that all the pixels don't add up to 1.0 hene the darkeness at
        //  the edges.
        //  Now, make the value as igh as possible
        //  because of the normalization done below
        n = pow(n, vec3(20.0));
        //  so do this to normalize the n value,
        //  retaining its smoothness and making it brighter
        //  while ensuring the rifges, the boundaries still tighter
        n /= n.x + n.y + n.z; 
        
        vec3 colXZ = texture(u_Texture0, p.xz * 0.5 + 0.5).rgb;
        vec3 colYZ = texture(u_Texture0, p.yz * 0.5 + 0.5).rgb;
        vec3 colXY = texture(u_Texture0, p.xy * 0.5 + 0.5).rgb;

        col = colXZ * n.y + colYZ * n.x + colXY * n.z;
        // col = n;
    }

    // ViewTextureNormally(col);

    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void MainSphereTextureRevolvingText()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y; //  flip mouse y coordinates due to pygame's coord system
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0.0);

    vec3 ro = vec3(0.0, 3.0, -3.0);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);

    vec3 rd = CamViewRays(uv, ro, vec3(0.0), 1.0);

    float d = RayMarchSphere(ro, rd);

    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        TransformSphere2(p);
        vec3 n = GetNormal(p);

        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1.0, 2.0, 3.0))) * 0.5 + 0.5;
        col += dif * dif;   //  or col = vec3(dif * dif)

        //  Consider that this same technique is called Triplanar Mapping
        //  This approach has poles


        n = abs(n); //  now essential for the sphere
        n *= pow(n, vec3(20.0));
        n /= n.x + n.y + n.z; 
        
        vec3 colXZ = texture(u_Texture0, p.xz * 0.5 + 0.5).rgb;
        vec3 colYZ = texture(u_Texture0, p.yz * 0.5 + 0.5).rgb;
        vec3 colXY = texture(u_Texture0, p.xy * 0.5 + 0.5).rgb;
        col = colXZ * n.y + colYZ * n.x + colXY * n.z;

        //  Make Logo Appear Around The Sphere
        //  gives angle in radians around the point p on plane pXZ
        //  the Y coordinate of pixel P on surface of sphere
        //  is used since Y coordinate has range -1 -> 1. from center
        //  of sphere.

        //  Now, because the Triplanar Mapping approach has poles,
        //  and because the sphere's space goes from -1.5 to 1.5
        //  do `p.y / 3.0 + 0.5` 
        //  Here, the polar angle goes from -PI to PI
        // uv = vec2(atan(p.x, p.z), p.y / 3.0 + 0.5);

        //  Here, it makes it makes the polar angle go from 0 to 1 
        //  by dividing by 2PI and adding 0.5
        // uv = vec2(atan(p.x, p.z) / 6.2832 + 0.5, p.y / 3.0 + 0.5);
        //  To make it cleaner, add 0.5 to the vec2
        // uv = vec2(atan(p.x, p.z) / 6.2832, p.y / 3.0) + 0.5;

        //  Squish the texture in y-axis by doing `2.0 * p.y / 2.0`
        // uv = vec2(atan(p.x, p.z) / 6.2832, 2.0 * p.y / 3.0) + 0.5;
        // vec4 logo = texture(u_Texture1, uv);
        // //  Remove the repitition at the poles!
        // logo.a *= smoothstep(0.6, 0.5, abs(p.y));
        // col = mix(col, logo.rgb, logo.a);

        //  Make Text Spin Around
        // uv = vec2(atan(p.x, p.z) / 6.2832, 2.0 * p.y / 3.0) + 0.5;
        // uv.x -= u_time * 0.1;
        // vec4 logo = texture(u_Texture1, uv);
        // //  Remove the repitition at the poles!
        // logo.a *= smoothstep(0.6, 0.5, abs(p.y));
        // col = mix(col, logo.rgb, logo.a);

        //  Simulate the wrap filter effect in case
        //  the global texture filter is GL_CLAMP (which would
        //  normally make the text stop rotating) 
        // uv = vec2(atan(p.x, p.z) / 6.2832, 2.0 * p.y / 3.0) + 0.5;
        //  flip the x axis!
        uv = vec2(atan(-p.x, p.z) / 6.2832, 2.0 * p.y / 3.0) + 0.5;
        uv.x = fract(uv.x - u_time * 0.1);
        vec4 logo = texture(u_Texture1, uv);
        //  Remove the repitition at the poles!
        logo.a *= smoothstep(0.6, 0.5, abs(p.y));
        col = mix(col, logo.rgb, logo.a);

        
        // uv = gl_FragCoord.xy /u_resolution.xy;
        // col = texture(u_Texture0, uv * 3.0).rgb;
    }

    // ViewTextureNormally(col);

    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y; //  flip mouse y coordinates due to pygame's coord system
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0.0);

    vec3 ro = vec3(0.0, 3.0, -3.0);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);

    vec3 rd = CamViewRays(uv, ro, vec3(0.0), 1.0);

    float d = RayMarch(ro, rd);

    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        TransformShape(p);
        vec3 n = GetNormal(p);

        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1.0, 2.0, 3.0))) * 0.5 + 0.5;
        col += dif * dif;   //  or col = vec3(dif * dif)

        //  Consider that this same technique is called Triplanar Mapping
        //  This approach has poles

        n = abs(n); //  now essential for the sphere
        n *= pow(n, vec3(2.0));
        n /= n.x + n.y + n.z; 
        
        vec3 colXZ = texture(u_Texture0, p.xz * 0.5 + 0.5).rgb;
        vec3 colYZ = texture(u_Texture0, p.yz * 0.5 + 0.5).rgb;
        vec3 colXY = texture(u_Texture0, p.xy * 0.5 + 0.5).rgb;
        col = colXZ * n.y + colYZ * n.x + colXY * n.z;

        //  Make Logo Appear Around The Sphere
    
        uv = vec2(atan(-p.x, p.z) / 6.2832, 2.0 * p.y / 3.0) + 0.5;
        uv.x = fract(uv.x - u_time * 0.1);
        vec4 logo = texture(u_Texture1, uv);
        //  Remove the repitition at the poles!
        logo.a *= smoothstep(0.6, 0.5, abs(p.y));
        col = mix(col, logo.rgb, logo.a);

        col *= dif; //  Add back lighting / shading
        // uv = gl_FragCoord.xy /u_resolution.xy;
        // col = texture(u_Texture0, uv * 3.0).rgb;
    }

    // ViewTextureNormally(col);

    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}