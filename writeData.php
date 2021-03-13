<?php
$data = $_POST['data'];
file_put_contents("database.json", $data);

if($data){
    echo $data;
} else {
    echo 'no data sent';
}
?>