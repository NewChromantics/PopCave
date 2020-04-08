precision highp float;
varying float3 FragColour;
varying float3 FragLocalPosition;

uniform bool DrawLocalPosition;

void main()
{
	gl_FragColor = float4( FragColour, 1 );

	if ( DrawLocalPosition )
	{
		gl_FragColor = float4( FragLocalPosition, 1 );

		float GridsPerMetre = 10.0;
		float x = fract( FragLocalPosition.x * GridsPerMetre );
		float y = fract( FragLocalPosition.y * GridsPerMetre );
		if ( x < 0.1 && y < 0.1 )
			gl_FragColor = float4(1,1,1,1);
	}
}


