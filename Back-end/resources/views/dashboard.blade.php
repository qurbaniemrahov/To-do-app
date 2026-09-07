@php
    $html = file_get_contents(dirname(base_path()).'/Dashboard/index.html');
    $html = str_replace('href="style.css"', 'href="/dashboard/style.css"', $html);
    $html = str_replace('src="app.js"', 'src="/dashboard/app.js"', $html);
@endphp

{!! $html !!}
