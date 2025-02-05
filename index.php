<?php
require_once 'fallacy-data.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logical Fallacy Quiz</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background-color: #f0f2f5;
        }
        h1 {
            color: #333;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .fallacy {
            background: white;
            padding: 20px;
            margin: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 80%;
            max-width: 600px;
        }
    </style>
</head>
<body>
    <h1>Logical Fallacy Quiz</h1>
    <?php
    foreach($logical_fallacies as $fallacy) {
        echo "<div class='fallacy'>";
        echo "<h2>{$fallacy['name']}</h2>";
        echo "<p>{$fallacy['description']}</p>";
        echo "</div>";
    }
    ?>
</body>
</html>