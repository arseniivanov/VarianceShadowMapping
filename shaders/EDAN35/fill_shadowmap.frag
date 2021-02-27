#version 410

layout (location = 0) out vec4 geometry_moments;

void main() 
{
    //moments
    float depth = gl_FragCoord.z;
	float moment1 = depth;
	float moment2 = depth * depth;
	float dx = dFdx(depth);
	float dy = dFdy(depth);
	moment2 += 0.25*(dx*dx+dy*dy); //Fix to avoid shadow bleeding from 8.2 in GPU GEMS 3 chapter 8.
    
	geometry_moments = vec4(moment1, moment2, 0.0, 0.0); //moments_texture in [0,1]
	
};
