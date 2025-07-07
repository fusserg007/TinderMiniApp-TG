# TinderMiniApp API Documentation

## Authentication

All API endpoints require authentication via Telegram WebApp initData.

### POST /api/auth/login
Authenticate user with Telegram data.

**Request:**
```json
{
  "initData": "telegram_init_data_string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "User Name",
    "age": 25,
    "bio": "User bio",
    "photos": ["photo_url1", "photo_url2"],
    "location": {
      "latitude": 55.7558,
      "longitude": 37.6176
    },
    "preferences": {
      "minAge": 18,
      "maxAge": 35,
      "maxDistance": 50
    },
    "scores": {
      "likes": 10,
      "superlikes": 5
    },
    "isPremium": false
  }
}
```

### GET /api/auth/me
Get current user profile.

### PUT /api/auth/profile
Update user profile.

### POST /api/auth/upload-photo
Upload user photo (multipart/form-data).

## Recommendations

### GET /api/recommendations
Get user recommendations for swiping.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "User Name",
      "age": 25,
      "bio": "User bio",
      "photos": ["photo_url1"],
      "distance": 5.2
    }
  ]
}
```

## Actions

### POST /api/fire
Like, dislike, or superlike a user.

**Request:**
```json
{
  "targetUserId": "user_id",
  "action": "like" | "dislike" | "superlike"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isMatch": true,
    "matchId": "match_id"
  }
}
```

## Matches

### GET /api/matches
Get user matches.

### GET /api/matches/:matchId/messages
Get messages for a specific match.

### POST /api/matches/:matchId/messages
Send a message in a match.

**Request:**
```json
{
  "text": "Hello!"
}
```

## Payments

### POST /api/payments/create
Create a payment for premium features.

**Request:**
```json
{
  "amount": 100,
  "currency": "XTR",
  "description": "5 Superlikes"
}
```

### GET /api/payments/history
Get payment history.

### POST /api/payments/verify
Verify payment completion.

## Webhooks

### POST /api/webhook/telegram
Telegram bot webhook endpoint.

### POST /api/webhook/payment
Payment notification webhook.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Authentication required
- `VALIDATION_ERROR` - Invalid request data
- `USER_NOT_FOUND` - User not found
- `INSUFFICIENT_FUNDS` - Not enough likes/superlikes
- `RATE_LIMITED` - Too many requests
