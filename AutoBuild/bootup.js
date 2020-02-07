

Pop.Perforce = {};

Pop.Perforce.WaitForRevisionPush = async function(WorkspacePath)
{
	return 0;
}

async function BuildUnreal(Path,OnStdOut)
{
	//const Command = "-ScriptsForProject=F:/vin/Vignettes.uproject BuildCookRun -nocompile -nocompileeditor -installed -nop4 -project=F:/vin/Vignettes.uproject -cook -stage -archive -archivedirectory=F:/vin/Build -package -clientconfig=Shipping -ue4exe="D:\Epic Games\UE_4.23\Engine\Binaries\Win64\UE4Editor-Cmd.exe" -pak -prereqs -nodebuginfo -targetplatform=Win64 -build -utf8output";
	const Command = "notepad.exe";

	//	create process
	const Process = new Pop.ShellExecute(Command);

	async function GetStdOutLoop()
	{
		//	keep running grabbing std out
		while (true)
		{
			//	this will return an exit code when process has exited
			const NewStdOutput = await Process.WaitForOutput();
			Pop.Debug("Output",NewStdOutput,typeof NewStdOutput);
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

async function BuildWorkspace(Path,OnBuildMetaUpdate,FilterArtifactFilename)
{
	const RevisionNumber = await Pop.Perforce.WaitForRevisionPush(Path);

	const BuildMeta = {};
	BuildMeta.Path = Path;
	BuildMeta.RevisionNumber = RevisionNumber;
	BuildMeta.StartTimeMs = Pop.GetTimeNowMs();
	BuildMeta.StdOut = "";
	OnBuildMetaUpdate(BuildMeta);

	//	start build process
	function OnStdOut(Output)
	{
		BuildMeta.StdOut += Output;
		OnBuildMetaUpdate(BuildMeta);
	}

	const ExitCode = await BuildUnreal(Path,OnStdOut);
	BuildMeta.ExitCode = ExitCode;
	OnBuildMetaUpdate(BuildMeta);

	//	create zip of artifacts
	//	enum every file in path, and filter
	const AllFilenames = Pop.GetFilenames(Path);
	const ArtifactFilenames = AllFilenames.filter(FilterArtifactFilename);

	BuildMeta.ArtifactFilenames = ArtifactFilenames;
	OnBuildMetaUpdate(BuildMeta);

	//	save zip somewhere

	return BuildMeta;
}


async function AutoBuild(Path)
{
	function OnBuildMetaUpdate(BuildMeta)
	{
		//Pop.Debug("Build Meta updated");
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
		const BuildMeta = await BuildWorkspace(Path,OnBuildMetaUpdate,FilterArtifactFilename);
		Pop.Debug("Build finished",JSON.stringify(BuildMeta));

		await Pop.Yield(1000);
	}
}

AutoBuild('F:/vin').then(Pop.Debug).catch(Pop.Debug);


