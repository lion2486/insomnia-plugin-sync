<?php

define('WORKSPACE_DIR', 'workspaces');

$workspace = 'default';
$workspace = $_GET['workspace'];
$workspace_file = __DIR__ . DIRECTORY_SEPARATOR . WORKSPACE_DIR . DIRECTORY_SEPARATOR . $workspace . '.json';

if( $_SERVER['REQUEST_METHOD'] === "POST") {
    $body = file_get_contents('php://input');

    echo "Writing to " . $workspace_file . "\n";

    $myfile = fopen($workspace_file, "w") or die("Unable to open file!");
    fwrite($myfile, $body);
    fclose($myfile);

    echo "OK";

} else {
    // it'a a get!
    $myfile = fopen($workspace_file, "r") or die("Unable to open file!");
    echo fread($myfile,filesize($workspace_file));
    fclose($myfile);
}