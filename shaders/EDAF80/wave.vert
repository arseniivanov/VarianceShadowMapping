#version 410


layout (location = 0) in vec3 vertex;
layout (location = 2) in vec3 texCoords;

uniform mat4 vertex_model_to_world;
uniform mat4 normal_model_to_world;
uniform mat4 vertex_world_to_clip;
uniform vec3 camera_position;
uniform vec3 light_position;
uniform float t;

out VS_OUT {
    vec2 normalCoord1;
    vec2 normalCoord2;
    vec2 normalCoord3;
	vec3 view;
	vec3 light;
	mat3 TBN;
} vs_out;

float wave(vec2 position, vec2 direction, float amplitude, float frequency, float phase, float sharpness, float time) {
    return amplitude * pow(sin((position.x * direction.x + position.y * direction.y) * frequency + time * phase) * 0.5 + 0.5, sharpness);
}
float waveDx(vec2 position, vec2 direction, float amplitude, float frequency, float phase, float sharpness, float time) {
    return 0.5*sharpness*amplitude*frequency*pow(sin((position.x * direction.x + position.y * direction.y) * frequency + time * phase) * 0.5 + 0.5, sharpness-1)*cos((position.x * direction.x + position.y * direction.y)*frequency+time*phase)*direction.x;
}
float waveDz(vec2 position, vec2 direction, float amplitude, float frequency, float phase, float sharpness, float time) {
    return 0.5*sharpness*amplitude*frequency*pow(sin((position.x * direction.x + position.y * direction.y) * frequency + time * phase) * 0.5 + 0.5, sharpness-1)*cos((position.x * direction.x + position.y * direction.y)*frequency+time*phase)*direction.y;
}

void main()
{
    vec3 displaced_vertex = vertex;
    displaced_vertex.y += wave(vertex.xz, vec2(-1.0,0.0), 1.0, 0.2, 0.5, 2.0, t) + wave(vertex.xz, vec2(-0.7,0.7), 0.5, 0.4, 1.3, 2.0, t);
    float dx = waveDx(vertex.xz, vec2(-1.0,0.0), 1.0, 0.2, 0.5, 2.0, t) + waveDx(vertex.xz, vec2(-0.7,0.7), 0.5, 0.4, 1.3, 2.0, t);
    float dz = waveDz(vertex.xz, vec2(-1.0,0.0), 1.0, 0.2, 0.5, 2.0, t) + waveDz(vertex.xz, vec2(-0.7,0.7), 0.5, 0.4, 1.3, 2.0, t);
    
    vec3 T = normalize(vec3(normal_model_to_world * vec4(normalize(vec3(1.0, dx, 0.0)), 0.0)));
    vec3 B = normalize(vec3(normal_model_to_world * vec4(normalize(vec3(0.0, dz,1.0)), 0.0)));
    vec3 N = normalize(vec3(normal_model_to_world * vec4(normalize(vec3(-dx,1.0,-dz)), 0.0)));
    vs_out.TBN = mat3(T,B,N);
    
    vec2 texScale = vec2(8,4);
    float normalTime = mod(t, 100.0);
    vec2 normalSpeed = vec2(-0.05,0.0);
    
    vs_out.normalCoord1 = texCoords.xy*texScale + normalTime*normalSpeed;
    vs_out.normalCoord2 = texCoords.xy*texScale*2 + normalTime*normalSpeed*4;
    vs_out.normalCoord3 = texCoords.xy*texScale*4 + normalTime*normalSpeed*8;
    
    vec3 worldPos = vec3(vertex_model_to_world * vec4(displaced_vertex, 1.0));
    vs_out.view = camera_position - worldPos;
    vs_out.light = light_position - worldPos;

	gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(displaced_vertex, 1.0);
}



