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
const GeoEdgeShader = Pop.LoadFileAsString('Edge.frag.glsl');


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
Params.CameraNearDistance = 0.1;
Params.CameraFarDistance = 2;
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
Params.KinectSkeletonInvertX = false;
Params.KinectSkeletonInvertY = true;
Params.KinectSkeletonInvertZ = false;
Params.KinectYieldMs = 20;

//	world->uv scalar
Params.SkeletonWorldMinX = -1;
Params.SkeletonWorldMaxX = 1;
Params.SkeletonWorldMinY = -1;
Params.SkeletonWorldMaxY = 1;
Params.SkeletonModelScale = 0.03;

//	video camera origin
Params.CaptureX = 0;
Params.CaptureY = 0;
Params.CaptureZ = -1;
Params.CaptureYaw = 0;
Params.CaptureDebugSize = 0.05;
Params.CaptureColour = [0,1,1];
Params.CaptureToWorldRotateFirst = false;
Params.CaptureToWorldInverse = false;

//	portal screen
Params.PortalX = 0;
Params.PortalY = 0;
Params.PortalZ = 0;
Params.PortalW = 1.10;
Params.PortalH = 1.88;
Params.PortalColour = [1,0,1];

Params.OriginDebugSize = 0.02;
Params.OriginColour = [1,1,1];

Params.SkewRenderCamera = false;
Params.SkewDebugCamera = true;
Params.SkewUseCameraWorldToCamera = false;
Params.SkewCamera_R = true;
Params.SkewCamera_T = true;
Params.SkewCamera_M = false;
Params.SkewCamera_InvT = false;
Params.SkewCamera_InvM = false;
Params.SkewTestFov = 30;
Params.CX_Scale = 0;
Params.CY_Scale = 0;
Params.CXCY_Override = false;

var ParamsWindow = CreateParamsWindow( Params, function(){}, [800,100,500,200] );

ParamsWindow.AddParam('SkewRenderCamera');
ParamsWindow.AddParam('SkewDebugCamera');
ParamsWindow.AddParam('CX_Scale',-1,1);
ParamsWindow.AddParam('CY_Scale',-1,1);
ParamsWindow.AddParam('CXCY_Override');
ParamsWindow.AddParam('SkewTestFov',1,80);
ParamsWindow.AddParam('SkewUseCameraWorldToCamera');
ParamsWindow.AddParam('SkewCamera_R');
ParamsWindow.AddParam('SkewCamera_T');
ParamsWindow.AddParam('SkewCamera_M');
ParamsWindow.AddParam('SkewCamera_InvT');
ParamsWindow.AddParam('SkewCamera_InvM');

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
ParamsWindow.AddParam('KinectSkeletonInvertY');
ParamsWindow.AddParam('KinectSkeletonInvertZ');
ParamsWindow.AddParam('KinectYieldMs',0,100,Math.floor);


ParamsWindow.AddParam('LineWidth',0.0001,0.01);
ParamsWindow.AddParam('FaceZ',0,10);
ParamsWindow.AddParam('WorldVerticalFov',4,90);
ParamsWindow.AddParam('CameraNearDistance',0.001,100);
ParamsWindow.AddParam('CameraFarDistance',0.001,100);
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
const PoseSockets = [];


function SendToPeers(Socket,Object)
{
	const Peers = Socket.GetPeers();
	Pop.Debug("Peers:",Peers);
	const Message = (Object instanceof Uint8Array) ? Object : JSON.stringify(Object);
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

function OnFramePng(Bytes)
{
	PoseSockets.forEach(Socket => SendToPeers(Socket,Bytes));
}


function OnNewPose(Pose)
{
	if (Pose.GetProjectionMatrix)
	{
		//	generate projection matrix for sending
		Pose.ProjectionMatrix = Pose.GetProjectionMatrix([-1,-1,1,1]);
	}
	Pop.Debug("OnNewPose: ",JSON.stringify(Pose));
	
	PoseSockets.forEach(Socket => SendToPeers(Socket,Pose));
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





function LabelsToSkeleton(Labels,InvertX,InvertY,InvertZ)
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
			const y = (InvertY === true) ? -Label.y : Label.y;
			const z = (InvertZ === true) ? -Label.z : Label.z;
			const Score = Label.Score;
			const u = Math.Range(Params.SkeletonWorldMinX,Params.SkeletonWorldMaxX,Label.x);
			const v = Math.Range(Params.SkeletonWorldMinY,Params.SkeletonWorldMaxY,Label.y);
			Skeleton[Label.Label] = [u,v,Score,x,y,z];
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

function RenderActor(RenderTarget,Camera,Actor)
{
	if (Actor.Geometry == 'Cube')
		Actor.Geometry = GetCube(RenderTarget);

	const Geo = Actor.Geometry;
	const Shader = Pop.GetShader(RenderTarget,Actor.FragShader,Actor.VertShader);

	const WorldToCameraTransform = Camera.GetWorldToCameraMatrix();
	const ViewRect = [-1,-1,1,1];
	const CameraProjectionTransform = Camera.GetProjectionMatrix(ViewRect);
	//Pop.Debug(Position);
	function SetUniforms(Shader)
	{
		Shader.SetUniform('WorldToCameraTransform',WorldToCameraTransform);
		Shader.SetUniform('CameraProjectionTransform',CameraProjectionTransform);
		function SetUniform(Name)
		{
			Shader.SetUniform(Name,Actor.Uniforms[Name]);
		}
		Object.keys(Actor.Uniforms).forEach(SetUniform);
	}
	RenderTarget.DrawGeometry(Geo,Shader,SetUniforms);
}

function RenderCube(RenderTarget,Camera,Position,Scale,Colour)
{
	const Actor = {};

	Actor.Uniforms = {};

	Actor.Geometry = 'Cube';
	Actor.FragShader = GeoColourShader;
	Actor.VertShader = GeoVertShader;

	if (Colour == null)
	{
		Actor.Uniforms.DrawLocalPosition = true;
		Actor.Uniforms.Colour = [1,1,1];
	}
	else
	{
		Actor.Uniforms.DrawLocalPosition = false;
		Actor.Uniforms.Colour = Colour;
	}

	const Scale3 = Array.isArray(Scale) ? Scale : [Scale,Scale,Scale];
	Actor.Uniforms.LocalToWorldTransform = Math.CreateTranslationScaleMatrix(Position,Scale3);

	RenderActor(RenderTarget,Camera,Actor);
}


function GetPortalSkewedCamera(Camera)
{
	const PortalDirRight = [1,0,0];
	const PortalDirUp = [0,1,0];
	const PortalDirForward = [0,0,-1];	//	facing us
	function GetPortalOrientationMatrix()
	{
		//const M = Math.CreateLookAtRotationMatrix([0,0,0],PortalDirUp,PortalDirForward);
		const M =
			[
				PortalDirRight[0],PortalDirUp[0],PortalDirForward[0],0,
				PortalDirRight[1],PortalDirUp[1],PortalDirForward[1],0,
				PortalDirRight[2],PortalDirUp[2],PortalDirForward[2],0,
				0,0,0,1
			];
		return M;
	}

	function GetPortalCorners()
	{
		//	center for now
		const l = Params.PortalX - (Params.PortalW / 2);
		const r = Params.PortalX + (Params.PortalW / 2);
		const t = Params.PortalY + (Params.PortalH / 2);
		const b = Params.PortalY - (Params.PortalH / 2);
		const z = Params.PortalZ;
		const tl = [l,t,z];
		const tr = [r,t,z];
		const br = [r,b,z];
		const bl = [l,b,z];
		return [tl,tr,br,bl];
	}

	function glFrustum(l,r,b,t,n,f)
	{
		const DrawDistance = (f - n);
		const ortho = n;
		const X = (2 * ortho) / (r - l);
		const A = (r+l) / (r-l);
		const Y = (2 * ortho) / (t - b);
		const B = (t + b) / (t - b);
		const C = (f + n) / DrawDistance;		//	far point / viewdistance, ie, 1
		const D = (2 * n * f) / DrawDistance;
		const E = -1;
		const F = 0;

		let Matrix =
			[
				X,0,A,0,
				0,Y,B,0,
				0,0,C,D,
				0,0,E,F
			];
		return Matrix;
	}

	function glOrtho(l,r,b,t,n,f)
	{
		const DrawDistance = (f - n);
		const ortho = 1;
		const X = (2 * ortho) / (r - l);
		const A = 0;
		const AA = -((r + l) / (r - l));
		const Y = (2 * ortho) / (t - b);
		const B = 0;
		const BB = -((t + b) / (t - b));
		const C = -2 / DrawDistance;
		const D = -((f + n) / DrawDistance);
		const E = 0;
		const F = 1;

		//	a and b go in w as they're not multiplied with z in ortho
		let Matrix =
			[
				X,0,A,AA,
				0,Y,B,BB,
				0,0,C,D,
				0,0,E,F
			];
		return Matrix;
	}

	function CreateFrustumMatrix(l,r,b,t,n,f,Headxyz,DistanceToPortal)
	{
		//	https://stackoverflow.com/questions/16416552/achieving-off-axis-projection
		const Fov = Params.SkewTestFov;
		const Ratio = Params.PortalW / Params.PortalH;
		const headX = Headxyz[0];
		const headY = Headxyz[1];
		//	gluLookAt(headX * headZ,headY * headZ,0,headX * headZ,headY * headZ,-1,0,1,0);
		/*
		return glOrtho(
			n * (-Fov * Ratio + headX),
			n * (Fov * Ratio + headX),
			n * (-Fov + headY),
			n * (Fov + headY),
			n,
			f);  */
		const DistanceToZeroDepth = DistanceToPortal;
		return glFrustum(
			n * (-Fov * Ratio + headX),
			n * (Fov * Ratio + headX),
			n * (-Fov + headY),
			n * (Fov + headY),
			n,
			DistanceToPortal);  
		/*
		//	left plane = 1,0,0,0	1=dist
		//	right plane = -1,0,0,0
		//	bottom plane = 0,1,0,0 (up)
		//	up plane = 0,-1,0,0

		normalised
		left = cx + x) * width
		right = cx - x) * width
		*/

		//	gl flips this so it needs to be -1...1 
		//	near = 0,0,0,1
		//	far = 0,0,0,-1



		//	compare this to Pop.Camera.GetProjectionMatrix()
		//	and GetOpenglFocalLengths()
		//	https://docs.microsoft.com/en-us/windows/win32/opengl/glfrustum?redirectedfrom=MSDN
		const RIGHT = (2 * n) / (r - l);
		const UP = (2 * n) / (t - b);
		let CX_A = (r + l) / (r - l);
		let CY_B = (t + b) / (t - b);
		Pop.Debug("CX_A=" + CX_A,"r=" + r,"l=" + l);
		//const C = -((f + n) / (f - n));
		//const E = -1;
		//const D = -((2 * f * n) / (f - n));
		//	Pop.Camera.GetProjectionMatrix
		const C = (-n - f) / (n - f);
		const E = 1;
		const D = (2 * f * n) / (n - f);
		const S = 0;

		if (Params.CXCY_Override)
			CX_A = CY_B = 1;
		CX_A *= Params.CX_Scale;
		CY_B *= Params.CY_Scale;
		//CX_A = 0;
		//CY_B = 0;
		let Matrix = [];
		Matrix[0] = RIGHT;
		Matrix[1] = S;
		Matrix[2] = CX_A;
		Matrix[3] = 0;

		Matrix[4] = 0;
		Matrix[5] = UP;
		Matrix[6] = CY_B;
		Matrix[7] = 0;

		Matrix[8] = 0;
		Matrix[9] = 0;
		Matrix[10] = C;
		Matrix[11] = E;

		Matrix[12] = 0;
		Matrix[13] = 0;
		Matrix[14] = D;
		Matrix[15] = 0;
		return Matrix;

		return [
			RIGHT,S,CX_A,0,
			0,UP,CY_B,0,
			0,0,C,D,
			0,0,E,0
		];
	}

	//	https://medium.com/@michel.brisis/off-axis-projection-in-unity-1572d826541e
	//	m from here https://github.com/aptas/off-axis-projection-unity/blob/master/Assets/Scripts/Projection/ProjectionPlane.cs
	//	the paper inverses this, (transpose),but no different?
	const M = GetPortalOrientationMatrix();
	//const M = GetPortalOrientationMatrix();
	const eyePos = Camera.Position.slice();
	/*
	Vector3 pa = ProjectionScreen.BottomLeft;
	Vector3 pb = ProjectionScreen.BottomRight;
	Vector3 pc = ProjectionScreen.TopLeft;
	Vector3 pd = ProjectionScreen.TopRight;
	
	Vector3 vr = ProjectionScreen.DirRight;
	Vector3 vu = ProjectionScreen.DirUp;
	Vector3 vn = ProjectionScreen.DirNormal;
	*/
	/*
	const vr = PortalDirRight;
	const vu = PortalDirUp;
	const vn = PortalDirForward;
	*/

	const PortalCorners = GetPortalCorners();
	const pa = PortalCorners[3];	//	bottom left
	const pb = PortalCorners[2];	//	bottom right
	const pc = PortalCorners[0];	//	top left
	const pd = PortalCorners[1];	//	top right

	const vr = Math.Normalise3( Math.Subtract3(pb,pa) );
	const vu = Math.Normalise3( Math.Subtract3(pc,pa) );
	const vn = PortalDirForward;
	/*
	subtract(vr,pb,pa);
	subtract(vu,pc,pa);
	normalize(vr);
	normalize(vu);
	cross_product(vn,vr,vu);
	normalize(vn);	*/


	//From eye to projection screen corners
	//Pop.Debug("PortalCorners",PortalCorners);
	//Pop.Debug("eyePos",eyePos);
	va = Math.Subtract3(pa,eyePos);
	vb = Math.Subtract3(pb,eyePos);
	vc = Math.Subtract3(pc,eyePos);
	vd = Math.Subtract3(pd,eyePos);
	//viewDir = eyePos + va + vb + vc + vd;
	let viewDir = Math.Add3(eyePos,va);
	viewDir = Math.Add3(viewDir,vb);
	viewDir = Math.Add3(viewDir,vc);
	viewDir = Math.Add3(viewDir,vd);

	//distance from eye to projection screen plane
	//	https://csc.lsu.edu/~kooima/pdfs/gen-perspective.pdf
	//	this can be to any corner
	//const d = -Math.Dot3(vn,va);	//	paper
	const d = -Math.Dot3(va,vn);	//	unity example
	//const d = Math.Distance3(pa,eyePos);	//	gr: more correct, but doesn't skew?
	Pop.Debug("Distance to screen plane",d);
	//if (ClampNearPlane)
	//	cam.nearClipPlane = d;
	const n = Camera.NearDistance;
	const f = Camera.FarDistance;

	/*	dot product of the unit vector vr (which points from the
	screen origin toward the right) with the non - unit vector
	vb(which points from the eye to the right - most point on
the screen) the result is a scalar value telling us how far
	to the right of the screen origin the right - most point on
	the screen is
	*/
	let r = Math.Dot3(vr,vb);	//	1,0,0 * right = length of x
	let l = Math.Dot3(vr,va);	//	1,0,0 * left = -length of x
	let t = Math.Dot3(vu,vc);	//	0,-1,0 * top = length of y
	let b = Math.Dot3(vu,vb);	//	0,-1,0 * bottom = length of y

	//Because frustum extents are specified at the near plane,
	//	we use similar triangles to scale this distance back from
	//its value at the screen,d units away,to its value at the
	//near clipping plane,n units away
	const nearOverDist = n / d;
	l *= nearOverDist;
	r *= nearOverDist;
	b *= nearOverDist;
	t *= nearOverDist;

	//	va,vb,vc,vd are in "portal space" so the gist here should be 
	//	plane (distances) relative to the portal
	
	
	Pop.Debug("l=" + l,"r=" + r,"b=" + b,"t=" + t,"n="+n,"f="+f);
	const Headxyz = eyePos;
	const P = CreateFrustumMatrix(l,r,b,t,n,f,Headxyz,d);


	//Translation to eye position
	//	gr: same as in GetWorldToCameraMatrix
	const eyex = -eyePos[0];
	const eyey = -eyePos[1];
	const eyez = -eyePos[2];
	const T = Math.CreateTranslationMatrix(eyex,eyey,eyez);

	//Matrix4x4 R = Matrix4x4.Rotate(
	//	Quaternion.Inverse(transform.rotation) * ProjectionScreen.transform.rotation);
	//const R = Math.CreateIdentityMatrix();
	const R = Camera.GetLocalRotationMatrix();
	//	M is portal orientation/lookat
	//	T is camera(human/debug) positon
	//	R is orientation of camera
	//const WorldToCamera = Math.MatrixMultiply4x4Multiple(M,R,T);
	let WorldToCamera = Math.CreateIdentityMatrix();
	if (Params.SkewCamera_R)
		WorldToCamera = Math.MatrixMultiply4x4(WorldToCamera,R);
	if (Params.SkewUseCameraWorldToCamera)
		WorldToCamera = Math.MatrixMultiply4x4(WorldToCamera,Camera.GetWorldToCameraMatrix());
	if (Params.SkewCamera_T)
		WorldToCamera = Math.MatrixMultiply4x4(WorldToCamera,T);
	if (Params.SkewCamera_M)
		WorldToCamera = Math.MatrixMultiply4x4(WorldToCamera,M);
	if (Params.SkewCamera_InvT)
		WorldToCamera = Math.MatrixMultiply4x4(WorldToCamera,Math.MatrixInverse4x4(T));
	if (Params.SkewCamera_InvM)
		WorldToCamera = Math.MatrixMultiply4x4(WorldToCamera,Math.MatrixInverse4x4(M));
	
	//Pop.Debug("WorldToCamera",WorldToCamera);

	//const WorldToCamera = T;
	//const WorldToCamera = M;
	//const WorldToCamera = Math.MatrixInverse4x4(T);
	//	gr: in the paper the projection multiplies with the screen rotateion
	//		no effect here, but maybe as portal is basically identity
	//const ProjectionMatrix = Math.MatrixMultiply4x4(P,M);
	//const ProjectionMatrix = Math.MatrixMultiply4x4Multiple(T,M,P);
	//const ProjectionMatrix = Math.MatrixMultiply4x4(P,M);
	//const ProjectionMatrix = P;
	//const ProjectionMatrix = Math.MatrixMultiply4x4Multiple(P,M,T);
	let ProjectionMatrix = P;
	/*
	ProjectionMatrix =
		[
			4.75416,	0.00000, -3.43179,	0.00000,
	0.00000,	2.90532, -0.15004,	0.00000,
	0.00000,	0.00000, -1.01415, -0.60425,
	0.00000,	0.00000, -1.00000,	0.00000,
		];
	
	//	unity example with our size
	/*
	persp
	4.75416	0.00000 -3.43179	0.00000
	0.00000	2.90532 -0.15004	0.00000
	0.00000	0.00000 -1.01415	-0.60425
	0.00000	0.00000 -1.00000	0.00000
	d= 2..3

	trans
	1.00000	0.00000	0.00000		-1.88748
	0.00000	1.00000	0.00000		-0.13504
	0.00000	0.00000	1.00000		2.61479
	0.00000	0.00000	0.00000		1.00000*/
	/*
	WorldToCamera,
	0.9742,-0.023,-0.224,0,
	0,		-0.994,0.10292553468212256,0,-0.22544092880528343,-0.10027590603381753,-0.9690826230453768,0,-0.35540405415451737,-1.2821413949361437,1.6524623987865503,1

ProjectionMatrix,
2.5321,	0,		-1.2491,	0,
0,		1.4815,	-0.218,		0,
0,		0,		1.0002,		1,
0,		0,		-0.02000,	0

		*/

	
	function gluLookAt(eyex,eyey,eyez,centerx,centery,centerz,upx,upy,upz)
	{
		const eye = [eyex,eyey,eyez];
		const center = [centerx,centery,centerz];
		const up = [upx,upy,upz];
		return Math.CreateLookAtRotationMatrix(eye,up,center);
	}
	{
		const headX = -Headxyz[0];
		const headY = -Headxyz[1];
		const headZ = -Headxyz[2];
		WorldToCamera = gluLookAt(headX * headZ,headY * headZ,0,headX * headZ,headY * headZ,-1,0,1,0);
		WorldToCamera = Math.CreateTranslationMatrix(headX,headY,headZ);
	}
	Pop.Debug("WorldToCamera",WorldToCamera);
	Pop.Debug("ProjectionMatrix",ProjectionMatrix);

	let SkewCamera = {};
	SkewCamera.GetWorldToCameraMatrix = function ()
	{
		return WorldToCamera;
	}

	SkewCamera.GetProjectionMatrix = function (ViewRect)
	{
		//	viewrect is irrelvent cos its the size of the portal
		return ProjectionMatrix;
	}

	SkewCamera.GetLocalToWorldFrustumTransformMatrix = function ()
	{
		let Matrix = ProjectionMatrix.slice();
		Matrix = Math.MatrixInverse4x4(Matrix);

		let WorldToCameraMatrix = WorldToCamera;
		let LocalToWorldMatrix = Math.MatrixInverse4x4(WorldToCameraMatrix);
		Matrix = Math.MatrixMultiply4x4(LocalToWorldMatrix,Matrix);
		return Matrix;
	}

	//const ViewRect = [-1,-1,1,1];
	//Pop.Debug("OrigProjectionMatrix",Camera.GetProjectionMatrix(ViewRect));

	return SkewCamera;
}

function RenderPortal(RenderTarget,Camera)
{
	//	render the screen
	const y = Params.PortalY + (Params.PortalH / 2);
	const Pos = [Params.PortalX,y,Params.PortalZ];
	const Scale = [Params.PortalW / 2,Params.PortalH / 2,0.05];
	const Colour = Params.PortalColour;

	RenderCube(RenderTarget,Camera,Pos,Scale,null);
}


function RenderCameraDebug_WithProjection(RenderTarget,RenderCamera,Camera,XOffset,ProjectionMatrix)
{
	function GetLocalToWorldFrustumTransformMatrix()
	{
		let Matrix = ProjectionMatrix;
		Matrix = Math.MatrixInverse4x4(Matrix);
		//	put into world space
		Matrix = Math.MatrixMultiply4x4(Camera.GetLocalToWorldMatrix(),Matrix);
		Matrix = Math.MatrixMultiply4x4(Matrix,Math.CreateTranslationMatrix(XOffset,0,0));
		return Matrix;
	}

	//	draw frustum
	const Actor = {};
	Actor.Geometry = 'Cube';
	Actor.FragShader = GeoEdgeShader;
	Actor.VertShader = GeoVertShader;
	Actor.Uniforms = {};
	Actor.Uniforms['LocalToWorldTransform'] = GetLocalToWorldFrustumTransformMatrix();
	Actor.Uniforms['ChequerFrontAndBack'] = true;
	Actor.Uniforms['ChequerSides'] = false;
	Actor.Uniforms['LineWidth'] = 0.01;
	RenderActor(RenderTarget,RenderCamera,Actor);
}

function RenderCameraDebug_OrthoProjection(RenderTarget,RenderCamera,Camera,XOffset)
{
	const Projection =
		[
			0.5,0,0,0,	//	half width in both directions, so 1m wide
			0,1,0,0,
			0,0,1,0,

			0,0,1,1		//	move forward 1
		];
	//const InvProjection = Math.MatrixInverse4x4(Projection);
	const InvProjection = (Projection);
	RenderCameraDebug_WithProjection(RenderTarget,RenderCamera,Camera,XOffset,InvProjection);
}

function RenderCameraDebug_BoxProjection(RenderTarget,RenderCamera,Camera,XOffset)
{
	//	far = 1, so width at far
	const Near = Camera.NearDistance;
	const Far = Camera.FarDistance;
	const ZDist = Far - Near;

	//	work out projection (-1..1) to camera-space

	//	z=-1 should be near (0.1)
	//	z=1 should be far (100)
	//	
	//	z== -1...1
	let ProjectionOffset =
		[
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,1,1,
		];

	//	z== 0...2
	//	this does add then scale
	let ProjectionScale =
		[
			1,0,0,0,
			0,1,0,0,
			0,0,0.5*ZDist,0,		//	scale z
			0,0,Near,1			//	offset
		];
	//	z== Near..Near+dist
	
	const Projection = Math.MatrixMultiply4x4(ProjectionScale,ProjectionOffset);

	const InvProjection = Math.MatrixInverse4x4(Projection);
	RenderCameraDebug_WithProjection(RenderTarget,RenderCamera,Camera,XOffset,InvProjection);
}

function RenderCameraDebug(RenderTarget,RenderCamera,Camera,XOffset)
{
	//	draw frustum
	const Actor = {};
	Actor.Geometry = 'Cube';
	Actor.FragShader = GeoEdgeShader;
	Actor.VertShader = GeoVertShader;
	Actor.Uniforms = {};
	Camera.Position[0] += XOffset;
	Camera.LookAt[0] += XOffset;
	Actor.Uniforms['LocalToWorldTransform'] = Camera.GetLocalToWorldFrustumTransformMatrix();
	Camera.Position[0] -= XOffset;
	Camera.LookAt[0] -= XOffset;
	Actor.Uniforms['ChequerFrontAndBack'] = true;
	Actor.Uniforms['ChequerSides'] = false;
	Actor.Uniforms['LineWidth'] = 0.01;
	RenderActor(RenderTarget,RenderCamera,Actor);
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
	for (let z = -0.5;z <= 0;	z+=0.5)
	for (let y = 0;y < 10;y+=0.5)
	{
		const Pos = [0,y,z];
		const Scale = Params.OriginDebugSize;
		const Colour = Params.OriginColour;
		RenderCube(RenderTarget,Camera,Pos,Scale,Colour);
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


class TCameraWindow
{
	constructor(CameraName)
	{
		this.FaceCamera = new Pop.Camera();
		this.FaceCamera.Up[1] = 1;
		this.FaceCamera.Position = [0,0,0];
		this.FaceCamera.LookAt = [0,0,1];

		this.DebugCamera = new Pop.Camera();
		//this.DebugCamera.Position = [0,0.4,2];
		this.DebugCamera.Position = [Params.CaptureX,Params.CaptureY,Params.CaptureZ];
		this.DebugCamera.LookAt = [0,0,0];
		this.DebugCamera.Up[1] = 1;
		
		//const Options = null;
		const Rect = [200,100,500,500];
		const Options = undefined;
		//const Rect = undefined;
		this.Window = new Pop.Opengl.Window(CameraName,Options,Rect);
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
	}
	
	OnRender(RenderTarget)
	{
		let RenderCamera = Params.RenderFromFaceCamera ? this.FaceCamera : this.DebugCamera;
		RenderCamera.FocalCenter[0] = Params.CX_Scale;
		RenderCamera.FocalCenter[1] = Params.CY_Scale;
		this.FaceCamera.FovVertical = Params.WorldVerticalFov;
		this.FaceCamera.NearDistance = Params.CameraNearDistance;
		this.FaceCamera.FarDistance = Params.CameraFarDistance;

		RenderTarget.ClearColour( ...Params.BackgroundColour );
		//if ( Params.RenderGeo )
		//	RenderScene( RenderTarget, RenderCamera );

		RenderCameraDebug(RenderTarget,RenderCamera,this.FaceCamera,-2);
		RenderCameraDebug_OrthoProjection(RenderTarget,RenderCamera,this.FaceCamera,2);
		RenderCameraDebug_BoxProjection(RenderTarget,RenderCamera,this.FaceCamera,0);

		//RenderPortal(RenderTarget,RenderCamera);
		//RenderCapture(RenderTarget,RenderCamera);
		//RenderOrigin(RenderTarget,RenderCamera);
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
			PoseSockets.push(Socket);
			Pop.Debug("Websocket listening on ",JSON.stringify(Socket.GetAddress()));

			OnNewPose("Server says Hello");

			while (true)
			{				
				const Message = await Socket.WaitForMessage();
				OnMessage(Message,Socket);
			}
		}
		catch (e)
		{
			Pop.Debug("Exception in server loop: " + e);
			await Pop.Yield(2000);
		}
	}
}


//	keep trying to connect to servers
async function ConnectToServer(HostNames,OnMessage)
{
	let PortIndex = 0;
	function GetPort()
	{
		//return 9001;
		return 80;
		const PortCount = Expose.ListenPorts.length;
		PortIndex = (PortIndex + 1) % PortCount;
		return Expose.ListenPorts[PortIndex];
	}

	let HostIndex = 0;
	function GetHostName()
	{
		const HostCount = HostNames.length;
		HostIndex = (HostIndex + 1) % HostCount;
		return HostNames[HostIndex];
	}

	while (true)
	{
		try
		{
			const HostName = GetHostName();
			const Port = GetPort();
			const Address = HostName + ":" + Port;

			//	wrapper for websocket
			Pop.Debug("Connecting to websocket " + Address);
			const Socket = new Pop.Websocket.Client(Address);
			Pop.Debug("Created websocket client..." + Address);
			await Socket.WaitForConnect();
			Pop.Debug("Connected websocket client! " + Address);
			PoseSockets.push(Socket);

			OnNewPose("Client says Hello");

			while (true)
			{
				const Message = await Socket.WaitForMessage();
				OnMessage(Message,Socket);
			}
		}
		catch (e)
		{
			Pop.Debug("Exception in server loop: " + e);
			await Pop.Yield(2000);
		}
	}
}

const Window = new TCameraWindow('Projection Test');
