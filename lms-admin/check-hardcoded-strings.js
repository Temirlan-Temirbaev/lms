#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to detect if a string contains English or Russian text that needs translation
function needsTranslation(text) {
  const cleanText = text.trim();
  
  // Skip empty strings
  if (!cleanText) return false;
  
  // Skip technical patterns
  const technicalPatterns = [
    /^[a-z-]+$/, // CSS classes like 'flex', 'gap-4'
    /^\d+$/, // Numbers
    /^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|svg|gif|webp)$/, // Image files
    /^https?:\/\//, // URLs
    /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email addresses
    /^[A-Z_][A-Z0-9_]*$/, // Constants like 'API_URL'
    /^[a-z][a-zA-Z0-9]*$/, // Single camelCase variables
    /^\$\{.*\}$/, // Template literals
    /^className$/, // React className
    /^[a-z]+="[^"]*"$/, // HTML attributes
    /^[a-z]+-[a-z-]*$/, // CSS classes
    /^text-/, // Tailwind text classes
    /^bg-/, // Tailwind background classes
    /^flex/, // Tailwind flex classes
    /^grid/, // Tailwind grid classes
    /^p-/, // Tailwind padding classes
    /^m-/, // Tailwind margin classes
    /^w-/, // Tailwind width classes
    /^h-/, // Tailwind height classes
    /^gap-/, // Tailwind gap classes
    /^rounded/, // Tailwind border radius
    /^border/, // Tailwind border classes
    /^shadow/, // Tailwind shadow classes
    /^hover:/, // Tailwind hover states
    /^focus:/, // Tailwind focus states
    /^active:/, // Tailwind active states
    /^\{[^}]*\}$/, // JSX expressions
    /^[a-zA-Z0-9_]+\([^)]*\)$/, // Function calls
    /^use client$/, // React directive
    /^use server$/, // React directive
    /^@\//, // Import paths starting with @/
    /^\/[a-zA-Z0-9\/-]+$/, // URL paths
    /^[a-zA-Z0-9\/-]+\/[a-zA-Z0-9\/-]+$/, // Import paths
    /^Content-Type$/, // HTTP headers
    /^application\/json$/, // MIME types
    /^[a-z]+\.[a-zA-Z0-9]+$/, // Object properties
    /^next\//, // Next.js imports
    /^react/, // React imports
    /^lucide-react/, // Icon imports
  ];
  
  // Check if it's a technical string
  if (technicalPatterns.some(pattern => pattern.test(cleanText))) {
    return false;
  }
  
  // Check for common English words that definitely need translation
  const englishWords = [
    'loading', 'error', 'success', 'failed', 'save', 'edit', 'delete', 'create', 'add',
    'update', 'cancel', 'submit', 'confirm', 'yes', 'no', 'ok', 'close', 'open',
    'search', 'filter', 'sort', 'view', 'show', 'hide', 'upload', 'download',
    'login', 'logout', 'register', 'password', 'email', 'username', 'name',
    'title', 'description', 'content', 'message', 'notification', 'alert',
    'warning', 'info', 'help', 'about', 'contact', 'home', 'dashboard',
    'settings', 'profile', 'account', 'user', 'admin', 'role', 'permission',
    'course', 'lesson', 'test', 'question', 'answer', 'result', 'score',
    'progress', 'level', 'status', 'active', 'inactive', 'pending', 'completed',
    'welcome', 'hello', 'goodbye', 'please', 'thank', 'sorry', 'excuse',
    'next', 'previous', 'back', 'forward', 'start', 'finish', 'continue',
    'required', 'optional', 'invalid', 'valid', 'empty', 'full', 'new', 'old',
    'select', 'choose', 'pick', 'option', 'menu', 'button', 'link', 'form',
    'input', 'field', 'label', 'placeholder', 'tooltip', 'modal', 'dialog',
    'popup', 'dropdown', 'checkbox', 'radio', 'toggle', 'switch', 'slider',
    'tab', 'page', 'section', 'header', 'footer', 'sidebar', 'navigation',
    'breadcrumb', 'pagination', 'table', 'row', 'column', 'cell', 'grid',
    'list', 'item', 'card', 'panel', 'widget', 'component', 'element',
    'text', 'image', 'video', 'audio', 'file', 'document', 'folder',
    'copy', 'paste', 'cut', 'undo', 'redo', 'refresh', 'reload', 'reset',
    'clear', 'remove', 'insert', 'replace', 'find', 'replace', 'match',
    'compare', 'merge', 'split', 'join', 'combine', 'separate', 'group',
    'ungroup', 'expand', 'collapse', 'minimize', 'maximize', 'resize',
    'move', 'drag', 'drop', 'click', 'hover', 'focus', 'blur', 'select'
  ];
  
  const lowerText = text.toLowerCase();
  const hasEnglishWords = englishWords.some(word => lowerText.includes(word));
  
  // Check for Russian/Cyrillic letters (excluding Kazakh-specific characters)
  const hasRussian = /[а-яё]/i.test(text) && !/[әіңғүұқөһ]/i.test(text);
  
  // Check for English sentences (multiple words with spaces)
  const hasEnglishSentence = /[a-zA-Z].*\s+.*[a-zA-Z]/.test(text) && text.length > 5;
  
  return hasEnglishWords || hasRussian || hasEnglishSentence;
}

// Function to scan files for hardcoded strings
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const lines = content.split('\n');
    
    // First, handle multi-line JSX text content by processing the entire file
    const multiLineJsxMatches = [...content.matchAll(/>\s*([^<>{}]+?)\s*</gs)];
    multiLineJsxMatches.forEach(match => {
      const text = match[1].trim();
      if (text && needsTranslation(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const columnNumber = content.substring(0, match.index).split('\n').pop().length + 1;
        issues.push({
          line: lineNumber,
          column: columnNumber,
          text: text,
          type: 'JSX text content'
        });
      }
    });
    
    lines.forEach((line, index) => {
      
      // Find strings in quotes (excluding attributes)
      const stringMatches = line.matchAll(/["']([^"']{2,})["']/g);
      for (const match of stringMatches) {
        const text = match[1].trim();
        // Skip if it's likely an attribute value or technical string
        if (text && needsTranslation(text) && !line.includes(`=${match[0]}`)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'quoted string'
          });
        }
      }
      
      // Find template literals with text
      const templateMatches = line.matchAll(/`([^`]*[a-zA-Z][^`]*)`/g);
      for (const match of templateMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text) && !text.includes('${')) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'template literal'
          });
        }
      }
      
      // Find placeholder attributes
      const placeholderMatches = line.matchAll(/placeholder\s*=\s*["']([^"']+)["']/g);
      for (const match of placeholderMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'placeholder attribute'
          });
        }
      }
      
      // Find title attributes
      const titleMatches = line.matchAll(/title\s*=\s*["']([^"']+)["']/g);
      for (const match of titleMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'title attribute'
          });
        }
      }
      
      // Find alt attributes
      const altMatches = line.matchAll(/alt\s*=\s*["']([^"']+)["']/g);
      for (const match of altMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'alt attribute'
          });
        }
      }
      
      // Find aria-label attributes
      const ariaLabelMatches = line.matchAll(/aria-label\s*=\s*["']([^"']+)["']/g);
      for (const match of ariaLabelMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'aria-label attribute'
          });
        }
      }
      
      // Find aria-describedby content
      const ariaDescMatches = line.matchAll(/aria-describedby\s*=\s*["']([^"']+)["']/g);
      for (const match of ariaDescMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'aria-describedby attribute'
          });
        }
      }
      
      // Find label prop in JSX
      const labelPropMatches = line.matchAll(/label\s*=\s*["']([^"']+)["']/g);
      for (const match of labelPropMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'label prop'
          });
        }
      }
      
      // Find object properties with text values (like { label: "text" })
      const objectLabelMatches = line.matchAll(/(?:label|title|name|description|placeholder|text)\s*:\s*["']([^"']+)["']/g);
      for (const match of objectLabelMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'object property value'
          });
        }
      }
      
      // Find error/success/info messages in variables
      const messageMatches = line.matchAll(/(?:error|success|message|notification|alert|warning|info)\s*[=:]\s*["']([^"']+)["']/g);
      for (const match of messageMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'message variable'
          });
        }
      }
      
      // Find toast/notification calls
      const toastMatches = line.matchAll(/(?:toast|notification|alert)\s*\(["']([^"']+)["']/g);
      for (const match of toastMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'toast/notification call'
          });
        }
      }
      
      // Find console.log/error messages
      const consoleMatches = line.matchAll(/console\.[a-z]+\(["']([^"']+)["']/g);
      for (const match of consoleMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'console message'
          });
        }
      }
      
      // Find translation function calls that might need updating
      const translationMatches = line.matchAll(/(?:t|i18n|translate|__?)\s*\(["']([^"']+)["']/g);
      for (const match of translationMatches) {
        const text = match[1].trim();
        // These are translation keys, not direct text, but worth noting
        issues.push({
          line: index + 1,
          column: match.index,
          text: text,
          type: 'translation key'
        });
      }
      
      // Find data attributes with text
      const dataAttrMatches = line.matchAll(/data-[a-z-]+\s*=\s*["']([^"']+)["']/g);
      for (const match of dataAttrMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'data attribute'
          });
        }
      }
      
      // Find value attributes in form elements
      const valueMatches = line.matchAll(/value\s*=\s*["']([^"']+)["']/g);
      for (const match of valueMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text) && !line.includes('type="hidden"')) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'value attribute'
          });
        }
      }
      
      // Find defaultValue attributes
      const defaultValueMatches = line.matchAll(/defaultValue\s*=\s*["']([^"']+)["']/g);
      for (const match of defaultValueMatches) {
        const text = match[1].trim();
        if (text && needsTranslation(text)) {
          issues.push({
            line: index + 1,
            column: match.index,
            text: text,
            type: 'defaultValue attribute'
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Function to recursively scan directory
function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const results = {};
  
  function scanDir(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other irrelevant directories
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
            scanDir(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (extensions.includes(ext)) {
            const issues = scanFile(fullPath);
            if (issues.length > 0) {
              results[fullPath] = issues;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentPath}:`, error.message);
    }
  }
  
  scanDir(dirPath);
  return results;
}

try {
  console.log('🔍 Checking for English/Russian text that needs translation to Kazakh...\n');
  
  // Scan files directly for hardcoded strings
  const issuesByFile = scanDirectory('./app');
  let totalIssues = 0;
  
  // Count total issues
  Object.values(issuesByFile).forEach(issues => {
    totalIssues += issues.length;
  });
  
  if (totalIssues === 0) {
    console.log('✅ No English/Russian text found that needs translation!');
    console.log('🎉 All user-facing text appears to be properly translated to Kazakh.');
    console.log('\n📋 Summary:');
    console.log('   • Direct file scanning is working');
    console.log('   • All hardcoded strings have been analyzed');
    console.log('   • No untranslated English or Russian text detected');
    console.log('   • The application is fully localized to Kazakh');
  } else {
    console.log(`⚠️  Found ${totalIssues} English/Russian text(s) that need translation to Kazakh:\n`);
    
    Object.entries(issuesByFile).forEach(([filePath, issues]) => {
          console.log(`📁 ${filePath.replace(process.cwd(), '.')}`);
          
          // Group issues by type for better organization
          const issuesByType = {};
          issues.forEach(issue => {
            const type = issue.type || 'unknown';
            if (!issuesByType[type]) {
              issuesByType[type] = [];
            }
            issuesByType[type].push(issue);
          });
          
          Object.entries(issuesByType).forEach(([type, typeIssues]) => {
             console.log(`   📝 ${type}:`);
             typeIssues.forEach(issue => {
               console.log(`      Line ${issue.line}:${issue.column} - "${issue.text}"`);
             });
           });
           console.log('');
         });
    
    console.log('💡 These strings should be replaced with appropriate Kazakh translations.');
    console.log('🔧 Use the update_file tool to replace these strings with Kazakh equivalents.');
  }
  
} catch (error) {
  console.error('Error scanning files:', error.message);
}