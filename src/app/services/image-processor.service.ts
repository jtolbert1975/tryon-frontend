import { Injectable } from '@angular/core';
import { heicTo, isHeic} from 'heic-to';
import exifr from 'exifr';

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {

 //Tune these to taste
 private readonly MAX_DIMENSION = 1600; // px, longest slide
 private readonly MAX_WIDTH = 1200;
  private readonly MAX_HEIGHT = 1600;
 private readonly JPEG_QUALITY = 0.85;

 /**
  * Takes a user-selected File, converts HEIC -< JPEG if needed,
  * resizes/compresses, and eturns a ready-to-upload JPEG file
  */
async process(file: File): Promise<File> {
  let workingBlob: Blob = file;

   // read EXIF orientation from the ORIGINAL file (before any conversion strips it)
   let orientation = 1;
   try {
     orientation = (await exifr.orientation(file)) || 1;
   } catch {
     orientation = 1; // no EXIF or unreadable → assume normal
   }

  // 1. Convert HEIC -> JPEG if necessary
  if (await isHeic(file)) {
    workingBlob = await heicTo({
      blob: file,
      type: 'image/jpeg',
      quality: this.JPEG_QUALITY,
    });
  }

  // 2. Load into an image element
  const dataUrl = await this.blobToDataURL(workingBlob);
  const img = await this.loadImage(dataUrl);

  // 3. Resize via canvas if larger than MAX_DIMENSION
  const { canvas } = this.drawResized(img);

  // 4. Re-encode as compressed JPEG
  const finalBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas encode failed'))),
      'image/jpeg',
      this.JPEG_QUALITY
    );
  });


  // 5. Wrap back into a File with a .jpg name
  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([finalBlob], newName, { type: 'image/jpeg' });

}

private drawResized(img: HTMLImageElement, orientation: number = 1): { canvas: HTMLCanvasElement } {
  let width = img.width;
  let height = img.height;

  // orientations 5-8 are rotated 90°/270°, so the displayed dimensions are swapped
  const swap = orientation >= 5 && orientation <= 8;
  let displayWidth = swap ? height : width;
  let displayHeight = swap ? width : height;

  // scale to fit within MAX_WIDTH x MAX_HEIGHT (using display dimensions)
  if (displayWidth > this.MAX_WIDTH || displayHeight > this.MAX_HEIGHT) {
    const scale = Math.min(this.MAX_WIDTH / displayWidth, this.MAX_HEIGHT / displayHeight);
    displayWidth = Math.round(displayWidth * scale);
    displayHeight = Math.round(displayHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  const ctx = canvas.getContext('2d')!;

  // apply the EXIF orientation transform before drawing
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, displayWidth, 0); break;          // flip horizontal
    case 3: ctx.transform(-1, 0, 0, -1, displayWidth, displayHeight); break; // 180°
    case 4: ctx.transform(1, 0, 0, -1, 0, displayHeight); break;         // flip vertical
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;                      // transpose
    case 6: ctx.transform(0, 1, -1, 0, displayWidth, 0); break;          // 90° CW
    case 7: ctx.transform(0, -1, -1, 0, displayWidth, displayHeight); break; // transverse
    case 8: ctx.transform(0, -1, 1, 0, 0, displayHeight); break;         // 90° CCW
    default: break;                                                       // orientation 1, no transform
  }

  // draw using the ORIGINAL (unswapped) dimensions scaled to fit
  const drawWidth = swap ? displayHeight : displayWidth;
  const drawHeight = swap ? displayWidth : displayHeight;
  ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

  return { canvas };
}

private blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

private loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  })
}

}
