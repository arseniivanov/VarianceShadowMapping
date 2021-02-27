#version 410

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;
uniform float shininess;
uniform bool use_normal_mapping;
uniform sampler2D normalMap;
uniform sampler2D diffuseMap;
uniform sampler2D roughnessMap;

in vec3 norm;
in vec3 view;
in vec3 light;
in vec2 texCoords;
in mat3 TBN;

out vec4 FragColor;

void main()
{    
    vec3 diff;
    vec3 spec;
    
    vec3 N = normalize(norm);
    vec3 L = normalize(light);
    vec3 V = normalize(view);
        
    vec3 R = normalize(reflect(-L,N));
    float diffVal = max(dot(N,L),0.0);
    float specVal = pow(max(dot(R,V),0.0),shininess);

    if(use_normal_mapping) { 
        N = texture(normalMap, texCoords).rgb;
        N = N * 2.0 - 1.0; 
        N = normalize(TBN * N);
        diffVal = max(dot(N,L),0.0);
        float specVal = pow(max(dot(R,V),0.0),shininess);
        vec3 diffTex = texture(diffuseMap, texCoords).rgb;
        vec3 specTex = texture(roughnessMap, texCoords).rgb;
        diff = diffTex * diffVal;
        spec = specTex * specVal;
    } else {
        diff = diffuse * diffVal;
        spec = specular * specVal;
    }
    FragColor = vec4(ambient + diff + spec,0.9);
}
