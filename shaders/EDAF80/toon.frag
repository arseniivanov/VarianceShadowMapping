#version 410

uniform float shininess;
in vec3 norm;
in vec3 view;
in vec3 light;

out vec4 FragColor;

void main()
{    
    vec3 N = normalize(norm);
    vec3 L = normalize(light);
    vec3 V = normalize(view);
    vec3 R = normalize(reflect(-L,N));
    vec3 ambient = vec3(0.5f,0.5f,1.0f);
    vec3 color;
    
    if (max(dot(V,R), 0.0) > 0.95){
        color = vec3(1.0f,1.0f,1.0f);
    } else if (dot(V,N) < 0.3) {
        color = vec3(0.0f,0.0f,0.0f);
    } else {
        color = ambient;
    }
    FragColor = vec4(color,1.0f);
}

