/**
 * Your header documentation here for _listen
 *    For your reference...
 * 		event will hold an Event object with the pixels in
 *   	event.detail.data and the timestamp in event.timeStamp
 */

let rxTranslateOutputRef = document.getElementById("rx-translated"); 
let rxCodeOutputRef = document.getElementById("rx-code");

let errorDetect = // Object used in determining early termination of message
{
	isBright: false,
	isError: false,
}

let findingDuration = // Object used in determining the length of half gaps and full gaps and the creation of rawDataArray
{
	duration: 0,                    // 
	brightDarkDivide: 200,          // Grey scaled values below this value are dark, values above are light
	tolerance: 200,                 // Tolerance for half gap and full gap durations (+-200ms)
	prevBright: false,              
	halfGap: 0,                     // Initial duration of half gap
	fullGap: 0,                     // Initial duration of full gap
	gapsFound: false,                
	gapLength: 0,                   // Initial duration of a gap              
	ignoreFirst:true,               
}

let conversionInfo = // Object used in converting rawDataArray into translatedDataArray
{
	duration: 0,
	currentIndex: 0,
	prevDark: false,
	ignoredFirst: false,
	rawDataArray: [],               // Initial array which will be filled with either taps or a duration

};


/*_______________________________________________________________________________________________________________________________*/



_listen = function(event)
{
	greyScaledPixel = greyScale();
	lastPixBrightSetter(greyScaledPixel);
	generateRawDataArray(greyScaledPixel);

}
/*_______________________________________________________________________________________________________________________________*/

// greyScale()
//
// This function accesses the pixel array data stored in event.detail.data and converts this RBGA
// (Red, Green, Blue, and Alpha) information into a grey scaled value. It does this by totalling 
// every value in the array bar the fourth and taking the average. Every fourth value is ignored as
// it is the alpha value, which is not required to generate a greyscaled value.
// 
// precondition: 
// returns: greyScaledPixel: This is the grey scaled value for the 20x20 pixel provided by the event
// 		object.

greyScale = function()
{
	let greyScaledPixel = 0;  
	is4isAlpha = 1;
	for (i = 0; i < event.detail.data.length; i++)
    {
		if (is4isAlpha === 4) // Ignores all alpha values of recieved RGB array
        {
			is4isAlpha = 1;
        }
		else
        {
			greyScaledPixel += event.detail.data[i]; // Adds all RGB values in 20x20 pixel area
			is4isAlpha += 1;			
		}
	}
	greyScaledPixel = Math.floor(greyScaledPixel/1200); // Calculating average grey scale value of 20x20 pixel area and rounding down to the nearest whole number
	console.log('____________________');
	console.log(greyScaledPixel); 
	return greyScaledPixel;

}

// lastPixBrightSetter()
//
// This function checks if the current pixel is 'bright' and stores this information for use
// later in the local function errorHandle(). It achieves this by comparing the greyScaledPixel
// value against the tolerence dictated in findingDuration and storing an appropriate
// boolean value in errorDetect.isBright.
// argument: pixel: This is the grey scaled value a 20x20 pixel.
// return:
//      This function does not return anything.
lastPixBrightSetter = function(pixel)
{
    if (pixel < findingDuration.brightDarkDivide === true)  // If the pixel value is dark
    {
    errorDetect.isBright = false; // Does not end on a tap
    }
    else
    {
	    errorDetect.isBright = true; // Ends on a tap
	}
}

//  findGapDuration()
//     
// This function determines the duration half gaps and full gaps. It receives darkness duration
// times by accessing the findingDuration object. If the duration of a halfgap is 0 (stored in 
// gapDurationsAndTolerances), it is initially set to the current gap duration. Successive calls
// of this function compare the current gap duration with that of halfgap. When the difference 
// between halfgap and the current gap duration is exceeds a tolerance value, set in findingDuration,
// we set the larger of the two values as the fullGap, and the lesser value as
// the halfGap, with both values being stored in gapDurationsAndTolerances object.
// return:
// 	This function does not return anything.
findGapDuration = function()
{
	if (findingDuration.halfGap === 0)
	{
		findingDuration.halfGap = findingDuration.gapLength;
	} // Tolerance of +-150
	else if  (findingDuration.gapLength > (findingDuration.halfGap + findingDuration.tolerance)) // If gap length is longer than maximum half gap length
	{
		findingDuration.fullGap = findingDuration.gapLength; // Gap length becomes full gap length
		findingDuration.gapsFound = true; // Gaps have been found, function is no longer called
		console.log("halfGap is " + findingDuration.halfGap);
		console.log("fullGap is " + findingDuration.fullGap);
	}
	else if (findingDuration.gapLength < (findingDuration.halfGap - findingDuration.tolerance)) // If gap length is less than minimum half gap length
	{
		findingDuration.fullGap = findingDuration.halfGap; // Full gap length becomes half gap length
		findingDuration.halfGap = findingDuration.gapLength; // Half gap length becomes gap length
		findingDuration.gapsFound = true; // Gaps have been found, function is no longer called
		console.log("halfGap is " + findingDuration.halfGap);
		console.log("fullGap is " + findingDuration.fullGap);
	}
}


// generateRawDataArray()
//
// This function generates the rawDataArray consisting of duration time valueswhich is to be translated into
// a more usable format in the translate function. This function will also call findGapDuration() if
// the boolean attribute gapsFound is not true. The function times the duration of every tap and gap and stores
// this information in the rawDataArray. The durations for taps and gaps are obtained by utilising 
// time stamps. When a change in brightness from dark to light or light to dark is detected a timestamp is 
// taken as both indicate the beginning of either a tap or a gap. When a brightness change is detected again, 
// another timestamp is taken and the the difference between the two timestamps is recorded as duration
// Due to the nature of Tap Code (alternating taps and gaps), every even index in the array will contain 
// the duration of a tap, and every odd index will contain the duration of a gap. 
// 
// argument: greyScaledPixel: This is the grey scaled value a 20x20 pixel.
// return:
//      This function does not return anything.
//
generateRawDataArray = function(greyScaledPixel)
{
	if (greyScaledPixel < findingDuration.brightDarkDivide && findingDuration.prevBright === true)
    {
		// Records only one tick of the tap and adds this to rawDataArray
		conversionInfo.rawDataArray.push(Math.round(event.timeStamp - findingDuration.duration))          
		findingDuration.duration = event.timeStamp; 
		findingDuration.prevBright = false; // Changes prevBright value after tap has been recorded
		console.log("Gap Start");
	} 
    
	// If currently bright, and previous tick is dark. End of gap.
	else if (greyScaledPixel > findingDuration.brightDarkDivide && findingDuration.prevBright === false)
    {
    // Ignore the first dark to bright as message output starts with a tap
	   if (findingDuration.ignoreFirst)
        {
			findingDuration.duration = event.timeStamp;
            findingDuration.ignoreFirst = false;
            findingDuration.prevBright = true;
            console.log("Ignore the First");
        } 
        else
        {
            findingDuration.prevBright = true;
            findingDuration.gapLength = Math.round(event.timeStamp - findingDuration.duration); // Calculates the length of the gap and rounds down to whole number
			conversionInfo.rawDataArray.push(findingDuration.gapLength); // Pushes gap length into rawDataArray
			findingDuration.duration = event.timeStamp;
            console.log("Gap End");
            //Initialising first time half gap
            if (findingDuration.gapsFound === false)
            {
                findGapDuration();
            }

		}
    }
}


/*_______________________________________________________________________________________________________________________________*/


/**
* Clear function resets all key variables for translating transmitted tap code in to plain text
*/
clear = function()
{
    console.log("Entered the clear function");
    greyScaledPixel = 0;
    rxTranslateOutputRef.innerHTML = "";
    rxCodeOutputRef.innerHTML = "";
    conversionInfo.rawDataArray = [];
    
    findingDuration = 
    {
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

    conversionInfo = 
    {
        duration: 0,
        currentIndex: 0,
        prevDark: false,
        ignoredFirst: false,
        rawDataArray: [],               
	};
	
	errorDetect =
	{
	isBright: false,
	isError: false,
	}

        console.log(conversionInfo.rawDataArray);

    };

/*_______________________________________________________________________________________________________________________________*/




translate = function()
{	
    let tapInfo =  
    {					
        tapTable:  [["0", "0", "0", "0", "0", "0"],				//Tap Conversion Array indexed from 1
		["0", "E", "T", "A", "N", "D"],
		["0", "O", "I", "R", "U", "C"],
		["0", "S", "H", "M", "F", "P"],
		["0", "L", "Y", "G", "V", "J"],
        ["0", "W", "B", "X", "Q", "Z"]],
    };

    //Converts T & duration array into a translated T, H and F array.
	translatedDataArray = translateRawToText();   
	errorHandle(translatedDataArray);	
	codeString = translateToTapCode(translatedDataArray);
	plainText = translateToPlainText(translatedDataArray, tapInfo);

        /*	counterOfF is the counter for F (Full Gaps).
            taps1 and taps2 are the number of taps.
            halfGaps1 and halfGaps2 are the number of half gaps.
            taps1 and halfgaps1 correspond to row value 
            taps2 and halfgaps2 correspond to column value
			taps1 and taps2 represent the row and column index in the tap table respectively 
		*/


	var  finalString = plainText.replace(/WUW/g, " ").replace(/QC/, "K"); // Changing special characters wuw and qc into space and k respectively
	

	
	
        
	console.log(plainText);
	console.log(translatedDataArray);
	if (errorDetect.isError === false)
	{
		rxTranslateOutputRef.innerHTML = finalString; // Output to "Translated" on Listener App
		rxCodeOutputRef.innerHTML = codeString; // Output to "Code" on Listener App
	}
	else
	{
		rxCodeOutputRef.innerHTML = "A potential error was detected, please retry receiving the message again";
	}


	console.log("Entered the Translate Function");
	console.log(findingDuration.halfGap);
	console.log(findingDuration.fullGap);
}



/*_______________________________________________________________________________________________________________________________*/



// translateToTapCode() 
// 
// This function receives the translated Data Array consisting of 'T's, 'H's, and 'F's, and translates it into 
// tap code. It does this by iterating through the array and for appending a '*', or ' ' depending on if the 
// element in the array is a 'T' or an 'F'.
// 
// argument: translatedDataArray: An array consisting of 'T's 'H's and 'F's
// precondition: 
// 		translatedDataArray must be a non zero Array containing elements of 'T's 'H's and 'F's
// postcondition: 
// 		codeString is a stirng which consists of the translated tap code.
// return: codeString: String containing the tap code translated from the translated Data Array.
translateToTapCode = function(translatedDataArray)
{
	var codeString = ""  // Converting the initial translated text string into tap code
	for ( i = 0; i < translatedDataArray.length; i++)
    {
		if (translatedDataArray[i] === "T") // Converts all "T" in to * (taps in to asterisks)
        {
            codeString += '*';
        }
		else if (translatedDataArray[i] === "F") // Converts all "F" in to " " (full gaps in to spaces)
        {
            codeString += " ";
        }
	}
	return codeString;
}


// errorHandle()
// This function enables us to determine and handle the situations where errors occur during the 
// use of the app. When an error is encountered, there will be a pop-up alert to tell the user what
// the error is. The errors we will handle are: when a message is stopped at a tap or a potential 
// half-gap, and when the number of full gaps is an odd number. If message ends at a tap, a pop-up 
// box of "Stopped at a tap" will pop out; If gap duration is less than half gap duration, a pop-up 
// box showing "Stopped in potential half-gap" will be popped up. Next, if the message stops at an 
// "H", meaning the recording has stopped at a half gap, which suggests early termination, therefore 
// "Recording is not complete" will be shown. Lastly, to obtain a letter from the tap-code, the number
// of full gaps must be an odd number. If not, early termination is suggested as it is an error. If 
// this error occurred, "Recording is not complete " alert box will be popped out.

// arguments: translatedDataArray: This array contains a series of 'T', 'H', and 'F' 
// pre-conditions: 
//		The translatedDataArray must consist of strings 'T', 'H', and 'F'. ;
// post-conditions: 
//		Alert messages will be shown.
// returns: 
// 		This function does not return anything.
errorHandle = function(translatedDataArray)
{
	prevF = false;

	if (errorDetect.isBright === true) // If message ends at a tap
       {		
		alert("Stopped at a tap."); //Error out
		errorDetect.isError = true;
	}
	else if (event.timeStamp - findingDuration.duration < findingDuration.halfGap + findingDuration.tolerance) // If gap duration is less than half gap duration
    {
		alert("Stopped in potential halfgap.") //Error out
		errorDetect.isError = true;
	}
	let noOfF = 0;
	// If the message stops at an "H", the recording has stopped at a half gap, which suggests early termination.
	if (translatedDataArray[translatedDataArray.length -1] === "H")
	{
		alert("Recording is not complete."); //Error out
		errorDetect.isError = true;
	}
	//Number of full gaps must be an odd number
	for (let i = 1; i < translatedDataArray.length ; i++)
	{
		if (translatedDataArray[i] ==="F") // Counts the number of full gaps in translatedDataArray
		{
			noOfF += 1;
			if (prevF === true)
			{
				alert("Consecutive full gaps detected."); //Error out.
				errorDetect.isError = true;
				break;
			}
			else
			{
				prevF = true;
			}
		}
		else
		{
			prevF = false;
		}	
	}
	if (noOfF % 2 === 0) //If noOfF is an even number
	{
		alert("Recording is not complete."); // Error out
		errorDetect.isError = true;
	}
}

// translateToPlainText()
//
// Translate function converts code message into plain text string, and handles early termination of the message 
// and alerts the user though errorHandle function. DataArray which is been completely recored will add with a 
// 'F' in the front and at the end of it, and become an newDataArray. The new created newDataArray pass though a
// for loop. This for loops collects number of the the taps, halfgaps and fullgaps in the newDataArray. CounterOfF
// is the counter for F (Full Gaps). When the number of F is an odd number, all the data collected is for the first
// half of the data for the wanted letter. Taps1 represents the row index of the characters in the tapInfo 
// conversion array. Vice Versa. When the number of F is an even number, all the data collected is for the other half
// of the data for the wanted letter. Taps2 represents the row index of the characters in the tapInfo conversion array.
// When the counter of F back to an odd number, assign taps1 and taps2 value into row index and column index respectively,
// and convert them into a proper letter and store them into plain text array.After that, initialise all counter values 
// for a new letter. Translate function converts rawDataArray into newDataArray which is then translated into characters
// using the tapInfo conversion array. The plain text containing representatives of letter 'k' and space will be converted
// into corresponding characters.
//
// argument: translatedDataArray: This array contains a series of 'T', 'H', and 'F' 
// 
// pre-conditions: 
//		The translatedDataArray must consist of strings 'T', 'H', and 'F'. ;
// post-conditions: 
//      The returned plain text string will be non zero length.
//		Alert messages will be shown.
// returns:
//		plainText: a non zero length string

translateToPlainText = function(translatedDataArray, tapInfo)
{
	let plainText = '';
	let counterOfF = 0; 
	let taps1 = 0;
	let halfGaps1 = 0;
	let taps2 = 0;
	let halfGaps2 = 0;
	let rowIndex = 0;
	let columnIndex = 0;
	let charater = '';
	translatedDataArray.unshift("F");translatedDataArray.push("F"); // Add "F" in front of message and return the new length.
		
	for (let  i = 0; i < translatedDataArray.length;i++)
	{
		if (translatedDataArray[i] === "F")
		{
			counterOfF += 1; // Assume all the messages start with F. The first counter of F is 1.
		}
		// Beginning of next letter. 
		if (translatedDataArray[i] === "F" && counterOfF % 2 !== 0 && i !== 0) 
		{   
			// Assign taps1 and taps2 to row and column index
			rowIndex = taps1;
			columnIndex = taps2;
			// Convert code message to plaintext
			plainText += tapInfo.tapTable[rowIndex][columnIndex];
			// Initialise all counter values for a new letter
			taps1 = 0; 
			taps2 = 0;
			halfGaps1 = 0;
			halfGaps2 = 0;
		}
			
		// Finding the number of taps and number of half gaps for row value
		// If counterOfF is an odd number , all the obtained value if for the row index
		if (counterOfF % 2 !== 0) // Condition: Odd number
		{
			if (taps1 <= 5 && halfGaps1 <= 4) // As tapInfo is a 5x5 array, the maximum number of taps is 5, and the maximum number of half gaps is 4
			{
				if ( translatedDataArray[i] === "T") // Counts the number of "T" in translatedDataArray
				{
					taps1 += 1;
				}
				if ( translatedDataArray[i] === "H") // Counts the number of "H" in translatedDataArray
				{
					halfGaps1 += 1;
				}	
			}
			if (errorDetect.isError === false)
			{
				// Checking whether the number of taps and halfgaps exceed the maximum limit
				if (taps1 > 5) // More than 5 taps will return an error message
				{
					alert("Error: There are too many successive taps.");
					errorDetect.isError = true;
				}
				else if (halfGaps1 > 4) // More than 4 half gaps will return an error message
				{
					alert("Error:  There are too many half gaps.");
					errorDetect.isError = true;
				}
			}
				
		}
		// Finding the number of taps and number of half gaps for column value
		// If counterOfF is an even number , all the obtained value if for the row index
		if (counterOfF % 2 === 0) // Condition: Even number
		{
			if (taps2 <= 5 && halfGaps2 <= 4) // As tapInfo is a 5x5 array, the maximum number of taps is 5, and the maximum number of half gaps is 4
			{
				if (translatedDataArray[i] === "T") // Counts the number of "T" in translatedDataArray
				{
					taps2 += 1;
				}
				if (translatedDataArray[i] === "H") // Counts the number of "H" in translatedDataArray
				{
					halfGaps2 += 1;
				}
			}
			// Checking whether number of taps and halfgaps exceed the maximum limit
			if (errorDetect.isError === false)
			{
				if (taps2 > 5)// More than 5 taps will return an error message
				{
					alert("Error: There are too many successive taps.");
					errorDetect.isError = true;
				}
				else if (halfGaps1 > 4) // More than 4 half gaps will return an error message
				{
					alert("Error:  There are too many half gaps.");
					errorDetect.isError = true;
				}
			}
		}
	}
	return plainText;
}

// translatedRawToText()
// 
// This function translates durations to 'T's, 'H's, and 'F's depending if the index is an even number or an odd number. 
// The function achives this by first checking if the index is even or odd. If even, the time duration stored in the index
// is checked to see if it is within the tolerance of a tap (Which is the same length as a halfgap). If it is, a tap is 
// recorded in the translatedDataArray, which is used to store all the translated data generated by this function. If the duration
// is not within the tolerance of a tap duration, then an error is raised, as the recorded tap length exceeds that of a normal tap.
// If the index is an odd number, then the duration within the index corresponds to a gap. If the duration is within the
// tolerance of a half gap, a half gap is recorded in the translatedDataArray, otherwise is is tested to see if the duration
// is within that of a full gap. If it is, then a full gap is recorded, else a duration exceeding that of a full gap has been
// detected an an error is raised.
// 
// returns:
//		This function does not return anything.
translateRawToText = function()
{
	translatedDataArray = [];
	for (i = 0; i < conversionInfo.rawDataArray.length ; i++)
    {
		if (i % 2 == 0) // Pushes all "T" from rawDataArray into translatedDataArray
        {
			absoluteVal = Math.abs(conversionInfo.rawDataArray[i] - findingDuration.halfGap); 
			if(absoluteVal < findingDuration.tolerance)
			{
				translatedDataArray.push("T")
			}
			else if (errorDetect.isError == false)
			{
				alert("Too long of a Tap Length Detected");
				errorDetect.isError = true;
			}
		}
		else
        {
			absoluteVal = Math.abs(conversionInfo.rawDataArray[i] - findingDuration.halfGap);  // Calculating absolute value of durations
			if (absoluteVal < findingDuration.tolerance) // If absolute value is less than tolerance it is a half gap
            {
				translatedDataArray.push("H"); // Converts half gap duration into "H" and pushes it into translatedDataArray
			}
			else // If absolute value is more than tolerance it is a full gap
            {
				absoluteVal = Math.abs(conversionInfo.rawDataArray[i] - findingDuration.fullGap);
				if (absoluteVal < findingDuration.tolerance) // If absolute value is less than tolerance it is a fullGap
				{
					translatedDataArray.push("F"); // Converts full gap duration into "F" and pushes it into translatedDataArray
				}
				else
				{	
					alert("Gap Length exceeding that of half gap and full gap detected")
					errorDetect.isError = true;
				}
			}
		}
	}
	return translatedDataArray;
}