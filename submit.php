<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($data) {
        // Generate unique ID
        $id = uniqid('APP-', true);
        $data['id'] = $id;
        $data['submittedAt'] = date('Y-m-d H:i:s');
        $data['status'] = 'pending';
        
        // Load existing applications
        $applications = [];
        if (file_exists('applications.json')) {
            $applications = json_decode(file_get_contents('applications.json'), true);
        }
        
        // Add new application
        $applications[] = $data;
        
        // Save to file
        file_put_contents('applications.json', json_encode($applications, JSON_PRETTY_PRINT));
        
        echo json_encode([
            'success' => true,
            'message' => 'Application submitted successfully!',
            'id' => $id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid data'
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // For admin to get all applications
    $applications = [];
    if (file_exists('applications.json')) {
        $applications = json_decode(file_get_contents('applications.json'), true);
    }
    
    echo json_encode($applications);
}
?>
