#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Language detection using franc library (already in package.json)
const { franc } = require('franc');

class KazakhTranslator {
  constructor(options = {}) {
    this.translatedCache = new Map();
    this.backupDir = path.join(process.cwd(), '.translation-backup');
    this.logFile = path.join(process.cwd(), 'translation-log.json');
    this.translations = [];
    this.dryRun = options.dryRun || false;
  }

  // Create backup directory
  createBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    console.log('✅ Backup directory created');
  }

  // Detect language of text
  detectLanguage(text) {
    const cleanText = text.trim().replace(/[^a-zA-Zа-яёА-ЯЁ\s]/g, '');
    if (cleanText.length < 3) return 'unknown';
    
    const detected = franc(cleanText);
    
    // Map franc codes to our language codes
    const langMap = {
      'eng': 'en',
      'rus': 'ru',
      'kaz': 'kk',
      'und': 'unknown'
    };
    
    return langMap[detected] || 'unknown';
  }

  // Check if text contains Cyrillic characters (Russian/Kazakh)
  isCyrillic(text) {
    return /[а-яёА-ЯЁ]/.test(text);
  }

  // Check if text is likely English
  isEnglish(text) {
    return /^[a-zA-Z\s.,!?;:()\-"']+$/.test(text.trim());
  }

  // Free translation using Google Translate (unofficial API)
  async translateText(text, fromLang, toLang = 'kk') {
    const cacheKey = `${fromLang}-${toLang}-${text}`;
    
    if (this.translatedCache.has(cacheKey)) {
      return this.translatedCache.get(cacheKey);
    }

    try {
      // Using a free Google Translate API endpoint
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodedText}`;
      
      const response = await this.makeHttpRequest(url);
      const data = JSON.parse(response);
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translation = data[0][0][0];
        this.translatedCache.set(cacheKey, translation);
        return translation;
      }
    } catch (error) {
      console.warn(`⚠️  Translation failed for "${text}": ${error.message}`);
    }
    
    return text; // Return original if translation fails
  }

  // Make HTTP request
  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  // Extract strings from JavaScript/TypeScript files
  extractStrings(content) {
    const strings = [];
    
    // Regex patterns for different string types
    const patterns = [
      // Double quoted strings
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      // Single quoted strings
      /'([^'\\]*(\\.[^'\\]*)*)'/g,
      // Template literals (basic)
      /`([^`\\]*(\\.[^`\\]*)*)`/g,
      // JSX text content
      />([^<>{}]+)</g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1] || match[0];
        if (text && text.trim().length > 2) {
          strings.push({
            text: text.trim(),
            fullMatch: match[0],
            index: match.index
          });
        }
      }
    });

    return strings;
  }

  // Process a single file
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Create backup
      const backupPath = path.join(this.backupDir, relativePath);
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupPath, content);

      const strings = this.extractStrings(content);
      let modifiedContent = content;
      let hasChanges = false;
      
      console.log(`\n📄 Processing: ${relativePath}`);
      
      for (const stringInfo of strings) {
        const { text, fullMatch } = stringInfo;
        
        // Skip if text is too short or contains only special characters
        if (text.length < 3 || /^[\s\W]*$/.test(text)) continue;
        
        // Skip URLs, file paths, and technical strings
        if (/^(https?:\/\/|\.\/|\/|[a-z]+\.[a-z]+|\w+_\w+)/.test(text)) continue;
        
        // Skip CSS classes and technical patterns
        if (/^[a-z-]+\s[a-z-]+/.test(text) || // CSS class patterns like "bg-slate-100 text-slate-800"
            /^@\//.test(text) || // Import paths like "@/components/ui/dialog"
            /^[a-z]+(-[a-z0-9]+)+/.test(text) || // Kebab-case technical strings
            /^[a-z]+\.[a-z]+/.test(text) || // Dot notation
            /^\w+\s*=\s*/.test(text) || // Variable assignments
            /^\([^)]*\);?$/.test(text) || // Function calls or parentheses
            /^[A-Z][a-zA-Z]*$/.test(text) || // Single PascalCase words (likely component names)
            /^[a-z]+[A-Z]/.test(text) || // camelCase technical terms
            /\$\{/.test(text) || // Template literals with variables
            /^[\w\s]*\$\{/.test(text) || // Strings containing template variables
            /console\.|log\(|error\(|warn\(/.test(text) || // Console methods
            /^[\s\n\\]*$/.test(text) || // Only whitespace, newlines, or backslashes
            /className|onClick|onChange|onSubmit|useState|useEffect|props|ref|key|id|data-/.test(text)) continue; // React/JS keywords
        
        const detectedLang = this.detectLanguage(text);
        
        if (detectedLang === 'en' || detectedLang === 'ru') {
          console.log(`  🔍 Found ${detectedLang.toUpperCase()}: "${text}"`);
          
          const translation = await this.translateText(text, detectedLang, 'kk');
          
          if (translation !== text) {
            console.log(`  ✅ Translated to: "${translation}"`);
            
            // Replace in content
            const newFullMatch = fullMatch.replace(text, translation);
            modifiedContent = modifiedContent.replace(fullMatch, newFullMatch);
            hasChanges = true;
            
            // Log translation
            this.translations.push({
              file: relativePath,
              original: text,
              translated: translation,
              language: detectedLang
            });
          }
        }
      }
      
      if (hasChanges) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, modifiedContent);
          console.log(`  💾 File updated: ${relativePath}`);
        } else {
          console.log(`  🔍 [DRY RUN] Would update: ${relativePath}`);
        }
      } else {
        console.log(`  ⏭️  No changes needed: ${relativePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  // Get all files to process
  getFilesToProcess() {
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.translation-backup'];
    
    const files = [];
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !excludeDirs.includes(item)) {
          walkDir(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item))) {
          // Skip this script file itself to avoid translating its own code
          if (!fullPath.includes('translate-to-kazakh.js')) {
            files.push(fullPath);
          }
        }
      }
    };
    
    walkDir(process.cwd());
    return files;
  }

  // Save translation log
  saveLog() {
    const logData = {
      timestamp: new Date().toISOString(),
      totalTranslations: this.translations.length,
      translations: this.translations
    };
    
    fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
    console.log(`\n📊 Translation log saved to: ${this.logFile}`);
  }

  // Main execution
  async run() {
    console.log(`🚀 Starting Kazakh translation process${this.dryRun ? ' (DRY RUN)' : ''}...`);
    
    if (!this.dryRun) {
      this.createBackup();
    }
    
    const files = this.getFilesToProcess();
    console.log(`📁 Found ${files.length} files to process`);
    
    for (const file of files) {
      await this.processFile(file);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.saveLog();
    
    console.log('\n🎉 Translation process completed!');
    console.log(`📈 Total translations: ${this.translations.length}`);
    console.log(`💾 Backups saved in: ${this.backupDir}`);
    console.log(`📋 Log file: ${this.logFile}`);
  }
}

// Run the translator
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  const translator = new KazakhTranslator({ dryRun });
  translator.run().catch(console.error);
}

module.exports = KazakhTranslator;