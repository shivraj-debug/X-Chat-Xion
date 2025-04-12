import { useState } from "react";
import { Copy, Check } from "lucide-react";

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-4 text-sm text-gray-500 hover:text-gray-800 transition"
      title="Copy to clipboard"
    >
      {copied ? <div className="flex items-center gap-1">
        <div><Check className="w-4 h-4 text-green-500" /></div><div className="text-gray-500">copied</div>
      </div> :<div className="flex items-center gap-1">
        <div><Copy className="w-4 h-4 text-cyan-600" /></div><div className="text-gray-500">copy</div>
      </div>}
    </button>
  );
};
