#version 130
//This shader will say what does this light add to the output of this pixel 
//This pixel is a texture coordinate on the screen between 0 and 1 

in vec2 vs_out_tex; // input textur coordinate 

out vec4 fs_out_col; // output variable, the color

uniform vec3 eye_pos;
uniform mat4 projMatrixInv;
uniform mat4 viewMatrixInv;


//whenever we read these textures [color normal positon and specular(material)]
//the textures that we attached to the frame buffer channel 0,1,2

//added
uniform sampler2D shadow_depth_texture;

//deleted
uniform sampler2D positionTexture;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D materialTexture;
// If we want to simulate several types of objects in OpenGL we have to define material properties specific to each surface.

//light properties
uniform vec3 lightPositions[100];
uniform float lightStrengths[100];
uniform vec3 lightColors[100];


vec3 WorldPosFromDepth(float depth) {

    float z = depth * 0.5 + 0.5;

	//Given  depth values in [0, 1] and texture coordinates in [0, 1]
	//(1.) calculate clip-space position
    vec4 clipSpacePosition = vec4(vs_out_tex * 0.5 + 0.5, z, 1.0);

	//(2.) Transform from clip-space to view-space
    vec4 viewSpacePosition = projMatrixInv * clipSpacePosition;
    // Perspective division
    viewSpacePosition /= viewSpacePosition.w;

	//(3.) Transform from view-space to world-space
    vec4 worldSpacePosition = viewMatrixInv * viewSpacePosition;

    return worldSpacePosition.xyz;
}


void main()
{

	
	//first we read the color texture to get the base color
	vec4 baseCol = texture(colorTexture, vs_out_tex);

	vec3 normalTex = texture(normalTexture, vs_out_tex).xyz;
	// zero normal vector is used to indicate that this is a light source (in that case we leave it white)

	if (normalTex != vec3(0))
	{
		vec4 ambient = vec4(0.0f);
		vec4 diffuse = vec4(0.0f);
		vec4 specular = vec4(0.0f);

		//read position texture and obtain the world coordinates

		//vec3 pos = texture(positionTexture, vs_out_tex).rgb;

		float Depth = texture(shadow_depth_texture, vs_out_tex).x;
		vec3 pos = WorldPosFromDepth(Depth);

		vec3 normal = normalize(normalTex);

		//read material property from a texture 
		vec4 material = texture(materialTexture, vs_out_tex);

		for (int i = 0; i < 100; ++i)
		{
		//calculate the light direction
			vec3 toLight = lightPositions[i] - pos;

			float unscaledStrength = lightStrengths[i]; 

			float strength = unscaledStrength * unscaledStrength * unscaledStrength * 50.0f / (length(toLight) * length(toLight));
			if (strength > 0.02f)
			{
				vec4 La = vec4(0.5 * normalize(lightColors[i]), 1.0f); //read light source color ambient 
				vec4 Ld = vec4(0.8 * normalize(lightColors[i]), 1.0f); // diffuse
				vec4 Ls = vec4(0.6 * normalize(lightColors[i]), 1.0f); //specular
				
				toLight = normalize(toLight);

				ambient += La * vec4(material.r) * strength;

				float di = clamp(dot(toLight, normal), 0.0f, 1.0f); // clamp to to obtain negative colors
				diffuse += vec4(di * Ld.rgb * vec3(material.g) * strength, material.g);

				if (di > 0.0f)
				{
					vec3 toEye = normalize(eye_pos - pos); //view direction
					vec3 r = reflect(-toLight, normal); //returns a vector that points in the direction of reflection
					float si = pow(clamp(dot(toEye, r), 0.0f, 1.0f), material.a);
					specular += Ls * vec4(material.b) * si * strength;
				}
			}
		}

//		vec3 actualPosition = texture(positionTexture, vs_out_tex).rgb;
//		vec3 difference = abs(pos - actualPosition);
//		fs_out_col = vec4(difference, 0.0);


		fs_out_col = (ambient + diffuse + specular) * baseCol;
	}
	else
	{
		fs_out_col = baseCol;

//		vec3 actualPosition = texture(positionTexture, vs_out_tex).rgb;
//		vec3 difference = abs(pos - actualPosition);
//		fs_out_col = vec4(difference, 0.0);
	}
}