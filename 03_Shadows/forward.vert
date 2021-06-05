#version 400

layout(location = 0) in vec3 vs_in_pos;
layout(location = 1) in vec3 vs_in_normal;
layout(location = 2) in vec2 vs_in_tex0;

out vec3 vs_out_pos;
out vec3 vs_out_normal;
out vec2 vs_out_tex0;

uniform mat4 world = mat4(1, 0, 0, 0,
						  0, 1, 0, 0,
						  0, 0, 1, 0, 
						  0, 0, 0, 1);

uniform mat4 worldIT = mat4(1, 0, 0, 0,
						    0, 1, 0, 0,
						    0, 0, 1, 0, 
						    0, 0, 0, 1);
uniform mat4 MVP;

void main()
{
	gl_Position = MVP * vec4(vs_in_pos, 1); //actual positions of triangles in openGL, those will be used to cut the triangles into shapes

	//output will be use in the fragment shader 

	//world position 
	vs_out_pos = (world * vec4(vs_in_pos, 1)).xyz;

	//world matrix does not calculate because normals are not positions .. but directions 
	//they should be perpendicular to the surface => we have to use inverse transpose of the matrix

	vs_out_normal  = (worldIT * vec4(vs_in_normal, 0)).xyz;

	vs_out_tex0 = vs_in_tex0;
}