#version 330 core


out vec4 fragColor;

in vec2 textureCoord;

uniform sampler2D textureVar1;
uniform float uTime;

void main()
{
    vec2 samplePos = vec2(textureCoord.x + sin(textureCoord.y * 5 + uTime) * 0.1, textureCoord.y);
    vec3 myTexture = vec3(texture(textureVar1, samplePos)).rgb * 0.5;

    fragColor = vec4(myTexture.r * 10, myTexture.g * 10, myTexture.b * 10, 1.0);
}