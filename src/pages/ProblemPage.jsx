import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

const langMap = {
        cpp: 'C++',
        java: 'Java',
        javascript: 'JavaScript'
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId}  = useParams();

  

  const { handleSubmit } = useForm();

 useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
          console.log("hi meri jan");  
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
       
              
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;

        setProblem(response.data);
        
        setCode(initialCode);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       setLoading(false);
       setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <span className="loading loading-spinner loading-lg text-orange-500"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900 text-gray-100">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 flex flex-col border-r border-gray-700">
        {/* Left Tabs */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeLeftTab === 'description' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveLeftTab('description')}
          >
            Description
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeLeftTab === 'editorial' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveLeftTab('editorial')}
          >
            Editorial
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeLeftTab === 'solutions' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveLeftTab('solutions')}
          >
            Solutions
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeLeftTab === 'submissions' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveLeftTab('submissions')}
          >
            Submissions
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeLeftTab === 'chatAI' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveLeftTab('chatAI')}
          >
            💬 AI Chat
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-semibold text-white">{problem.title}</h1>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-200 border border-blue-700">
                      {problem.tags}
                    </span>
                  </div>

                  <div className="text-gray-300 leading-relaxed">
                    <div className="whitespace-pre-wrap text-sm">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-white">Examples</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold mb-3 text-white">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono">
                            <div className="bg-gray-900 p-2 rounded">
                              <span className="text-gray-400">Input:</span> <span className="text-green-400">{example.input}</span>
                            </div>
                            <div className="bg-gray-900 p-2 rounded">
                              <span className="text-gray-400">Output:</span> <span className="text-blue-400">{example.output}</span>
                            </div>
                            <div className="bg-gray-900 p-2 rounded text-gray-300">
                              <span className="text-gray-400">Explanation:</span> {example.explanation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">Editorial</h2>
                  <div className="text-gray-300">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                          <h3 className="font-semibold text-white">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-4 bg-gray-900">
                          <pre className="bg-black p-4 rounded text-sm overflow-x-auto text-green-400">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">My Submissions</h2>
                  <div className="text-gray-400">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">Chat with AI</h2>
                  <div className="text-gray-300">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col bg-gray-900">
        {/* Right Tabs */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeRightTab === 'code' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveRightTab('code')}
          >
            Code
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeRightTab === 'testcase' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveRightTab('testcase')}
          >
            Testcase
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeRightTab === 'result' 
                ? 'text-white border-b-2 border-orange-500 bg-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveRightTab('result')}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        selectedLanguage === lang 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
                <button 
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  Console
                </button>
                <div className="flex gap-2">
                  <button
                    className={`px-5 py-2 text-sm font-medium rounded bg-gray-700 text-white hover:bg-gray-600 transition-all ${loading ? 'opacity-50' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {loading ? '⏳ Running...' : '▶ Run'}
                  </button>
                  <button
                    className={`px-5 py-2 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-500 transition-all ${loading ? 'opacity-50' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {loading ? '⏳ Submitting...' : '✓ Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
              <h3 className="font-semibold mb-4 text-white">Test Results</h3>
              {runResult ? (
                <div className={`p-4 rounded-lg border-l-4 ${
                  runResult.success 
                    ? 'bg-green-900 border-green-500' 
                    : 'bg-red-900 border-red-500'
                }`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold text-green-300 text-lg">✅ All test cases passed!</h4>
                        <div className="mt-3 space-y-1 text-sm text-gray-300">
                          <p>Runtime: <span className="text-green-400">{runResult.runtime} sec</span></p>
                          <p>Memory: <span className="text-green-400">{runResult.memory} KB</span></p>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-gray-800 border border-gray-700 p-3 rounded text-xs">
                              <div className="font-mono space-y-1">
                                <div><span className="text-gray-400">Input:</span> <span className="text-white">{tc.stdin}</span></div>
                                <div><span className="text-gray-400">Expected:</span> <span className="text-blue-400">{tc.expected_output}</span></div>
                                <div><span className="text-gray-400">Output:</span> <span className="text-green-400">{tc.stdout}</span></div>
                                <div className="text-green-400 font-semibold">✓ Passed</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-red-300 text-lg">❌ Test Failed</h4>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-gray-800 border border-gray-700 p-3 rounded text-xs">
                              <div className="font-mono space-y-1">
                                <div><span className="text-gray-400">Input:</span> <span className="text-white">{tc.stdin}</span></div>
                                <div><span className="text-gray-400">Expected:</span> <span className="text-blue-400">{tc.expected_output}</span></div>
                                <div><span className="text-gray-400">Output:</span> <span className="text-red-400">{tc.stdout}</span></div>
                                <div className={`font-semibold ${tc.status_id==3 ? 'text-green-400' : 'text-red-400'}`}>
                                  {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
              <h3 className="font-semibold mb-4 text-white">Submission Result</h3>
              {submitResult ? (
                <div className={`p-6 rounded-lg border-l-4 ${
                  submitResult.accepted 
                    ? 'bg-green-900 border-green-500' 
                    : 'bg-red-900 border-red-500'
                }`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-2xl text-green-300">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2 text-gray-200">
                          <p>Test Cases Passed: <span className="text-green-400 font-semibold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span></p>
                          <p>Runtime: <span className="text-green-400 font-semibold">{submitResult.runtime} sec</span></p>
                          <p>Memory: <span className="text-green-400 font-semibold">{submitResult.memory} KB</span></p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-2xl text-red-300">❌ {submitResult.error}</h4>
                        <div className="mt-4 space-y-2 text-gray-200">
                          <p>Test Cases Passed: <span className="text-red-400 font-semibold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;