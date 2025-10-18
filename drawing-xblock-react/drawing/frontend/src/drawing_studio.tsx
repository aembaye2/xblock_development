//////////////////////////////////////////////////////////////////////////////
// Studio View for Drawing XBlock                                             //
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';
import { DrawingApp } from "./components/canvas/DrawingApp";
import { modes } from "./components/canvas/modesfile";
import faMessages from '../lang/compiled/fa.json';
import frMessages from '../lang/compiled/fr.json';

const messages = {
  fa: faMessages,
  fr: frMessages,
};

interface StudioInitData {
  // XBlock settings
  display_name?: string;
  question?: string;
  max_attempts?: number;
  weight?: number;
  
  // Drawing canvas settings
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  bgnumber?: number;
  visibleModes?: string[];
  axisLabels?: [string, string];
  hideLabels?: boolean;
  
  // Reference drawing for comparison
  reference_drawing?: object;
  grading_mode?: 'manual' | 'completion' | 'comparison';
  similarity_threshold?: number;
}

const StudioView: React.FC<{ runtime: BoundRuntime; initData: StudioInitData }> = ({ runtime, initData }) => {
  // Form state
  const [displayName, setDisplayName] = useState<string>(initData.display_name ?? 'Drawing Exercise');
  const [question, setQuestion] = useState<string>(initData.question ?? 'Use the drawing tools to complete the exercise.');
  const [maxAttempts, setMaxAttempts] = useState<number>(initData.max_attempts ?? 0);
  const [weight, setWeight] = useState<number>(initData.weight ?? 1);
  
  // Canvas settings
  const [canvasWidth, setCanvasWidth] = useState<number>(initData.canvasWidth ?? 500);
  const [canvasHeight, setCanvasHeight] = useState<number>(initData.canvasHeight ?? 400);
  const [scaleFactors, setScaleFactors] = useState<string>(
    JSON.stringify(initData.scaleFactors ?? [100, 200, 75, 84, 25, 35])
  );
  const [bgnumber, setBgnumber] = useState<number>(initData.bgnumber ?? 0);
  const [visibleModes, setVisibleModes] = useState<string>(
    JSON.stringify(initData.visibleModes ?? undefined)
  );
  const [axisLabels, setAxisLabels] = useState<string>(
    JSON.stringify(initData.axisLabels ?? ["q", "p"])
  );
  const [hideLabels, setHideLabels] = useState<boolean>(initData.hideLabels ?? false);
  
  // Grading settings
  const [gradingMode, setGradingMode] = useState<string>(initData.grading_mode ?? 'completion');
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(initData.similarity_threshold ?? 0.7);
  
  // Reference drawing state
  const [showReferenceEditor, setShowReferenceEditor] = useState<boolean>(false);
  const [submitButtonClicked, setSubmitButtonClicked] = useState<boolean>(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!question.trim()) {
      newErrors.question = 'Question text is required';
    }
    
    if (canvasWidth < 100 || canvasWidth > 2000) {
      newErrors.canvasWidth = 'Canvas width must be between 100 and 2000';
    }
    
    if (canvasHeight < 100 || canvasHeight > 2000) {
      newErrors.canvasHeight = 'Canvas height must be between 100 and 2000';
    }
    
    if (maxAttempts < 0) {
      newErrors.maxAttempts = 'Max attempts cannot be negative';
    }
    
    // Validate JSON fields
    try {
      JSON.parse(scaleFactors);
    } catch (e) {
      newErrors.scaleFactors = 'Scale factors must be valid JSON array';
    }
    
    try {
      if (visibleModes !== 'undefined' && visibleModes.trim()) {
        JSON.parse(visibleModes);
      }
    } catch (e) {
      newErrors.visibleModes = 'Visible modes must be valid JSON array';
    }
    
    try {
      JSON.parse(axisLabels);
    } catch (e) {
      newErrors.axisLabels = 'Axis labels must be valid JSON array';
    }
    
    if (similarityThreshold < 0 || similarityThreshold > 1) {
      newErrors.similarityThreshold = 'Similarity threshold must be between 0 and 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save settings to backend
  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      return;
    }
    
    setSaveStatus('saving');
    
    try {
      // Get reference drawing from localStorage if in comparison mode
      let referenceDrawing = null;
      if (gradingMode === 'comparison' && showReferenceEditor) {
        const key = `studio-reference-drawing`;
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            referenceDrawing = JSON.parse(raw);
          } catch (e) {
            console.error('Error parsing reference drawing', e);
          }
        }
      }
      
      const data = {
        display_name: displayName,
        question: question,
        max_attempts: maxAttempts,
        weight: weight,
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        scale_factors: JSON.parse(scaleFactors),
        bgnumber: bgnumber,
        visible_modes: visibleModes === 'undefined' || !visibleModes.trim() ? null : JSON.parse(visibleModes),
        axis_labels: JSON.parse(axisLabels),
        hide_labels: hideLabels,
        grading_mode: gradingMode,
        similarity_threshold: similarityThreshold,
        reference_drawing: referenceDrawing,
      };
      
      const result = await runtime.postHandler('studio_submit', data);
      
      if (result.result === 'success') {
        setSaveStatus('success');
        setTimeout(() => {
          runtime.notify('save', { state: 'end' });
        }, 1000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    runtime.notify('cancel', {});
  };

  // Save reference drawing
  const saveReferenceDrawing = () => {
    setSubmitButtonClicked(true);
    setTimeout(() => {
      const key = `studio-reference-drawing`;
      const raw = localStorage.getItem(`studio-canvasDrawing-1`);
      if (raw) {
        localStorage.setItem(key, raw);
        alert('Reference drawing saved! This will be used for comparison grading.');
      }
      setSubmitButtonClicked(false);
    }, 200);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <div style={{ 
        background: '#0075b4', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px 8px 0 0',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>✏️ Edit Drawing Exercise</h2>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Configure your drawing exercise settings</p>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        {/* Basic Settings Section */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #0075b4', paddingBottom: '10px' }}>
            📝 Basic Settings
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.displayName ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="e.g., Question 1: Draw a Supply Curve"
            />
            {errors.displayName && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.displayName}</span>}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              The name shown in the course outline
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Question/Instructions *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '100px',
                padding: '10px', 
                border: errors.question ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Enter instructions for students..."
            />
            {errors.question && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.question}</span>}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Instructions shown to students. Supports HTML.
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Maximum Attempts
              </label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                min="0"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: errors.maxAttempts ? '2px solid #dc3545' : '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              {errors.maxAttempts && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.maxAttempts}</span>}
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                0 = unlimited attempts
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Weight
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                min="0"
                step="0.5"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Point value for this problem
              </small>
            </div>
          </div>
        </section>

        {/* Canvas Settings Section */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #0075b4', paddingBottom: '10px' }}>
            🎨 Canvas Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Canvas Width (px)
              </label>
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(parseInt(e.target.value) || 500)}
                min="100"
                max="2000"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: errors.canvasWidth ? '2px solid #dc3545' : '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              {errors.canvasWidth && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.canvasWidth}</span>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                Canvas Height (px)
              </label>
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(parseInt(e.target.value) || 400)}
                min="100"
                max="2000"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: errors.canvasHeight ? '2px solid #dc3545' : '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              {errors.canvasHeight && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.canvasHeight}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Background Number
            </label>
            <input
              type="number"
              value={bgnumber}
              onChange={(e) => setBgnumber(parseInt(e.target.value) || 0)}
              min="0"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Background template number (0 = blank)
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Scale Factors (JSON)
            </label>
            <textarea
              value={scaleFactors}
              onChange={(e) => setScaleFactors(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '60px',
                padding: '10px', 
                border: errors.scaleFactors ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              placeholder='[100, 200, 75, 84, 25, 35]'
            />
            {errors.scaleFactors && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.scaleFactors}</span>}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Array of scale factors for canvas. Example: [100, 200, 75, 84, 25, 35]
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Visible Modes (JSON, optional)
            </label>
            <textarea
              value={visibleModes}
              onChange={(e) => setVisibleModes(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '60px',
                padding: '10px', 
                border: errors.visibleModes ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              placeholder='["line", "curve", "point"] or leave empty for all modes'
            />
            {errors.visibleModes && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.visibleModes}</span>}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Limit which drawing modes are available. Leave empty or "undefined" for all modes.
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Axis Labels (JSON)
            </label>
            <input
              type="text"
              value={axisLabels}
              onChange={(e) => setAxisLabels(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.axisLabels ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              placeholder='["x", "y"]'
            />
            {errors.axisLabels && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.axisLabels}</span>}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Array of two labels for x and y axes. Example: ["quantity", "price"]
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hideLabels}
                onChange={(e) => setHideLabels(e.target.checked)}
                style={{ marginRight: '10px', width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 600, color: '#333' }}>Hide Axis Labels</span>
            </label>
            <small style={{ display: 'block', marginTop: '5px', marginLeft: '28px', color: '#666' }}>
              Check to hide axis labels on the canvas
            </small>
          </div>
        </section>

        {/* Grading Settings Section */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #0075b4', paddingBottom: '10px' }}>
            ✅ Grading Settings
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
              Grading Mode
            </label>
            <select
              value={gradingMode}
              onChange={(e) => setGradingMode(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="completion">Completion - Credit for submitting</option>
              <option value="manual">Manual - Instructor grades manually</option>
              <option value="comparison">Comparison - Compare to reference drawing</option>
            </select>
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              How this exercise will be graded
            </small>
          </div>

          {gradingMode === 'comparison' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                  Similarity Threshold
                </label>
                <input
                  type="number"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.7)}
                  min="0"
                  max="1"
                  step="0.05"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: errors.similarityThreshold ? '2px solid #dc3545' : '2px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.similarityThreshold && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.similarityThreshold}</span>}
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Minimum similarity score (0-1) required to pass
                </small>
              </div>

              <div style={{ 
                background: '#fff9e6', 
                border: '1px solid #ffc107', 
                borderLeft: '3px solid #ffc107',
                padding: '15px', 
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Reference Drawing</h4>
                <p style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '14px' }}>
                  Create a reference drawing that student submissions will be compared against.
                </p>
                <button
                  onClick={() => setShowReferenceEditor(!showReferenceEditor)}
                  style={{
                    padding: '8px 16px',
                    background: '#0075b4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {showReferenceEditor ? '▼ Hide Reference Editor' : '▶ Show Reference Editor'}
                </button>
              </div>

              {showReferenceEditor && (
                <div style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <DrawingApp
                    index={1}
                    AssessName="studio"
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    scaleFactors={JSON.parse(scaleFactors)}
                    submitButtonClicked={submitButtonClicked}
                    modes={modes}
                    visibleModes={visibleModes === 'undefined' || !visibleModes.trim() ? undefined : JSON.parse(visibleModes)}
                    bgnumber={bgnumber}
                    axisLabels={JSON.parse(axisLabels)}
                    initialDrawing={{}}
                    hideLabels={hideLabels}
                  />
                  <button
                    onClick={saveReferenceDrawing}
                    style={{
                      marginTop: '10px',
                      padding: '10px 20px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    💾 Save Reference Drawing
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Save Status */}
        {saveStatus && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px',
            borderRadius: '4px',
            background: saveStatus === 'success' ? '#d4edda' : saveStatus === 'error' ? '#f8d7da' : '#fff3cd',
            border: `1px solid ${saveStatus === 'success' ? '#c3e6cb' : saveStatus === 'error' ? '#f5c6cb' : '#ffeaa7'}`,
            color: saveStatus === 'success' ? '#155724' : saveStatus === 'error' ? '#721c24' : '#856404'
          }}>
            {saveStatus === 'saving' && '⏳ Saving...'}
            {saveStatus === 'success' && '✅ Settings saved successfully!'}
            {saveStatus === 'error' && '❌ Error saving settings. Please check the form for errors.'}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              background: '#0075b4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            💾 Save Changes
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 24px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Loader for XBlock React Studio view
function initStudioView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: StudioInitData) {
  if ('jquery' in container) container = container[0];
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  root.render(
    <IntlProvider messages={(messages as any)[languageCode]} locale={languageCode} defaultLocale="en">
      <StudioView
        runtime={new BoundRuntime(runtime, container)}
        initData={initData}
      />
    </IntlProvider>
  );
}

(globalThis as any).initDrawingXBlockStudioView = initStudioView;
