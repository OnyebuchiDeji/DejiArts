#version 330 core

in vec2 vertexPosition;

// in vec2 texturePosition;

// out vec2 textureCoord;

void main(){
    // textureCoord = texturePosition;
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}