precision highp float;
varying float3 FragColour;
varying float3 FragLocalPosition;

uniform bool DrawLocalPosition;

void main()
{
	gl_FragColor = float4( FragColour, 1 );
	if ( DrawLocalPosition )
		gl_FragColor = float4( FragLocalPosition, 1 );
}


