#version 410

uniform sampler2D depth_texture;
uniform sampler2D normal_texture;
uniform sampler2D shadow_texture;
uniform sampler2D moments_texture;

uniform vec2 inv_res;

uniform mat4 view_projection_inverse;
uniform vec3 camera_position;
uniform mat4 shadow_view_projection;

uniform vec3 light_color;
uniform vec3 light_position;
uniform vec3 light_direction;
uniform float light_intensity;
uniform float light_angle_falloff;

uniform bool vsm;
uniform bool offsets;
uniform bool pcf;
uniform bool bleeding;

uniform vec2 shadowmap_texel_size;

layout (location = 0) out vec4 light_diffuse_contribution;
layout (location = 1) out vec4 light_specular_contribution;

// float off_lookup(sampler2D map,vec2 loc,vec2 off, float z) {
//     return texture(map, vec2(loc + off * shadowmap_texel_size)).r > z ? 1.0 : 0.0; 
// }

float ReduceLightBleeding(float pMax, float amount)
{
  // Remove the [0, amount] tail and linearly rescale (amount, 1].
   return smoothstep(amount, 1.0f, pMax);
}

float chebyshevUpperBound(float depth, vec2 moments)
{
	if (depth <= moments.x) // pixel fully seen
		return 1.0;
		
	float variance = moments.y - (moments.x*moments.x);
	variance = max(variance, 0.000000015);

	float d = depth - moments.x;
	float p_max = variance / (variance + d*d);
	if (bleeding) {
        p_max = ReduceLightBleeding(p_max, 0.15);
    }
	return p_max;
}



void main()
{
    vec2 texcoords = inv_res*gl_FragCoord.xy; // Normalized screen space coords [0,1]
    vec3 norm = texture(normal_texture, texcoords).xyz*2-1; //move normals to [-1,1] for use
    float zed = texture(depth_texture, texcoords).x*2-1; //Depth is stored in first element in range [0,1],  move to [-1,1]
    vec3 fragpos = vec3(texcoords*2-1,zed);
    vec4 fpos = view_projection_inverse*vec4(fragpos,1.0); //fragment position in [-1,1]. World space coordinates.
    vec4 fposW = vec4(fpos.xyz/fpos.w, 1.0); // perspective divide on fragment position in world space?.
    
    vec3 LightDir = normalize(light_direction); //Direction from middle of light (node.getFront)
    vec3 LightFrag = normalize(light_position-fposW.xyz); //Direction from light to fragment.
    
     vec3 normalOffSet = norm*(1.0f-abs(dot(norm,LightDir)))*0.00002;  //added normal offset, moves shadow-tested coordinate in normal vector direction. 
     vec3 depthOffSet = -LightFrag*0.00002; // added depth offset, moves the shapow-tested coordinate in light direction.    
    
    vec4 shadowSpaceCoords = shadow_view_projection*fposW;
    vec4 shadowSpaceCoordsW = shadowSpaceCoords/shadowSpaceCoords.w; //perspective divide on shadow position.
    shadowSpaceCoordsW = shadowSpaceCoordsW*0.5+0.5; // Move shadow space coords to [0,1] for texture lookup and shadow map comparison
    
    float shadow = 0.0;
      //shadow = texture(shadow_texture, shadowSpaceCoordsW.xy).r > shadowSpaceCoordsW.z-0.0001 ? 1.0 : 0.0; 
      //  vec2 moments = texture(moments_texture, shadowSpaceCoordsW.xy).xy;
      //  shadowSpaceCoordsW = shadowSpaceCoordsW + vec4(depthOffSet,0.0f) + vec4(normalOffSet,0.0f);
    //     PCF BELOW--------------------------
    
    if (pcf) {
        float x, y;
        for (y = -1.5; y <= 1.5; y += 1.0) {
            for (x = -1.5; x <= 1.5; x += 1.0) {
                vec2 moments = texture(moments_texture, shadowSpaceCoordsW.xy+vec2(x, y)*shadowmap_texel_size).xy;
                if (offsets) {
                    shadowSpaceCoordsW = shadowSpaceCoordsW + vec4(depthOffSet,0.0f) + vec4(normalOffSet,0.0f);
                }
                if (vsm) {
                    shadow += chebyshevUpperBound(shadowSpaceCoordsW.z,moments);
                } else {
                    shadow += moments.x > shadowSpaceCoordsW.z ? 1.0 : 0.0; 
                }
            }
        }
        shadow = shadow/16;
    } else {
        if (offsets) {
            shadowSpaceCoordsW = shadowSpaceCoordsW + vec4(depthOffSet,0.0f) + vec4(normalOffSet,0.0f);
        }
        if (vsm) {
            vec2 moments = texture(moments_texture, shadowSpaceCoordsW.xy).xy;
            shadow = chebyshevUpperBound(shadowSpaceCoordsW.z,moments);
        } else {
            shadow = texture(moments_texture, shadowSpaceCoordsW.xy).r > shadowSpaceCoordsW.z ? 1.0 : 0.0; 
        }
    }
    //shadow = texture(shadow_texture, shadowSpaceCoordsW.xy).r > shadowSpaceCoordsW.z-0.0001 ? 1.0 : 0.0; 
      //  vec2 moments = texture(moments_texture, shadowSpaceCoordsW.xy).xy;
      //  shadowSpaceCoordsW = shadowSpaceCoordsW + vec4(depthOffSet,0.0f) + vec4(normalOffSet,0.0f);
    //  shadow = chebyshevUpperBound(shadowSpaceCoordsW.z,moments);
    
    vec3 N = normalize(norm); //For some reason, normal has to be inverted <-- ask, maybe has to do with how i chose my other vectors
    vec3 V = normalize(camera_position-fposW.xyz); // Vector from fragment to camera
    vec3 R = normalize(reflect(-LightFrag,N));
    
        
    float diffVal = 0.0;
    float specVal = 0.0;
    float theta = dot(LightFrag, -LightDir);
    float outerbound = cos(light_angle_falloff);
    
    if((theta > outerbound))
    {   
        float depth = length(fposW.xyz-light_position);
        float innerbound = cos(light_angle_falloff/2);
        float epsilon = innerbound - outerbound; //Start light smoothing at half angle
        float intensity = smoothstep(0.0, 1.0, (theta - outerbound) / epsilon); //Intensity constant in middle to half angle, then falloff to 0 at 37 deg
        float attenuation = light_intensity/(depth * depth); 

        diffVal = attenuation*shadow*intensity*max(dot(N,LightFrag),0.0);
        specVal = attenuation*shadow*intensity*pow(max(dot(R,V),0.0),16);
    }
    
	light_diffuse_contribution  = vec4(diffVal*light_color,1.0f);
	light_specular_contribution = vec4(specVal*light_color,1.0f);
}

//     PCF BELOW--------------------------
//     float x, y;
//     float bias = 0.0001; //tested bias adjusted to remove fluttering on edge-case surfaces like lion head.
//     for (y = -1.5; y <= 1.5; y += 1.0) {
//         for (x = -1.5; x <= 1.5; x += 1.0) {
//             shadow += off_lookup(shadow_texture, shadowSpaceCoords.xy, vec2(x, y), shadowSpaceCoords.z-bias);
//         }
//     }
//    shadow = shadow/16;
