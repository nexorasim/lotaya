import React, { useRef, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';

interface DesignCanvasProps {
    imageSrc: string;
    caption: string;
    hashtags: string[];
    width: number;
    height: number;
    templateName: string;
}

// Helper function to wrap text on canvas
const wrapText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
) => {
    const words = text.split(' ');
    let line = '';
    let testLine;
    let metrics;
    let testWidth;
    const lines = [];

    for (let i = 0; i < words.length; i++) {
        testLine = line + words[i] + ' ';
        metrics = context.measureText(testLine);
        testWidth = metrics.width;
        if (testWidth > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    const totalTextHeight = (lines.length -1) * lineHeight;
    let currentY = y - totalTextHeight / 2;

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i].trim(), x, currentY);
        currentY += lineHeight;
    }
};

const DesignCanvas: React.FC<DesignCanvasProps> = ({ imageSrc, caption, hashtags, width, height, templateName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        canvas.width = width;
        canvas.height = height;

        const bgImage = new Image();
        bgImage.crossOrigin = "anonymous"; 
        bgImage.onload = () => {
            // Draw background image to cover canvas
            ctx.drawImage(bgImage, 0, 0, width, height);

            // Draw a semi-transparent overlay for text readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            const padding = width * 0.05;
            ctx.fillRect(padding, padding, width - (padding * 2), height - (padding * 2));

            // --- Draw Caption ---
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const baseFontSize = Math.max(24, Math.floor(width / 25));
            ctx.font = `bold ${baseFontSize}px Inter, sans-serif`;
            const lineHeight = baseFontSize * 1.2;
            
            wrapText(ctx, caption, width / 2, height / 2, width * 0.8, lineHeight);
            
            // --- Draw Hashtags ---
            const hashtagFontSize = Math.max(12, Math.floor(width / 60));
            ctx.font = `normal ${hashtagFontSize}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const hashtagText = hashtags.map(h => `#${h}`).join(' ');
            ctx.fillText(hashtagText, width / 2, height - (padding * 0.5));
        };
        bgImage.src = `data:image/jpeg;base64,${imageSrc}`;

    }, [imageSrc, caption, hashtags, width, height]);

    const handleDownload = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `lotaya-ai-${templateName.toLowerCase().replace(/\s/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [templateName]);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 md:p-8 rounded-xl shadow-2xl">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-100">Design Preview</h3>
                <button
                    onClick={handleDownload}
                    aria-label="Download Design"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                    <Download size={16} />
                    <span>Download</span>
                </button>
            </div>
            <div className="w-full bg-gray-950 rounded-md overflow-hidden border border-gray-700" style={{ aspectRatio: `${width} / ${height}` }}>
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        </div>
    );
};

export default DesignCanvas;