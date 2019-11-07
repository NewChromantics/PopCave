precision highp float;
varying float3 Colour;

void main()
{
	gl_FragColor = float4( Colour, 1 );
}


