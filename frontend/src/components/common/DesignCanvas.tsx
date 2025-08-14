import React from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Share } from 'lucide-react';

interface DesignCanvasProps {
  imageSrc: string;
  caption: string;
  hashtags: string[];
  width: number;
  height: number;
  templateName: string;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  imageSrc,
  caption,
  hashtags,
  width,
  height,
  templateName,
}) => {
  const aspectRatio = width / height;
  const canvasWidth = Math.min(400, width * 0.5);
  const canvasHeight = canvasWidth / aspectRatio;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${imageSrc}`;
    link.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-design.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCaption = async () => {
    const fullText = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
    try {
      await navigator.clipboard.writeText(fullText);
      // You could show a toast here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Design Preview */}
        <div className="flex-shrink-0">
          <div className="relative group">
            <motion.div
              className="relative overflow-hidden rounded-xl shadow-lg"
              style={{ width: canvasWidth, height: canvasHeight }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={`data:image/jpeg;base64,${imageSrc}`}
                alt="Generated design"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleDownload}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Download size={16} />
                  </motion.button>
                  <motion.button
                    className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
            
            {/* Dimensions */}
            <div className="mt-2 text-center">
              <span className="text-gray-400 text-sm">{width} × {height}px</span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white">{templateName}</h3>
              <motion.button
                onClick={handleCopyCaption}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy size={14} />
                Copy All
              </motion.button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Caption</h4>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{caption}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <motion.span
                  key={i}
                  className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              Download Image
            </motion.button>
            
            <motion.button
              onClick={handleCopyCaption}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Copy size={16} />
              Copy Text
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;