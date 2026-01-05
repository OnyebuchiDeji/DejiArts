#version 330 core

// out vec4 fragColor;

in vec4 v_ClipCoords;

uniform samplerCube u_TextureSkybox;

uniform mat4 u_InvProjViewMat;

void main()
{
    vec4 worldCoords = u_InvProjViewMat * v_ClipCoords;

    vec3 texCubeCoord = normalize(worldCoords.xyz / worldCoords.w);
    gl_FragColor = texture(u_TextureSkybox, texCubeCoord);
}