VMS4 = new Controller();

// Pause
VMS4.pause = function( channel, control, value, status, group )
{
	if( engine.getValue(group, "play") )
		engine.setValue( group, "play", 0 );
}


// Flanger toggle
VMS4.flangerToggle = function( channel, control, value, status, group )
{
	if( status == 0x90 )
		engine.setValue( group, "flanger", 1 );
	else
		engine.setValue( group, "flanger", 0 );
}
