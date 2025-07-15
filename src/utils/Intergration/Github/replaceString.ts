import { searchYmlFiles, getYmlFileContent } from './searchYmlFiles';
import * as yaml from 'js-yaml';
import type { ReplaceResult, FileResult, FileChange } from '../../../types/github';

export async function replaceImageVersion(
  imageName: string,
  newVersion: string
): Promise<ReplaceResult> {
  const result: ReplaceResult = {
    success: false,
    updatedFiles: [],
    errors: [],
    results: []
  };

  try {
    console.log(`🔍 Searching YAML files for image replacement: ${imageName}:${newVersion}`);
    
    const ymlFilesResult = await searchYmlFiles();
    
    if (!ymlFilesResult.success) {
      result.errors.push(`Error searching YAML files: ${ymlFilesResult.error}`);
      return result;
    }

    console.log(`📁 Found ${ymlFilesResult.files.length} YAML files`);

    for (const ymlFile of ymlFilesResult.files) {
      console.log(`\n🔄 Processing file: ${ymlFile}`);
      
      try {
        const fileContentResult = await getYmlFileContent(ymlFile);
        
        if (!fileContentResult.success) {
          const error = `Error getting file content ${ymlFile}: ${fileContentResult.error}`;
          result.errors.push(error);
          result.results.push({
            file: ymlFile,
            success: false,
            error: error
          });
          continue;
        }

        const originalContent = fileContentResult.content!;
        const changes: FileChange[] = [];
        
        const doc = yaml.load(originalContent) as any;
        
        function processContainer(container: any, path: string = '') {
          if (!container || typeof container !== 'object') return;
          
          for (const key of Object.keys(container)) {
            if (key === 'image' && typeof container[key] === 'string') {
              const imageValue = container[key];
              
              // Check if image matches our name
              if (imageValue.startsWith(imageName + ':')) {
                const oldVersion = imageValue.substring(imageName.length + 1);
                const newImageValue = `${imageName}:${newVersion}`;
                
                console.log(`  📦 Found: ${imageValue} -> ${newImageValue}`);
                
                container[key] = newImageValue;
                changes.push({
                  oldVersion,
                  newVersion,
                  line: `${path}${key}: ${imageValue}`
                });
              }
            } else if (typeof container[key] === 'object') {
              processContainer(container[key], `${path}${key}.`);
            }
          }
        }

        function traverse(obj: any, path: string = '') {
          if (!obj || typeof obj !== 'object') return;
          
          for (const key of Object.keys(obj)) {
            if (key === 'container') {
              processContainer(obj[key], `${path}${key}.`);
            } else if (key === 'containers' && Array.isArray(obj[key])) {
              obj[key].forEach((container: any, index: number) => {
                processContainer(container, `${path}${key}[${index}].`);
              });
            } else if (typeof obj[key] === 'object') {
              traverse(obj[key], `${path}${key}.`);
            }
          }
        }

        traverse(doc);

        if (changes.length > 0) {
          const updatedContent = yaml.dump(doc, { lineWidth: -1 });
          
          console.log(`✅ File ${ymlFile} updated (${changes.length} changes)`);
          result.updatedFiles.push(ymlFile);
          result.results.push({
            file: ymlFile,
            success: true,
            originalContent,
            updatedContent,
            changes
          });
        } else {
          console.log(`ℹ️  No changes found in file ${ymlFile}`);
          result.results.push({
            file: ymlFile,
            success: true,
            originalContent,
            updatedContent: originalContent
          });
        }

      } catch (error) {
        const errorMsg = `Error processing file ${ymlFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        result.results.push({
          file: ymlFile,
          success: false,
          error: errorMsg
        });
      }
    }

    result.success = result.errors.length === 0;
    console.log(`\n📊 Result: ${result.updatedFiles.length} files updated, ${result.errors.length} errors`);

  } catch (error) {
    const errorMsg = `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMsg);
    console.error('❌', errorMsg);
  }

  return result;
}