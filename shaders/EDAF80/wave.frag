#version 410

uniform samplerCube cubemap;
uniform sampler2D normalMap;
uniform float t;

in VS_OUT {
    vec2 normalCoord1;
    vec2 normalCoord2;
    vec2 normalCoord3;
	vec3 view;
	vec3 light;
	mat3 TBN;
} fs_in;

out vec4 frag_color;


void main()
{        
    vec3 n1 = (texture(normalMap, fs_in.normalCoord1).rgb)*2 - 1;
    vec3 n2 = (texture(normalMap, fs_in.normalCoord2).rgb)*2 - 1;
    vec3 n3 = (texture(normalMap, fs_in.normalCoord3).rgb)*2 - 1;
    vec3 nBump = normalize(n1+n2+n3);
    vec3 N = normalize(fs_in.TBN * nBump);
    if(!gl_FrontFacing) {
    N = -N;
    }
    
    vec3 V = normalize(fs_in.view);
	vec3 L = normalize(fs_in.light);
    vec3 R = reflect(-V,N);
    
    vec4 colorDeep = vec4(0.0,0.0,0.1,1.0);
    vec4 colorShallow = vec4(0.0,0.3,0.5,1.0);
	float facing = 1 - max(dot(V,N),0.0);
	vec4 colorWater = mix(colorDeep, colorShallow, facing);
	
	vec4 skyBoxReflection = vec4(texture(cubemap, R).rgb, 1.0);
	float N1 = 1.33;
	float N2 = 1.0;
    float R0 = pow((N1-N2)/(N1+N2),2);
	float fresnel = R0 + (1-R0)*pow(1-dot(V,N),5);
	vec3 refraction;
	if(gl_FrontFacing) {
		refraction = refract(-V,N,N1/N2);
    } else {
    	refraction = refract(-V,-N,N2/N1);
    }
	vec4 skyBoxRefraction = vec4(texture(cubemap, refraction).rgb, 1.0);
	frag_color = colorWater + skyBoxReflection*fresnel + skyBoxRefraction*(1-fresnel);
}
