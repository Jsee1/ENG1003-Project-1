/**
 * Your header documentation here for _listen
 *    For your reference...
 * 		event will hold an Event object with the pixels in
 *   	event.detail.data and the timestamp in event.timeStamp
 */

let rxTranslateOutputRef = document.getElementById("rx-translated"); 
let rxCodeOutputRef = document.getElementById("rx-code");

let translatedDataArray =[];
let earlyTerm = // Object used in determining early termination of message
{
	isBright: false,
}

let findingDuration = // Object used in determining the length of half gaps and full gaps and the creation of rawDataArray
{
	durationBright: 0,
	duration: 0,                    // 
	brightDarkDivide: 175,          // Grey scaled values below this value are dark, values above are light
	tolerance: 150,                 // Tolerance for half gap and full gap durations (+-150ms)
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
_listen = function(event)
{
	greyScaledPixel = greyScale();
	lastPixBrightSetter(greyScaledPixel);
	generateRawDataArray(greyScaledPixel);

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


lastPixBrightSetter = function(pixel)
{
    if (pixel < findingDuration.brightDarkDivide === true)  // If the pixel value is dark
    {
    earlyTerm.isBright = false; // Does not end on a tap
    }
    else
    {
	    earlyTerm.isBright = true; // Ends on a tap
	}
}


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


generateRawDataArray = function(greyScaledPixel)
{
	if (greyScaledPixel < findingDuration.brightDarkDivide && findingDuration.prevBright === true)
    {
		// Records only one tick of the tap and adds this to rawDataArray
		conversionInfo.rawDataArray.push(Math.round(event.timeStamp - findingDuration.durationBright))          
		findingDuration.duration = event.timeStamp; 
		findingDuration.prevBright = false; // Changes prevBright value after tap has been recorded
		console.log("Gap Start");
	} 
    
	// If currently bright, and previous tick is dark. End of gap.
	else if (greyScaledPixel > findingDuration.brightDarkDivide && findingDuration.prevBright === false)
    {
	findingDuration.durationBright = event.timeStamp;
    // Ignore the first dark to bright as message output starts with a tap
	   if (findingDuration.ignoreFirst)
        {
            findingDuration.ignoreFirst = false;
            findingDuration.prevBright = true;
            console.log("Ignore the First");
        } 
        else
        {
            findingDuration.prevBright = true;
            findingDuration.gapLength = Math.round(event.timeStamp - findingDuration.duration); // Calculates the length of the gap and rounds down to whole number
            conversionInfo.rawDataArray.push(findingDuration.gapLength); // Pushes gap length into rawDataArray
            console.log("Gap End");
            //Initialising first time half gap
            if (findingDuration.gapsFound === false)
            {
                findGapDuration();
            }

		}
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/**
* Clear function resets all key variables for translating transmitted tap code in to plain text
*/
clear = function()
{
    console.log("Entered the clear function");
    greyScaledPixel = 0;
    rxTranslateOutputRef.innerHTML = "";
    rxCodeOutputRef.innerHTML = "";
    conversionInfo.rawDataArray =[];
    translatedDataArray=[];
    
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

        console.log(conversionInfo.rawDataArray);
        console.log(translatedDataArray);

    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
* Translate function converts rawDataArray into newDataArray which is then translated into characters using the tapInfo conversion array
* Translate function also handles early termination of the message and alerts the user
*/

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
	rxTranslateOutputRef.innerHTML = finalString; // Output to "Translated" on Listener App
	rxCodeOutputRef.innerHTML = codeString; // Output to "Code" on Listener App
	console.log("Entered the Translate Function");
	console.log(findingDuration.halfGap);
	console.log(findingDuration.fullGap);
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

errorHandle = function(translatedDataArray)
{
	prevF = false;

	if (earlyTerm.isBright === true) // If message ends at a tap
       {		
		alert("Stopped at a tap."); //Error out
	}
	else if (event.timeStamp - findingDuration.duration < findingDuration.halfGap + findingDuration.tolerance) // If gap duration is less than half gap duration
       {
		alert("Stopped in potential halfgap.") //Error out
	}
       
	let noOfF = 0;
	// If the message stops at an "H", the recording has stopped at a half gap, which suggests early termination.
	if (translatedDataArray[translatedDataArray.length -1] === "H")
	{
		alert("Recording is not complete."); //Error out
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
	}
}

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
			// Checking whether the number of taps and halfgaps exceed the maximum limit
			if (taps1 > 5) // More than 5 taps will return an error message
			{
				alert("Error: There are too many successive taps.");
			}
			else if (halfGaps1 > 4) // More than 4 half gaps will return an error message
			{
				alert("Error:  There are too many half gaps.");
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
			if (taps2 > 5)// More than 5 taps will return an error message
			{
				alert("Error: There are too many successive taps.");
			}
			else if (halfGaps1 > 4) // More than 4 half gaps will return an error message
			{
				alert("Error:  There are too many half gaps.");
			}
		}
	}
	return plainText;
}

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
			else
			{
				alert("Too long of a Tap Length Detected");
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
				translatedDataArray.push("F"); // Converts full gap duraton into "F" and pushes it into translatedDataArray
			}
		}
	}
	return translatedDataArray;
}