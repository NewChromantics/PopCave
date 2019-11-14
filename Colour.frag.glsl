precision highp float;
varying float3 FragColour;
varying float3 FragLocalPosition;

void main()
{
	gl_FragColor = float4( FragColour, 1 );
	gl_FragColor = float4( FragLocalPosition, 1 );
}


