<?php
function load_env_file($path) {
	$vars = [];
	if (!is_readable($path)) {
		return $vars;
	}

	$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
	foreach ($lines as $line) {
		$line = trim($line);
		if ($line === '' || strpos($line, '#') === 0) {
			continue;
		}
		$parts = explode('=', $line, 2);
		if (count($parts) !== 2) {
			continue;
		}
		$key = trim($parts[0]);
		$value = trim($parts[1]);
		$value = trim($value, "'\"");
		if ($key !== '') {
			$vars[$key] = $value;
		}
	}

	return $vars;
}

function get_env_value($key, $fallback = null) {
	if (isset($_ENV[$key])) {
		return $_ENV[$key];
	}
	if (isset($_SERVER[$key])) {
		return $_SERVER[$key];
	}
	return $fallback;
}

header('Content-Type: application/json; charset=utf-8');

$username = isset($_GET['username']) ? preg_replace('/[^a-zA-Z0-9-]/', '', $_GET['username']) : '';
$type = isset($_GET['type']) ? strtolower($_GET['type']) : 'repos';
if ($username === '') {
	http_response_code(400);
	echo json_encode(['error' => 'Missing username']);
	exit;
}

$allowed_types = ['repos', 'profile'];
if (!in_array($type, $allowed_types, true)) {
	http_response_code(400);
	echo json_encode(['error' => 'Invalid type']);
	exit;
}

$env_file = __DIR__ . DIRECTORY_SEPARATOR . '.env';
$env_values = load_env_file($env_file);
$token = $env_values['GITHUB_TOKEN'] ?? get_env_value('GITHUB_TOKEN');

$base_url = 'https://api.github.com/users/' . rawurlencode($username);
$url = $type === 'profile'
	? $base_url
	: $base_url . '/repos?per_page=100';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'PortfolioProxy/1.0');
$headers = ['Accept: application/vnd.github+json'];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false) {
	http_response_code(502);
	echo json_encode(['error' => 'Proxy error', 'detail' => $error]);
	exit;
}

http_response_code($status);
echo $response;
