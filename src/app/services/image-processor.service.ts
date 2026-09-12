import { Injectable } from '@angular/core';
import { heicTo, isHeic} from 'heic-to';

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {

 //Tune these to taste
 private readonly MAX_DIMENSION = 1600; // px, longest slide
 private readonly JPEG_QUALITY = 0.85;

 /**
  * Takes a user-selected File, converts HEIC -< JPEG if needed,
  * resizes/compresses, and eturns a ready-to-upload JPEG file
  */
async process(file: File): Promise<File> {
  let workingBlob: Blob = file;

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

private drawResized(img: HTMLImageElement): { canvas: HTMLCanvasElement} {
  let {width, height } = img;

  if (width > this.MAX_DIMENSION || height > this.MAX_DIMENSION){
    if(width >= height){
      height = Math.round(height * (this.MAX_DIMENSION / width));
      width = this.MAX_DIMENSION;
    } else {
      width = Math.round(width * (this.MAX_DIMENSION / height));
      height = this.MAX_DIMENSION;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
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
