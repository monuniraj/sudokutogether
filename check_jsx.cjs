const fs = require('fs');
const src = fs.readFileSync('src/App.tsx', 'utf8');
const returnStart = src.indexOf('  return (');
const returnEnd = src.length;
const returnCode = src.substring(returnStart, returnEnd);

// Count opening and closing tags properly
let openTag = 0;
let closeTag = 0;

// Find all <AnimatePresence> and </AnimatePresence>
const openMatches = returnCode.match(/<AnimatePresence>/g);
const closeMatches = returnCode.match(/<\/AnimatePresence>/g);

console.log('Opening <AnimatePresence> tags:', openMatches ? openMatches.length : 0);
console.log('Closing </AnimatePresence> tags:', closeMatches ? closeMatches.length : 0);

// Find all <div and </div>
const divOpen = returnCode.match(/<div[^>]*>/g);
const divClose = returnCode.match(/<\/div>/g);
console.log('Opening <div> tags:', divOpen ? divOpen.length : 0);
console.log('Closing </div> tags:', divClose ? divClose.length : 0);

// Find all <motion.div and </motion.div>
const motionOpen = returnCode.match(/<motion\.div[^>]*>/g);
const motionClose = returnCode.match(/<\/motion\.div>/g);
console.log('Opening <motion.div> tags:', motionOpen ? motionOpen.length : 0);
console.log('Closing </motion.div> tags:', motionClose ? motionClose.length : 0);

// Find all footer tags
const footerOpen = returnCode.match(/<footer[^>]*>/g);
const footerClose = returnCode.match(/<\/footer>/g);
console.log('Opening <footer> tags:', footerOpen ? footerOpen.length : 0);
console.log('Closing </footer> tags:', footerClose ? footerClose.length : 0);

// Count lines in the return
const returnLines = returnCode.split('\n').length;
console.log('Total lines in return:', returnLines);
