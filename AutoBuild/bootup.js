

Pop.Perforce = {};

Pop.Perforce.WaitForRevisionPush = async function(WorkspacePath)
{
	return 0;
}

async function BuildUnreal(Path,OnStdOut)
{
	//const Command = "-ScriptsForProject=F:/vin/Vignettes.uproject BuildCookRun -nocompile -nocompileeditor -installed -nop4 -project=F:/vin/Vignettes.uproject -cook -stage -archive -archivedirectory=F:/vin/Build -package -clientconfig=Shipping -ue4exe="D:\Epic Games\UE_4.23\Engine\Binaries\Win64\UE4Editor-Cmd.exe" -pak -prereqs -nodebuginfo -targetplatform=Win64 -build -utf8output";
	//const Command = "dir .";
	const Command = "D:\\Epic Games\\UE_4.23\\Engine\\Build\\BatchFiles\\RunUAT.bat";

	//	create process
	const Process = new Pop.ShellExecute(Command);

	async function GetStdOutLoop()
	{
		//	keep running grabbing std out
		while (true)
		{
			//	this will return an exit code when process has exited
			const NewStdOutput = await Process.WaitForOutput();
			//Pop.Debug("Output",NewStdOutput,typeof NewStdOutput);
			if (typeof NewStdOutput == "number")
			{
				const ExitCode = NewStdOutput;
				return ExitCode;
			}
			OnStdOut(NewStdOutput);
		}
	}

	const ExitCode = await GetStdOutLoop();
	return ExitCode;
}

function String_CutLeft(Haystack,Needle)
{
	//	while to allow trim of multiple starting chars/strings
	while (Haystack.startsWith(Needle))
	{
		Haystack = Haystack.slice(Needle.length);
	}
	return Haystack;
}

async function BuildWorkspace(InputMeta,OnBuildMetaUpdate)
{
	const RevisionNumber = await Pop.Perforce.WaitForRevisionPush(InputMeta.Path);

	const BuildMeta = {};
	BuildMeta.Path = InputMeta.Path;
	BuildMeta.RevisionNumber = RevisionNumber;
	BuildMeta.StartTimeMs = Pop.GetTimeNowMs();
	BuildMeta.StdOut = "";
	OnBuildMetaUpdate(BuildMeta);

	//	start build process
	function OnStdOut(Output)
	{
		Output = Output.replace('\n','\\n');
		Output = Output.replace('\r','\\r');
		BuildMeta.StdOut += Output;
		OnBuildMetaUpdate(BuildMeta);
	}

	const ExitCode = await BuildUnreal(InputMeta.Path,OnStdOut);
	BuildMeta.ExitCode = ExitCode;
	OnBuildMetaUpdate(BuildMeta);

	//	create zip of artifacts
	//	enum every file in path, and filter
	const AllFilenames = Pop.GetFilenames(InputMeta.Path);
	const ArtifactFilenames = AllFilenames.filter(InputMeta.FilterArtifactFilename);

	BuildMeta.ArtifactFilenames = ArtifactFilenames;
	OnBuildMetaUpdate(BuildMeta);

	BuildMeta.Zip = {};
	BuildMeta.Zip.StartTimeMs = Pop.GetTimeNowMs();
	BuildMeta.Zip.AddedFiles = [];
	BuildMeta.Zip.Filename = InputMeta.ZipFilename;

	const Zip = new Pop.Zip.Archive(InputMeta.ZipFilename);
	for (const Filename of BuildMeta.ArtifactFilenames)
	{
		let ZipFilename = String_CutLeft(Filename,InputMeta.Path);
		ZipFilename = ZipFilename.replace(/\\/g,"/");
		ZipFilename = String_CutLeft(ZipFilename,"/");
		await Zip.AddFile(Filename,ZipFilename);
		Pop.Debug("Added " + ZipFilename,Filename);
		BuildMeta.Zip.AddedFiles.push(ZipFilename);
		OnBuildMetaUpdate(BuildMeta);
	}
	Zip.Close();

	Pop.ShowFileInFinder(BuildMeta.Zip.Filename);
	BuildMeta.EndTimeMs = Pop.GetTimeNowMs();

	return BuildMeta;
}


async function AutoBuild(Path)
{
	function OnBuildMetaUpdate(BuildMeta)
	{
		Pop.Debug("Build Meta updated");
	}

	function FilterArtifactFilename(Filename)
	{
		if (Filename.endsWith('.exe'))
			return true;

		return false;
	}

	//while (true)
	{
		Pop.Debug("Waiting for next build...");
		const BuildInfo = {};
		BuildInfo.ZipFilename = 'Build.zip';
		BuildInfo.FilterArtifactFilename = FilterArtifactFilename;
		BuildInfo.Path = Path;

		const BuildMeta = await BuildWorkspace(BuildInfo,OnBuildMetaUpdate);
		const DurationSecs = (BuildMeta.EndTimeMs - BuildMeta.StartTimeMs)/1000;
		Pop.Debug(`Build finished after ${DurationSecs} secs`,JSON.stringify(BuildMeta,null,'\t'));

		await Pop.Yield(1000);
	}
}

AutoBuild('F:/vin').then(Pop.Debug).catch(Pop.Debug);


