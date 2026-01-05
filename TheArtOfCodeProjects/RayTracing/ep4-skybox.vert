#version 330 core

layout(location=0) in vec3 a_VertexPosition;

out vec4 v_ClipCoords;

void main()
{
    gl_Position = vec4(a_VertexPosition, 1.0);
    v_ClipCoords = gl_Position;
}