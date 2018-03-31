/**
 * Your header documentation here for _listen
 *    For your reference...
 * 		event will hold an Event object with the pixels in
 *   	event.detail.data and the timestamp in event.timeStamp
 */

let rxTranslateOutputRef = document.getElementById("rx-translated");
let rxCodeOutputRef = document.getElementById("rx-code");

let earlyTerm = {
	isBright: true,
}

let findingDuration = {
	duration: 0,
	brightDarkDivide: 200,
	tolerance: 150,
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

if (greyScaledPixel < findingDuration.brightDarkDivide == true){
	earlyTerm.isBright = false;
}
else{
	earlyTerm.isBright = true;
}


//GreyScaled Values Done here. Need to find method to store the data.


//Finding the Gap Length.
		//If currently dark, and previous tick is bright. Start of gap.
		if (greyScaledPixel < findingDuration.brightDarkDivide && findingDuration.prevBright == true){
			conversionInfo.rawDataArray.push('T');
			findingDuration.duration = event.timeStamp;
			findingDuration.prevBright = false;
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
				findingDuration.gapLength = Math.round(event.timeStamp - findingDuration.duration);
				conversionInfo.rawDataArray.push(findingDuration.gapLength);
				console.log("Gap End");
				//Initialising first time Halfgap.
				if (findingDuration.gapsFound == false){
					findGapDuration();
				}
			}

		}

findGapDuration = function(){
	if (findingDuration.halfGap == 0){
		findingDuration.halfGap = findingDuration.gapLength;
	} //Tolerance of +-30
		else if  (findingDuration.gapLength > (findingDuration.halfGap + findingDuration.tolerance)) {
			findingDuration.fullGap = findingDuration.gapLength;
			findingDuration.gapsFound = true;
			console.log("halfGap is " + findingDuration.halfGap);
			console.log("fullGap is " + findingDuration.fullGap);
		}else if (findingDuration.gapLength < (findingDuration.halfGap - findingDuration.tolerance)){
			findingDuration.fullGap = findingDuration.halfGap;
			findingDuration.halfGap = findingDuration.gapLength;
			findingDuration.gapsFound = true;
			console.log("halfGap is " + findingDuration.halfGap);
			console.log("fullGap is " + findingDuration.fullGap);
		}
	}
}




/**
 * Your header documentation here for clear
 */
clear = function()
{
	console.log("Entered the clear function");
	// your code here
};

/**
 * Your header documentation here for translate
 */

translate = function()
{	
	if (earlyTerm.isBright == true){
		//Error out
		alert("Stopped at tap");
	}
	else if (event.timeStamp - findingDuration.duration < findingDuration.halfGap + 150){
		alert("Stopped in potential halfgap.")
	}

	console.log(conversionInfo.rawDataArray);
	translatedDataArray = [];
	for (i = 0; i < conversionInfo.rawDataArray.length ; i++){
		if (conversionInfo.rawDataArray[i] == 'T'){
			translatedDataArray.push('T');
		}
		else{
			absoluteVal = Math.abs(conversionInfo.rawDataArray[i] - findingDuration.halfGap)
			if (absoluteVal < findingDuration.tolerance){
				translatedDataArray.push('H');
			}
			else{
				translatedDataArray.push('F');
			}
		}
	}
	console.log(translatedDataArray);
	rxTranslateOutputRef.innerHTML = "Code for Translate";
	rxCodeOutputRef.innerHTML = "Code for Code";
	console.log("Entered the Translate Function");
	console.log(findingDuration.halfGap);
	console.log(findingDuration.fullGap);



};