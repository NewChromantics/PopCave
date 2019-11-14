Pop.Include = function(Filename)
{
	const Source = Pop.LoadFileAsString(Filename);
	return Pop.CompileAndRun( Source, Filename );
}

Pop.Include('PopEngineCommon/PopShaderCache.js');
Pop.Include('PopEngineCommon/PopFrameCounter.js');
Pop.Include('PopEngineCommon/MemCheckLoop.js');
Pop.Include('PopEngineCommon/PopMath.js');
Pop.Include('PopEngineCommon/ParamsWindow.js');
Pop.Include('PopEngineCommon/PopCamera.js');
Pop.Include('PopEngineCommon/PopObj.js');

const VertShader = Pop.LoadFileAsString('Quad.vert.glsl');
const GreyscaleFragShader = Pop.LoadFileAsString('Greyscale.frag.glsl');
const SkeletonFragShader = Pop.LoadFileAsString('DrawLines.frag.glsl');
const GeoVertShader = Pop.LoadFileAsString('Geo.vert.glsl');
const GeoColourShader = Pop.LoadFileAsString('Colour.frag.glsl');



var Params = {};
Params.MaxScore = 0.5;
Params.LineWidth = 0.0015;
Params.BoneCount = 64;
Params.RenderVideo = false;
Params.RenderWorld = true;
Params.RenderFromFaceCamera = true;
Params.CameraModelScale = 0.1;
Params.FaceZ = 1;
Params.FaceCameraColour = [0,1,0];
Params.VideoCameraColour = [1,1,1];
Params.BackgroundColour = [0,0,0];
Params.GeoColour = [0,0,1];
Params.GeoScale = 0.01;
Params.GeoYaw = 90;
Params.GeoX = 0;
Params.GeoY = 0;
Params.GeoZ = 0;
Params.RenderGeo = true;


var ParamsWindow = CreateParamsWindow( Params, function(){}, [800,100,500,200] );
ParamsWindow.AddParam('MaxScore',0,1);
ParamsWindow.AddParam('LineWidth',0.0001,0.01);
ParamsWindow.AddParam('BoneCount',1,64,Math.floor);
ParamsWindow.AddParam('FaceZ',0,10);
ParamsWindow.AddParam('RenderVideo');
ParamsWindow.AddParam('RenderWorld');
ParamsWindow.AddParam('RenderFromFaceCamera');
ParamsWindow.AddParam('CameraModelScale',0.001,2);
ParamsWindow.AddParam('FaceCameraColour','Colour');
ParamsWindow.AddParam('VideoCameraColour','Colour');
ParamsWindow.AddParam('BackgroundColour','Colour');

ParamsWindow.AddParam('RenderGeo');
ParamsWindow.AddParam('GeoColour','Colour');
ParamsWindow.AddParam('GeoScale',0.001,10);
ParamsWindow.AddParam('GeoX',-10,10);
ParamsWindow.AddParam('GeoY',-10,10);
ParamsWindow.AddParam('GeoZ',-10,10);
ParamsWindow.AddParam('GeoYaw',-180,180);



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
	
	const SceneFilename = 'Assets/parallax_test_02.obj';
	
	function OnGeometry(Geometry)
	{
		if ( !SceneGeos )
			SceneGeos = [];
		
		Pop.Debug("Geo " + Geometry.Name);
		
		//	convert to triangle buffer
		const VertexAttributeName = "LocalPosition";
		const VertexSize = 3;
		const VertexData = new Float32Array( Geometry.Positions );
		//const TriangleIndexes = new Int32Array( Geometry.TriangleIndexes );
		const TriangleIndexes = undefined;
		const TriangleBuffer = new Pop.Opengl.TriangleBuffer( RenderTarget, VertexAttributeName, VertexData, VertexSize, TriangleIndexes );

		SceneGeos.push( TriangleBuffer );
	}
	const Contents = Pop.LoadFileAsString( SceneFilename );
	Pop.Obj.ParseGeometry( Contents, OnGeometry );
	
	Pop.Debug( SceneFilename + " parsed " + SceneGeos.length + " objects");
	return SceneGeos;
}





function LabelsToSkeleton(Labels)
{
	if ( !Labels || !Labels.length )
		return null;
	
	const Skeleton = {};
	
	function LabelToPoint(Label)
	{
		const Rect = [ Label.x, Label.y, Label.w, Label.h ];
		const u = Label.x + (Label.w/2);
		const v = Label.y + (Label.h/2);
		const Score = Label.Score;	//	all 1 atm
		Skeleton[Label.Label] = [u,v,Score];
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


function GetSkeletonLines(Skeleton,Lines,Scores)
{
	function PushLine(Start,End,Score)
	{
		Lines.push( Start[0] );
		Lines.push( Start[1] );
		Lines.push( End[0] );
		Lines.push( End[1] );
		Scores.push( Score );
	}
	
	if ( !Skeleton )
	{
		//	draw x
		PushLine( [0,0], [1,1], 0 );
		PushLine( [1,0], [0,1], 0 );
		return;
	}
	
	function PointJointRect(Joint)
	{
		try
		{
			const uvscore = Skeleton[Joint];
			const Score = uvscore[2];
			const Size = Params.LineWidth;
			const l = uvscore[0]-Size;
			const r = uvscore[0]+Size;
			const t = uvscore[1]-Size;
			const b = uvscore[1]+Size;
			PushLine( [l,t], [r,t], Score );
			PushLine( [r,t], [r,b], Score );
			PushLine( [r,b], [l,b], Score );
			PushLine( [l,b], [l,t], Score );
		}
		catch(e)
		{
			Pop.Debug(e);
		}
	}
	
	function PushBone(JointAB,Index)
	{
		if ( Index >= Params.BoneCount )
			return;
		try
		{
			const JointA = JointAB[0];
			const JointB = JointAB[1];
			const a = Skeleton[JointA];
			const b = Skeleton[JointB];
			const Score = (a[2] + b[2]) / 2;
			PushLine( a, b, Score );
		}
		catch(e)
		{
			//	missing joint
		}
	}
	
	//Object.keys(Skeleton).forEach( PointJointRect );

	const Bones =
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
	Bones.forEach( PushBone );
}

function RenderScene(RenderTarget, Camera)
{
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
	
	const LocalToWorldTransform = Math.CreateTranslationScaleMatrix( Position, [Scale,Scale,Scale] );
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


function RenderSkeleton(RenderTarget,Skeleton)
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
		
		this.VideoCamera = new Pop.Camera();
		//	calibrate camera
		this.VideoCamera.Position = [0,0,0];
		this.VideoCamera.LookAt = [0,0,1];

		this.FaceCamera = new Pop.Camera();
		
		this.DebugCamera = new Pop.Camera();
		this.DebugCamera.Position = [0,0.4,2];
		this.DebugCamera.LookAt = [0,0,0];

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
		/*
		this.Window.OnMouseScroll = function(x,y,Button,Delta)
		{
			let Fly = Delta[1] * 50;
			//Fly *= Params.ScrollFlySpeed;
			
			const Camera = this.DebugCamera;
			Camera.OnCameraPanLocal( 0, 0, 0, true );
			Camera.OnCameraPanLocal( 0, 0, Fly, false );
		}
*/
		this.Source = new Pop.Media.Source(CameraName);
		this.ListenForFrames().catch(Pop.Debug);
	}
	
	OnRender(RenderTarget)
	{
		this.UpdateFaceCamera( this.LastFace );
		
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
			RenderVideoImage( RenderTarget, this.VideoTexture );
			RenderSkeleton( RenderTarget, this.Skeleton );
		}
		else if ( Params.RenderWorld || Params.RenderFromFaceCamera )
		{
			const RenderCamera = Params.RenderFromFaceCamera ? this.FaceCamera : this.DebugCamera;
			
			RenderTarget.ClearColour( ...Params.BackgroundColour );
			if ( Params.RenderGeo )
				RenderScene( RenderTarget, RenderCamera );
			if ( RenderCamera != this.FaceCamera )
				RenderCube( RenderTarget, RenderCamera, this.FaceCamera.Position, Params.CameraModelScale, Params.FaceCameraColour );
			RenderCube( RenderTarget, RenderCamera, this.VideoCamera.Position, Params.CameraModelScale, Params.VideoCameraColour );
		}
		else
		{
			RenderTarget.ClearColour(0,0,255);
		}
	}
	
	async ProcessNextFrame(FrameBuffer)
	{
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
		//const FrameBuffer = undefined;
		while ( true )
		{
			try
			{
				await Pop.Yield(5);
				const fb = FrameBuffer;
				const NewTexures = await this.ProcessNextFrame(fb);
				if ( !NewTexures )
					continue;
				
				const Luma = new Pop.Image();
				Luma.Copy( NewTexures[0] );
			
				const FaceUvz = await this.GetFaceUvz( Luma );

				this.LastFaceUvz = FaceUvz || this.LastFaceUvz;

				this.UpdateFaceCamera();
				//Pop.Debug(JSON.stringify(this.Skeleton));
				this.VideoTexture = Luma;
				this.CameraFrameCounter.Add();
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
			const FaceUv = this.LastFaceUvz.slice(0,2);
			const FaceZ = this.LastFaceUvz[2];
			const RayToFace = GetCameraRay( this.VideoCamera, FaceUv, FaceZ );

			this.FaceCamera.Position = RayToFace.GetPosition( FaceZ );
			//Pop.Debug("this.FaceCamera.Position",this.FaceCamera.Position);
			this.FaceCamera.LookAt = this.VideoCamera.Position.slice();
		}
		catch(e)
		{
			Pop.Debug("UpdateFaceCamera error",e);
		}
	}
	
	async GetFaceUvz(Frame)
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
		/*
		if ( !CameraName.includes('iSight') )
		{
			return;
		}
		*/
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
	
	while ( true )
	{
		try
		{
			let Devices = await Pop.Media.EnumDevices();
			Pop.Debug("Pop.Media.EnumDevices found(" + Devices + ") result type=" + (typeof Devices) );
			Devices.reverse();
			//CreateCamera(Devices[0]);
			Devices.forEach( CreateCamera );
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

//	start tracking cameras
FindCamerasLoop().catch(Pop.Debug);
