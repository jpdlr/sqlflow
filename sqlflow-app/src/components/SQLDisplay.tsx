import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';

interface SQLDisplayProps {
  sqlCode: string;
}

const SQLDisplay: React.FC<SQLDisplayProps> = ({ sqlCode }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [sqlCode]);

  return (
    <div className="sql-display-container">
      <h3>SQL Code</h3>
      <div className="code-wrapper">
        <pre className="language-sql">
          <code ref={codeRef} className="language-sql">
            {sqlCode || '-- No SQL code to display'}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default SQLDisplay;