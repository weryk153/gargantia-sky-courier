// Copyright (c) 2013 Turbulenz Limited

//
//  Config RELEASE
//
//  Used by index.html -- the game as players see it. editor.html loads
//  configdebug.js instead, which turns the debug panel and the level editor
//  back on. The two files must define the same keys; only the values differ.
//

/*exported Config*/

var Config =
{
    //Version
    version : '0.9',
    saveVersionNumber : 1,

    versionMessage : 'RELEASE CONFIG',

    infoText :  'Work in progress.',
    drawInfoText : false,

    //Rendering.
    cameraNearPlane : 3.0,
    cameraFarPlane : 14000.0,
    imposterPageSize: 1024,

    //Performance.
    targetFPS : 60,
    variableStep : false,

    //Startup.
    useLoadingBar : true,   // Leave this on -- shaders may not load without it.
    useSplashScreens : false,
    skipToMission : true,

    //Debugging.
    maxDebugLines : 16384,
    cheats : false,
    resetKey : true,                // Lets a player restart the mission.
    debugText : false,              // Hides the FPS/memory readout.
    debugUpdate : false,            //Requires debugText.
    debugRender : false,            //Requires debugText.
    debugNav : false,               //Requires debugText.
    profiling : false,              // Forces cheats
    debugEnableWireframe : false,   // Keeps copy of vertex data
    debugDrawGameSpaces : false,
    debugSliders : false,
    enableDynamicUI : false,
    addArchetypeSliders : false,
    debugWebGL : false,
    debugDrawHoops : false,

    // Audio
    disableSound : false,

    //Controller.
    controlOneButton : false,
    controlWasd : true,
    controlPad : true,

    //Levels
    startUpLevelPath : 'levels/mission_1.json',

    starsEnabled : true,
    levelProgressionStartIndex : 100,
    levelProgressionEndIndex : 100,

    //Editor
    enableEditor : false,
    editorScreenShotMode : false,

    //Mouse lock
    lockMouseInGame : false,
    lockMouseInMenus : false,
    enableCustomCursors : true,

    //Music enabled.
    musicEnabled : false,

    //Whether to render to a render buffer
    useRenderBuffer : false,
    renderBufferWidth : null,// - use device width
    renderBufferHeight : null // - use device height
};
