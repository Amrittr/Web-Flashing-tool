/// <reference types="w3c-web-serial" />
import { ESPLoader, Transport } from 'esptool-js';
import type { LogMessage } from '../types';

export class ESPService {
  private port: SerialPort | null = null;
  private transport: Transport | null = null;
  private loader: ESPLoader | null = null;
  private connectedChip: string = '';
  private isConnected: boolean = false;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isMonitoring: boolean = false;

  public isWebSerialSupported(): boolean {
    return 'serial' in navigator;
  }

  public async requestPort(): Promise<SerialPort> {
    if (!this.isWebSerialSupported()) {
      throw new Error("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
    }
    this.port = await (navigator as any).serial.requestPort();
    return this.port!;
  }


  public async connect(
    baudRate: number = 921600, 
    onLog?: (msg: string, type?: LogMessage['type']) => void
  ): Promise<string> {
    if (!this.port) {
      throw new Error("No port selected.");
    }

    try {
      this.transport = new Transport(this.port);
      
      const terminal = {
        clean: () => {},
        writeLine: (data: string) => {
          if (onLog) onLog(data, 'info');
        },
        write: (data: string) => {
          if (onLog) onLog(data, 'info');
        }
      };

      this.loader = new ESPLoader({
        transport: this.transport,
        baudrate: baudRate,
        terminal: terminal
      });

      if (onLog) onLog("Connecting to ESP bootloader...", 'info');
      this.connectedChip = await this.loader.main();
      if (onLog) onLog(`Chip detected: ${this.connectedChip}`, 'success');

      this.isConnected = true;
      return this.connectedChip;
    } catch (err: any) {
      this.isConnected = false;
      if (onLog) onLog(`Connection failed: ${err.message || err}`, 'error');
      throw err;
    }
  }

  public async disconnect(onLog?: (msg: string, type?: LogMessage['type']) => void): Promise<void> {
    try {
      this.stopSerialMonitor();
      if (this.transport) {
        await this.transport.disconnect();
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (err: any) {
      console.warn("Error during disconnect", err);
    } finally {
      this.port = null;
      this.transport = null;
      this.loader = null;
      this.connectedChip = '';
      this.isConnected = false;
      if (onLog) onLog("Device disconnected.", 'info');
    }
  }

  public async flashFirmware(
    fileArray: Array<{ data: Uint8Array; address: number }>,
    _baudRate: number,
    onProgress: (percentage: number) => void,
    onLog: (msg: string, type?: LogMessage['type']) => void
  ): Promise<void> {
    if (!this.loader || !this.isConnected) {
      throw new Error("Device not connected.");
    }

    try {
      onLog("Preparing flash options...", 'info');
      
      const flashOptions = {
        fileArray: fileArray.map(f => ({
          data: f.data,
          address: f.address
        })),
        flashSize: "keep",
        eraseAll: false,
        compress: true,
        reportProgress: (_fileIndex: number, written: number, total: number) => {
          const pct = Math.floor((written / total) * 100);
          onProgress(pct);
        },
        calculateMD5Hash: (image: string) => image // default dummy hash verification helper if needed
      };

      onLog("Starting flashing process...", 'info');
      await this.loader.writeFlash(flashOptions as any);
      onLog("Flashing complete! Verifying...", 'success');
      onProgress(100);
    } catch (err: any) {
      onLog(`Flashing failed: ${err.message || err}`, 'error');
      throw err;
    }
  }

  public async eraseFlash(
    onLog: (msg: string, type?: LogMessage['type']) => void
  ): Promise<void> {
    if (!this.loader || !this.isConnected) {
      throw new Error("Device not connected.");
    }

    try {
      onLog("Starting flash erase (this may take several seconds)...", 'warning');
      await this.loader.eraseFlash();
      onLog("Flash memory erased successfully.", 'success');
    } catch (err: any) {
      onLog(`Erase failed: ${err.message || err}`, 'error');
      throw err;
    }
  }

  public async resetBoard(onLog: (msg: string, type?: LogMessage['type']) => void): Promise<void> {
    if (!this.transport) {
      throw new Error("No serial transport initialized.");
    }

    try {
      onLog("Resetting ESP board via RTS/DTR pins...", 'info');
      // Perform hardware reset sequence: DTR/RTS signals
      await this.transport.setDTR(false);
      await this.transport.setRTS(true);
      await new Promise(r => setTimeout(r, 100));
      await this.transport.setRTS(false);
      onLog("Board reset signal sent successfully. If not auto-resetting, please press manual EN/Reset button.", 'success');
    } catch (err: any) {
      onLog(`Board reset failed: ${err.message || err}`, 'error');
      throw err;
    }
  }

  public async startSerialMonitor(onData: (text: string) => void): Promise<void> {
    if (!this.port) return;
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    try {
      if (!this.port.readable) {
        await this.port.open({ baudRate: 115200 });
      }
      
      if (this.port.readable) {
        const textDecoder = new TextDecoderStream();
        void (this.port.readable as any).pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        this.reader = reader as any;

        while (this.isMonitoring) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          if (value) {
            onData(value);
          }
        }
      }
    } catch (err) {
      console.warn("Serial monitor read stopped/error:", err);
    } finally {
      this.isMonitoring = false;
    }
  }

  public stopSerialMonitor(): void {
    this.isMonitoring = false;
    if (this.reader) {
      try {
        this.reader.cancel();
      } catch (e) {}
      this.reader = null;
    }
  }

  public getPortName(): string {
    if (!this.port) return 'None';
    const info = this.port.getInfo();
    if (info.usbVendorId) {
      return `USB Serial (0x${info.usbVendorId.toString(16)}:0x${info.usbProductId?.toString(16)})`;
    }
    return 'Serial Device';
  }

  public getDetectedChip(): string {
    return this.connectedChip;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const espService = new ESPService();
