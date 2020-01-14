Pop.Include = function(Filename)
{
	const Source = Pop.LoadFileAsString(Filename);
	return Pop.CompileAndRun( Source, Filename );
}

//Pop.Include('ProjectionTest.js');
Pop.Include('Tracking.js');
