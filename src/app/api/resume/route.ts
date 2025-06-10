import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'download' or 'view'
    
    const filePath = path.join(process.cwd(), 'public', 'doc', 'likhith-resume-ai.pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Length': fileBuffer.length.toString(),
    };
    
    // Force download vs inline viewing
    if (action === 'download') {
      headers['Content-Disposition'] = 'attachment; filename="Likhith_Usurupati_Resume.pdf"';
    } else {
      headers['Content-Disposition'] = 'inline; filename="Likhith_Usurupati_Resume.pdf"';
    }
    
    return new NextResponse(fileBuffer, { headers });
    
  } catch (error) {
    console.error('Resume API Error:', error);
    return NextResponse.json({ error: 'Failed to serve resume' }, { status: 500 });
  }
}