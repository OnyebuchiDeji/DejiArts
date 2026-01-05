#version 300 es

in vec2 vertexPosition;

in vec2 texturePosition;

out vec2 textureCoords;


void main(){
    textureCoords = texturePosition;
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}