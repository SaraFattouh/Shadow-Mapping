#version 400
//This shader creates quads // runs for 4 vertices
//This vertics shader has these positions and texture coordinates in a constant vector 

vec4 positions[4] = vec4[4](
	vec4(-1,-1, 0, 1),  //x,y positions are the corners of the screen 
	vec4( 1,-1, 0, 1),
	vec4(-1, 1, 0, 1),
	vec4( 1, 1, 0, 1)
);

vec2 texCoords[4] = vec2[4](
	vec2(0, 0),
	vec2(1, 0),
	vec2(0, 1),
	vec2(1, 1)
);

out vec2 vs_out_tex;

void main()
{
	gl_Position = positions[gl_VertexID];
	vs_out_tex	= texCoords[gl_VertexID];
}