#version 330 core

in vec2 a_VertexPosition;


void main(){
    gl_Position = vec4(a_VertexPosition, 0.0, 1.0);
}