// Google Drive service to sync book loan activities and selfie proofs client-side

export interface DriveReceiptFile {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
}

/**
 * Searches for or creates a specific app folder in the user's Google Drive.
 */
export async function getOrCreateAppFolder(token: string): Promise<string> {
  const folderName = 'IDN Smart Library Receipts';
  
  // 1. Search for folder
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`;
  
  try {
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!searchRes.ok) {
      throw new Error(`Failed to search Drive folders: ${searchRes.statusText}`);
    }
    
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
    
    // 2. Folder doesn't exist, create it
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    
    if (!createRes.ok) {
      throw new Error(`Failed to create Drive folder: ${createRes.statusText}`);
    }
    
    const folder = await createRes.json();
    return folder.id;
  } catch (error) {
    console.error('Error in getOrCreateAppFolder:', error);
    throw error;
  }
}

/**
 * Uploads a base64 selfie image with metadata metadata to Google Drive.
 */
export async function uploadSelfieReceiptToDrive(
  token: string, 
  base64Img: string, 
  loanDetails: {
    bookTitle: string;
    studentName: string;
    studentNis: string;
    leaseDate: string;
  }
): Promise<any> {
  try {
    const parentFolderId = await getOrCreateAppFolder(token);
    
    // Process base64 data to get just the raw sequence
    const base64Data = base64Img.includes('base64,') 
      ? base64Img.split('base64,')[1] 
      : base64Img;
      
    const sanitizeTitle = loanDetails.bookTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Selfie_Pinjam_${sanitizeTitle}_${loanDetails.studentNis}_2026-06-14.png`;
    
    // Build multipart raw body
    const boundary = 'idn_smart_lib_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    
    const metadata = {
      name: filename,
      mimeType: 'image/png',
      parents: [parentFolderId]
    };
    
    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: image/png\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data +
      closeDelimiter;
      
    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink,createdTime';
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: body
    });
    
    if (!uploadRes.ok) {
      throw new Error(`Failed to upload selfie to Drive: ${uploadRes.statusText}`);
    }
    
    return await uploadRes.json();
  } catch (error) {
    console.error('Error in uploadSelfieReceiptToDrive:', error);
    throw error;
  }
}

/**
 * Syncs overall loan snapshot database state into a single JSON ledger file in Google Drive
 */
export async function syncLoansJsonToDrive(token: string, loansList: any[]): Promise<any> {
  try {
    const parentFolderId = await getOrCreateAppFolder(token);
    const filename = 'buku_peminjaman_ledger.json';
    
    // Check if file exists in Drive folder to determine update (PUT) or make new file (POST)
    const searchQuery = `name = '${filename}' and '${parentFolderId}' in parents and trashed = false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id)`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let fileId: string | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id;
      }
    }
    
    const jsonData = JSON.stringify({
      appName: "IDN Smart Library System",
      synchronizedAt: "2026-06-14T18:59:43-07:00",
      totalTransactions: loansList.length,
      ledger: loansList
    }, null, 2);
    
    if (fileId) {
      // Update file content
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      const updateRes = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: jsonData
      });
      return updateRes.ok;
    } else {
      // Create new file
      const boundary = 'idn_smart_lib_json_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;
      
      const metadata = {
        name: filename,
        mimeType: 'application/json',
        parents: [parentFolderId]
      };
      
      const body = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        jsonData +
        closeDelimiter;
        
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: body
      });
      return response.ok;
    }
  } catch (err) {
    console.error('Error syncing JSON ledger to Drive:', err);
    throw err;
  }
}

/**
 * List files inside IDN Smart Library folder to show receipt logs page in real-time
 */
export async function listDriveFiles(token: string): Promise<DriveReceiptFile[]> {
  try {
    const parentFolderId = await getOrCreateAppFolder(token);
    
    // Get all files inside parent folder
    const query = `'${parentFolderId}' in parents and trashed = false`;
    const fields = 'files(id, name, webViewLink, thumbnailLink, createdTime)';
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${fields}&orderBy=createdTime desc`;
    
    const listRes = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!listRes.ok) {
      throw new Error(`Failed to list Drive files: ${listRes.statusText}`);
    }
    
    const data = await listRes.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Drive files:', error);
    return [];
  }
}
