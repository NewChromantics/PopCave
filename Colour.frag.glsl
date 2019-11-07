precision highp float;
varying float3 FragColour;

void main()
{
	gl_FragColor = float4( FragColour, 1 );
}


