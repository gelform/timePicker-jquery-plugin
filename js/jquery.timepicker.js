;
/**
 * developed by Gelform Inc. http://gelform.com
 * more info at https://github.com/coreymaass/timePicker
 * examples at http://gelform.com/timepicker
 */



// add some utility fuctions to Date
// http://stackoverflow.com/questions/1643320/get-month-name-from-date-using-javascript
Date.prototype.monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()];
};

Date.prototype.getShortMonthName = function () {
    return this.getMonthName().substr(0, 3);
};

Date.prototype.dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

Date.prototype.getDayName = function() {
    return this.dayNames[this.getDay()];
};

Date.prototype.getShortDayName = function ()
{
    return this.getDayName().substr(0, 3);
};

Date.prototype.toMysqlDate = function()
{
	function twoDigits(d)
	{
		if(0 <= d && d < 10) {return "0" + d.toString();}
		if(-10 < d && d < 0) {return "-0" + (-1*d).toString();}
		return d.toString();
	}

    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate());
};



(function($){
	$.fn.timePicker = function(options)
	{



		// start FUNCTIONS



		// takes the "template" for populating the date boxes and renders them
		function renderDateTemplate(text, date)
		{
			text = text.replace('shortMonthName', date.getShortMonthName());
			text = text.replace('monthName', date.getMonthName());
			text = text.replace('shortDayName', date.getShortDayName());
			text = text.replace('dayName', date.getDayName());
			text = text.replace('date', date.getDate());

			return text;
		}


		// add the date boxes to the datePicker jQuery element
		function addDateBoxes ($datePickerDates, startDateObj)
		{
			// create a box for each date in the numOfDates setting
			for (var i = settings.datePicker.numOfDates; i > 0; i--)
			{
				// create a new "date" element
				var $datePickerDate = $(settings.datePicker.date.html);

				// add a class, the data-date attr we use to match elements, and populate the html from the "template" html setting
				$datePickerDate
				.addClass(settings.datePicker.date.className)
				.attr('data-date', startDateObj.getTime() )
				.attr('data-tp-role', 'datePickerDate' )
				.html(renderDateTemplate(settings.datePicker.date.text, startDateObj))
				.appendTo( $datePickerDates );

				// if this date has been chosen, add the "selected" class name
				if ( undefined !== variables.selectedDatesArr[startDateObj.getTime()] )
				{
					$datePickerDate.addClass(settings.datePicker.date.selectedClassName);
				}

				startDateObj.setDate(startDateObj.getDate()+1);

				// callback
				settings.datePicker.dates.added.call( $('[data-tp-role=datePickerDate]', $datePickerDates) );
			}
		}



		// when a date is selected, we need a corresponding time picker box
		function addTimePicker ($timePicker, dateObj)
		{
			// if there's a "htmlBefore" message, add it when there are dates chosen
			if ( '' !== settings.timePicker.wrapper.htmlBefore && $('[data-tp-role=timePickerHtmlBefore]', $timePicker).length === 0 )
			{
				$(settings.timePicker.wrapper.htmlBefore)
				.attr('data-tp-role', 'timePickerHtmlBefore' )
				.prependTo($timePicker);
			}

			// create a time element
			var $timePickerTime = $(settings.timePicker.time.html);

			// add a class, the data-date attr we use to match elements, and populate the html from the "template" html setting
			$timePickerTime
			.addClass(settings.timePicker.time.className)
			.attr('data-date', dateObj.getTime() )
			.attr('data-tp-role', 'timePickerTime' )
			.html(renderDateTemplate(settings.timePicker.time.text, dateObj));

			// add hidden date field
			$('<input type="hidden" name="' + settings.fieldName + '[' + dateObj.getTime() + '][' + settings.datePicker.date.hiddenFieldName + ']" value="' + dateObj.toMysqlDate() + '" />').appendTo($timePickerTime);

			// create the select element
			var $select = $('<select></select>');
			$select
			.attr('name', settings.fieldName + '[' + dateObj.getTime() + '][' + settings.timePicker.time.selectFieldName + ']')
			.appendTo($timePickerTime);

			// create an array of the times for the select
			var friendlyTimesArr = $.fn.timePicker.createFriendlyTimesArr(settings.timePicker.time.startTime, settings.timePicker.time.endTime, settings.timePicker.time.interval);

			if ( settings.timePicker.showPlaceholders )
			{
				$('[data-tp-role=timePickerPlaceholder]:first', $timePicker).remove();
			}

			// add the options to the select from the times arr
			for (var i in friendlyTimesArr)
			{
				var $option = $('<option value="' + i + '">' + friendlyTimesArr[i] + '</option>');

				// select the default time, from the preSelected setting
				if ( friendlyTimesArr[i] === settings.timePicker.time.preSelected )
				{
					$option.prop('selected', 'selected');
				}

				$option.appendTo($select);
			}

			// put timePickers in order
			var appended = false;

			// figure out if time is before the others
			$('[data-tp-role=timePickerTime]', $timePicker).each(function(){
				if ( $(this).attr('data-date') > dateObj.getTime() )
				{
					$timePickerTime.insertBefore(this);
					appended = true;
					return false;
				}
			});

			// if not yet appended (meaning it wasn't before the other times) add it to the end
			if ( !appended )
			{
				$timePickerTime.appendTo($timePicker);
			}

			// trigger our callback
			settings.timePicker.time.added.call($timePickerTime);
		}



		function addTimePlaceholder ($timePicker)
		{
			// create a time element
			var $timePickerTime = $(settings.timePicker.placeholder.html);

			// add a class, the data-date attr we use to match elements, and populate the html from the "template" html setting
			$timePickerTime
			.addClass(settings.timePicker.placeholder.className)
			.attr('data-tp-role', 'timePickerPlaceholder' )
			.html(settings.timePicker.placeholder.text);

			$timePickerTime.appendTo($timePicker);
		}



		// if a date is unselected, remove it's corresponding time picker
		function removeTimePicker ($timePicker, dateObj)
		{
			$('[data-date=' + dateObj.getTime() + ']', $timePicker).remove();

			// if no more timepickers, empty it, to remove the message
			if ( $('[data-tp-role=timePickerTime]', $timePicker).length === 0 )
			{
				$('[data-tp-role=timePickerHtmlBefore]', $timePicker).remove();
			}

			if ( settings.timePicker.showPlaceholders )
			{
				addTimePlaceholder($timePicker);
			}

			// trigger our callback 
			settings.timePicker.time.removed.call($timePicker);
		} // removeTimePicker



		// end FUNCTIONS
		// start SETTINGS



		// extend SEETTINGS



		var settings = $.extend( true, {}, $.fn.timePicker.defaults, options);



		// end SETTINGS
		// START VARIABLES



		var variables = {
			selectedDatesArr: []
		};



		// end VARIABLES
		// start PLUGIN
		


		return this.each(function()
		{
			// first create and empty the wrapper
			var $wrapper = $(this).empty();

			// create our datepicker wrapper element
			var $datePicker = $(settings.datePicker.wrapper.html);

			// add a date picker message, if htmlBefore setting 
			if ( '' !== settings.datePicker.wrapper.htmlBefore )
			{
				$(settings.datePicker.wrapper.htmlBefore)
				.attr('data-tp-role', 'datePickerHtmlBefore' )
				.appendTo($datePicker);
			}

			// add a class, and append it to the wrapper
			$datePicker
			.addClass(settings.datePicker.wrapper.className)
			.attr('data-tp-role', 'datePicker' )
			.appendTo($wrapper);



			// add the previous date selecter
			var $datePickerPrev = $(settings.datePicker.prev.html);

			// add our class, html (even though our setting is "text") and our behavior
			$datePickerPrev
			.addClass(settings.datePicker.prev.className)
			.attr('data-tp-role', 'datePickerPrev' )
			.html(settings.datePicker.prev.text)
			.on('click',
				function()
				{
					settings.datePicker.prev.clicked.call($(this));

					// get first date, and make it an object
					var $firstDate = $('[data-tp-role=datePickerDate]:first', $datePicker);
					var dateStr = parseInt($firstDate.attr('data-date'), 10);
					var startDate = new Date(dateStr);

					// don't allow previous dates
					if ( !settings.datePicker.allowPastDates && startDate.toDateString() === settings.datePicker.startDate.toDateString() )
					{
						return false;
					}

					// if somehow we got before today, and don't allow previous dates
					if ( !settings.datePicker.allowPastDates && startDate < settings.datePicker.startDate )
					{
						return false;
					}

					// clear out dates
					$datePickerDates.empty();

					// subtract one day
					startDate.setDate(startDate.getDate()-1);

					// add dates boxes based on new start date
					addDateBoxes ($datePickerDates, startDate);

					// callback
					settings.datePicker.prev.finished.call($(this));
				}
			)
			.appendTo($datePicker);



			// add the date picker wrapper, between the prev and next
			var $datePickerDates = $(settings.datePicker.dates.html);

			// add our class, html (even though our setting is "text") and our behavior
			$datePickerDates
			.addClass(settings.datePicker.dates.className)
			.attr('data-tp-role', 'datePickerDates' )
			.on('click',
				'[data-tp-role=datePickerDate]',
				function()
				{
					// trigger callback
					settings.datePicker.date.clicked.call($(this));



					// get number of selected dates
					var selectedDatesArrLength = 0;
					for (var e in variables.selectedDatesArr) { selectedDatesArrLength++; }



					var $this = $(this);
					var dateStr = parseInt($this.attr('data-date'), 10);

					// we store our selected dates in selectedDatesArr. if we don't find it, add it.
					if ( undefined === variables.selectedDatesArr[dateStr] )
					{
						// we already have all the dates we want, cancel
						if ( selectedDatesArrLength >= settings.numberOfTimes )
						{
							return false;
						}

						// otherwise add our selected date to selectedDatesArr
						variables.selectedDatesArr[dateStr] = 1;

						// and add the timepicker element
						addTimePicker($timePicker, new Date(dateStr));
					}
					else
					{
						// if we're unselecting a time, delete it from selectedDatesArr.
						delete variables.selectedDatesArr[dateStr];

						// and remove the timepicker element
						removeTimePicker($timePicker, new Date(dateStr));
					}

					// for bootstrap, the option to *not* add the selected class when clicked (since bootstrap adds the class, we don't want to toggle it, because it'll just turn it off again)
					if ( settings.datePicker.date.addSelectedClassOnClick )
					{
						$this.toggleClass(settings.datePicker.date.selectedClassName);
					}

					// callback
					settings.datePicker.date.finished.call($(this));
				}
			)
			.appendTo($datePicker);



			// add the next date selecter
			var $datePickerNext = $(settings.datePicker.next.html);

			// add our class, html (even though our setting is "text") and our behavior
			$datePickerNext
			.addClass(settings.datePicker.next.className)
			.attr('data-tp-role', 'datePickerNext' )
			.html(settings.datePicker.next.text)
			.on('click',
				function()
				{
					settings.datePicker.next.clicked.call($(this));

					// get first date, and make it an object
					var $firstDate = $('[data-tp-role=datePickerDate]:first', $datePicker);
					var dateStr = parseInt($firstDate.attr('data-date'), 10);

					var startDate = new Date(dateStr);

					// clear out dates
					$datePickerDates.empty();

					// add one day
					startDate.setDate(startDate.getDate()+1);

					// add our date boxes
					addDateBoxes ($datePickerDates, startDate);

					// callback
					settings.datePicker.next.finished.call($(this));
				}
			)
			.appendTo($datePicker);



			// add the timepicker wrapper element
			var $timePicker = $(settings.timePicker.wrapper.html);

			// add our class and append it to the wrapper
			$timePicker
			.addClass(settings.timePicker.wrapper.className)
			.attr('data-tp-role', 'timePicker' )
			.appendTo($wrapper);



			if ( settings.timePicker.showPlaceholders )
			{
				for (var i = 0; i < 3; i++)
				{
					addTimePlaceholder($timePicker);
				}
			}



			// add dates for the first time
			addDateBoxes($datePickerDates, new Date(settings.datePicker.startDate.getTime()));
		});

		// end PLUGIN
		


	}; // $.fn.timePicker



	// start DEFAULTS



	$.fn.timePicker.defaults = {
		numberOfTimes: 3,
		fieldName: 'schedule',
		datePicker: {
			startDate: new Date(), // the first date that will be shown 
			numOfDates: 5,
			allowPastDates: false,
			wrapper: {
				htmlBefore: '<p class="TPDatePickerHtmlBefore">First, choose three dates:</p>', // must be html
				html: '<div />',
				className: 'TPDatePicker'
			},
			prev: {
				className: 'TPDatePickerPrev',
				html: '<span />',
				text: '&#9664;',
				clicked: function(){}, // this = the $datePickerPrev just clicked
				finished: function(){} // this = the $datePickerPrev just clicked
			},
			dates: {
				className: 'TPDatePickerDates',
				html: '<span />',
				added: function(){} // this = a jQuery array of the date elements just added
			},
			date: {
				className: 'TPDatePickerDate',
				selectedClassName: 'selected',
				addSelectedClassOnClick: true, // for bootstrap
				hiddenFieldName: 'date',
				html: '<span />',
				text: '<small>shortMonthName</small> <b>date</b> <small>shortDayName</small>',
				clicked: function(){}, // this = the $datePickerDate just clicked
				finished: function(){} // this = the $datePickerDate just clicked
			},
			next: {
				className: 'TPDatePickerNext',
				html: '<span />',
				text: '&#9654;',
				clicked: function(){}, // this = the $datePickerNext just clicked
				finished: function(){} // this = the $datePickerNext just clicked
			}
		}, // datePicker
		timePicker: {
			showPlaceholders: true,
			wrapper: {
				htmlBefore: '<p class="TPTimePickerHtmlBefore">Now, please select your available times:</p>', // must be html
				html: '<div />',
				className: 'TPTimePicker'
			},
			time: {
				className: 'TPTimePickerTime',
				preSelected: '7:00am',
				startTime: '6:00', // in 24h
				endTime: '19:00', // in 24h
				interval: 15, // in minutes
				selectFieldName: 'time',
				html: '<span />',
				text: '<small>shortMonthName</small> <b>date</b> <small>shortDayName</small>',
				added: function(){}, // this = the $timePickerTime just added
				removed: function(){} // this = the $timePicker wrapper
			},
			placeholder: {
				html: '<span />',
				className: 'TPTimePickerPlaceholder',
				text: '<small>Please</small><small>Pick</small> <b>3</b>',
			}
		} // timePicker
	};



	// end DEFAULTS



	// start EXTRAS



	//  take a 24h time, like 17:45 (5:45PM) and make it a date object
	$.fn.timePicker.createDateObjFromTime = function (timeStr, dateObj)
	{
		// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		// check if it's a number
		function isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}

		// get our parts - hours, minutes, and seconds
		var timeStrArr = timeStr.split(':');
		timeStrArr[0] = isNumber(timeStrArr[0]) ? parseInt(timeStrArr[0], 10) : 0;
		timeStrArr[1] = isNumber(timeStrArr[1]) ? parseInt(timeStrArr[1], 10) : 0;
		timeStrArr[2] = isNumber(timeStrArr[2]) ? parseInt(timeStrArr[2], 10) : 0;

		// create a date object
		if ( undefined === dateObj )
		{
			dateObj = new Date();
		}

		// set our time parts
		dateObj.setHours(timeStrArr[0]);
		dateObj.setMinutes(timeStrArr[1]);
		dateObj.setSeconds(timeStrArr[2]);

		// return our date object
		return dateObj;
	};



	// create an array of times based on a start time, and end time, and a minute interval 
	$.fn.timePicker.createFriendlyTimesArr = function (startTimeStr, endTimeStr, interval)
	{
		function addLeadingZero(n)
		{
			return n.length === 1 ? '0' + n : n;
		}

		if ( undefined === startTimeStr )
		{
			startTimeStr = '00:00';
		}

		// create date objects from our start and end times
		var startTime = $.fn.timePicker.createDateObjFromTime(startTimeStr);
		var endTime = $.fn.timePicker.createDateObjFromTime(endTimeStr);

		var timesArr = [];
		while (endTime >= startTime )
		{
			// get minutes, as string
			var m = addLeadingZero('' + startTime.getMinutes());

			// get hours, and add am/pm
			var h = startTime.getHours();
			var k = addLeadingZero('' + h) + ':' + m;

			if ( h === 0 ) { h = 12 + ':' + m + 'am'; }
			else if ( h < 12 ) { h = h + ':' + m + 'am'; }
			else if ( h === 12 ) { h = 12 + ':' + m + 'pm'; }
			else { h = (h - 12) + ':' + m + 'pm'; }


			// add the final string to the array
			timesArr[k] = h;

			// move forward by the interval
			startTime.setTime(startTime.getTime() + (interval * 60 * 1000));
		}

		return timesArr;
	}; // createFriendlyTimesArr



	// end EXTRAS 
	
})(jQuery);




