#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files
#include <windows.h>
// C RunTime Header Files
#include <stdlib.h>
#include <malloc.h>
#include <memory.h>
#include <tchar.h>

#include "PopEngine.h"
#pragma comment(lib, "PopEngine.lib")

#include <string>
#include <sstream>

std::string GetErrorString(int Error)
{
	if (Error == ERROR_SUCCESS)
		return std::string();

	LPVOID lpMsgBuf;
	DWORD bufLen = FormatMessageA(
		FORMAT_MESSAGE_ALLOCATE_BUFFER |
		FORMAT_MESSAGE_FROM_SYSTEM |
		FORMAT_MESSAGE_IGNORE_INSERTS,
		NULL,
		Error,
		MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
		(LPSTR)&lpMsgBuf,
		0, NULL);

	if (!bufLen)
	{
		//	gr: LocalFree missing on hololens, change buffering
		if (lpMsgBuf)
			LocalFree(lpMsgBuf);

		std::stringstream ErrorStr;
		ErrorStr << "<Error=" << Error << ">";
		return ErrorStr.str();
	}

	LPCSTR lpMsgStr = (LPCSTR)lpMsgBuf;
	std::string result(lpMsgStr, lpMsgStr + bufLen);

	LocalFree(lpMsgBuf);
	/*
	//	gr: trim off line feeds
	BufferArray<char, 2> LineFeeds;
	LineFeeds.PushBack('\n');
	LineFeeds.PushBack('\r');
	Soy::StringTrimRight(result, GetArrayBridge(LineFeeds));*/
	return result;
}


int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
                     _In_opt_ HINSTANCE hPrevInstance,
                     _In_ LPWSTR    lpCmdLine,
                     _In_ int       nCmdShow)
{
	return PopEngine("d:/PopCave/PopCave");
}

