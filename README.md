# FreelanceHub - Student Freelance Marketplace

A modern freelance marketplace connecting students with businesses for project collaboration.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Job Management**: Create, browse, and manage freelance jobs
- **Proposal System**: Students can submit proposals for jobs
- **Contract Management**: Full contract lifecycle with e-signatures
- **Payment Integration**: Razorpay payment gateway integration
- **Real-time Updates**: Auto-refresh and status tracking

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Razorpay (Optional - for production payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# OpenAI (Optional - for AI contract generation)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Payment Setup

#### Option A: Production (Razorpay)
1. Sign up for a Razorpay account
2. Get your API keys from the dashboard
3. Add them to `.env.local`

#### Option B: Development (Test Payments)
- No setup required
- The system will automatically use test payments when Razorpay is not configured
- Perfect for development and testing

### 4. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Contract Flow

1. **Proposal Submission**: Student submits proposal for a job
2. **Proposal Review**: Business reviews and accepts/rejects proposals
3. **Contract Creation**: Business creates contract for accepted proposals
4. **Student Review**: Student reviews and approves contract
5. **Payment**: Business makes payment through Razorpay
6. **E-Signatures**: Both parties sign the contract digitally
7. **Project Execution**: Work begins with signed contract

## API Endpoints

### Contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts` - List contracts
- `GET /api/contracts/[id]` - Get contract details
- `PUT /api/contracts/[id]` - Update contract
- `POST /api/contracts/[id]/payment` - Process payment
- `POST /api/contracts/[id]/sign` - Save e-signature

### Proposals
- `GET /api/proposals` - List proposals
- `PUT /api/proposals/[id]` - Update proposal status

## Development Notes

- The system automatically detects if Razorpay is configured
- Test payments are available in development mode
- E-signatures are stored as base64 encoded images
- Real-time updates every 30 seconds
- Responsive design with Tailwind CSS

## Troubleshooting

### Payment Issues
- Check if Razorpay keys are properly configured
- Verify contract status is 'approved' before payment
- Ensure user has proper authorization

### Signature Issues
- Payment must be completed before signing
- Both parties must sign for contract completion
- Check browser console for any JavaScript errors

## License

MIT License - see LICENSE file for details
