/**
 * Your header documentation here for _listen
 *    For your reference...
 * 		event will hold an Event object with the pixels in
 *   	event.detail.data and the timestamp in event.timeStamp
 */
let findingDuration = {
	duration: 0,
	brightDarkDivide: 175,
	prevBright: false,
	halfGap: 0,
	fullGap: 0,
	gapsFound: false,
	gapLength: 0,
	ignoreFirst:true,
}
let tapInfo =  {					
	tapTable:  [['0','0','0','0','0','0'],				//Tap Conversion Array indexed from 1
				['0','e','t','a','n','d'],
				['0','o','i','r','u','c'],
				['0','s','h','m','f','p'],
				['0','l','y','g','v','j'],
				['0','w','b','x','q','z']],
};

let conversionInfo = {
	duration: 0,
	currentIndex: 0,
	prevDark: false,
	ignoredFirst: false,
	rawDataArray: [],
};
_listen = function(event)
{
	let greyScaledPixel = 0;
	is4isAlpha = 1;
	for (i = 0; i < event.detail.data.length; i++){
		if (is4isAlpha == 4){
			is4isAlpha = 1;
		}
		else{
			greyScaledPixel += event.detail.data[i];
			is4isAlpha += 1;			
		}
	}
	greyScaledPixel = Math.floor(greyScaledPixel/1200);
	console.log('____________________');
	console.log(greyScaledPixel); 
//GreyScaled Values Done here. Need to find method to store the data.


//Finding the Gap Length.
	if (findingDuration.gapsFound == false){
		//If currently dark, and previous tick is bright. Start of gap.
		if (greyScaledPixel < findingDuration.brightDarkDivide && findingDuration.prevBright == true){
			findingDuration.duration = event.timeStamp;
			findingDuration.prevBright = false;
			findingDuration.ignoreFirst = false;
			console.log("Gap Start");
		} 
		//If currently bright, and previous tick is dark. End of gap.
		else if (greyScaledPixel > findingDuration.brightDarkDivide && findingDuration.prevBright == false){
			//Ignore the first Dark to Bright
			if (findingDuration.ignoreFirst){
				findingDuration.ignoreFirst = false;
				findingDuration.prevBright = true;
				console.log("Ignore the First");
			} else{
				findingDuration.prevBright = true;
				findingDuration.gapLength = Math.floor(event.timeStamp - findingDuration.duration);
				console.log("Gap End");
				//Initialising first time Halfgap.
				if (findingDuration.halfGap == 0){
					findingDuration.halfGap = findingDuration.gapLength;
				} //Tolerance of +-30
				else if  (findingDuration.gapLength > (findingDuration.halfGap + 30)) {
					findingDuration.fullGap = findingDuration.gapLength;
					findingDuration.gapsFound = true;
					console.log("halfGap is " + findingDuration.halfGap);
					console.log("fullGap is " + findingDuration.fullGap);
				}	else if (findingDuration.gapLength < (findingDuration.halfGap - 30)){
					findingDuration.fullGap = findingDuration.halfGap;
					findingDuration.halfGap = findingDuration.gapLength;
					findingDuration.gapsFound = true;
					console.log("halfGap is " + findingDuration.halfGap);
					console.log("fullGap is " + findingDuration.fullGap);
				}
			}

		}
	}
//Filling rawDataArray with times and taps


if (greyScaledPixel > 175 & conversionInfo.rawDataArray[conversionInfo.currentIndex  - 1] != 'T'){
	console.log(conversionInfo.rawDataArray + conversionInfo.currentIndex);
	conversionInfo.rawDataArray.push('T');
	conversionInfo.currentIndex += 1;
	conversionInfo.ignoredFirst = true;
}

if (conversionInfo.ignoredFirst == true){
	if (greyScaledPixel < 175 & conversionInfo.prevDark == false) {
		conversionInfo.duration = event.timeStamp;
		conversionInfo.prevDark = true;
	}
	else if (greyScaledPixel > 175 & conversionInfo.prevDark == true){
		conversionInfo.rawDataArray.push(Math.round(event.timeStamp - conversionInfo.duration));
		conversionInfo.prevDark = false;
		conversionInfo.currentIndex +=1
		}
	}
}	


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