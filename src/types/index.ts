export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
  status: 'active' | 'disabled';
  flashCount?: number;
}

export type ESPBoardType = 
  | 'Auto Detect'
  | 'ESP32'
  | 'ESP32-C3'
  | 'ESP32-S2'
  | 'ESP32-S3'
  | 'ESP32-C6'
  | 'ESP8266';

export interface FirmwareFile {
  fileName: string;
  flashAddress: string;
  storagePath: string;
  downloadUrl?: string;
}

export interface Firmware {
  id: string;
  name: string;
  version: string;
  description: string;
  targetBoard: ESPBoardType;
  status: 'active' | 'inactive';
  createdAt: number;
  createdBy: string;
  releaseNotes?: string;
  files: Record<string, FirmwareFile>;
}

export interface FlashRecord {
  id?: string;
  userId: string;
  firmwareId: string;
  firmwareName: string;
  board: string;
  status: 'success' | 'failed';
  startedAt: number;
  completedAt: number;
  duration: number; // milliseconds
  errorMessage?: string;
}

export interface SystemLog {
  id?: string;
  userId: string;
  userEmail?: string;
  action: string;
  details?: string;
  timestamp: number;
}

export type ConnectionStatus =
  | 'No device connected'
  | 'Connecting'
  | 'Device connected'
  | 'Connection failed'
  | 'Flashing firmware'
  | 'Flash completed'
  | 'Erasing flash';

export interface LogMessage {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
