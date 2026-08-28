import { ref as dbRef, get, set, update, remove, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { database, storage } from "./firebase";
import type { Firmware, FlashRecord, SystemLog } from "../types";

// Upload a single firmware binary file to Firebase Storage
export const uploadFirmwareFile = async (
  firmwareId: string, 
  _fileKey: string, 
  file: File
): Promise<{ fileName: string; storagePath: string; downloadUrl: string }> => {
  const storagePath = `firmwares/${firmwareId}/${file.name}`;
  const fileStorageRef = storageRef(storage, storagePath);
  
  await uploadBytes(fileStorageRef, file);
  const downloadUrl = await getDownloadURL(fileStorageRef);
  
  return {
    fileName: file.name,
    storagePath,
    downloadUrl
  };
};

// Create firmware entry in Database
export const createFirmware = async (
  firmwareData: Omit<Firmware, 'id' | 'createdAt'>,
  firmwareId?: string
): Promise<string> => {
  const newId = firmwareId || push(dbRef(database, 'firmwares')).key!;
  const newFirmware: Firmware = {
    ...firmwareData,
    id: newId,
    createdAt: Date.now()
  };

  await set(dbRef(database, `firmwares/${newId}`), newFirmware);
  return newId;
};

// Update firmware
export const updateFirmware = async (
  id: string,
  firmwareData: Partial<Firmware>
): Promise<void> => {
  await update(dbRef(database, `firmwares/${id}`), firmwareData);
};

// Delete firmware and its associated storage files
export const deleteFirmware = async (firmware: Firmware): Promise<void> => {
  // Delete binary files from Storage
  if (firmware.files) {
    for (const fileKey of Object.keys(firmware.files)) {
      const file = firmware.files[fileKey];
      if (file.storagePath) {
        try {
          const fileRef = storageRef(storage, file.storagePath);
          await deleteObject(fileRef);
        } catch (e) {
          console.warn(`Could not delete storage file ${file.storagePath}`, e);
        }
      }
    }
  }

  // Delete DB entry
  await remove(dbRef(database, `firmwares/${firmware.id}`));
};

// Fetch all firmwares
export const getAllFirmwares = async (): Promise<Firmware[]> => {
  const snapshot = await get(dbRef(database, 'firmwares'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as Firmware[];
  }
  return [];
};

// Fetch active firmwares for user portal
export const getActiveFirmwares = async (): Promise<Firmware[]> => {
  const all = await getAllFirmwares();
  return all.filter(f => f.status === 'active');
};

// Fetch single firmware by ID
export const getFirmwareById = async (id: string): Promise<Firmware | null> => {
  const snapshot = await get(dbRef(database, `firmwares/${id}`));
  if (snapshot.exists()) {
    return snapshot.val() as Firmware;
  }
  return null;
};

// Save user flash record
export const saveFlashRecord = async (userId: string, record: Omit<FlashRecord, 'id'>): Promise<string> => {
  const flashRef = push(dbRef(database, `flashHistory/${userId}`));
  const flashId = flashRef.key!;
  
  const fullRecord: FlashRecord = {
    ...record,
    id: flashId
  };

  await set(flashRef, fullRecord);

  // Increment user flash count in RTDB
  try {
    const userRef = dbRef(database, `users/${userId}`);
    const userSnap = await get(userRef);
    if (userSnap.exists()) {
      const currentCount = userSnap.val().flashCount || 0;
      await update(userRef, { flashCount: currentCount + 1 });
    }
  } catch (e) {
    console.error("Failed to update user flash count", e);
  }

  // Log system event
  await addSystemLog({
    userId,
    action: record.status === 'success' ? 'firmware_flash_success' : 'firmware_flash_failed',
    details: `Flashed ${record.firmwareName} to ${record.board}`,
    timestamp: Date.now()
  });

  return flashId;
};

// Get flash history for a user
export const getUserFlashHistory = async (userId: string): Promise<FlashRecord[]> => {
  const snapshot = await get(dbRef(database, `flashHistory/${userId}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as FlashRecord[];
  }
  return [];
};

// Get all flash history across users (for Admin)
export const getAllFlashHistory = async (): Promise<FlashRecord[]> => {
  const snapshot = await get(dbRef(database, 'flashHistory'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const allRecords: FlashRecord[] = [];
    Object.values(data).forEach((userRecords: any) => {
      if (userRecords) {
        Object.values(userRecords).forEach((record: any) => {
          allRecords.push(record);
        });
      }
    });
    return allRecords.sort((a, b) => b.startedAt - a.startedAt);
  }
  return [];
};

// System logs helpers
export const addSystemLog = async (log: Omit<SystemLog, 'id'>): Promise<void> => {
  const logRef = push(dbRef(database, 'systemLogs'));
  await set(logRef, {
    ...log,
    id: logRef.key!
  });
};

export const getSystemLogs = async (): Promise<SystemLog[]> => {
  const snapshot = await get(dbRef(database, 'systemLogs'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const logs = Object.values(data) as SystemLog[];
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }
  return [];
};
