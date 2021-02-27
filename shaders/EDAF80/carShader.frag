
#version 410

out vec4 FragColor;

in VS_OUT {
	vec2 texcoord;
} fs_in;

uniform sampler2D carTexture;

void main()
{    
    FragColor = texture(carTexture, fs_in.texcoord);
}


