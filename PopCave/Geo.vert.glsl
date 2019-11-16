attribute float3 LocalPosition;
varying float3 FragColour;
varying float3 WorldPosition;
varying float3 FragLocalPosition;

uniform mat4 LocalToWorldTransform;
uniform mat4 WorldToCameraTransform;
uniform mat4 CameraProjectionTransform;
uniform float3 Colour;

void main()
{
	float3 LocalPos = LocalPosition;
	
	float4 WorldPos = LocalToWorldTransform * float4(LocalPos,1);
	float4 CameraPos = WorldToCameraTransform * WorldPos;	//	world to camera space
	float4 ProjectionPos = CameraProjectionTransform * CameraPos;

	gl_Position = ProjectionPos;
	
	WorldPosition = WorldPos.xyz;
	FragColour = Colour;//LocalPosition;
	FragLocalPosition = LocalPosition;
}
