#version 410

uniform sampler2D blur_texture;

layout (location = 0) out vec4 blurred_moments;

in VS_OUT {
	vec2 texcoord;
} fs_in;

void main()
{ 
    vec2 Texcoord = fs_in.texcoord;
    vec2 scale = vec2(0.0f, 1.0f/1024); //vertical blur 
    vec4 color = vec4(0.0);
	float parts = 1.0/64.0;
    color += texture2D(blur_texture, Texcoord + vec2(-3.0*scale))*parts;
	color += texture2D(blur_texture, Texcoord + vec2(-2.0*scale))*6*parts;
	color += texture2D(blur_texture, Texcoord + vec2(-1.0*scale))*15*parts;
 	color += texture2D(blur_texture, Texcoord + vec2(0.0 , 0.0))*20*parts;
	color += texture2D(blur_texture, Texcoord + vec2(1.0*scale))*15*parts;
	color += texture2D(blur_texture, Texcoord + vec2(2.0*scale))*6*parts;
	color += texture2D(blur_texture, Texcoord + vec2(3.0*scale))*parts;

	blurred_moments = vec4(color.xy,0.0,1.0);
};
