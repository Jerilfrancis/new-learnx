import React, { useState } from "react";
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  X,
  Sparkles,
  Clock,
  Layers,
  ChevronDown,
} from "lucide-react";
import { codeApi } from "../../services/api";

interface CodePlaygroundModalProps {
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
}

const STARTER_CODES: Record<string, string> = {
  javascript: `// JavaScript ES6+ Sandbox
function calculateFibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

console.log("Fibonacci Sequence (first 10):", calculateFibonacci(10));
console.log("Current Timestamp:", new Date().toISOString());`,

  python: `# Python 3 Algorithm Challenge
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45]
print("Original:", numbers)
print("Sorted Array:", quick_sort(numbers))`,

  typescript: `// TypeScript Strong-Typing Sandbox
interface Developer {
  name: string;
  skills: string[];
  level: number;
}

const dev: Developer = {
  name: "Alex Vance",
  skills: ["React", "Node.js", "Docker", "Go"],
  level: 42
};

console.log(\`Developer \${dev.name} is Level \${dev.level}\`);
console.log("Active Stack:", dev.skills.join(", "));`,

  cpp: `// C++ 17 Modern High-Performance Program
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "LearnX C++ Sandbox\\n";
    std::cout << "Sum of elements: " << sum << std::endl;
    return 0;
}`,

  rust: `// Rust Safe Memory & Concurrency Sandbox
fn main() {
    let message = "LearnX Rust Engine";
    println!("Hello from {}!", message);
    
    let numbers: Vec<i32> = (1..=5).map(|x| x * x).collect();
    println!("Squared Vector: {:?}", numbers);
}`,

  go: `// Go High-Concurrency Engine
package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("LearnX Go Playground")
	fmt.Println("Current time:", time.Now().Format(time.RFC3339))
}`,
};

export const CodePlaygroundModal: React.FC<CodePlaygroundModalProps> = ({
  onClose,
  initialCode,
  initialLanguage = "javascript",
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || STARTER_CODES[initialLanguage] || STARTER_CODES.javascript);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [stderr, setStderr] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "stdin">("output");

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(STARTER_CODES[newLang] || STARTER_CODES.javascript);
    setOutput(null);
    setStderr(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Compiling and executing in isolated sandbox...");
    setStderr(null);
    setExecTime(null);
    setActiveTab("output");

    try {
      const res = await codeApi.execute(language, code, stdin);
      setOutput(res.output || res.stdout || "Program exited with status 0.");
      if (res.stderr) setStderr(res.stderr);
      if (res.executionTime) setExecTime(res.executionTime);
    } catch (err: any) {
      setOutput(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#112D4E] text-[#112D4E]/[.55] w-full max-w-5xl rounded-lg shadow-md border border-[#112D4E]/[.12] flex flex-col h-[88vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Control Bar */}
        <div className="p-4 bg-[#112D4E] border-b border-[#112D4E]/[.12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3F72AF] text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Interactive Multi-Language Code Sandbox</h2>
              <p className="text-[10px] text-[#112D4E]/[.55]">Piston Remote Execution Engine (Isolated Container)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#112D4E] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#112D4E]/[.12] text-[#112D4E]/[.55] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] cursor-pointer"
              >
                <option value="javascript">JavaScript (Node 18)</option>
                <option value="typescript">TypeScript 5.0</option>
                <option value="python">Python 3.10</option>
                <option value="cpp">C++ 17</option>
                <option value="rust">Rust 1.68</option>
                <option value="go">Go 1.16</option>
              </select>
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-5 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Code</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#112D4E]/[.55] hover:text-white rounded-full hover:bg-[#112D4E] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor & Console Split Window */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#112D4E]/[.35] overflow-hidden">
          {/* Code Editor Pane */}
          <div className="flex flex-col h-full bg-[#112D4E]">
            <div className="px-4 py-2 bg-[#112D4E]/60 border-b border-[#112D4E]/[.12] flex items-center justify-between text-[11px] text-[#112D4E]/[.55]">
              <span className="font-mono uppercase font-bold text-[#112D4E]">main.{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "rust" ? "rs" : language === "go" ? "go" : language === "typescript" ? "ts" : "js"}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Copy Source Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#112D4E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setCode(STARTER_CODES[language] || "")}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Reset to Starter Template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent text-[#112D4E] font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed selection:bg-[#112D4E] overflow-y-auto"
            />
          </div>

          {/* Output & STDIN Console Pane */}
          <div className="flex flex-col h-full bg-[#112D4E]">
            <div className="px-4 py-2 bg-[#112D4E]/60 border-b border-[#112D4E]/[.12] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("output")}
                  className={`font-bold pb-0.5 cursor-pointer ${
                    activeTab === "output" ? "text-white border-b-2 border-[#112D4E]/[.12]" : "text-[#112D4E]/[.55] hover:text-[#112D4E]/[.55]"
                  }`}
                >
                  Terminal Output
                </button>
                <button
                  onClick={() => setActiveTab("stdin")}
                  className={`font-bold pb-0.5 cursor-pointer ${
                    activeTab === "stdin" ? "text-white border-b-2 border-[#112D4E]/[.12]" : "text-[#112D4E]/[.55] hover:text-[#112D4E]/[.55]"
                  }`}
                >
                  Custom STDIN
                </button>
              </div>

              {execTime && (
                <span className="text-[#112D4E] font-mono flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3" /> {execTime}
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
              {activeTab === "output" ? (
                output ? (
                  <div className="space-y-2">
                    <pre className="text-[#112D4E]/[.55] whitespace-pre-wrap leading-relaxed">{output}</pre>
                    {stderr && (
                      <div className="p-2 rounded-xl bg-[#112D4E]/40 border border-[#112D4E]/[.12] text-[#112D4E] text-[11px] whitespace-pre-wrap">
                        {stderr}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[#112D4E]/[.55] text-center py-20">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Click "Run Code" to compile and view output</p>
                  </div>
                )
              ) : (
                <div className="space-y-2 h-full flex flex-col">
                  <p className="text-[11px] text-[#112D4E]/[.55]">Pass custom text/inputs to standard input (stdin):</p>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter standard input values here..."
                    className="flex-1 w-full bg-[#112D4E] border border-[#112D4E]/[.12] rounded-xl p-3 text-xs text-[#112D4E]/[.55] focus:outline-none focus:border-[#112D4E]/[.12] resize-none font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
