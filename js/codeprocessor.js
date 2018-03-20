/**
 * Your header documentation here for _listen
 *    For your reference...
 * 		event will hold an Event object with the pixels in
 *   	event.detail.data and the timestamp in event.timeStamp
 */
_listen = function(event)
{
	let greyScaledPixel = 0;
	for (i = 0; i < event.detail.data.length; i++){
		greyScaledPixel += event.detail.data[i];
	}
	greyScaledPixel = Math.floor(greyScaledPixel/1600);
	console.log(greyScaledPixel);
	console.log("_____________");
};

/**
 * Your header documentation here for clear
 */
clear = function()
{
	// your code here
};

/**
 * Your header documentation here for translate
 */
translate = function()
{	
	
	var tapInfo =  {				
		tapTable:  [['0','0','0','0','0','0'],				//Tap Conversion Array indexed from 1
					['0','e','t','a','n','d'],
					['0','o','i','r','u','c'],
					['0','s','h','m','f','p'],
					['0','l','y','g','v','j'],
					['0','w','b','x','q','z']],
		gapDuration: 0										//Gap duration intially set to 0.
	};

	// your code here
};