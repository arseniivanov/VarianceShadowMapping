#version 410

layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 binormal;

uniform mat4 vertex_model_to_world; //World matrix
uniform mat4 normal_model_to_world; //Inverse world matrix
uniform mat4 vertex_world_to_clip;
uniform vec3 light_position;
uniform vec3 camera_position;

out vec2 texCoords;
out vec3 norm;
out vec3 view;
out vec3 light;
out mat3 TBN;

void main()
{
    vec3 worldPos = vec3(vertex_model_to_world * vec4(vertex, 1.0));
	norm = vec3(normal_model_to_world * vec4(normal, 0.0));
    view = camera_position - worldPos; // Calculate in frag to avoid missing fragment in ray-tracing
    light = light_position - worldPos;
    vec3 T = normalize(vec3(normal_model_to_world * vec4(tangent, 0.0)));
    vec3 B = normalize(vec3(normal_model_to_world * vec4(binormal, 0.0)));
    vec3 N = normalize(vec3(normal_model_to_world * vec4(normal, 0.0)));
    TBN = mat3(T, B, N);
    texCoords = aTexCoords;
	gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(vertex, 1.0);
}



