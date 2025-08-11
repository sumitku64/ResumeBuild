// Dynamic PDF Text Extractor with Coordinates
import { pdfjs } from 'react-pdf';
import { TextItem } from './realAnalysisEngine';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface PDFTextExtractorResult {
  textItems: TextItem[];
  pageWidth: number;
  pageHeight: number;
  success: boolean;
  error?: string;
}

interface PDFTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir: string;
  fontName: string;
  hasEOL: boolean;
}

export class DynamicPDFTextExtractor {
  static async extractTextWithCoordinates(
    fileUrl: string, 
    pageNumber: number = 1,
    scale: number = 1.0
  ): Promise<PDFTextExtractorResult> {
    try {
      console.log('🔍 Extracting text from PDF:', fileUrl, 'Page:', pageNumber);
      
      // Load PDF document
      const loadingTask = pdfjs.getDocument({
        url: fileUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      console.log('✅ PDF loaded successfully, pages:', pdf.numPages);
      
      // Get specific page
      const page = await pdf.getPage(pageNumber);
      console.log('📄 Page loaded:', pageNumber);
      
      // Get viewport for scaling
      const viewport = page.getViewport({ scale });
      console.log('📐 Viewport:', viewport.width, 'x', viewport.height);
      
      // Extract text content with positioning
      const textContent = await page.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });
      console.log('📝 Text items found:', textContent.items.length);
      
      // Transform text items with accurate coordinates
      const textItems: TextItem[] = [];
      let itemId = 0;

      textContent.items.forEach((item: any, index: number) => {
        if (item.str && item.str.trim()) {
          // Extract coordinates from transform matrix
          const transform = item.transform;
          const x = transform[4] * scale;
          const y = (viewport.height - transform[5]) * scale; // Flip Y coordinate for screen coords
          
          // Calculate dimensions with better accuracy
          const fontSize = Math.abs(transform[0] || transform[3] || 12);
          const width = Math.max(item.width * scale || item.str.length * fontSize * 0.6, 20);
          const height = Math.max(fontSize * scale, 16);

          const textItem: TextItem = {
            id: `item_${itemId++}`,
            text: item.str.trim(),
            coordinates: {
              x: Math.round(Math.max(0, x)),
              y: Math.round(Math.max(0, y - height)), // Adjust for text baseline
              width: Math.round(width),
              height: Math.round(height)
            },
            pageNumber,
            fontInfo: {
              name: item.fontName || 'unknown',
              size: Math.round(fontSize * scale)
            }
          };

          textItems.push(textItem);
          
          if (index < 5) { // Debug first few items
            console.log(`Item ${index}:`, {
              text: item.str,
              transform,
              calculated: textItem.coordinates
            });
          }
        }
      });

      console.log('✅ Text extraction complete:', textItems.length, 'items processed');

      // Sort items by reading order (top to bottom, left to right)
      textItems.sort((a, b) => {
        const yDiff = a.coordinates.y - b.coordinates.y;
        if (Math.abs(yDiff) < 5) { // Same line tolerance
          return a.coordinates.x - b.coordinates.x;
        }
        return yDiff;
      });

      return {
        success: true,
        textItems,
        pageWidth: Math.round(viewport.width),
        pageHeight: Math.round(viewport.height)
      };

    } catch (error) {
      console.error('❌ PDF text extraction failed:', error);
      
      return {
        success: false,
        textItems: [],
        pageWidth: 0,
        pageHeight: 0,
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      };
    }
  }

  /**
   * Extract text from all pages
   */
  static async extractFullDocumentText(fileUrl: string): Promise<{
    success: boolean;
    pages: { pageNumber: number; textItems: TextItem[] }[];
    error?: string;
  }> {
    try {
      const loadingTask = pdfjs.getDocument({
        url: fileUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      const pdf = await loadingTask.promise;
      
      const pages: { pageNumber: number; textItems: TextItem[] }[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const result = await this.extractTextWithCoordinates(fileUrl, pageNum);
        
        if (result.success) {
          pages.push({
            pageNumber: pageNum,
            textItems: result.textItems
          });
        }
      }

      return {
        success: true,
        pages
      };

    } catch (error) {
      console.error('❌ Full document extraction failed:', error);
      
      return {
        success: false,
        pages: [],
        error: error instanceof Error ? error.message : 'Full extraction failed'
      };
    }
  }
}
}
      const textItems: TextItem[] = textContent.items
        .map((item: any, index: number) => {
          // Validate item structure
          if (!item.str || !item.transform || item.transform.length < 6) {
            return null;
          }
          
          const transform = item.transform;
          const x = transform[4]; // X coordinate
          const y = viewport.height - transform[5]; // Y coordinate (flip for screen coordinates)
          const width = item.width || (item.str.length * 8); // Estimated width if not available
          const height = item.height || Math.abs(transform[0]) || 12; // Font size or default
          
          return {
            id: index,
            text: item.str.trim(),
            x: x * scale,
            y: y * scale,
            width: width * scale,
            height: height * scale,
            fontName: item.fontName || 'default'
          };
        })
        .filter((item: TextItem | null): item is TextItem => {
          // Filter out null items and empty text
          return item !== null && item.text && item.text.length > 0;
        });
      
      console.log('✅ Processed text items:', textItems.length);
      console.log('📍 Sample coordinates:', textItems.slice(0, 3).map(t => ({
        text: t.text,
        x: t.x,
        y: t.y,
        w: t.width,
        h: t.height
      })));
      
      return {
        textItems,
        pageWidth: viewport.width * scale,
        pageHeight: viewport.height * scale,
        success: true
      };
      
    } catch (error) {
      console.error('❌ PDF text extraction failed:', error);
      
      return {
        textItems: [],
        pageWidth: 600,
        pageHeight: 800,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  static async validatePDFFile(fileUrl: string): Promise<boolean> {
    try {
      const loadingTask = pdfjs.getDocument({
        url: fileUrl,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      return pdf.numPages > 0;
    } catch (error) {
      console.error('❌ PDF validation failed:', error);
      return false;
    }
  }
  
  static async extractAllPages(fileUrl: string, maxPages: number = 3): Promise<TextItem[]> {
    try {
      const loadingTask = pdfjs.getDocument({
        url: fileUrl,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      const totalPages = Math.min(pdf.numPages, maxPages);
      const allTextItems: TextItem[] = [];
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const result = await this.extractTextWithCoordinates(fileUrl, pageNum);
        if (result.success) {
          // Offset Y coordinates for subsequent pages
          const offsetY = (pageNum - 1) * result.pageHeight;
          const offsetItems = result.textItems.map(item => ({
            ...item,
            y: item.y + offsetY,
            id: `${pageNum}-${item.id}`
          }));
          allTextItems.push(...offsetItems);
        }
      }
      
      return allTextItems;
    } catch (error) {
      console.error('❌ Multi-page extraction failed:', error);
      return [];
    }
  }
}
