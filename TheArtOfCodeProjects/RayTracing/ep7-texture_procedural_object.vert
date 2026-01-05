#version 330 core


layout(location=0) in vec2 a_VertexPosition;
layout(location=1) in vec2 a_TexturePosition;

// out vec2 v_TextureCoords;

void main()
{
    gl_Position = vec4(a_VertexPosition, 0.0f, 1.0f);
    // v_TextureCoords = a_TexturePosition;
};