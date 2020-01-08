Pop.Debug("PopCave");

Pop.Include = function(Filename)
{
	const Source = Pop.LoadFileAsString(Filename);
	return Pop.CompileAndRun( Source, Filename );
}

Pop.Include('PopEngineCommon/PopShaderCache.js');
Pop.Include('PopEngineCommon/PopFrameCounter.js');
//Pop.Include('PopEngineCommon/MemCheckLoop.js');
Pop.Include('PopEngineCommon/PopMath.js');
Pop.Include('PopEngineCommon/ParamsWindow.js');
Pop.Include('PopEngineCommon/PopCamera.js');
Pop.Include('PopEngineCommon/PopObj.js');

const VertShader = Pop.LoadFileAsString('Quad.vert.glsl');
const GreyscaleFragShader = Pop.LoadFileAsString('Greyscale.frag.glsl');
const SkeletonFragShader = Pop.LoadFileAsString('DrawLines.frag.glsl');
const GeoVertShader = Pop.LoadFileAsString('Geo.vert.glsl');
const GeoColourShader = Pop.LoadFileAsString('Colour.frag.glsl');


const RenderCounter = new Pop.FrameCounter('Render');
const PoseCounter = new Pop.FrameCounter('Poses');
const FrameImageCounter = new Pop.FrameCounter('FrameImage');
const PngKbCounter = new Pop.FrameCounter('Png kb');



//	namespace for Expose network API
const Expose = {};
Expose.BroadcastPorts = [9000];
Expose.ListenPorts = [9001,9002,9003,9004,9005];


var Params = {};
Params.MaxScore = 1.0;
Params.LineWidth = 0.0015;
Params.WorldVerticalFov = 45;
Params.RenderVideo = false;
Params.RenderWorld = true;
Params.RenderFromFaceCamera = false;
Params.CameraModelScale = 0.1;
Params.FaceZ = 1;
Params.FaceCameraColour = [0,1,0];
Params.BackgroundColour = [0,0,0];
Params.GeoColour = [0,0,1];
Params.GeoScale = 0.01;
Params.GeoYaw = 90;
Params.GeoX = 0;
Params.GeoY = 0;
Params.GeoZ = 0;
Params.RenderGeo = false;
Params.UseAppleFace = false;
Params.UseOpenPose = false;
Params.UseHourglass = false;
Params.UseCpm = false;
Params.UseResnet50 = false;
Params.UseSsdMobileNet = false;
Params.UseYolo = false;
Params.UsePosenet = false;
Params.UseWinSkillSkeleton = false;
Params.UseKinectAzureSkeleton = true;
Params.EnableStreamFramePng = false;
Params.KinectSkeletonInvertX = true;
Params.KinectYieldMs = 20;

//	world->uv scalar
Params.SkeletonWorldMinX = -1;
Params.SkeletonWorldMaxX = 1;
Params.SkeletonWorldMinY = -1;
Params.SkeletonWorldMaxY = 1;
Params.SkeletonModelScale = 0.03;

//	video camera origin
Params.CaptureX = 0.6;
Params.CaptureY = -0.49;
Params.CaptureZ = 2.5;
Params.CaptureYaw = 180;
Params.CaptureDebugSize = 0.05;
Params.CaptureColour = [0,1,1];
Params.CaptureToWorldRotateFirst = false;
Params.CaptureToWorldInverse = false;

//	portal screen
Params.PortalX = 0;
Params.PortalY = -0.30;
Params.PortalZ = 0;
Params.PortalW = 1.10;
Params.PortalH = 1.88;
Params.PortalColour = [1,0,1];

Params.OriginDebugSize = 0.02;
Params.OriginColour = [1,1,1];


var ParamsWindow = CreateParamsWindow( Params, function(){}, [800,100,500,200] );
ParamsWindow.AddParam('MaxScore',0,1);
ParamsWindow.AddParam('UseAppleFace');
ParamsWindow.AddParam('UseOpenPose');
ParamsWindow.AddParam('UseCpm');
ParamsWindow.AddParam('UseHourglass');
ParamsWindow.AddParam('UseResnet50');
ParamsWindow.AddParam('UseSsdMobileNet');
ParamsWindow.AddParam('UseYolo');
ParamsWindow.AddParam('UsePosenet');
ParamsWindow.AddParam('UseWinSkillSkeleton');
ParamsWindow.AddParam('UseKinectAzureSkeleton');
ParamsWindow.AddParam('KinectSkeletonInvertX');
ParamsWindow.AddParam('KinectYieldMs',0,100,Math.floor);


ParamsWindow.AddParam('LineWidth',0.0001,0.01);
ParamsWindow.AddParam('FaceZ',0,10);
ParamsWindow.AddParam('WorldVerticalFov',4,90);
ParamsWindow.AddParam('RenderVideo');
ParamsWindow.AddParam('RenderWorld');
ParamsWindow.AddParam('RenderFromFaceCamera');
ParamsWindow.AddParam('CameraModelScale',0.001,2);
ParamsWindow.AddParam('SkeletonModelScale',0.001,1);
ParamsWindow.AddParam('FaceCameraColour','Colour');
ParamsWindow.AddParam('BackgroundColour','Colour');

ParamsWindow.AddParam('RenderGeo');
ParamsWindow.AddParam('GeoColour','Colour');
ParamsWindow.AddParam('GeoScale',0.001,10);
ParamsWindow.AddParam('GeoX',-10,10);
ParamsWindow.AddParam('GeoY',-10,10);
ParamsWindow.AddParam('GeoZ',-10,10);
ParamsWindow.AddParam('GeoYaw',-180,180);

ParamsWindow.AddParam('EnableStreamFramePng');
ParamsWindow.AddParam('SkeletonWorldMinX',-10,10);
ParamsWindow.AddParam('SkeletonWorldMaxX',-10,10);
ParamsWindow.AddParam('SkeletonWorldMinY',-10,10);
ParamsWindow.AddParam('SkeletonWorldMaxY',-10,10);

ParamsWindow.AddParam('CaptureX',-2,2);
ParamsWindow.AddParam('CaptureY',-2,2);
ParamsWindow.AddParam('CaptureZ',-4,4);
ParamsWindow.AddParam('CaptureColour','Colour');
ParamsWindow.AddParam('CaptureDebugSize',0,0.1);
ParamsWindow.AddParam('CaptureYaw',-180,180);
ParamsWindow.AddParam('CaptureToWorldInverse');
ParamsWindow.AddParam('CaptureToWorldRotateFirst');

ParamsWindow.AddParam('PortalX',-5,5);
ParamsWindow.AddParam('PortalY',-5,5);
ParamsWindow.AddParam('PortalZ',-5,5);
ParamsWindow.AddParam('PortalW',0,4);
ParamsWindow.AddParam('PortalH',0,4);
ParamsWindow.AddParam('PortalColour','Colour');

ParamsWindow.AddParam('OriginColour','Colour');
ParamsWindow.AddParam('OriginDebugSize',0,0.1);


//	send callback
let SendPose = null;
let SendFramePng = null;



function OnNewPose(Pose)
{
	if (!SendPose)
		return;

	SendPose(Pose);
}



const SkeletonJointNames =
[
 'Head',
 'LeftShoulder',		'LeftElbow',	'LeftHand',		'LeftHip',	'LeftKnee',		'LeftFoot',
 'RightShoulder',	'RightElbow',	'RightHand',	'RightHip',	'RightKnee',	'RightFoot',
 //	posenet has these!
 'LeftEye', 		'RightEye',	'LeftEar', 'RightEar'
 ];

function LabelMapToSkeleton(LabelMap)
{
	if ( !LabelMap.Meta )
	{
		Pop.Debug( JSON.stringify(LabelMap) );
		throw "Label map missing meta";
	}
	
	function IndexToUv(Index)
	{
		const Width = LabelMap.Meta.Width;
		const Height = LabelMap.Meta.Height;
		const x = Index / Width;
		const y = Index % Width;
		const u = x / Width;
		const v = y / Height;
		return [u,v];
	}
	
	function FindBestUvScore(MapFloats)
	{
		if ( !MapFloats )
			return null;
		
		let HighestIndex = 0;
		let HighestValue = MapFloats[HighestIndex];
		for ( let i=0;	i<MapFloats.length;	i++ )
		{
			const Value = MapFloats[i];
			if ( Value <= HighestValue )
				continue;
			HighestIndex = i;
			HighestValue = Value;
		}
		let uvscore = IndexToUv(HighestIndex);
		uvscore.push( HighestValue );
		return uvscore;
	}
	
	//	todo: get a map from one label set to joints
	const Skeleton = {};
	function MapLabelToJoint(Label)
	{
		const Joint = Label;
		Skeleton[Joint] = FindBestUvScore( LabelMap[Label] );
	}
	SkeletonJointNames.forEach( MapLabelToJoint );
	return Skeleton;
}

function LabelRectsToSkeleton(Rects)
{
	function CompareBestScore(RectA,RectB)
	{
		if ( RectA.Score > RectB.Score )
			return -1;
		if ( RectA.Score < RectB.Score )
			return 1;
		return 0;
	}

	//	get best
	Rects.sort( CompareBestScore );

	function RectToSkeleton(Rect)
	{
		const BestRect = Rects[0];
		const Score = BestRect.Score;
		const t = Rect.y;
		const l = Rect.x;
		const r = Rect.x + Rect.w;
		const b = Rect.y + Rect.h;
		const vm = Rect.x + (Rect.w/2);
		const hm = Rect.y + (Rect.h/2);

		const Skeleton = {};
		Skeleton.LeftShoulder = [l,vm,Score];
		Skeleton.RightShoulder = [r,vm,Score];
		Skeleton.Head = [hm,t,Score];
		Skeleton.LeftHip = [l,vm,Score];
		Skeleton.LeftFoot = [l,b,Score];
		Skeleton.RightHip = [r,vm,Score];
		Skeleton.RightFoot = [r,b,Score];
		return Skeleton;
	}
	const Skeleton = RectToSkeleton( Rects[0] );
	return Skeleton;
}

function CreateCubeGeometry(RenderTarget,Min=-1,Max=1)
{
	let VertexSize = 3;
	let VertexData = [];
	let TriangleIndexes = [];
	
	let AddTriangle = function(a,b,c)
	{
		let FirstTriangleIndex = VertexData.length / VertexSize;
		
		a.forEach( v => VertexData.push(v) );
		b.forEach( v => VertexData.push(v) );
		c.forEach( v => VertexData.push(v) );
		
		TriangleIndexes.push( FirstTriangleIndex+0 );
		TriangleIndexes.push( FirstTriangleIndex+1 );
		TriangleIndexes.push( FirstTriangleIndex+2 );
	}
	
	let tln = [Min,Min,Min];
	let trn = [Max,Min,Min];
	let brn = [Max,Max,Min];
	let bln = [Min,Max,Min];
	let tlf = [Min,Min,Max];
	let trf = [Max,Min,Max];
	let brf = [Max,Max,Max];
	let blf = [Min,Max,Max];
	
	
	//	near
	AddTriangle( tln, trn, brn );
	AddTriangle( brn, bln, tln );
	//	far
	AddTriangle( trf, tlf, blf );
	AddTriangle( blf, brf, trf );
	
	//	top
	AddTriangle( tln, tlf, trf );
	AddTriangle( trf, trn, tln );
	//	bottom
	AddTriangle( bln, blf, brf );
	AddTriangle( brf, brn, bln );
	
	//	left
	AddTriangle( tlf, tln, bln );
	AddTriangle( bln, blf, tlf );
	//	right
	AddTriangle( trn, trf, brf );
	AddTriangle( brf, brn, trn );
	
	const VertexAttributeName = "LocalPosition";
	
	//	loads much faster as a typed array
	VertexData = new Float32Array( VertexData );
	TriangleIndexes = new Int32Array(TriangleIndexes);
	
	//	emulate webgl on desktop
	//TriangleIndexes = undefined;
	
	let TriangleBuffer = new Pop.Opengl.TriangleBuffer( RenderTarget, VertexAttributeName, VertexData, VertexSize, TriangleIndexes );
	return TriangleBuffer;
}

var Cube;
function GetCube(RenderTarget)
{
	if ( Cube )
		return Cube;
	
	Cube = CreateCubeGeometry(RenderTarget);
	return Cube;
}


var SceneGeos;
function GetSceneGeos(RenderTarget)
{
	if ( SceneGeos )
		return SceneGeos;
	
	const SceneFilename = 'parallax_test_02.obj';
	
	function OnGeometry(Geometry)
	{
		if ( !SceneGeos )
			SceneGeos = [];

		//	gr: desktop throws if zero vertexes, web doesnt?
		try
		{
			Pop.Debug("Loading Geo " + Geometry.Name);

			//	skip empty geos, throwing in here seems to cause a rejit exception??
			if (!Geometry.Positions || Geometry.Positions.length == 0)
				return;

			//	convert to triangle buffer
			const VertexAttributeName = "LocalPosition";
			const VertexSize = 3;
			const VertexData = new Float32Array(Geometry.Positions);
			//const TriangleIndexes = new Int32Array( Geometry.TriangleIndexes );
			const TriangleIndexes = undefined;
			const TriangleBuffer = new Pop.Opengl.TriangleBuffer(RenderTarget,VertexAttributeName,VertexData,VertexSize,TriangleIndexes);

			SceneGeos.push(TriangleBuffer);
		}
		catch (e)
		{
			Pop.Debug("Error Loading Geo " + Geometry.Name + ": " + e);
		}
	}
	const Contents = Pop.LoadFileAsString( SceneFilename );
	Pop.Obj.ParseGeometry( Contents, OnGeometry );
	
	Pop.Debug( SceneFilename + " parsed " + SceneGeos.length + " objects");
	return SceneGeos;
}





function LabelsToSkeleton(Labels,InvertX)
{
	if ( !Labels || !Labels.length )
		return null;
	
	const Skeleton = {};
	
	function LabelToPoint(Label)
	{
		//	world space label
		if (Label.z !== undefined)
		{
			const x = (InvertX === true) ? -Label.x : Label.x;
			const Score = Label.Score;
			const u = Math.Range(Params.SkeletonWorldMinX,Params.SkeletonWorldMaxX,Label.x);
			const v = Math.Range(Params.SkeletonWorldMinY,Params.SkeletonWorldMaxY,Label.y);
			Skeleton[Label.Label] = [u,v,Score,x,Label.y,Label.z];
		}
		else
		{
			const Rect = [Label.x,Label.y,Label.w,Label.h];
			const u = Label.x + (Label.w / 2.0);
			const v = Label.y + (Label.h / 2.0);
			const Score = Label.Score;
			Skeleton[Label.Label] = [u,v,Score];
		}
	}
	Labels.forEach( LabelToPoint );

	return Skeleton;
}

function GetFaceCenterDistance(FaceLabels)
{
	const CenterLabel = FaceLabels.filter( l => l.Label == 'FaceLandmark60' )[0];
	const FaceCenter = CenterLabel;
	const u = FaceCenter.x + (FaceCenter.w/2);
	const v = FaceCenter.y + (FaceCenter.h/2);
	//	todo: get face left, right, center in world space
	//			then scale that to the width of a head.
	const z = Params.FaceZ;
	return [u,v,z];
}

function RenderVideoImage(RenderTarget,VideoTexture)
{
	let FragShader = Pop.GetShader( RenderTarget, GreyscaleFragShader, VertShader );
	let SetUniforms = function(Shader)
	{
		Shader.SetUniform("Texture", VideoTexture );
	}
	RenderTarget.DrawQuad( FragShader, SetUniforms );
}

//	get 2D lines [x,y,x,y]
function GetSkeletonLines(Skeleton,Lines,Scores)
{
	function PushLine(Start,End,Score)
	{
		Lines.push(Start[0]);
		Lines.push(Start[1]);
		Lines.push(End[0]);
		Lines.push(End[1]);
		Scores.push(Score);
	}
	EnumSkeletonBones(Skeleton,PushLine);
}

function GetSkeletonLines3D(Skeleton,Lines,Scores)
{
	function PushLine(Start,End)
	{
		const StartScore = Start[2];
		const EndScore = End[2];
		const StartPos = Start.slice(3,6);
		const EndPos = End.slice(3,6);
		Lines.push([StartPos,EndPos]);
		Scores.push([StartScore,EndScore]);
	}
	EnumSkeletonBones(Skeleton,PushLine);
}

function EnumSkeletonBones(Skeleton,EnumBone)
{
	if ( !Skeleton )
	{
		//	draw x
		const z = 0;
		EnumBone( [0,0,z], [1,1,z], 0 );
		EnumBone( [1,0,z], [0,1,z], 0 );
		return;
	}
	
	function PushBone(JointAB,Index)
	{
		try
		{
			const JointA = JointAB[0];
			const JointB = JointAB[1];
			const a = Skeleton[JointA];
			const b = Skeleton[JointB];
			//	gr: if I don't exit here it's throwing an exception I think should be caught?
			if (!a || !b)
				return;
			const Score = (a[2] + b[2]) / 2;
			EnumBone(a,b,Score);
		}
		catch(e)
		{
			Pop.Debug("Error in PushBone "+e);
			//	missing joint
		}
	}
	
	
	const AppleFace_Bones =
	[
		//	left eyebrow
		['FaceLandmark00','FaceLandmark01'],
		['FaceLandmark01','FaceLandmark02'],
		['FaceLandmark02','FaceLandmark03'],
		//	right eyebrow
		['FaceLandmark04','FaceLandmark05'],
		['FaceLandmark05','FaceLandmark06'],
		['FaceLandmark06','FaceLandmark07'],
		//	left eye
		['FaceLandmark08','FaceLandmark09'],
		['FaceLandmark09','FaceLandmark10'],
		['FaceLandmark10','FaceLandmark11'],
		['FaceLandmark11','FaceLandmark12'],
		['FaceLandmark12','FaceLandmark13'],
		['FaceLandmark13','FaceLandmark14'],
		['FaceLandmark14','FaceLandmark15'],
		['FaceLandmark15','FaceLandmark08'],	//	close eye loop
		//	right eye
		['FaceLandmark16','FaceLandmark17'],
		['FaceLandmark17','FaceLandmark18'],
		['FaceLandmark18','FaceLandmark19'],
		['FaceLandmark19','FaceLandmark20'],
		['FaceLandmark20','FaceLandmark21'],
		['FaceLandmark21','FaceLandmark22'],
		['FaceLandmark22','FaceLandmark23'],
		['FaceLandmark23','FaceLandmark16'],	//	close eye loop
		//['FaceLandmark23','FaceLandmark24'],
		//	mouth
		['FaceLandmark24','FaceLandmark25'],
		['FaceLandmark25','FaceLandmark26'],
		['FaceLandmark26','FaceLandmark27'],
		['FaceLandmark27','FaceLandmark28'],
		['FaceLandmark28','FaceLandmark29'],
		['FaceLandmark29','FaceLandmark30'],
		['FaceLandmark30','FaceLandmark31'],
		['FaceLandmark31','FaceLandmark32'],
		['FaceLandmark32','FaceLandmark33'],
		['FaceLandmark33','FaceLandmark24'],	//	close mouth loop
		//['FaceLandmark33','FaceLandmark34'],
		//teeth
		['FaceLandmark34','FaceLandmark35'],
		['FaceLandmark35','FaceLandmark36'],
		['FaceLandmark36','FaceLandmark37'],
		['FaceLandmark37','FaceLandmark38'],
		['FaceLandmark38','FaceLandmark39'],
		['FaceLandmark39','FaceLandmark34'],	//	close teeth loop

		//	chin
		//['FaceLandmark39','FaceLandmark40'],
		['FaceLandmark40','FaceLandmark41'],
		['FaceLandmark41','FaceLandmark42'],
		['FaceLandmark42','FaceLandmark43'],
		['FaceLandmark43','FaceLandmark44'],
		['FaceLandmark44','FaceLandmark45'],
		['FaceLandmark45','FaceLandmark46'],
		['FaceLandmark46','FaceLandmark47'],
		['FaceLandmark47','FaceLandmark48'],
		['FaceLandmark48','FaceLandmark49'],
		['FaceLandmark49','FaceLandmark50'],
	 
		//	nose
		//['FaceLandmark50','FaceLandmark51'],
		['FaceLandmark51','FaceLandmark52'],
		['FaceLandmark52','FaceLandmark53'],
		['FaceLandmark53','FaceLandmark54'],
		['FaceLandmark54','FaceLandmark55'],
		['FaceLandmark55','FaceLandmark56'],
		['FaceLandmark56','FaceLandmark57'],
		['FaceLandmark57','FaceLandmark58'],
		['FaceLandmark58','FaceLandmark59'],
		//['FaceLandmark59','FaceLandmark60'],
	 
		//	nose center line
		['FaceLandmark60','FaceLandmark61'],
		['FaceLandmark61','FaceLandmark62'],
	 
		//	eyes
		//['FaceLandmark62','FaceLandmark63'],
		['FaceLandmark63','FaceLandmark64'],
	];
	
	const Skeleton_Bones =
	[
		['Head','LeftEye'],
		['Head','RightEye'],
		['LeftEye','RightEye'],
		['LeftEye','LeftEar'],
		['RightEye','RightEar'],

		['Head','LeftShoulder'],
		['Head','RightShoulder'],
		['LeftShoulder','RightShoulder'],
		['LeftHip','RightHip'],
		['LeftShoulder','LeftElbow'],
			['LeftElbow','LeftHand'],
			['LeftHand','LeftFinger'],
			['LeftHand','LeftThumb'],
		['LeftShoulder','LeftHip'],
		['LeftHip','LeftKnee'],
		['LeftKnee','LeftFoot'],
			['LeftKnee','LeftAnkle'],
			['LeftAnkle','LeftFoot'],
		['RightShoulder','RightElbow'],
		['RightElbow','RightHand'],
			['RightHand','RightFinger'],
			['RightHand','RightThumb'],
		['RightShoulder','RightHip'],
		['RightHip','RightKnee'],
		['RightKnee','RightFoot'],
			['RightKnee','RightAnkle'],
			['RightAnkle','RightFoot'],

		//	extra kinect bones!
		['Head','Neck'],
		['Neck','Chest'],
		['Chest','Navel'],
		['Navel','Pelvis'],
		['LeftHip','Pelvis'],
		['RightHip','Pelvis'],
		['Chest','LeftClavicle'],
		['LeftClavicle','LeftShoulder'],
		['Chest','RightClavicle'],
		['RightClavicle','RightShoulder'],
	 ];
	AppleFace_Bones.forEach( PushBone );
	Skeleton_Bones.forEach( PushBone );
}

function RenderScene(RenderTarget, Camera)
{
	Camera.FovVertical = Params.WorldVerticalFov;
	const Geos = GetSceneGeos( RenderTarget );
	const Position = [Params.GeoX,Params.GeoY,Params.GeoZ];
	const Scale = Params.GeoScale;
	const Colour = Params.GeoColour;
	
	const RotationTransform = Math.CreateAxisRotationMatrix( [0,1,0], Params.GeoYaw );
	
	const Shader = Pop.GetShader( RenderTarget, GeoColourShader, GeoVertShader );
	const LocalToWorldTransform = Math.MatrixMultiply4x4( RotationTransform, Math.CreateTranslationScaleMatrix( Position, [Scale,Scale,Scale] ) );
	
	const WorldToCameraTransform = Camera.GetWorldToCameraMatrix();
	const ViewRect = [-1,-1,1,1];
	const CameraProjectionTransform = Camera.GetProjectionMatrix(ViewRect);
	
	function SetUniforms(Shader)
	{
		Shader.SetUniform('LocalToWorldTransform',LocalToWorldTransform);
		Shader.SetUniform('WorldToCameraTransform',WorldToCameraTransform);
		Shader.SetUniform('CameraProjectionTransform',CameraProjectionTransform);
		Shader.SetUniform('Colour',Colour);
	}
	function RenderGeo(Geo)
	{
		RenderTarget.DrawGeometry( Geo, Shader, SetUniforms );
	}
	Geos.forEach( RenderGeo );
}

function RenderCube(RenderTarget,Camera,Position,Scale,Colour)
{
	const Geo = GetCube( RenderTarget );
	const Shader = Pop.GetShader( RenderTarget, GeoColourShader, GeoVertShader );

	const Scale3 = Array.isArray(Scale) ? Scale : [Scale,Scale,Scale];
	const LocalToWorldTransform = Math.CreateTranslationScaleMatrix(Position,Scale3);
	const WorldToCameraTransform = Camera.GetWorldToCameraMatrix();
	const ViewRect = [-1,-1,1,1];
	const CameraProjectionTransform = Camera.GetProjectionMatrix(ViewRect);
	//Pop.Debug(Position);
	function SetUniforms(Shader)
	{
		Shader.SetUniform('LocalToWorldTransform',LocalToWorldTransform);
		Shader.SetUniform('WorldToCameraTransform',WorldToCameraTransform);
		Shader.SetUniform('CameraProjectionTransform',CameraProjectionTransform);
		Shader.SetUniform('Colour',Colour);
	}
	RenderTarget.DrawGeometry( Geo, Shader, SetUniforms );
}

function RenderPortal(RenderTarget,Camera)
{
	//	render the screen
	const y = Params.PortalY - (Params.PortalH / 2);
	const Pos = [Params.PortalX,y,Params.PortalZ];
	const Scale = [Params.PortalW / 2,Params.PortalH / 2,0.05];
	const Colour = Params.PortalColour;
	RenderCube(RenderTarget,Camera,Pos,Scale,Colour);
}

function RenderCapture(RenderTarget,Camera)
{
	//	render capture origin marker
	{
		//const Pos = [Params.CaptureX,Params.CaptureY,Params.CaptureZ];
		const Pos = CapturePosToWorldPos([0,0,0]);
		const Scale = Params.CaptureDebugSize;
		const Colour = Params.CaptureColour;
		RenderCube(RenderTarget,Camera,Pos,Scale,Colour);
	}

	//	draw a marker in front of camera
	for (let z = 0.2;z < 1;z += 0.2)
	{
		const Pos = CapturePosToWorldPos([0,0,z]);
		const Scale = Params.CaptureDebugSize * 0.5;
		const Colour = Params.CaptureColour;
		RenderCube(RenderTarget,Camera,Pos,Scale,Colour);
	}
}

function RenderOrigin(RenderTarget,Camera)
{
	//	render origin marker
	const Pos = [0,0,0];
	const Scale = Params.OriginDebugSize;
	const Colour = Params.OriginColour;
	RenderCube(RenderTarget,Camera,Pos,Scale,Colour);
}


function RenderSkeleton2D(RenderTarget,Skeleton)
{
	//	make lines from skeleton
	let Lines = [];
	let Scores = [];
	GetSkeletonLines( Skeleton, Lines, Scores );
	
	let FragShader = Pop.GetShader( RenderTarget, SkeletonFragShader, VertShader );
	let SetUniforms = function(Shader)
	{
		Shader.SetUniform("Lines", Lines );
		Shader.SetUniform("Scores", Scores );
		Shader.SetUniform("ScoreMax", Params.MaxScore );
		Shader.SetUniform("LineWidth", Params.LineWidth );
	}
	RenderTarget.EnableBlend(true);
	RenderTarget.DrawQuad( FragShader, SetUniforms );
}


function ScoreToColour(Score)
{
	if (Score < 0)
	{
		return [1,0,1];
	}
	else if (Score < 0.5)
	{
		Score = Math.Range(0,0.5,Score);
		return [1,Score,0];
	}
	else if (Score < 1.0)
	{
		Score = Math.Range(0.5,1.0,Score);
		return [1 - Score,1,0];
	}
	else
	{
		return [0,0,1];
	}
}

function CapturePosToWorldPos(CapturePos)
{
	//	get a transform to put capture-space into world space
	let WorldToCaptureTransform = Math.CreateTranslationMatrix(Params.CaptureX,Params.CaptureY,Params.CaptureZ);
	let RotationMatrix = Math.CreateAxisRotationMatrix([0,1,0],Params.CaptureYaw);


	if (Params.CaptureToWorldRotateFirst)
		WorldToCaptureTransform = Math.MatrixMultiply4x4(RotationMatrix,WorldToCaptureTransform);
	else
		WorldToCaptureTransform = Math.MatrixMultiply4x4(WorldToCaptureTransform,RotationMatrix);

	if (Params.CaptureToWorldInverse )
		WorldToCaptureTransform = Math.MatrixInverse4x4(WorldToCaptureTransform);

	return Math.TransformPosition(CapturePos,WorldToCaptureTransform);
}

//	todo: render in capture space
function RenderSkeleton3D(RenderTarget,Camera,Skeleton)
{
	//	make lines from skeleton
	let Lines = [];
	let Scores = [];
	GetSkeletonLines3D(Skeleton,Lines,Scores);

	const Scale = Params.SkeletonModelScale;

	function RenderBone(Bone,BoneIndex)
	{
		const BoneScores = Scores[BoneIndex];
		const StartColour = ScoreToColour(BoneScores[0]);
		const EndColour = ScoreToColour(BoneScores[1]);
		const StartPos = CapturePosToWorldPos(Bone[0]);
		const EndPos = CapturePosToWorldPos(Bone[1]);
		//Pop.Debug("RenderCube at ",JSON.stringify(StartPos));
		RenderCube(RenderTarget,Camera,StartPos,Scale,StartColour);
		RenderCube(RenderTarget,Camera,EndPos,Scale,EndColour);
	}
	Lines.forEach(RenderBone);
}

class TCameraWindow
{
	constructor(CameraName)
	{
		this.CameraName = CameraName;
		this.Skeleton = null;
		this.LastFace = null;
		this.LastFaceUvz = null;
		this.VideoTexture = null;
		this.CameraFrameCounter = new Pop.FrameCounter( CameraName );
		
		this.FaceCamera = new Pop.Camera();
		
		this.DebugCamera = new Pop.Camera();
		this.DebugCamera.Position = [0,0.4,2];
		this.DebugCamera.LookAt = [0,0,0];
		this.DebugCamera.Up[1] = -1;

		this.Window = new Pop.Opengl.Window(CameraName);
		this.Window.OnRender = this.OnRender.bind(this);
		
		
		const MoveCamera = function(x,y,Button,FirstDown)
		{
			const Camera = this.DebugCamera;
			
			//if ( Button == 0 )
			//	this.Camera.OnCameraPan( x, 0, y, FirstDown );
			if ( Button == 0 )
				Camera.OnCameraOrbit( x, y, 0, FirstDown );
			if ( Button == 2 )
				Camera.OnCameraPanLocal( x, y, 0, FirstDown );
			if ( Button == 1 )
				Camera.OnCameraPanLocal( x, 0, y, FirstDown );
		}.bind(this);
		
		this.Window.OnMouseDown = function(x,y,Button)
		{
			MoveCamera( x,y,Button,true );
		}
		
		this.Window.OnMouseMove = function(x,y,Button)
		{
			MoveCamera( x,y,Button,false );
		}
 
		this.Window.OnMouseScroll = function(x,y,Button,Delta)
		{
			let Fly = Delta[1] * 50;
			//Fly *= Params.ScrollFlySpeed;
			
			const Camera = this.DebugCamera;
			Camera.OnCameraPanLocal( 0, 0, 0, true );
			Camera.OnCameraPanLocal( 0, 0, Fly, false );
		}
 
		this.Source = new Pop.Media.Source(CameraName);
		this.ListenForFrames().catch(Pop.Debug);
	}
	
	OnRender(RenderTarget)
	{
		if ( !this.Source )
		{
			RenderTarget.ClearColour(255,0,0);
			return;
		}
		
		if ( !this.VideoTexture )
		{
			RenderTarget.ClearColour(0,0,255);
			return;
		}
		
		if ( Params.RenderVideo )
		{
			RenderVideoImage(RenderTarget,this.VideoTexture);
			RenderSkeleton2D(RenderTarget,this.Skeleton);
		}
		else if ( Params.RenderWorld || Params.RenderFromFaceCamera )
		{
			const RenderCamera = Params.RenderFromFaceCamera ? this.FaceCamera : this.DebugCamera;
			
			RenderTarget.ClearColour( ...Params.BackgroundColour );
			if ( Params.RenderGeo )
				RenderScene( RenderTarget, RenderCamera );

			if (RenderCamera != this.FaceCamera)
			{
				//	render the face camera
				RenderCube(RenderTarget,RenderCamera,this.FaceCamera.Position,Params.CameraModelScale,Params.FaceCameraColour);

				//	skeleton obscures camera too
 				RenderSkeleton3D(RenderTarget,RenderCamera,this.Skeleton);
			}
			RenderPortal(RenderTarget,RenderCamera);
			RenderCapture(RenderTarget,RenderCamera);
			RenderOrigin(RenderTarget,RenderCamera);
		}
		else
		{
			RenderTarget.ClearColour(0,0,255);
		}
	}
	
	async ProcessNextFrame(FrameBuffer)
	{
		if (Params.UseKinectAzureSkeleton)
		{
			await Pop.Yield( Params.KinectYieldMs );
			return [FrameBuffer];
		}

		const Stream = 0;
		const Latest = true;
		//let NextFrame = await this.Source.GetNextFrame( Planes, Stream, Latest );
		//let NextFrame = await this.Source.GetNextFrame( undefined, Stream, Latest );
		const NextFrame = await this.Source.GetNextFrame( FrameBuffer, Stream, Latest );
		//NextFrame = null;
		//Pop.GarbageCollect();
		//return;
		
		const NewFrame = NextFrame ? NextFrame : FrameBuffer;
		if ( !NewFrame )
			return null;
		
		if ( !NewFrame.Planes )
			return [NewFrame];
		
		return NewFrame.Planes;
	}
	
	async ListenForFrames()
	{
		const FrameBuffer = new Pop.Image();
		FrameBuffer.WritePixels(1,1,[128],'Greyscale');
		//const FrameBuffer = undefined;
		while ( true )
		{
			try
			{
				//await Pop.Yield(5);
				const fb = FrameBuffer;
				const NewTexures = await this.ProcessNextFrame(fb);
				if ( !NewTexures )
					continue;
				
				const Luma = new Pop.Image();
				Luma.Copy( NewTexures[0] );

				try
				{					
					const FaceXyz = await this.GetFaceXyz(Luma);

					//Pop.Debug("FaceXyz",FaceXyz);
					this.LastFacePosition = FaceXyz || this.LastFacePosition;

					this.UpdateFaceCamera();
				}
				catch (e)
				{}
				//Pop.Debug(JSON.stringify(this.Skeleton));
				this.VideoTexture = Luma;
				this.CameraFrameCounter.Add();

				if (Params.EnableStreamFramePng && SendFramePng)
				{
					const PngData = Luma.GetPngData(0.5);
					PngKbCounter.Add(PngData.length / 1024);
					if (SendFramePng)
						SendFramePng(PngData);
				}
			}
			catch(e)
			{
				//	sometimes OnFrameExtracted gets triggered, but there's no frame? (usually first few on some cameras)
				//	so that gets passed up here. catch it, but make sure we re-request
				if ( e != "No frame packet buffered" )
					Pop.Debug( this.CameraName + " ListenForFrames: " + e);
			}
		}
	}

	UpdateFaceCamera()
	{
		try
		{
			this.FaceCamera.Position = CapturePosToWorldPos(this.LastFacePosition);

			//	just face forward for now
			this.FaceCamera.LookAt = this.FaceCamera.Position.slice();
			this.FaceCamera.LookAt[2] += -1;

			OnNewPose(this.FaceCamera);
		}
		catch(e)
		{
			Pop.Debug("UpdateFaceCamera error",e);
		}
	}


	async GetFaceXyz(Frame)
	{
		//	model that gets position
		if (Params.UseKinectAzureSkeleton)
			return this.GetFaceXyz_KinectAzureSkeleton(Frame);

		//	convert uv to pos
		const uvz = await this.GetFaceUvz(Frame);
		this.LastFaceUvz = uvz;
		const FaceUv = uvz.slice(0,2);
		const FaceZ = uvz[2];

		//	for 2D cameras, we need to know the orientation
		const VideoCamera = new Pop.Camera();
		VideoCamera.Position = [Params.CaptureX,Params.CaptureY,Params.CaptureZ];
		VideoCamera.LookAt = VideoCamera.Position.slice();
		VideoCamera.LookAt[2] += 1;

		const RayToFace = GetCameraRay(VideoCamera,FaceUv,FaceZ);
		const xyz = RayToFace.GetPosition(FaceZ);
		return xyz;
	}

	async GetFaceUvz(Frame)
	{
		if ( Params.UseAppleFace )
			return this.GetFaceUvz_AppleFace( Frame );
		
		if ( Params.UseOpenPose )
			return this.GetFaceUvz_OpenPose( Frame );
		
		if ( Params.UseCpm )
			return this.GetFaceUvz_Cpm( Frame );
		
		if ( Params.UseHourglass )
			return this.GetFaceUvz_Hourglass( Frame );
		
		if ( Params.UseResnet50 )
			return this.GetFaceUvz_Resnet50( Frame );
		
		if ( Params.UseSsdMobileNet )
			return this.GetFaceUvz_SsdMobileNet( Frame );
		
		if ( Params.UseYolo )
			return this.GetFaceUvz_Yolo( Frame );
		
		if ( Params.UsePosenet )
			return this.GetFaceUvz_Posenet( Frame );

		if (Params.UseWinSkillSkeleton)
			return this.GetFaceUvz_WinSkillSkeleton(Frame);

		return null;
	}
	
	async GetFaceUvz_OpenPose(Frame)
	{
		Frame.Resize( 368, 368 );
		Frame.SetFormat('Greyscale');
		
		const LabelMap = await Coreml.OpenPoseLabelMap( Frame );
		
		this.Skeleton = LabelMapToSkeleton(LabelMap);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_Hourglass(Frame)
	{
		Frame.Resize( 192, 192 );
		Frame.SetFormat('Greyscale');
		
		const LabelMap = await Coreml.HourglassLabelMap( Frame );
		
		this.Skeleton = LabelMapToSkeleton(LabelMap);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_Cpm(Frame)
	{
		Frame.Resize( 192, 192 );
		Frame.SetFormat('Greyscale');
		
		const LabelMap = await Coreml.CpmLabelMap( Frame );
		
		this.Skeleton = LabelMapToSkeleton(LabelMap);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_Resnet50(Frame)
	{
		Frame.Resize( 224, 224 );
		Frame.SetFormat('Greyscale');
		
		const LabelMap = await Coreml.Resnet50LabelMap( Frame );
		
		this.Skeleton = LabelMapToSkeleton(LabelMap);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_SsdMobileNet(Frame)
	{
		Frame.Resize( 300, 300 );
		Frame.SetFormat('Greyscale');
		
		const Rects = await Coreml.SsdMobileNet( Frame );
		
		function FilterPersons(Label)
		{
			return Label.Label == 'person';
		}
		const PersonRects = Rects.filter( FilterPersons );
		
		//	get the person rect[s] and fake a skeleton
		this.Skeleton = LabelRectsToSkeleton(Rects);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_Yolo(Frame)
	{
		Frame.Resize( 416, 416 );
		Frame.SetFormat('Greyscale');
		
		const Rects = await Coreml.Yolo( Frame );
		
		function FilterPersons(Label)
		{
			return Label.Label == 'person';
		}
		const PersonRects = Rects.filter( FilterPersons );
		
		//	get the person rect[s] and fake a skeleton
		this.Skeleton = LabelRectsToSkeleton(Rects);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_Posenet(Frame)
	{
		Frame.Resize( 513, 513 );
		Frame.SetFormat('Greyscale');
		
		const LabelMap = await Coreml.PosenetLabelMap( Frame );
		
		this.Skeleton = LabelMapToSkeleton(LabelMap);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [ HeadUvScore[0], HeadUvScore[1], Distance ];
		
		return FaceUvDistance;
	}
	
	async GetFaceUvz_AppleFace(Frame)
	{
		Frame.Resize( 512, 256 );
		Frame.SetFormat('Greyscale');
	
		const Face = await Coreml.AppleVisionFaceDetect( Frame );
		if ( Face.length == 0 )
			return null;
		
		this.Skeleton = LabelsToSkeleton( Face );
		this.LastFace = Face;
		const FaceUvDistance = GetFaceCenterDistance(Face);
		return FaceUvDistance;
	}

	async GetFaceUvz_WinSkillSkeleton(Frame)
	{
		Frame.Resize(512,512);
		Frame.SetFormat('Greyscale');

		const Labels = await Coreml.WinSkillSkeleton(Frame);
		
		this.Skeleton = LabelsToSkeleton(Labels);
		const HeadUvScore = this.Skeleton.Head;
		const Distance = Params.FaceZ;
		const FaceUvDistance = [HeadUvScore[0],HeadUvScore[1],Distance];

		return FaceUvDistance;
	}


	async GetFaceXyz_KinectAzureSkeleton(Frame)
	{
		//Frame.Resize(256,256);
		Frame.SetFormat('Greyscale');

		const Labels = await Coreml.KinectAzureSkeleton(Frame);
		const HeadLabels = Labels.filter(Object => Object.Label == "Head");

		//	todo: flatten skeleton for rendering
		this.Skeleton = LabelsToSkeleton(Labels,Params.KinectSkeletonInvertX);
		//Pop.Debug("Skeleton",JSON.stringify(this.Skeleton));

		if (!HeadLabels.length)
			return null;

		const Head = HeadLabels[0];
		Pop.Debug("Head",JSON.stringify(Head));
		return [Head.x,Head.y,Head.z];
	}
}


function GetCameraRay(Camera,uv)
{
	//	gr: need to fix this so we don't know the aspect ratio...
	let ScreenRect = [0,0,100,100];
	//let ScreenRect = Window.GetScreenRect();
	let Aspect = ScreenRect[2] / ScreenRect[3];
	let x = Math.lerp( -Aspect, Aspect, uv[0] );
	let y = Math.lerp( 1, -1, uv[1] );
	
	const ViewRect = [-1,-1,1,1];

	//	this should be between -1 and 1 (in camera space)
	const RayDistance = 0.5;
	
	let ScreenToCameraTransform = Camera.GetProjectionMatrix( ViewRect );
	ScreenToCameraTransform = Math.MatrixInverse4x4( ScreenToCameraTransform );
	
	let StartMatrix = Math.CreateTranslationMatrix( x, y, 0.001 );
	let EndMatrix = Math.CreateTranslationMatrix( x, y, RayDistance );
	StartMatrix = Math.MatrixMultiply4x4( ScreenToCameraTransform, StartMatrix );
	EndMatrix = Math.MatrixMultiply4x4( ScreenToCameraTransform, EndMatrix );
	
	StartMatrix = Math.MatrixMultiply4x4( Camera.GetLocalToWorldMatrix(), StartMatrix );
	EndMatrix = Math.MatrixMultiply4x4( Camera.GetLocalToWorldMatrix(), EndMatrix );
	
	const Ray = {};
	Ray.Start = Math.GetMatrixTranslation( StartMatrix, true );
	Ray.End = Math.GetMatrixTranslation( EndMatrix, true );
	Ray.Direction = Math.Normalise3( Math.Subtract3( Ray.End, Ray.Start ) );
	
	Ray.GetPosition = function(Time)
	{
		const Offset = Math.Multiply3( Ray.Direction, [Time,Time,Time] );
		const Pos = Math.Add3( Ray.Start, Offset );
		return Pos;
	}
	
	return Ray;
}


let Coreml = new Pop.CoreMl();

let CameraWindows = [];

async function FindCamerasLoop()
{
	let CreateCamera = function(CameraName)
	{
		if ( CameraWindows.hasOwnProperty(CameraName) )
		{
			Pop.Debug("Already have window for " + CameraName);
			return;
		}
		
		if ( CameraName == "Test")
			return;
		
		if ( !CameraName.includes("Pengo") )
		{
			//return;
		}
		
		try
		{
			let Window = new TCameraWindow(CameraName);
			CameraWindows.push(Window);
		}
		catch(e)
		{
			Pop.Debug(e);
		}
	}
	
	function CreateCameraMatch(Devices,Match)
	{
		const Matches = Devices.filter( Name => Name.includes(Match) );
		if ( !Matches.length )
			return false;
		CreateCamera( Matches[0] );
		return true;
	}
	
	while ( true )
	{
		try
		{
			let Devices = await Pop.Media.EnumDevices();
			Pop.Debug("Pop.Media.EnumDevices found(" + Devices + ") result type=" + (typeof Devices) );

			if (CreateCameraMatch(Devices,'USB  Live  Camera'))
			{

			}
			else if ( CreateCameraMatch( Devices, 'iSight' ) )
			{
				
			}
			else if ( CreateCameraMatch( Devices, 'FaceTime' ) )
			{
			}
			else
			{
				Devices.forEach( CreateCamera );
			}
			await Pop.Yield( 1 );
			
			//	todo: EnumDevices needs to change to "OnDevicesChanged"
			break;
		}
		catch(e)
		{
			Pop.Debug("FindCamerasLoop error: " + e );
		}
	}
}




function OnBroadcastMessage(Message,Socket)
{
	//	send back our address
	Pop.Debug("Got broadcast message",JSON.stringify(Message));
	Socket.Send(Message.Peer,"Hello");
}

function OnRecievedMessage(Message,Socket)
{
	//	send to expose api for decoding
	Pop.Debug("Got message",JSON.stringify(Message));
}


//	create discovery udp
async function RunBroadcast(OnMessage)
{
	while (true)
	{
		try
		{
			const Socket = new Pop.Socket.UdpBroadcastServer(Expose.BroadcastPorts[0]);
			Pop.Debug("Broadcast listening on ",JSON.stringify(Socket.GetAddress()));

			while (true)
			{
				Pop.Debug("Waiting for message");
				const Message = await Socket.WaitForMessage();
				OnMessage(Message,Socket);
			}
		}
		catch (e)
		{
			Pop.Debug("Exception in broadcast loop: " + e);
			await Pop.Yield(2000);
		}
	}
}

//	keep trying to run servers
async function RunServer(OnMessage)
{
	let PortIndex = 0;
	function GetPortIndex()
	{
		const PortCount = Expose.ListenPorts.length;
		PortIndex = (PortIndex + 1) % PortCount;
		return Expose.ListenPorts[PortIndex];
	}

	while (true)
	{
		try
		{
			const Port = GetPortIndex();
			const Socket = new Pop.Websocket.Server(Port);


			Pop.Debug("Websocket listening on ",JSON.stringify(Socket.GetAddress()));

			while (true)
			{
				if (!SendPose)
				{
					//	gr: this was causing an error, because I THINK we send a packet before handshake is finished?
					//		temp fix, added to WaitForMessage
					//	gr: maybe need peer's to finish connecting?
					SendPose = function (Object)
					{
						const Peers = Socket.GetPeers();
						const Message = JSON.stringify(Object);
						function SendToPeer(Peer)
						{
							try
							{
								//Pop.Debug("Sending to " + Peer,Message);
								Socket.Send(Peer,Message);
							}
							catch (e)
							{
								Pop.Debug("Error sending pose to " + Peer + "; " + e);
							}
						}
						Peers.forEach(SendToPeer);
					}

					SendFramePng = function (Object)
					{
						const Peers = Socket.GetPeers();
						const Message = (Object);
						function SendToPeer(Peer)
						{
							try
							{
								//Pop.Debug("Sending to " + Peer,Message);
								Socket.Send(Peer,Message);
							}
							catch (e)
							{
								Pop.Debug("Error sending png to " + Peer + "; " + e);
							}
						}
						Peers.forEach(SendToPeer);
					}
				}

				const Message = await Socket.WaitForMessage();
				OnMessage(Message,Socket);
			}
		}
		catch (e)
		{
			SendPose = null;
			Pop.Debug("Exception in server loop: " + e);
			await Pop.Yield(2000);
		}
	}
}





//	start tracking cameras
FindCamerasLoop().catch(Pop.Debug);
//MemCheckLoop().catch(Pop.Debug);


//RunBroadcast(OnBroadcastMessage).then(Pop.Debug).catch(Pop.Debug);
RunServer(OnRecievedMessage).then(Pop.Debug).catch(Pop.Debug);
