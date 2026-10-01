import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly STORAGE_KEY = 'q_ltura_saved_reminders';
  private reminderIdsSubject = new BehaviorSubject<string[]>(this.loadInitialIds());
  public reminderIds$: Observable<string[]> = this.reminderIdsSubject.asObservable();

  private loadInitialIds(): string[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public get reminderIds(): string[] {
    return this.reminderIdsSubject.value;
  }

  public isReminded(eventId: string): boolean {
    return this.reminderIds.includes(eventId);
  }

  public toggleReminder(eventId: string): boolean {
    let current = [...this.reminderIds];
    const exists = current.includes(eventId);

    if (exists) {
      current = current.filter(id => id !== eventId);
    } else {
      current.push(eventId);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    this.reminderIdsSubject.next(current);
    return !exists;
  }
}