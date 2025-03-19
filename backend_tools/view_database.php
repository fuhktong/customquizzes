<?php
require_once '../db_connection.php';

// Set page title
$title = 'MySQL Database Viewer';

// Function to get all tables in the database
function getTables($pdo) {
    $stmt = $pdo->query("SHOW TABLES");
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

// Function to get table structure
function getTableStructure($pdo, $table) {
    $stmt = $pdo->query("DESCRIBE `$table`");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Function to get table data (limited to 100 rows for performance)
function getTableData($pdo, $table, $limit = 100) {
    $stmt = $pdo->query("SELECT * FROM `$table` LIMIT $limit");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get selected table from query string
$selectedTable = isset($_GET['table']) ? $_GET['table'] : null;

// Get all tables
$tables = getTables($pdo);

// Get table structure and data if a table is selected
$structure = $selectedTable ? getTableStructure($pdo, $selectedTable) : [];
$data = $selectedTable ? getTableData($pdo, $selectedTable) : [];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f2f5;
        }
        h1, h2, h3 {
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .container h1 {
            margin: 25px;
        }
        .tables-list {
            float: left;
            width: 20%;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px;
        }
        .tables-list ul {
            list-style-type: none;
            padding: 0;
        }
        .tables-list li {
            margin-bottom: 10px;
        }
        .tables-list a {
            display: block;
            padding: 5px 10px;
            text-decoration: none;
            color: #333;
            border-radius: 4px;
        }
        .tables-list a:hover, .tables-list a.active {
            background-color: #e6f7ff;
            color: #1890ff;
        }
        .content {
            float: left;
            width: 75%;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow-x: auto;
            margin: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .clearfix {
            clear: both;
        }
        .database-name {
            margin: 20px;
            padding: 10px;
            background-color: #e6f7ff;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo $title; ?></h1>
        
        <div class="database-name">
            <strong>Database:</strong> <?php echo $dbname; ?>
        </div>
        
        <div class="tables-list">
            <h3>Tables</h3>
            <?php if (count($tables) > 0): ?>
                <ul>
                    <?php foreach ($tables as $table): ?>
                        <li>
                            <a href="?table=<?php echo $table; ?>" <?php echo ($selectedTable === $table) ? 'class="active"' : ''; ?>>
                                <?php echo $table; ?>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php else: ?>
                <p>No tables found in database.</p>
            <?php endif; ?>
        </div>
        
        <div class="content">
            <?php if ($selectedTable): ?>
                <h2>Table: <?php echo $selectedTable; ?></h2>
                
                <h3>Structure</h3>
                <table>
                    <tr>
                        <th>Field</th>
                        <th>Type</th>
                        <th>Null</th>
                        <th>Key</th>
                        <th>Default</th>
                        <th>Extra</th>
                    </tr>
                    <?php foreach ($structure as $column): ?>
                        <tr>
                            <td><?php echo $column['Field']; ?></td>
                            <td><?php echo $column['Type']; ?></td>
                            <td><?php echo $column['Null']; ?></td>
                            <td><?php echo $column['Key']; ?></td>
                            <td><?php echo $column['Default'] ?? 'NULL'; ?></td>
                            <td><?php echo $column['Extra']; ?></td>
                        </tr>
                    <?php endforeach; ?>
                </table>
                
                <h3>Data (First 100 rows)</h3>
                <?php if (count($data) > 0): ?>
                    <table>
                        <tr>
                            <?php foreach ($data[0] as $column => $value): ?>
                                <th><?php echo $column; ?></th>
                            <?php endforeach; ?>
                        </tr>
                        <?php foreach ($data as $row): ?>
                            <tr>
                                <?php foreach ($row as $value): ?>
                                    <td><?php echo is_null($value) ? 'NULL' : htmlspecialchars($value); ?></td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    </table>
                <?php else: ?>
                    <p>No data in this table.</p>
                <?php endif; ?>
            <?php else: ?>
                <p>Select a table from the list to view its structure and data.</p>
            <?php endif; ?>
        </div>
        
        <div class="clearfix"></div>
    </div>
</body>
</html>