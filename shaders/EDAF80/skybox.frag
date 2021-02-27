#version 410

out vec4 FragColor;

in vec3 normal;

uniform samplerCube cubemap;

void main()
{    
    FragColor = texture(cubemap, normal);
}
