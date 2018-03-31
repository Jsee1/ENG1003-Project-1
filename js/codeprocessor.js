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
	brightDarkDivide: 175,
	tolerance: 150,
	prevBright: false,
	halfGap: 0,
	fullGap: 0,
	gapsFound: false,
	gapLength: 0,
	ignoreFirst:true,
}

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
	let tapInfo =  {					
		tapTable:  [['0','0','0','0','0','0'],				//Tap Conversion Array indexed from 1
					['0','e','t','a','n','d'],
					['0','o','i','r','u','c'],
					['0','s','h','m','f','p'],
					['0','l','y','g','v','j'],
					['0','w','b','x','q','z']],
	};
	//Converts T & duration array into a translated T, H and F array.
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
	
	errorHandle = function(){
		if (earlyTerm.isBright == true){		
			alert("Stopped at tap");     //Error out
		}
		else if (event.timeStamp - findingDuration.duration < findingDuration.halfGap + findingDuration.tolerance){
			alert("Stopped in potential halfgap.")
		}
		let noOfF = 0;
		// If the message stop with an "H" means recording stops at half gaps, which suggests is an early termination.
		if (translatedDataArray[translatedDataArray.length -1] === "H")
		{
			alert('Recording is not completed.');
		}
		// 
		for (let i = 1; i < translatedDataArray.length ; i++)
		{
			if (translatedDataArray[i] ==='F')
			{
				noOfF += 1;
			}	
		}
		if (noOfF%2 === 0)
		{
			alert('Recording is not completed.');
		}
	}
	errorHandle();


/*	counterOfF is the counter for F.
		taps1 and taps2 are the No.of taps.
		halfGaps1 and halfGaps2 are the No.of half gaps.
		taps1 and halfgaps1 -> row value 
		taps2 and halfgaps2 -> column value
		taps1 and taps2 represent the row and colum index in the tap table respectively */
		let plainText = '';
		let counterOfF = 0, taps1 = 0, halfGaps1 = 0, taps2 = 0,halfGaps2 = 0,rowIndex=0,columnIndex=0,charater = '';
		translatedDataArray.unshift('F');translatedDataArray.push('F'); // Add 'F' in front of message and return the new length.
		
		for (let  i = 0; i < translatedDataArray.length;i++)
		{
			if (translatedDataArray[i] === "F")
			{
				counterOfF += 1; // Assume all the messages start with F. The first counter of F is 1.
			}
			// beginning of next letter. 
			if (translatedDataArray[i] === "F" && counterOfF%2 != 0 && i != 0) 
			{   
				// assign taps1 and taps2 to row and colmn index
				rowIndex = taps1;
				columnIndex = taps2;
				// convert code message to plaintext
				plainText += tapInfo.tapTable[rowIndex][columnIndex];
				// initialise all counter value for new letter
				taps1 = 0; 
				taps2 = 0;
				halfGaps1 = 0;
				halfGaps2 = 0;
			}
			
			// to find the no. of taps and no.of half gaps for row value
			// if counterOfF is an odd number , all the obtained value if for the row index
			if (counterOfF%2 != 0) // condition: odd number
			{
				if (taps1 <= 5 && halfGaps1 <= 4) //as tapInfo is a 5x5 array, the max taps number is 5; correspondingly,the max half gap number is 4.
				{
					if ( translatedDataArray[i] === "T")
					{
						taps1 += 1;
					}
					if ( translatedDataArray[i] === "H")
					{
						halfGaps1 += 1;
					}	
				}
				// checking whether number of taps and halfgaps exceed the maximum taps or not
				if (taps1 > 5) // taps number greater than 5 will return an error message
				{
					alert('Error: There are too many successive taps.');
				}
				else if (halfGaps1 > 4) // halfGaps number greater than 4 will return an error message.
				{
					alert('Error:  There are too many half gaps.');
				}
				
			}
			// to find the no. of taps and no.of half gaps for column
			// if counterOfF is an even number , all the obtained value if for the row index
			if (counterOfF%2 === 0) // condition: even number
			{
				
				if (taps2 <= 5 && halfGaps2 <= 4) //as tapInfo is a 5x5 array, the max taps number is 5; correspondingly,the max half gap number is 4.
					{
					if ( translatedDataArray[i] === "T")
					{
						taps2 += 1;
					}
					if ( translatedDataArray[i] === "H")
					{
						halfGaps2 += 1;
					}
				}
				// checking whether number of taps and halfgaps exceed the maximum taps or not
				if (taps2 > 5)// taps number greater than 5 will return an error message
				{
					
					alert('Error: There are too many successive taps.');
				}
				else if (halfGaps1 > 4) // halfGaps number greater than 4 will return an error message.
				{
					alert('Error:  There are too many half gaps.');
				}
			}
		}
		var  finalString = plainText.replace(/wuw/g, " ").replace(/qc/, "k");
		var codeString = ''
		for ( i = 0; i < translatedDataArray.length; i++){
			if (translatedDataArray[i] == "T"){
				codeString += '*';
			}
			else if (translatedDataArray[i] == "F"){
				codeString += " ";
			}
		}
	console.log(plainText);
	console.log(translatedDataArray);
	rxTranslateOutputRef.innerHTML = finalString;
	rxCodeOutputRef.innerHTML = codeString;
	console.log("Entered the Translate Function");
	console.log(findingDuration.halfGap);
	console.log(findingDuration.fullGap);



}