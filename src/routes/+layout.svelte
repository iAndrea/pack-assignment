<script>
	import '../app.css';
</script>

<div class="app">
	<header>
		<h1>Pack Assignment - File Upload System</h1>
	</header>

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		background: #f8fafc;
	}

	header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 1rem 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	header h1 {
		margin: 0;
		color: #1e293b;
		font-size: 1.5rem;
		font-weight: 600;
	}

	main {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
