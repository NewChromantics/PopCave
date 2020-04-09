
let Window = new Pop.Gui.Window("Any name");
let Label = new Pop.Gui.Label(Window,"TheTextBox");
Label.SetValue('Hello from javascript!');

async function FindCamerasLoop()
{
	while(true)
	{
		try
		{
			let Devices = await Pop.Media.EnumDevices();
			Pop.Debug("Pop.Media.EnumDevices found(" + JSON.stringify(Devices) + ") result type=" + (typeof Devices));
			Label.SetValue( JSON.stringify(Devices,null,'\t') );
		}
		catch(e)
		{
			Pop.Debug("FindCamerasLoop error: " + e );
		}
		await Pop.Yield(2000);
	}
}

//	start tracking cameras
FindCamerasLoop().catch(Pop.Debug);
