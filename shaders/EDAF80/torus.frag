#version 410

uniform vec3 ambient;
uniform float shininess;
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

    N = texture(normalMap, texCoords).rgb;
    N = N * 2.0 - 1.0; 
    N = normalize(TBN * N);
    vec3 diffTex = texture(diffuseMap, texCoords).rgb;
    vec3 specTex = texture(roughnessMap, texCoords).rgb;
    float diffVal = max(dot(N,L),0.0);
    float specVal = pow(max(dot(R,V),0.0),shininess);
    diff = diffTex * diffVal;
    spec = specTex * specVal;
    FragColor = vec4(ambient + diff + spec,1.0);
}
