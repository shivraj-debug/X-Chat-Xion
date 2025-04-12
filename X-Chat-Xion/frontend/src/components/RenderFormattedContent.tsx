export const RenderFormattedContent = (text: string) => {
    const lines = text.split("\n").filter(Boolean);
  
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/\*\*/g, "").trim();
  
          // Bullet points
          if (/^[*•\-]/.test(cleanLine)) {
            return (
              <div key={idx} className="ml-4 before:content-['•_']">
                {cleanLine.replace(/^[*•\-]\s*/, "")}
              </div>
            );
          }
  
          // Bold for sections like "Features:" or "Steps:"
          if (/^[A-Za-z ]+:$/.test(cleanLine)) {
            return (
              <div key={idx} className="font-semibold mt-2">
                {cleanLine}
              </div>
            );
          }
  
          return <div key={idx}>{cleanLine}</div>;
        })}
      </div>
    );
  };
  