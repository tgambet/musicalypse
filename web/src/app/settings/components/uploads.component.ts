import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-uploads',
  template: `
    <p>
      Drag and drop files in the zone below to upload them to the server.<br>
      Or click it to choose files to upload from the explorer.
    </p>
    <input #file type='file' accept=".mp3" multiple style="display: none" (change)="addFiles.emit($event.target.files)"/>
    <div [class.empty]="files.length == 0"
         [class.outline-dashed]="dragOver"
         class="drop hover-background"
         (click)="isUploading ? {} : file.click(); $event.preventDefault()"
         (dragover)="dragOver = true; $event.preventDefault()"
         (drop)="drop($event)"
         (dragenter)="dragOver = true"
         (dragleave)="dragOver = false">
      <button class="cloud-upload" mat-icon-button *ngIf="files.length == 0">
        <mat-icon>cloud_upload</mat-icon>
      </button>
      <div *ngFor="let file of files" class="file">
        <span class="name">{{ file._file.name }}</span>
        <span class="progress">
            <mat-progress-bar mode="determinate" [value]="file.progress"></mat-progress-bar>
          </span>
        <span class="size">{{ file._file.size | sgFileSize }}</span>
      </div>
    </div>
    <div class="upload-actions">
      <button mat-button [disabled]="files.length == 0 || isUploading" (click)="uploadFiles.emit()">
        <mat-icon>file_upload</mat-icon>
        Upload
      </button>
      <button mat-button (click)="isUploading ? cancelUploads.emit() : clearUploads.emit()" [disabled]="files.length == 0">
        {{ isUploading ? 'Cancel' : 'Clear' }}
      </button>
    </div>
  `,
  styles: [`
    .drop {
      padding: 1rem;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    .drop.empty {
      justify-content: space-around;
    }
    .cloud-upload {
      padding: 5px;
      box-sizing: content-box;
    }
    .cloud-upload, .cloud-upload mat-icon  {
      height: 40px;
      width: 40px;
      font-size: 40px;
      line-height: 40px;
    }
    .cloud-upload mat-icon {
      position: relative;
      top: -4px;
    }
    .file {
      display: flex;
      width: 100%;
    }
    mat-progress-bar {
      width: auto;
    }
    .name {
      flex-grow: 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 50%;
      overflow: hidden;
    }
    .progress {
      flex-grow: 1;
      margin: 8px 8px 0 8px;
    }
    .size {
      flex-grow: 0;
      min-width: 60px;
      text-align: right;
    }
    .upload-actions {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadsComponent {

  dragOver: boolean;

  @Input() files: { _file: File, progress: number }[];
  @Input() isUploading: boolean;

  @Output() addFiles = new EventEmitter<File[]>();
  @Output() uploadFiles = new EventEmitter<void>();
  @Output() cancelUploads = new EventEmitter<void>();
  @Output() clearUploads = new EventEmitter<void>();

  drop(event) {
    this.addFiles.emit(event.dataTransfer.files);
    this.dragOver = false;
    event.preventDefault();
  }

}
