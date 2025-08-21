import  dbConnect  from './mongoose';

export async function testDatabaseConnection() {
  try {
    await dbConnect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}