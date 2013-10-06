<!DOCTYPE html>
<html>
<head>
	<title>timePicker jQuery plugin</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<!-- Bootstrap -->
	<link href="bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen">
	<link rel="stylesheet" type="text/css" media="all" href="css/jquery.timepicker.css" />

</head>
<body>



	<div class="container">
		<h1>TimePicker plugin for jQuery</h1>
		<p>
			This plugin is for letting a user choose dates and then corresponding times. I built it to allow users to let me know when they're available for phone calls.
		</p>

		<p>
			The time pickers return an array of parameters, time[], by default.
		</p>

		<hr />

		<p>Here's a basic example:</p>

		<div class="well" id="basic"></div>

		<p>All this requires is:</p>

		<pre><code>
<?php 
$html = <<<HTML
<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" type="text/css" media="all" href="css/jquery.timepicker.css" />
</head>
<body>
	<div id="basic"></div>
	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/jquery.timepicker.min.js"></script>
	<script>
	$(document).ready(function(){
		$('#basic').timePicker();
	});
	</script>
</body>
</html>
HTML;

echo htmlspecialchars($html, ENT_QUOTES);
 ?>
		</code></pre>
	</div><!-- container -->




	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/jquery.timepicker.min.js"></script>
	<script>
	$(document).ready(function(){
		$('#basic').timePicker();
	});
	</script>
</body>
</html>