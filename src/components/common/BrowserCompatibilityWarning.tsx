import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { espService } from '../../services/espService';

export const BrowserCompatibilityWarning: React.FC = () => {
  const isSupported = espService.isWebSerialSupported();

  if (isSupported) return null;

  return (
    <div className="bg-amber-950/80 border border-amber-500/30 text-amber-200 p-4 rounded-xl mb-6 shadow-lg backdrop-blur-md flex items-start gap-3">
      <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <h4 className="font-semibold text-amber-300 text-base mb-1">Web Serial API Unsupported</h4>
        <p className="text-amber-200/90 leading-relaxed">
          Your current browser does not support Web Serial communication required to interface with ESP boards directly.
          Please switch to <strong className="text-white">Google Chrome</strong> or <strong className="text-white">Microsoft Edge</strong> on Desktop to flash firmware.
        </p>
      </div>
    </div>
  );
};
