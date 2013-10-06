;
/**
 * developed by Gelform Inc. http://gelform.com
 */



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
		function renderDateTemplate(text, date)
		{
			text = text.replace('shortMonthName', date.getShortMonthName());
			text = text.replace('monthName', date.getMonthName());
			text = text.replace('shortDayName', date.getShortDayName());
			text = text.replace('dayName', date.getDayName());
			text = text.replace('date', date.getDate());

			return text;
		}



		function addDateBoxes ($datePickerDates, startDateObj)
		{
			for (var i = settings.datePicker.numOfDates; i > 0; i--)
			{
				var $datePickerDate = $(settings.datePicker.date.html);

				$datePickerDate
				.addClass(settings.datePicker.date.className)
				.attr('data-date', startDateObj.getTime() )
				// .html('<small>' + startDateObj.getShortMonthName() + '</small> <b>' + startDateObj.getDate() + '</b>' )
				.html(renderDateTemplate(settings.datePicker.date.text, startDateObj))
				.appendTo( $datePickerDates );

				if ( undefined !== $.fn.timePicker.variables.selectedDatesArr[startDateObj.getTime()] )
				{
					$datePickerDate.addClass(settings.datePicker.date.selectedClassName);
				}

				startDateObj.setDate(startDateObj.getDate()+1);
			}
		}



		function addTimePicker ($timePicker, dateObj)
		{
			if ( '' !== settings.timePicker.wrapper.htmlBefore && $('.' + settings.timePicker.wrapper.htmlBeforeClassName, $timePicker).length === 0 )
			{
				$(settings.timePicker.wrapper.htmlBefore)
				.addClass(settings.timePicker.wrapper.htmlBeforeClassName)
				.prependTo($timePicker);
			}

			var $timePickerTime = $(settings.timePicker.time.html);

			$timePickerTime
			.addClass(settings.timePicker.time.className)
			.attr('data-date', dateObj.getTime() )
			// .html('Time for <small>' + dateObj.getShortMonthName() + '</small> <b>' + dateObj.getDate() + '</b>')
			.html(renderDateTemplate(settings.timePicker.time.text, dateObj));

			var $select = $('<select></select>');
			$select
			.attr('name', settings.timePicker.time.selectFieldName + '[]')
			.appendTo($timePickerTime);

			var friendlyTimesArr = $.fn.timePicker.createFriendlyTimesArr();
			for (var i = 0; i < friendlyTimesArr.length; i++)
			{
				var $option = $('<option value="' + friendlyTimesArr[i] + '">' + friendlyTimesArr[i] + '</option>');

				if ( friendlyTimesArr[i] === settings.timePicker.time.preSelected )
				{
					$option.prop('selected', 'selected');
				}
				$option.appendTo($select);
			}

			// put timePickers in order
			var appended = false;
			$('.' + settings.timePicker.time.className, $timePicker).each(function(){
				if ( $(this).attr('data-date') > dateObj.getTime() )
				{
					$timePickerTime.insertBefore(this);
					appended = true;
					return false;
				}
			});

			if ( !appended )
			{
				$timePickerTime.appendTo($timePicker);
			}

			settings.timePicker.time.added.call($timePickerTime);
		}



		function removeTimePicker ($timePicker, dateObj)
		{
			$('[data-date=' + dateObj.getTime() + ']', $timePicker).remove();
			if ( $('.' + settings.timePicker.time.className, $timePicker).length === 0 )
			{
				$timePicker.empty();
			}

			settings.timePicker.time.removed.call($timePicker);
		} // removeTimePicker



		var settings = $.extend( true, {}, $.fn.timePicker.defaults, options);



		return this.each(function()
		{
			var $wrapper = $(this).empty();

			var $datePicker = $(settings.datePicker.wrapper.html);
			if ( '' !== settings.datePicker.wrapper.htmlBefore )
			{
				$(settings.datePicker.wrapper.htmlBefore)
				.addClass(settings.datePicker.wrapper.htmlBeforeClassName)
				.appendTo($datePicker);
			}

			$datePicker
			.addClass(settings.datePicker.wrapper.className)
			.appendTo($wrapper);

			var $datePickerPrev = $(settings.datePicker.prev.html);
			$datePickerPrev
			.addClass(settings.datePicker.prev.className)
			.html(settings.datePicker.prev.text)
			.on('click',
				function(){
					// get first date
					var $firstDate = $('.' + settings.datePicker.date.className + ':first', $datePicker);
					var dateStr = parseInt($firstDate.attr('data-date'), 10);
					var startDate = new Date(dateStr);

					var today = new Date();

					// if it's today
					if ( startDate.toDateString() === today.toDateString() )
					{
						return false;
					}

					// if somehow we got before today
					if ( startDate < today )
					{
						return false;
					}

					// clear out dates
					$datePickerDates.empty();

					// subtract one day
					startDate.setDate(startDate.getDate()-1);

					addDateBoxes ($datePickerDates, startDate);
				}
			)
			.appendTo($datePicker);



			var $datePickerDates = $(settings.datePicker.dates.html);
			$datePickerDates
			.addClass(settings.datePicker.dates.className)
			.on('click',
				'.' + settings.datePicker.date.className,
				function(){

					// don't do anytihng if 3 dates are already selected
					var selectedDatesArrLength = 0;
					for (var e in $.fn.timePicker.variables.selectedDatesArr) { selectedDatesArrLength++; }



					var $this = $(this);
					var dateStr = parseInt($this.attr('data-date'), 10);

					if ( undefined === $.fn.timePicker.variables.selectedDatesArr[dateStr] )
					{
						// we already have 3, cancel
						if ( selectedDatesArrLength >= settings.numberOfTimes )
						{
							return false;
						}

						$.fn.timePicker.variables.selectedDatesArr[dateStr] = 1;

						addTimePicker($timePicker, new Date(dateStr));
					}
					else
					{
						delete $.fn.timePicker.variables.selectedDatesArr[dateStr];
						removeTimePicker($timePicker, new Date(dateStr));
					}

					if ( settings.datePicker.date.addSelectedClassOnClick )
					{
						$this.toggleClass(settings.datePicker.date.selectedClassName);
					}
				}
			)
			.appendTo($datePicker);



			var $datePickerNext = $(settings.datePicker.next.html);
			$datePickerNext
			.addClass(settings.datePicker.next.className)
			.html(settings.datePicker.next.text)
			.on('click',
				function(){
					// get first date
					var $firstDate = $('.' + settings.datePicker.date.className + ':first', $datePicker);
					var dateStr = parseInt($firstDate.attr('data-date'), 10);

					var startDate = new Date(dateStr);

					// clear out dates
					$datePickerDates.empty();

					// subtract one day
					startDate.setDate(startDate.getDate()+1);

					addDateBoxes ($datePickerDates, startDate);
				}
			)
			.appendTo($datePicker);



			var $timePicker = $(settings.timePicker.wrapper.html);
			$timePicker
			.addClass(settings.timePicker.wrapper.className)
			.appendTo($wrapper);



			addDateBoxes($datePickerDates, $.fn.timePicker.variables.now);
		});



	}; // $.fn.timePicker



	$.fn.timePicker.defaults = {
		numberOfTimes: 3,

		datePicker: {
			numOfDates: 5,
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



	$.fn.timePicker.variables = {
		selectedDatesArr: [],
		now: new Date()
	};



	$.fn.timePicker.createDateObjFromTime = function (timeStr, dateObj)
	{
		// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		function isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}

		var timeStrArr = timeStr.split(':');
		timeStrArr[0] = isNumber(timeStrArr[0]) ? parseInt(timeStrArr[0], 10) : 0;
		timeStrArr[1] = isNumber(timeStrArr[1]) ? parseInt(timeStrArr[1], 10) : 0;
		timeStrArr[2] = isNumber(timeStrArr[2]) ? parseInt(timeStrArr[2], 10) : 0;


		if ( undefined === dateObj )
		{
			dateObj = new Date();
		}

		dateObj.setHours(timeStrArr[0]);
		dateObj.setMinutes(timeStrArr[1]);
		dateObj.setSeconds(timeStrArr[2]);

		return dateObj;
	};



	$.fn.timePicker.createFriendlyTimesArr = function ()
	{

		if ( undefined === $.fn.timePicker.defaults.timePicker.time.startTime )
		{
			$.fn.timePicker.defaults.timePicker.time.startTime = '00:00';
		}

		var startTime = $.fn.timePicker.createDateObjFromTime($.fn.timePicker.defaults.timePicker.time.startTime);
		var endTime = $.fn.timePicker.createDateObjFromTime($.fn.timePicker.defaults.timePicker.time.endTime);

		var timesArr = [];
		while (endTime >= startTime )
		{
			var m = '' + startTime.getMinutes();
			if ( m.length === 1 ) { m = '0' + m;}

			var h = startTime.getHours();
			if ( h === 0 ) { h = 12 + ':' + m + 'am'; }
			else if ( h < 12 ) { h = h + ':' + m + 'am'; }
			else if ( h === 12 ) { h = 12 + ':' + m + 'pm'; }
			else { h = (h - 12) + ':' + m + 'pm'; }

			timesArr.push( h );
			startTime.setTime(startTime.getTime() + ($.fn.timePicker.defaults.timePicker.time.interval * 60 * 1000));
		}

		return timesArr;
	};
})(jQuery);




