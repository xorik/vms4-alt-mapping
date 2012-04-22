VMS4 = new Controller();
VMS4.msb = {};
VMS4.jog_prev = {};


// Pause
VMS4.pause = function( channel, control, value, status, group )
{
	if( engine.getValue(group, "play") )
		engine.setValue( group, "play", 0 );
}


// Jog wheel
VMS4.jogMsb = function( channel, control, value, status, group )
{
	VMS4.msb[group] = value;
}


VMS4.jogLsb = function( channel, control, value, status, group )
{
	// LSB<<7 + MSB
	var pos = (VMS4.msb[group] << 7) + value;
	
	// Initialized
	if( !isNaN(VMS4.jog_prev[group]) )
	{
		var offset = pos - VMS4.jog_prev[group];
		if(offset > 8192)
			offset -= 16384;
		else if(offset < -8192)
			offset += + 16384;
		
		engine.setValue( group, "jog", offset/40.0 );
	}
	
	// Save previous position
	VMS4.jog_prev[group] = pos;
}


// Flanger toggle
VMS4.flangerToggle = function( channel, control, value, status, group )
{
	if( status == 0x90 )
		engine.setValue( group, "flanger", 1 );
	else
		engine.setValue( group, "flanger", 0 );
}
