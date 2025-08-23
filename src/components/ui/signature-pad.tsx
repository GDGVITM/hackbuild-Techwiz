'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function SignaturePad({ onSave, onCancel, title, description, isLoading = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 200;

    // Set default styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureDataUrl = canvas.toDataURL('image/png');
    onSave(signatureDataUrl);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <p className="text-sm text-gray-600 text-center">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-48 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            Clear
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={saveSignature}
              disabled={!hasSignature || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Signature'}
            </Button>
          </div>
        </div>
        
        {!hasSignature && (
          <p className="text-sm text-gray-500 text-center">
            Please sign above to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}
