import {
  Component,
  ViewChild,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <button
            (click)="close()"
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <i class="fas fa-times"></i>
          </button>

          <ng-template #modalContent></ng-template>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;

  isOpen = false;
  private subscription?: Subscription;
  private componentRef?: any;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.subscription = this.modalService.modalState$.subscribe((state) => {
      this.isOpen = state.isOpen;

      if (state.isOpen && state.component) {
        this.loadComponent(state.component, state.data);
      } else {
        this.clearComponent();
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.clearComponent();
  }

  private loadComponent(component: any, data: any) {
    this.modalContent.clear();
    this.componentRef = this.modalContent.createComponent(component);
    Object.assign(this.componentRef.instance, data);
  }

  private clearComponent() {
    this.modalContent?.clear();
    this.componentRef = undefined;
  }

  close() {
    this.modalService.close();
  }
}
