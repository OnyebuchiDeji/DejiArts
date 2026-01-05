#version 330 core

precision highp float;


in vec3 v_HitPos;   //  this is the vertices of the cube for this pixel batch!
in vec3 v_HitPos_md;
// in vec3 v_Normal;
in vec2 v_TextureUV;
in mat4 v_MVP;
in mat4 v_VP;    //  Is not unique from MVP
// in vec4 v_ClipCoords;
 

// uniform vec2 u_resolution;
uniform vec3 u_CameraPosition;  //  used for ray origin
uniform mat4 u_ModelMat;  //  used for ray origin
// uniform sampler2D u_SkyRenderTexture;
// uniform mat4 u_InvProjViewMat;
// uniform mat4 u_MVP;
// uniform sampler2D u_Texture;
// uniform float u_time;
// uniform vec2 u_mouse;



int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 1e-3;

/**
    This episode demonstrates using a shader on a Cube in Unity!

    The first end result is a Torus being rendered within the cube
    as well as other effects done on the cube! With the cube's vertices
    and edges being made transparent!

    I'm taking inspiration from it for learning how to do that!
    Note! A RayMarch shader was chosen for the cube, giving it a translucent color.

    Many of the box's shader properties were modified

    Unity actually has its own modified shading language!

    In short, I can't really render this normally unless I add a cube
    vertex to run this example!
*/


float VisualizeCubeUV(vec2 uv)
{
    vec3 col = vec3(0);
    col.rg = uv;
    return col;
}

/**
    A slight gradient appears on the cube
    showing that the rays diverge and that it's correct!
*/
float VisualizeCamera(vec2 uv)
{
    vec3 col = vec3(0);
    //  Creating Simple camera model
    vec3 ro = vec3(0, 0, -3);
    vec3 rd = normalize(vec3(uv.x, uv.y, 1.));
    col.rgb = rd;
    return col;
}

float BlackBoxRedSphere(vec3 p)
{
    float sphereRad = .5;
    float sd = length(p) - sphereRad; //    spegerew
    return sd;
}

float BlackBoxTorus(vec3 p)
{
    //  Torus
    vec2 torusRadii = vec2(.5, .1);
    float d = length(vec2(length(p.xy) - torusRadii.x, p.z)) - torusRadii.y;
    return d;
}

float BlackBoxFlatTorus(vec3 p)
{
    //  Torus
    vec2 torusRadii = vec2(.5, .1);
    //  to turn torus around, replace p.z with p.y
    float d = length(vec2(length(p.xy) - torusRadii.x, p.y)) - torusRadii.y;
    return d;
}

/**
    Returns a distance from point p to a scene to
    be built 
*/
float GetDist(vec3 p)
{
    // float d = BlackBoxRedSphere(p);
    // float d = BlackBoxTorus(p);
    // float d = BlackBoxFlatTorus(p);

    //  distance to a sphere at the origin
    // float sphereRad = .25;
    // float sd = length(p) - sphereRad;
    
    //  Torus
    vec2 torusRadii = vec2(.5, .1);
    float d = length(vec2(length(p.xz) - torusRadii.x, p.y)) - torusRadii.y;
    

    return d;
}

//  RayMarch returns the distance to the scene or depth along
//  each viewing ray of the camera until a scene object
//  is hit or the scene is passed
float RayMarch(vec3 ro, vec3 rd)
{
    float dO = 0;
    float dS;
    for (int i = 0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + dO * rd;
        dS = GetDist(p);    //  GetDist: distance from p to the scene
        dO += dS;   // for next iteration to move p by new dO toward scene
        //  if the p's distance from scene is small enough, it's hit a scene object
        //  or if dO is too large, there has been a miss, break!
        if (dS < SURF_DIST || dO > MAX_DIST) break; 
    }
    return dO;  //  distance from origin
}

vec3 GetNormal(vec3 p)
{
        vec2 e = vec2(1e-2, 0); //  epsilon
        vec3 n = GetDist(p) - vec3(
        GetDist(p - e.xyy),
        GetDist(p - e.yxy),
        GetDist(p - e.yyx)
    );
    return normalize(n);
}

vec3 VisualizeBlackBoxRedSphere(vec3 col, float d)
{
    if (d < MAX_DIST)
    {
        col.r = 1.;
    }
    return col;
}

//  Visualizes both the sphere's and torus's normalas on the box!
vec3 VisualizeBlackBoxWithShapeNormal(vec3 ro, vec3 rd, float d, vec3 col)
{
    //  if true, surface has been hit!
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;   //  get point on surface
        vec3 n = GetNormal(p);  //  get point's normal!
        col.rgb = n;
    }
    return col;
}

void FirstRenderExampleOGCamera()
{
    //  move the origin to the cube's middle!
    // vec2 uv = (gl_FragCoord.xy * 0.5 - u_resolution.xy) / u_resolution.y;
    vec2 uv = v_TextureUV - 0.5;
    vec3 col = vec3(0);

    // col = VisualizeCubeUV(uv);
    
    //  Creating Simple camera model
    vec3 ro = vec3(0, 0, -3);   
    vec3 rd = normalize(vec3(uv.x, uv.y, 1.));
    // col = VisualizeCamera(uv);

    float d = RayMarch(ro, rd);

    // col = VisualizeBlackBoxRedSphere(col, d);
    // col = VisualizeBlackBoxWithShapeNormal(ro, rd, d, col);
    
    //  if true, surface has been hit!
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;   //  get point on surface
        vec3 n = GetNormal(p);  //  get point's normal!
        col.rgb = n;
    }

    gl_FragColor = vec4(col, 1.0);
}

void BoxWith3DTorusComplete1()
{
    //  move the origin to the cube's middle!
    // vec2 uv = (gl_FragCoord.xy * 0.5 - u_resolution.xy) / u_resolution.y;
    vec2 uv = v_TextureUV - 0.5;
    vec3 col = vec3(0);

    
    //  Creating Simple camera model
    //  doing this properly renders the 3d shapes in the cube
    //  such that they're actually in the cube rather than just on its surface
    //  it makes it look like a Hologram!
    //  Also, the Box should be at the Origin of the world space 
    //  Consider this first one's result
    //  Notice, in this version both camera position
    //  and hit pos are in the world space!
    //  However, the results are still bert good!
    //  camera pos is in world space
    //  v_HitPos is in world space (pure face vertices of cube. Not transformed by mvp matrix)
    // vec3 ro = u_CameraPosition; //  ray origin should be camera position!
    // vec3 rd = normalize(v_HitPos - ro);  //  where object is hit - camera position!

    //  Note! HitPos is already in World Space
    //  But by transforming it by the inverse of model view projection matrix)
    //  Doing the below makes the Torus only be visible on one face! Like looking at a TV
    // vec3 ro  = u_CameraPosition;
    // vec3 rd = normalize((inverse(v_MVP) * vec4(v_HitPos, 1.0)).xyz - ro);

    //  Now, consider effects when camera position
    //  is transformed to be object space.
    //  This is the best effect because when the cube's position
    //  or orientation changes, so will the Torus's

    //  Using inverse(MVP) makes the torus move and rotate in opposite direction
    //  to camera
    // vec3 ro = (inverse(v_MVP) * vec4(u_CameraPosition, 1.0)).xyz;

    //  By using MVP on CameraPosition, you effectively move the camera to the center
    //  of the model's origin. Hence Torus can only be viewed as though looking from the camera
    //  at the Torus's (and Box's) Center 
    // vec3 ro = (v_MVP * vec4(u_CameraPosition, 1.0)).xyz;
    //  Object is now in view space
    // vec3 rd = normalize(v_HitPos - ro);  //  where object is hit - camera position!

    //  Moving Obhect from World space to Object Space!
    // vec3 ro  = u_CameraPosition;
    // vec3 rd = normalize((u_ModelMat * vec4(v_HitPos, 1.0)).xyz - ro);  //  where object is hit - camera position!

    //  This is the solution of moving the Camera Properly to Object Space!
    //  Without the inverse(), the result will cause the Torus to warp
    //  when the cube is moved.
    //  The inverse ensures the camera has the opposite object-local spatial transformation
    //  to the Cube and the torus, making it function properly
    //  Object is now in view space

    // vec3 ro = (inverse(u_ModelMat) * vec4(u_CameraPosition, 1.0)).xyz;
    // vec3 rd = normalize(v_HitPos - ro);  //  where object is hit - camera position!
    
    vec3 ro = (inverse(u_ModelMat) * vec4(u_CameraPosition, 1.0)).xyz;
    vec3 rd = normalize(v_HitPos_md - ro);  //  where object is hit - camera position!

    float d = RayMarch(ro, rd);

    //  if true, surface has been hit!
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;   //  get point on surface
        vec3 n = GetNormal(p);  //  get point's normal!
        col.rgb = n;
        
        gl_FragColor = vec4(col, 1.0);
    }
    else{   //  Make black areas of cube transparent
        //  works with a skybox
        //  to make normal parts of cube where Torus doesn't appear
        //  to be transparent
        // col = vec3(0.0);

        //  At least i tried with making the sky texture match such that the cube
        //  is actually transparent (though I didn't achieve this using the shader)
        // vec4 worldCoords = u_InvProjViewMat * v_ClipCoords;
        // vec3 texCubeCoord = normalize(worldCoords.xyz / worldCoords.w);
        // col = texture(u_SkyRenderTexture, texCubeCoord.xy).rgb;

        // col = texture(u_SkyRenderTexture, (inverse(v_VP) * vec4(v_HitPos, 1.0)).xy).rgb;

        //  Finally found out how it works
        //  Using the skybox render as a texture here
        //  such that the cube background not containing the
        //  Torus indeed appears transparent, displaying the skybox texture
        //  appropriate for that region
        // uv = texture(u_SkyRenderTexture, uv).rgb;
        
        
        gl_FragColor = vec4(0.0);
    }

}

//  Only Works When Texture Coordinates are Passed In
void BoxWithTextureAnd3DTorusComplete2()
{
    //  Rendering Torus Within Cube With Texture With a Hole Cut Out
    vec2 uv = v_TextureUV - 0.5;
    vec3 col = vec3(0);

    vec3 Normal = normalize(v_Normal);
    gl_FragColor = vec4(Normal, 1.0);

    //  When using just the camera in world space
    //  as ray origin!
    vec3 ro = u_CameraPosition; //  ray origin should be camera position!
    vec3 ro = vec4(u_CameraPosition, 1.0).xyz;
    vec3 rd = normalize(v_HitPos - ro);  //  where object is hit - camera position!

    //  for proper working! 
    vec3 ro = (inverse(u_Model) * vec4(u_CameraPosition, 1.0)).xyz; 
    vec3 rd = normalize(v_HitPos_md - ro);  //  where object is hit - camera position!

    float d = RayMarch(ro, rd);

    vec3 tex = texture(u_Texture, uv).rgb;
    float m = dot(uv, uv);  //  distance of pixel from center

    //  if true, surface has been hit!
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;   //  get point on surface
        vec3 n = GetNormal(p);  //  get point's normal!
        col.rgb = n;
    }

    col = mix(col, tex, smoothstep(0.1, 0.2, m));

    gl_FragColor = vec4(col, 1);

}

void main()
{
    // FirstRenderExampleOGCamera();
   BoxWith3DTorusComplete1();

    
}
