import { Injectable, ComponentRef, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalStateSubject = new BehaviorSubject<{
    isOpen: boolean;
    component?: Type<any>;
    data?: any;
  }>({ isOpen: false });

  modalState$ = this.modalStateSubject.asObservable();

  open(component: Type<any>, data?: any) {
    this.modalStateSubject.next({ isOpen: true, component, data });
  }

  close() {
    this.modalStateSubject.next({ isOpen: false });
  }
}