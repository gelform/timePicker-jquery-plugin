;
/**
 * developed by Gelform Inc. http://gelform.com
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

Date.prototype.getShortDayName = function () {
    return this.getDayName().substr(0, 3);
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
				.html(renderDateTemplate(settings.datePicker.date.text, startDateObj))
				.appendTo( $datePickerDates );

				// if this date has been chosen, add the "selected" class name
				if ( undefined !== $.fn.timePicker.variables.selectedDatesArr[startDateObj.getTime()] )
				{
					$datePickerDate.addClass(settings.datePicker.date.selectedClassName);
				}

				startDateObj.setDate(startDateObj.getDate()+1);
			}
		}



		// when a date is selected, we need a corresponding time picker box
		function addTimePicker ($timePicker, dateObj)
		{
			// if there's a "htmlBefore" message, add it when there are dates chosen
			if ( '' !== settings.timePicker.wrapper.htmlBefore && $('.' + settings.timePicker.wrapper.htmlBeforeClassName, $timePicker).length === 0 )
			{
				$(settings.timePicker.wrapper.htmlBefore)
				.addClass(settings.timePicker.wrapper.htmlBeforeClassName)
				.prependTo($timePicker);
			}

			// create a time element
			var $timePickerTime = $(settings.timePicker.time.html);

			// add a class, the data-date attr we use to match elements, and populate the html from the "template" html setting
			$timePickerTime
			.addClass(settings.timePicker.time.className)
			.attr('data-date', dateObj.getTime() )
			.html(renderDateTemplate(settings.timePicker.time.text, dateObj));

			// create the select element
			var $select = $('<select></select>');
			$select
			.attr('name', settings.timePicker.time.selectFieldName + '[]')
			.appendTo($timePickerTime);

			// create an array of the times for the select
			var friendlyTimesArr = $.fn.timePicker.createFriendlyTimesArr(settings.timePicker.time.startTime, settings.timePicker.time.endTime, settings.timePicker.time.interval);

			// add the options to the select from the times arr
			for (var i = 0; i < friendlyTimesArr.length; i++)
			{
				var $option = $('<option value="' + friendlyTimesArr[i] + '">' + friendlyTimesArr[i] + '</option>');

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
			$('.' + settings.timePicker.time.className, $timePicker).each(function(){
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



		// if a date is unselected, remove it's corresponding time picker
		function removeTimePicker ($timePicker, dateObj)
		{
			$('[data-date=' + dateObj.getTime() + ']', $timePicker).remove();

			// if no more timepickers, empty it, to remove the message
			if ( $('.' + settings.timePicker.time.className, $timePicker).length === 0 )
			{
				$timePicker.empty();
			}

			// trigger our callback 
			settings.timePicker.time.removed.call($timePicker);
		} // removeTimePicker



		// end FUNCTIONS
		// start SETTINGS



		// extend SEETTINGS
		var settings = $.extend( true, {}, $.fn.timePicker.defaults, options);



		// end SETTINGS
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
				.addClass(settings.datePicker.wrapper.htmlBeforeClassName)
				.appendTo($datePicker);
			}

			// add a class, and append it to the wrapper
			$datePicker
			.addClass(settings.datePicker.wrapper.className)
			.appendTo($wrapper);



			// add the previous date selecter
			var $datePickerPrev = $(settings.datePicker.prev.html);

			// add our class, html (even though our setting is "text") and our behavior
			$datePickerPrev
			.addClass(settings.datePicker.prev.className)
			.html(settings.datePicker.prev.text)
			.on('click',
				function()
				{
					// get first date, and make it an object
					var $firstDate = $('.' + settings.datePicker.date.className + ':first', $datePicker);
					var dateStr = parseInt($firstDate.attr('data-date'), 10);
					var startDate = new Date(dateStr);

					// don't allow previous dates
					if ( !settings.datePicker.allowPastDates && startDate.toDateString() === $.fn.timePicker.variables.now.toDateString() )
					{
						return false;
					}

					// if somehow we got before today, and don't allow previous dates
					if ( !settings.datePicker.allowPastDates && startDate < $.fn.timePicker.variables.now )
					{
						return false;
					}

					// clear out dates
					$datePickerDates.empty();

					// subtract one day
					startDate.setDate(startDate.getDate()-1);

					// add dates boxes based on new start date
					addDateBoxes ($datePickerDates, startDate);
				}
			)
			.appendTo($datePicker);



			// add the date picker wrapper, between the prev and next
			var $datePickerDates = $(settings.datePicker.dates.html);

			// add our class, html (even though our setting is "text") and our behavior
			$datePickerDates
			.addClass(settings.datePicker.dates.className)
			.on('click',
				'.' + settings.datePicker.date.className,
				function()
				{
					// don't do anytihng if all our dates are already selected
					var selectedDatesArrLength = 0;
					for (var e in $.fn.timePicker.variables.selectedDatesArr) { selectedDatesArrLength++; }



					var $this = $(this);
					var dateStr = parseInt($this.attr('data-date'), 10);

					// we store our selected dates in selectedDatesArr. if we don't find it, add it.
					if ( undefined === $.fn.timePicker.variables.selectedDatesArr[dateStr] )
					{
						// we already have all the dates we want, cancel
						if ( selectedDatesArrLength >= settings.numberOfTimes )
						{
							return false;
						}

						// otherwise add our selected date to selectedDatesArr
						$.fn.timePicker.variables.selectedDatesArr[dateStr] = 1;

						// and add the timepicker element
						addTimePicker($timePicker, new Date(dateStr));
					}
					else
					{
						// if we're unselecting a time, delete it from selectedDatesArr.
						delete $.fn.timePicker.variables.selectedDatesArr[dateStr];

						// and remove the timepicker element
						removeTimePicker($timePicker, new Date(dateStr));
					}

					// for bootstrap, the option to *not* add the selected class when clicked (since bootstrap adds the class, we don't want to toggle it, because it'll just turn it off again)
					if ( settings.datePicker.date.addSelectedClassOnClick )
					{
						$this.toggleClass(settings.datePicker.date.selectedClassName);
					}
				}
			)
			.appendTo($datePicker);



			// add the next date selecter
			var $datePickerNext = $(settings.datePicker.next.html);

			// add our class, html (even though our setting is "text") and our behavior
			$datePickerNext
			.addClass(settings.datePicker.next.className)
			.html(settings.datePicker.next.text)
			.on('click',
				function()
				{
					// get first date, and make it an object
					var $firstDate = $('.' + settings.datePicker.date.className + ':first', $datePicker);
					var dateStr = parseInt($firstDate.attr('data-date'), 10);

					var startDate = new Date(dateStr);

					// clear out dates
					$datePickerDates.empty();

					// add one day
					startDate.setDate(startDate.getDate()+1);

					// add our date boxes
					addDateBoxes ($datePickerDates, startDate);
				}
			)
			.appendTo($datePicker);



			// add the timepicker wrapper element
			var $timePicker = $(settings.timePicker.wrapper.html);

			// add our class and append it to the wrapper
			$timePicker
			.addClass(settings.timePicker.wrapper.className)
			.appendTo($wrapper);


			// add dates for the first time
			addDateBoxes($datePickerDates, new Date($.fn.timePicker.variables.now.getTime()));
		});

		// end PLUGIN
		


	}; // $.fn.timePicker



	// start DEFAULTS



	$.fn.timePicker.defaults = {
		numberOfTimes: 3,

		datePicker: {
			numOfDates: 5,
			allowPastDates: false,
			wrapper: {
				htmlBefore: '<p>First, choose three dates:</p>', // must be html
				htmlBeforeClassName: 'TPDatePickerHtmlBefore',
				html: '<div />',
				className: 'TPDatePicker'
			},
			prev: {
				className: 'TPDatePickerPrev',
				html: '<span />',
				text: '&#9664;' // prev
			},
			dates: {
				className: 'TPDatePickerDates',
				html: '<span />'
			},
			date: {
				className: 'TPDatePickerDate',
				selectedClassName: 'selected',
				addSelectedClassOnClick: true, // for bootstrap
				html: '<span />',
				text: '<small>shortMonthName</small> <b>date</b> <small>shortDayName</small>'
			},
			next: {
				className: 'TPDatePickerNext',
				html: '<span />',
				text: '&#9654;' // next
			}
		}, // datePicker
		timePicker: {
			wrapper: {
				htmlBefore: '<p>Now, please select your available times:</p>', // must be html
				htmlBeforeClassName: 'TPTimePickerHtmlBefore',
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
			}
		} // timePicker
	};



	// end DEFAULTS
	// start VARIABLES



	$.fn.timePicker.variables = {
		selectedDatesArr: [],
		now: new Date()
	};



	// end VARIABLES
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
			var m = '' + startTime.getMinutes();

			// add leading zero
			if ( m.length === 1 ) { m = '0' + m;}

			// get hours, and add am/pm
			var h = startTime.getHours();
			if ( h === 0 ) { h = 12 + ':' + m + 'am'; }
			else if ( h < 12 ) { h = h + ':' + m + 'am'; }
			else if ( h === 12 ) { h = 12 + ':' + m + 'pm'; }
			else { h = (h - 12) + ':' + m + 'pm'; }

			// add the final string to the array
			timesArr.push( h );

			// move forward by the interval
			startTime.setTime(startTime.getTime() + (interval * 60 * 1000));
		}

		return timesArr;
	}; // createFriendlyTimesArr



	// end EXTRAS 
	
})(jQuery);




