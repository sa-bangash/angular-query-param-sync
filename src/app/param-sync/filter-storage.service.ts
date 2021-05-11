import { Inject, Injectable } from '@angular/core';
import { LZStringService } from './lz-string.service';
import { FilterSyncStorage } from './param.model';
import { PREFIX } from './utils';
import { WindowService, WINDOW_SERVICE } from './window.service';

@Injectable({
  providedIn: 'root',
})
export class FilterStorageService implements FilterSyncStorage {
  constructor(
    @Inject(WINDOW_SERVICE) private windowService: WindowService,
    private lzString: LZStringService
  ) {}

  get localStorage() {
    return this.windowService.windowRef.localStorage;
  }

  getStoreKey(key: string): string {
    if (key) {
      return `${PREFIX}${key}`;
    }
    return '';
  }

  saveItem(key: string, data: any): void {
    const stringData = JSON.stringify(data);
    const compressData = this.lzString.compress(stringData);
    this.localStorage.setItem(this.getStoreKey(key), compressData);
  }

  getItem(key: string): any {
    const data = this.localStorage.getItem(this.getStoreKey(key));
    const decompressedData = this.lzString.decompress(data);
    return JSON.parse(decompressedData);
  }

  removeItem(key: string): void {
    this.localStorage.removeItem(this.getStoreKey(key));
  }
}
