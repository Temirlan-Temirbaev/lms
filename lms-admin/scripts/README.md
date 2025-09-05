# Kazakh Translation Script

This script automatically detects hardcoded English and Russian text in your codebase and replaces it with Kazakh translations using Google Translate's free API.

## Features

- 🔍 **Language Detection**: Automatically identifies English and Russian text
- 🌐 **Free Translation**: Uses Google Translate's free API endpoint
- 💾 **Backup System**: Creates backups before making changes
- 📊 **Detailed Logging**: Tracks all translations made
- 🎯 **Smart Filtering**: Skips URLs, file paths, and technical strings
- 🔄 **Caching**: Avoids re-translating the same text

## Usage

### Run Translation
```bash
npm run translate:kazakh
```

### Dry Run (Preview Only)
```bash
npm run translate:dry-run
```

### Direct Execution
```bash
node scripts/translate-to-kazakh.js
```

## What It Does

1. **Scans Files**: Processes all `.ts`, `.tsx`, `.js`, `.jsx` files
2. **Detects Languages**: Uses the `franc` library to identify English/Russian text
3. **Creates Backups**: Saves original files to `.translation-backup/` directory
4. **Translates Text**: Converts detected text to Kazakh using Google Translate
5. **Updates Files**: Replaces original text with translations
6. **Logs Results**: Saves detailed log to `translation-log.json`

## File Types Processed

- TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`)
- String literals in double quotes: `"Hello World"`
- String literals in single quotes: `'Hello World'`
- Template literals: `` `Hello World` ``
- JSX text content: `<div>Hello World</div>`

## What Gets Skipped

- URLs and file paths
- Technical identifiers (e.g., `className`, `data-testid`)
- Short strings (less than 3 characters)
- Strings with only special characters
- Files in excluded directories (`node_modules`, `.git`, `.next`, etc.)

## Output Files

### Backup Directory
```
.translation-backup/
├── components/
│   ├── ui/
│   └── ...
├── app/
└── ...
```

### Translation Log
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalTranslations": 45,
  "translations": [
    {
      "file": "components/ui/button.tsx",
      "original": "Click me",
      "translated": "Мені басыңыз",
      "language": "en"
    }
  ]
}
```

## Safety Features

- **Automatic Backups**: Original files are preserved
- **Rate Limiting**: Small delays between API calls
- **Error Handling**: Continues processing if individual translations fail
- **Rollback Capability**: Easy to restore from backups

## Restoring from Backup

If you need to restore original files:

```bash
# Copy all files back from backup
cp -r .translation-backup/* .

# Or restore specific files
cp .translation-backup/components/ui/button.tsx components/ui/button.tsx
```

## Troubleshooting

### Translation Fails
- Check internet connection
- API might be rate-limited (wait a few minutes)
- Some text might not be translatable

### Unexpected Results
- Check the translation log for details
- Language detection might misidentify some text
- Technical terms might not translate well

### Performance
- Large codebases may take several minutes
- Script includes delays to avoid rate limiting
- Consider running on smaller directories first

## Customization

You can modify the script to:
- Change target language (currently set to Kazakh 'kk')
- Adjust file extensions to process
- Modify exclusion patterns
- Change translation service

## Dependencies

- `franc`: Language detection
- `https`: HTTP requests for translation API
- `fs`, `path`: File system operations

All dependencies are already included in your project.