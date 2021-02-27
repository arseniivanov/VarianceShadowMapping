#version 410

layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 aNormal;

uniform mat4 vertex_model_to_world;
uniform mat4 vertex_world_to_clip;
uniform mat4 normal_model_to_world;

out vec3 normal;

void main()
{
    normal = vec3(normal_model_to_world * vec4(aNormal, 0.0)); // Have 0 in last argument if vertex in question isnt position bound
	gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(vertex, 1.0);
}
