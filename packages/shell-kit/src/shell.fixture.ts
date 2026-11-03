import { ShellModel } from './shell-model.js';
import type { ShellFloor } from './floors.js';

/** A Shell with a few floors, apps and notifications, for the stories and the tests. Names are examples. */
export function exampleShell(open?: string) {
  const model = new ShellModel();
  const org = { id: 'org', kind: 'org' as const, name: 'Example Org' };
  const dept = { id: 'dept', kind: 'team' as const, name: 'Example Department', level: 'Department' };
  const floors: ShellFloor[] = [
    { id: 'me', kind: 'personal', name: 'Sam Lee', path: [{ id: 'me', kind: 'personal', name: 'Sam Lee' }] },
    { ...dept, path: [org, dept] },
    { ...org, path: [org] },
  ];
  model.user = { name: 'Sam Lee', email: 'sam@example.org' };
  model.background = 'none';
  model.floors = floors;
  model.floor = 'dept';
  model.apps = [
    { id: 'home', name: 'Home', icon: 'home' },
    { id: 'docs', name: 'Documents', icon: 'document', line: 'What your floors keep' },
  ];
  model.current = 'docs';
  model.navs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'title', label: 'Title', icon: 'apps', unavailable: 'Title is turned off on this floor. An organisation admin can turn it on.' },
  ];
  model.now = Date.parse('2026-11-03T10:00:00Z');
  model.notifications = [
    { id: 'n1', app: 'docs', level: 'needs', title: 'Review the budget draft', time: '2026-11-03T09:50:00Z', floor: 'dept', actions: [{ label: 'Open' }] },
    { id: 'n2', app: 'home', level: 'info', title: 'Two new people on your floor', time: '2026-11-03T08:00:00Z' },
  ];
  if (open) {
    model.isOpen = true;
    model.view = open;
  }
  return model;
}
