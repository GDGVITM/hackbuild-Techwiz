// pages/api/contracts/[id]/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Contract from '@/lib/models/Contract';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, NextApiResponse) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;
      const contract = await Contract.findById(req.query.id);
      
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      // Check if user is authorized to update this contract
      if (contract.businessId.toString() !== session.user.id && 
          contract.studentId.toString() !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      contract.status = status;
      contract.updatedAt = new Date();
      await contract.save();

      res.status(200).json({ success: true, contract });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}