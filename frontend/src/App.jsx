import { useState, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './index.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  const [viewMode, setViewMode] = useState('preview') // 'preview' | 'code'
  const [codeTab, setCodeTab] = useState('html') // 'html' | 'css' | 'js'
  const iframeRef = useRef(null)

  // Update iframe dynamically if code changes and we are in preview mode
  useEffect(() => {
    if (generatedCode && viewMode === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      const fullHTML = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${generatedCode.css}</style>
          </head>
          <body>
            ${generatedCode.html}
            <script>${generatedCode.js}</script>
          </body>
        </html>`;
      doc.write(fullHTML);
      doc.close();
    }
  }, [generatedCode, viewMode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedCode(null) // clear previous
    
    try {
      // Setup backend request
      const response = await fetch('/api/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json();
      setGeneratedCode(data)
      setViewMode('preview')
    } catch (error) {
      console.error('Error generating website:', error)
      alert('Error generating website. Please ensure the backend is running and OPENAI API key is valid.');
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyCode = () => {
    if (!generatedCode) return;
    const fullHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${generatedCode.css}</style>
  </head>
  <body>
    ${generatedCode.html}
    <script>${generatedCode.js}</script>
  </body>
</html>`;
    
    navigator.clipboard.writeText(fullHTML).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2s
    });
  }

  const handleDownloadZip = () => {
    if (!generatedCode) return;
    const zip = new JSZip();
    zip.file("index.html", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="style.css">
</head>
<body>
${generatedCode.html}
  <script src="script.js"></script>
</body>
</html>`);
    zip.file("style.css", generatedCode.css);
    zip.file("script.js", generatedCode.js);
    
    zip.generateAsync({type:"blob"}).then((content) => {
        saveAs(content, "ai-website.zip");
    });
  }

  return (
    <div className="app-container">
      <header>
        <h1>AI Website Generator</h1>
        <p className="subtitle">Describe your vision, and we'll build it for you.</p>
      </header>

      <main className="main-content">
        <section className="prompt-section">
          <div className="input-wrapper">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. A landing page for a modern coffee shop with a dark theme, a hero section featuring a 'Order Now' button, and a grid of coffee products..."
              readOnly={isGenerating}
            />
            <div className="controls">
              <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                {isGenerating ? (
                  <>
                    <div className="loader"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Website'
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="preview-section">
          <div className="preview-header">
            <h2 className="preview-title">Results</h2>
            
            {generatedCode && (
              <div className="tabs-container">
                <button 
                  className={`tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setViewMode('preview')}
                >Live Preview</button>
                <button 
                  className={`tab-btn ${viewMode === 'code' ? 'active' : ''}`}
                  onClick={() => setViewMode('code')}
                >Code Editor</button>
              </div>
            )}

            {generatedCode && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleDownloadZip} 
                  style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                >
                  📦 Export ZIP
                </button>
                <button 
                  onClick={handleCopyCode} 
                  style={{ 
                    background: isCopied ? '#10b981' : 'transparent', 
                    border: isCopied ? '1px solid #10b981' : '1px solid var(--border-color)', 
                    color: isCopied ? 'white' : 'var(--text-primary)',
                    padding: '0.4rem 1rem',
                    fontSize: '0.9rem'
                  }}
                >
                  {isCopied ? '✓ Copied' : '📄 Copy HTML'}
                </button>
              </div>
            )}
          </div>
          
          {viewMode === 'preview' ? (
            <div className="preview-container" style={{ display: generatedCode ? 'flex' : 'none', flexDirection: 'column', minHeight: '600px' }}>
              <iframe ref={iframeRef} title="Generated Website Preview" style={{ flex: 1, width: '100%', height: '100%', minHeight: '600px', border: 'none' }}></iframe>
            </div>
          ) : (
            <div className="code-editor-container">
              <div className="code-editor-header">
                <button className={`tab-btn ${codeTab === 'html' ? 'active' : ''}`} onClick={() => setCodeTab('html')}>HTML</button>
                <button className={`tab-btn ${codeTab === 'css' ? 'active' : ''}`} onClick={() => setCodeTab('css')}>CSS</button>
                <button className={`tab-btn ${codeTab === 'js' ? 'active' : ''}`} onClick={() => setCodeTab('js')}>JS</button>
              </div>
              <textarea 
                className="code-textarea"
                value={generatedCode?.[codeTab] || ''}
                onChange={(e) => setGeneratedCode({...generatedCode, [codeTab]: e.target.value})}
                spellCheck={false}
              />
            </div>
          )}
          
          {!generatedCode && (
            <div className="empty-state">
              <p>Your generated website will appear here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
