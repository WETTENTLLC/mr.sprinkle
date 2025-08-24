<?php
// Updated Pricing Structure - Mr. Sprinkle
function getServicePrice($serviceType) {
    $prices = [
        // Consultation & Services
        'consultation' => 50,
        'repair' => 100,
        
        // Featured Promotional Items
        'single_tooth_iced' => 180,      // $180 per tooth fully iced
        'three_teeth_iced' => 540,       // 3 teeth fully iced ($180 x 3)
        'eight_teeth_iced' => 1440,      // 8 teeth fully iced ($180 x 8)
        'gap_filler_clips' => 300,       // Gap filler + 2 back clips
        
        // Custom work (requires quote)
        'custom_design' => 0,            // Quote required
        
        // Legacy options (if needed)
        'basic_grillz' => 200,
        'premium_grillz' => 500
    ];
    
    return $prices[$serviceType] ?? 0;
}

// Wholesale cost tracking (internal only - never exposed to customers)
function getWholesaleCost($serviceType) {
    $wholesaleCosts = [
        'consultation' => 0,
        'repair' => 30,
        'single_tooth_iced' => 100,      // Wholesale cost per tooth
        'three_teeth_iced' => 300,       // 3 x $100
        'eight_teeth_iced' => 800,       // 8 x $100
        'gap_filler_clips' => 150,       // Estimated wholesale
        'custom_design' => 0,
        'basic_grillz' => 80,
        'premium_grillz' => 200
    ];
    
    return $wholesaleCosts[$serviceType] ?? 0;
}

// Calculate profit margin for internal reporting
function calculateProfitMargin($serviceType) {
    $retailPrice = getServicePrice($serviceType);
    $wholesaleCost = getWholesaleCost($serviceType);
    
    if ($retailPrice == 0) return 0;
    
    return (($retailPrice - $wholesaleCost) / $retailPrice) * 100;
}

// Service descriptions for customer display
function getServiceDescription($serviceType) {
    $descriptions = [
        'consultation' => 'Initial consultation and mold taking',
        'single_tooth_iced' => 'Single tooth fully iced out with premium stones',
        'three_teeth_iced' => '3 teeth fully iced out - perfect starter set',
        'eight_teeth_iced' => 'Full 8-tooth set fully iced out - premium package',
        'gap_filler_clips' => 'Gap filler plus 2 back clips for secure fit',
        'custom_design' => 'Custom design work - pricing varies by complexity',
        'repair' => 'Professional grillz repair service'
    ];
    
    return $descriptions[$serviceType] ?? 'Custom grillz service';
}
?>