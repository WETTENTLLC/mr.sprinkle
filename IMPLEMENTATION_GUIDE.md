# Mr. Sprinkle Ambassador Tracking System - Implementation Guide

## 🎯 System Overview
Complete ambassador referral tracking system with automatic URL capture, commission processing, email notifications, and dashboard functionality for Mr. Sprinkle's custom grillz business.

## 📋 Prerequisites
- Web server with PHP 7.4+ and MySQL 5.7+
- XAMPP, WAMP, or similar local development environment
- Email server configuration (for notifications)

## 🚀 Installation Steps

### 1. Database Setup
```bash
# Import the database schema
mysql -u root -p < database-setup.sql
```

### 2. File Structure
```
Mr.Sprinkle/
├── ambassador-tracking.js          # Frontend tracking script
├── ambassador-backend.php          # Backend API endpoints
├── ambassador-form-integration.html # Booking form with integration
├── ambassador-dashboard.php        # Ambassador dashboard
├── database-setup.sql             # Database schema
└── .env                          # Configuration file
```

### 3. Web Server Configuration
- Place all files in your web server's document root
- Ensure PHP has write permissions for session handling
- Configure URL rewriting for clean API endpoints:

```apache
# .htaccess file
RewriteEngine On
RewriteRule ^api/(.*)$ $1 [L]
```

### 4. Database Configuration
Update database credentials in `ambassador-backend.php`:
```php
$host = 'localhost';
$dbname = 'mr_sprinkle_db';
$username = 'your_username';
$password = 'your_password';
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Business Information
BUSINESS_PHONE=5302140676
BUSINESS_EMAIL=info@mrsprinklereno.com
WEBSITE_URL=https://mrsprinklereno.com

# Commission Settings
COMMISSION_RATE=0.20
CUSTOMER_DISCOUNT=0.10
```

### Email Configuration
Configure SMTP settings in `ambassador-backend.php` for email notifications:
```php
// Update mail() function calls with proper SMTP configuration
// Consider using PHPMailer for production environments
```

## 📱 Usage Instructions

### For Ambassadors
1. **Get Ambassador Code**: Contact Mr. Sprinkle to receive unique ambassador code
2. **Share Referral Link**: Use format `https://mrsprinklereno.com?ref=YOURCODE`
3. **Access Dashboard**: Visit `ambassador-dashboard.php` and enter ambassador code
4. **Track Earnings**: Monitor referrals, commissions, and statistics

### For Customers
1. **Visit via Referral Link**: Click ambassador's referral link
2. **Automatic Discount**: 10% discount automatically applied
3. **Book Service**: Complete booking form with discount applied
4. **Confirmation**: Receive booking confirmation email

### For Business Owner
1. **New Booking Notifications**: Automatic email alerts for new bookings
2. **Commission Tracking**: Monitor all ambassador referrals and commissions
3. **Payment Processing**: Mark commissions as paid in database

## 🔗 API Endpoints

### Track Visit
```
POST /api/track-visit.php
Content-Type: application/json

{
    "ambassador_code": "MIKE2024",
    "page": "/services",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### Process Booking
```
POST /api/process-booking.php
Content-Type: multipart/form-data

customer_name=John Doe
customer_email=john@example.com
customer_phone=555-123-4567
service_type=premium_grillz
booking_date=2024-01-20
ambassador_code=MIKE2024
```

### Get Ambassador Stats
```
GET /api/ambassador-stats.php?code=MIKE2024

Response:
{
    "success": true,
    "data": {
        "total_referrals": 5,
        "paid_commission": 200.00,
        "pending_commission": 150.00
    }
}
```

## 🧪 Testing Procedures

### 1. Database Testing
```sql
-- Verify tables created
SHOW TABLES;

-- Test sample data
SELECT * FROM ambassadors;
SELECT * FROM bookings LIMIT 5;
```

### 2. Frontend Testing
1. Open `ambassador-form-integration.html`
2. Add `?ref=MIKE2024` to URL
3. Verify discount banner appears
4. Submit test booking
5. Check database for new records

### 3. Dashboard Testing
1. Access `ambassador-dashboard.php`
2. Login with ambassador code `MIKE2024`
3. Verify stats display correctly
4. Test QR code generation
5. Test referral link copying

### 4. Commission Calculation Testing
```sql
-- Test commission calculation
CALL CalculateCommissions();

-- Verify results
SELECT * FROM ambassador_referrals WHERE status = 'pending';
```

## 📊 Database Schema Overview

### Key Tables
- **ambassadors**: Ambassador profiles and stats
- **bookings**: Customer bookings with pricing
- **ambassador_referrals**: Commission tracking
- **ambassador_visits**: Traffic analytics

### Key Relationships
- Bookings → Ambassadors (via ambassador_code)
- Referrals → Bookings (via booking_id)
- Visits → Ambassadors (via ambassador_code)

## 🔒 Security Considerations

### Input Validation
- All user inputs sanitized and validated
- SQL injection prevention with prepared statements
- XSS protection with htmlspecialchars()

### Session Management
- Secure session handling for dashboard access
- Session timeout for security
- CSRF protection recommended for production

### Data Protection
- Sensitive data encrypted in database
- PCI compliance for payment processing
- GDPR compliance for customer data

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify MySQL service is running
- Check database credentials
- Ensure database exists

**Email Notifications Not Sending**
- Configure SMTP settings
- Check server email configuration
- Verify recipient email addresses

**QR Code Not Generating**
- Check internet connection for QR API
- Verify URL encoding is correct
- Consider local QR generation library

**Commission Calculations Incorrect**
- Verify commission rate in code (20%)
- Check discount rate (10%)
- Run stored procedure manually

### Debug Mode
Enable debug mode in `ambassador-backend.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📈 Performance Optimization

### Database Optimization
- Regular index maintenance
- Query optimization for large datasets
- Database cleanup procedures

### Caching Strategy
- Implement Redis for session storage
- Cache ambassador stats for better performance
- Use CDN for static assets

### Monitoring
- Set up database monitoring
- Track API response times
- Monitor commission calculation accuracy

## 🔄 Maintenance Tasks

### Daily
- Monitor new bookings and referrals
- Check email notification delivery
- Verify commission calculations

### Weekly
- Review ambassador performance
- Process commission payments
- Update ambassador stats

### Monthly
- Database backup and cleanup
- Performance analysis
- Security audit

## 📞 Support Information

**Technical Support**
- Email: tech@mrsprinklereno.com
- Phone: (530) 214-0676

**Business Support**
- Email: info@mrsprinklereno.com
- Website: https://mrsprinklereno.com

## 🎉 Success Metrics

### Key Performance Indicators
- **Conversion Rate**: Referral visits to bookings
- **Ambassador Performance**: Referrals per ambassador
- **Revenue Impact**: Total revenue from referrals
- **Customer Satisfaction**: Booking completion rate

### Tracking Dashboard
Monitor these metrics through the ambassador dashboard and business analytics tools.

---

**Implementation Complete!** 🚀

The Mr. Sprinkle Ambassador Tracking System is now ready for deployment. Follow this guide step-by-step for successful implementation and ongoing maintenance.