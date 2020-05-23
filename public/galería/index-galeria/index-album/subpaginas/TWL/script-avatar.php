    <script>
		document.onkeydown = function (e) {
			if (e.ctrlKey &&
				(e.keyCode === 67 ||
					e.keyCode === 86 ||
					e.keyCode === 85 ||
					e.keyCode === 117)) {
				return false;
			}
			else {
				return true;
			}
		};
		$(document).keypress("u", function (e) {
			if (e.ctrlKey) {
				return false;
			}
			else {
				return true;
			}
		});
	</script>

	<script type="text/javascript">
		document.oncontextmenu = function () {
			return false;
		};
	</script>
	<script>
		$(document).keydown(function (event) {
			if (event.keyCode == 123) { // Prevent F12
				return false;
			} else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { // Prevent Ctrl+Shift+I        
				return fsalse;
			}
		});
	</script>
</head>

<body ondragstart='return false'>
	<!--Bloquear arrastrar y soltar-->

	<!-- Wrapper -->
	<div id="wrapper">

		<!-- Header -->
		<header id="header">
			<span class="avatar"><img src="http://drive.google.com/uc?export=view&id=19zGwIdJfUAK21HescgYZKNcqkPqsJ2-E"
					alt="" /></span>