#define WIN32_LEAN_AND_MEAN
#include <windows.h>

#include "PopEngine.h"
#pragma comment(lib, "PopEngine.lib")


int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
                     _In_opt_ HINSTANCE hPrevInstance,
                     _In_ LPWSTR    lpCmdLine,
                     _In_ int       nCmdShow)
{
	return PopEngine("./");
}

