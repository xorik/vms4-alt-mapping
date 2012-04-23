VMS4 = new Controller();
VMS4.msb = {};
VMS4.jog_prev = {};
VMS4.vinyl = { 1: false, 2: false };
VMS4.scratch_timer = { 1: false, 2: false };
VMS4.track_knob_prev = {};
VMS4.pitch_lock = {};


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
	var deck = group=="[Channel1]" ? 1 : 2;
	
	// Enable scratch
	if( VMS4.vinyl[deck] && !VMS4.scratch_timer[deck] )
		engine.scratchEnable( deck, 2000, 45, 1.0/8, 1.0/8/32 );
	// Reset timer
	if( VMS4.vinyl[deck] )
	{
		if( VMS4.scratch_timer[deck] )
			engine.stopTimer( VMS4.scratch_timer[deck] );
		VMS4.scratch_timer[deck] = engine.beginTimer( 50, "VMS4.scratchTimeout("+deck+")", true );
	}
	
	// Initialized
	if( !isNaN(VMS4.jog_prev[group]) )
	{
		var offset = pos - VMS4.jog_prev[group];
		if( offset > 8192 )
			offset -= 16384;
		else if( offset < -8192 )
			offset += + 16384;
		
		if( VMS4.scratch_timer[deck] )
			engine.scratchTick( deck, offset );
		else
			engine.setValue( group, "jog", offset/40.0 );
	}
	
	// Save previous position
	VMS4.jog_prev[group] = pos;
}


// Stop scrach by timer
VMS4.scratchTimeout = function( deck )
{
	VMS4.scratch_timer[deck] = false;
	engine.scratchDisable( deck );
}


// Enable/disable vinyl mode
VMS4.vinylToggle = function( channel, control, value, status, group )
{
	var deck = group=="[Channel1]" ? 1 : 2;
	
	VMS4.vinyl[deck] = !VMS4.vinyl[deck];
	
	// LED
	var led = { 1: 0x27, 2: 0x49 };
	
	if( VMS4.vinyl[deck] )
		midi.sendShortMsg( 0x90, led[deck], 0x7f );
	else
		midi.sendShortMsg( 0x80, led[deck], 0x00 );
}


VMS4.beatjump = function( channel, control, value, status, group )
{
	var jump_len = { 0x0f: -16.0, 0x10: 16.0, 0x31: -16.0, 0x32: 16.0 };
	
	var len = engine.getValue( group, "track_samples" ) / engine.getValue( group, "track_samplerate" ) / 2.0;
	var bpm = engine.getValue( group, "file_bpm" );
	var beat_size = 60.0 / bpm / len;
	
	var pos = engine.getValue( group, "playposition" ) + beat_size*jump_len[control];
	
	engine.setValue( group, "playposition", pos );
}


// Flanger toggle
VMS4.flangerToggle = function( channel, control, value, status, group )
{
	if( status == 0x90 )
		engine.setValue( group, "flanger", 1 );
	else
		engine.setValue( group, "flanger", 0 );
}


VMS4.trackSelect = function( channel, control, value, status, group )
{
	// Initialized
	if( !isNaN(VMS4.track_knob_prev[group]) )
	{
		var offset = value - VMS4.track_knob_prev[group];
		if( offset > 64 )
			offset -= 128;
		else if( offset < -64 )
			offset += 128;
		
		engine.setValue( "[Playlist]", "SelectTrackKnob", offset );
	}
	
	VMS4.track_knob_prev[group] = value;
}


// Lock pitch in center position
VMS4.pitchLock = function( channel, control, value, status, group )
{
	if( status == 0x90 )
	{
		engine.setValue( group, "rate", 0.0 );
		VMS4.pitch_lock[group] = true;
	}
	else
		VMS4.pitch_lock[group] = false;
}


// pitch control
VMS4.pitch = function( channel, control, value, status, group )
{
	// Locked on 0
	if( VMS4.pitch_lock[group] )
		return;
	
	var value = (value << 7) | control;
	var rate = (8192-value) / 8191.0;
	
	engine.setValue( group, "rate", rate );
}
