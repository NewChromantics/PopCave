
Pop.Debug("Hello");

function StringToByteArray(String)
{
	const Bytes = String.split('').map(c => c.charCodeAt(0));
	return Bytes;
}

function GetMessageReply(Message)
{
	switch (Message)
	{
		case "ReadyToConnect": return "Connected";
		case "BarcaStartup": return "Begin";
		case "CheckFlights": return "LiveView";	//	not true
		case "LiveViewComplete": return "Reset";
	}
	throw "Unhandled Message " + Message;
}

function OnMessage(Message,Server)
{
	const MessageString = String.fromCharCode(...Message.Data);
	Pop.Debug("Got message",MessageString,Message.Peer);

	const ReplyString = GetMessageReply(MessageString);
	/*
	//	gr: the "LiveView" reply times out after X secs normally, so lets force it to restart after a bit
	if (ReplyString == "LiveView")
	{
		function SendRestart()
		{
			Pop.Debug("Send Restart");
			Server.Send(Message.Peer,StringToByteArray("Begin"));
		}
		Pop.SetTimeout(SendRestart,4000);
	}
	*/
	Server.Send(Message.Peer,StringToByteArray(ReplyString));
}

async function RunTCPServer(Port)
{
	while (true)
	{
		const Server = new Pop.Socket.TcpServer(9002);
		try
		{
			Pop.Debug("Waiting for first message");
			while (true)
			{
				const Message = await Server.WaitForMessage();
				try
				{
					OnMessage(Message,Server);
				}
				catch (e)
				{
					Pop.Debug("OnMessage error",e);
				}
			}
		}
		catch (e)
		{
			Pop.Debug("TCP server error",e);
			await Pop.Yield(1000);
		}
	}
}

RunTCPServer().then(Pop.Debug).catch(Pop.Debug);
