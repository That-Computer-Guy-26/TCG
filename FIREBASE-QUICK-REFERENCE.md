# TCG Firebase - Quick Reference

## Database URL
https://babysitter-b322c-default-rtdb.firebaseio.com

## Quick Commands

### Backup Database
```bash
./backup-database.sh
```

### Health Check
```bash
./health-check.sh
```

### Admin Tools
```bash
./admin-tools.sh
```

### View Collection
```bash
curl https://babysitter-b322c-default-rtdb.firebaseio.com/customers/.json
```

### Add Data
```bash
curl -X POST https://babysitter-b322c-default-rtdb.firebaseio.com/customers.json \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

### Delete Collection
```bash
curl -X DELETE https://babysitter-b322c-default-rtdb.firebaseio.com/customers/.json
```

## Collections
- customers
- bookings
- invoices
- services
- appointments
- leads
- technicians
- timekeeping
- inventory
- reports
- webhooks

## Support
Phone: (812) 373-6023
Email: gary.amick0614@gmail.com
Available: 24/7
