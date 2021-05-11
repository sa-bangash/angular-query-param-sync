import { Injectable } from '@angular/core';
import * as LZString from 'lz-string';

@Injectable({
  providedIn: 'root',
})
export class LZStringService {
  compress(data: string): any {
    return LZString.compressToUTF16(data);
  }
  decompress(data: string) {
    return LZString.decompressFromUTF16(data);
  }
}
