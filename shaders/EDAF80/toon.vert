
#version 410

layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 normal;

uniform mat4 vertex_model_to_world; //World matrix
uniform mat4 normal_model_to_world; //Inverse world matrix
uniform mat4 vertex_world_to_clip;
uniform vec3 light_position;
uniform vec3 camera_position;

out vec3 norm;
out vec3 view;
out vec3 light;

void main()
{
    vec3 worldPos = vec3(vertex_model_to_world * vec4(vertex, 1.0));
	norm = vec3(normal_model_to_world * vec4(normal, 0.0));
    view = camera_position - worldPos; // Calculate in frag to avoid missing fragment in ray-tracing
    light = light_position - worldPos;
	gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(vertex, 1.0);
}



