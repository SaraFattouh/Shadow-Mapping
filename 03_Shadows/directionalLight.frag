#version 130

in vec2 vs_out_tex;

out vec4 fs_out_col;

uniform vec3 eye_pos;
uniform mat4 shadowVP; //light source view projection matrix
//where is that fragment in the light space

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D positionTexture;
uniform sampler2D materialTexture;
uniform sampler2D shadowDepthTexture;

uniform vec3 toLight = normalize(vec3(0, 1, 1)); // directional light 
												//instead of giving a position of the light source we give a direction 

uniform vec4 La = vec4(0.1, 0.1, 0.1, 1.0);
uniform vec4 Ld = vec4(0.5, 0.5, 0.5, 1.0);
uniform vec4 Ls = vec4(1.0, 1.0, 1.0, 1.0);

void main()
{
	vec4 baseCol = texture(colorTexture, vs_out_tex);
	vec3 normalTex = texture(normalTexture, vs_out_tex).xyz;
	// zero normal vector is used to indicate that this is a light source (in that case we leave it white)

	if (normalTex != vec3(0))
	{
		vec4 ambient = vec4(0.0f);
		vec4 diffuse = vec4(0.0f);
		vec4 specular = vec4(0.0f);
		
		vec3 pos = texture(positionTexture, vs_out_tex).rgb;
		vec3 normal = normalize(normalTex);
		vec4 material = texture(materialTexture, vs_out_tex);

		vec4 lightspace_pos = shadowVP * vec4(pos, 1); // take the position, we want to put it back in front of the light source

		 // position is in NDC [-1,+1], texture coordinate [-1,1] 
		 //perspective division 
		vec3 lightCoords = (0.5 * lightspace_pos.xyz + 0.5) / lightspace_pos.w;


		vec2 lightuv = lightCoords.xy;

		if (lightuv == clamp(lightuv, 0, 1)) //check whether we are inside the image or not
		{
			float fromLightDepth = texture(shadowDepthTexture, lightuv).x; // sample from the texture - distance values, not rgb
			
			ambient += La * vec4(material.r);

			//compare with the lightCoord z value
			if (fromLightDepth + 0.01 >= lightCoords.z)
			{		
		
				float di = clamp(dot(toLight, normal), 0.0f, 1.0f);
				diffuse += vec4(di * Ld.rgb * vec3(material.g), material.g);
		
				if (di > 0.0f)
				{
					vec3 toEye = normalize(eye_pos - pos); //view direction
					vec3 r = reflect(-toLight, normal); //returns a vector that points in the direction of reflection

					float si = pow(clamp(dot(toEye, r), 0.0f, 1.0f), material.a); 
					//The specular component is calculated by taking the dot product of the reflection vector and the view direction
					specular += Ls * vec4(material.b) * si;
				}

				fs_out_col = (ambient + diffuse + specular) * baseCol;
				
			}
			else //point in a show no diffuse, specular 
			{
				fs_out_col = ambient * baseCol; 
				
			}
		}
	}
	else
	{
		fs_out_col = vec4(0);
	}
}