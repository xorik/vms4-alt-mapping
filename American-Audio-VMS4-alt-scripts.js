VMS4 = new Controller();

// Pause
VMS4.pause = function( channel, control, value, status, group )
{
	if( engine.getValue(group, "play") )
		engine.setValue( group, "play", 0 );
}
