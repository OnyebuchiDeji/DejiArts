#version 330 core

/**
    This Vertex Shader is for rendering
    the cube needed to demonstrate episode 4
*/

layout(location = 0) in vec3 a_VertexPosition;
// layout(location = 1) in vec3 a_Normal;
layout(location = 2) in vec2 a_TexturePosition;

uniform mat4 u_ModelMat;
uniform mat4 u_ViewMat;
uniform mat4 u_ProjMat;


/**
  From comparing the effect of v_HitPos
  with v_HitPos_md, because the Torus Space Visualization
  color matches that shown in the episode 4, 
  I conclide that the HitPos indeed ought to be transformed
  using the Cube's u_ModelMat matrix so it can be properly used!

  Although both HitPos and v_HitPos first appear to produce the same result
  after moving around the Cube, you will start to notice the Torus within being displaced
  when using v_HitPos. Whereas, with v_HitPos_md, the model-spatial-transformed v_HitPos, 
  this error is not seen.
  v_HitPos_md more accurately represents the vertices of the cube in
  Object space as it takes into account the u_ModelMat transformation
  performed on the cube object's vertices! 
*/
out vec3 v_HitPos;
out vec3 v_HitPos_md;    //  to see the effect of the model matric on hitpos result!
// out vec3 v_Normal;
out vec2 v_TextureUV;
out mat4 v_MVP;

//  This was my explanation of its use:
//  should move torus from world space view
//  which would be the case when using just the camera position
//  to Projected Camera Space View
//  Differs from using MVP since that moves Torus to Model's
//  Projected Camera Space View
//  which makes Torus appear at center of Cube!
//  But it changed nothing using it in place of MVP
//  the real issue I was trying to solve was with `v_HitPos` as stated below!
out mat4 v_VP;  //  only view projection

// out vec4 v_ClipCoords;

// float z = 0.9999;

//  FOR ADVANCED SKYBOX USING TWO TRIANGLES
// vertices = [
//    (-1, -1, z), (1, 1, z), (-1, 1, z),
//    (-1, -1, z), (1, -1, z), (1, 1, z)]
//  FOR ADVANCED ADVANCED SKYBOX USING ONE TRIANGLE
// vec3[3] skyVertexData = vec3[](
//     vec3(-1, -1, z), vec3(3, -1, z), vec3(-1, 3, z)
// );

void main()
{
    //  Modify Vertex Coords
    mat4 mvp = u_ProjMat * u_ViewMat * u_ModelMat;
    vec4 nm_pos = (mvp * vec4(a_VertexPosition, 1.0));
    v_MVP = mvp;
    // v_VP = u_ProjMat * u_ViewMat;

    // v_ClipCoords = vec4(skyVertexData[gl_VertexID], 1.0);


    gl_Position = nm_pos;

    // v_Normal = mat3(transpose(inverse(u_ModelMat))) * normalize(a_Normal);

    //  Not right. HitPos shouldn't be projected vertices! They should be World Space Vertices
    // v_HitPos = nm_pos.xyz;

    //  Below is right!
    // The HitPos must not be `nm`, which is the Projected Coordinates of the Model!
    //  By multiplyign by u_ModelMat, transformations on the Cube will affect the 
    //  Ray direction that uses v_HitPos in the fragmenet shader
    v_HitPos_md = (u_ModelMat * vec4(a_VertexPosition, 1.0)).xyz;
    v_HitPos = a_VertexPosition;
    v_TextureUV = a_TexturePosition;
}