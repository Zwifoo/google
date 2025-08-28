// Test cases for speech recognition sensitivity
// Run this in browser console

const testCases = [
  // Should NOT trigger (false positives to avoid)
  { input: "saya suka sepak bola", expected: null, reason: "No trigger word" },
  { input: "sepak bola indonesia", expected: null, reason: "No trigger word" },
  { input: "main sepak bola", expected: null, reason: "No trigger word" },
  
  // Should trigger correctly
  { input: "pilih sepak bola", expected: "sepak bola", reason: "Clear trigger + keyword" },
  { input: "googling sepak bola", expected: "sepak bola", reason: "Clear trigger + keyword" },
  { input: "memilih laptop gaming", expected: "laptop gaming", reason: "Clear trigger + keyword" },
  { input: "milih tas hitam", expected: "tas hitam", reason: "Clear trigger + keyword" },
  
  // Edge cases
  { input: "pilih", expected: null, reason: "Trigger without keyword" },
  { input: "pilih aja deh sepak bola", expected: "sepak bola", reason: "Trigger with particles" },
  { input: "pilih sepak bola yang bagus", expected: "sepak bola bagus", reason: "Filter stop words" }
];

// Function to test extraction
function testExtraction() {
  // Import the function (this assumes you can access it)
  const { extractKeyword } = window;
  
  if (!extractKeyword) {
    console.log("❌ extractKeyword function not available in window");
    return;
  }
  
  console.log("🧪 Starting Speech Recognition Tests...\n");
  
  testCases.forEach((testCase, index) => {
    const result = extractKeyword(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${success ? '✅' : '❌'}`);
    console.log(`  Input: "${testCase.input}"`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got: ${result}`);
    console.log(`  Reason: ${testCase.reason}\n`);
  });
}

console.log("🎯 Speech Recognition Test Cases Ready!");
console.log("To run tests, call: testExtraction()");
console.log("\n📝 Manual Test Commands:");
testCases.filter(t => t.expected !== null).forEach(t => {
  console.log(`🗣️ Say: "${t.input}" → Should extract: "${t.expected}"`);
});

export { testCases, testExtraction };
