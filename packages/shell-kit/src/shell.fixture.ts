import { ShellModel } from './shell-model.js';
import type { ShellFloor } from './floors.js';

/** A Shell with a few floors, apps and notifications, for the stories and the tests. Names are examples. */
export function exampleShell(open?: string, app: string | undefined = 'docs') {
  const model = new ShellModel();
  const org = { id: 'org', kind: 'org' as const, name: 'Example Org' };
  const dept = { id: 'dept', kind: 'team' as const, name: 'Example Department', level: 'Department' };
  const floors: ShellFloor[] = [
    { id: 'me', kind: 'personal', name: 'Sam Lee', path: [{ id: 'me', kind: 'personal', name: 'Sam Lee' }] },
    { ...dept, path: [org, dept] },
    { ...org, path: [org] },
  ];
  model.user = { name: 'Sam Lee', email: 'sam@example.org' };
  model.background = 'horizon';
  model.floors = floors;
  model.floor = 'dept';
  model.groups = [
    { id: 'work', name: 'Work', icon: 'work', line: 'What you’re doing, and why' },
    { id: 'context', name: 'Context', icon: 'context', line: 'What’s known, and what it’s about' },
  ];
  model.apps = [
    { id: 'mandate', name: 'Mandate', icon: 'compass', line: 'What we’re trying to do', group: 'work' },
    {
      id: 'docs',
      name: 'Documents',
      icon: 'document',
      line: 'What your floors keep',
      group: 'context',
      pages: [
        { id: 'library', name: 'Library', icon: 'library' },
        { id: 'recent', name: 'Recent', icon: 'clock' },
        { id: 'shared', name: 'Shared', icon: 'people' },
      ],
    },
    { id: 'atlas', name: 'Atlas', icon: 'atlas', line: 'What it’s all about', group: 'context', off: 'Off on this floor. An organisation admin can turn it on.' },
  ];
  model.running = ['docs'];
  if (app) model.current = app;
  model.now = Date.parse('2026-11-03T10:00:00Z');
  model.notifications = [
    { id: 'n1', app: 'docs', level: 'needs', title: 'Review the budget draft', time: '2026-11-03T09:50:00Z', floor: 'dept', page: 'shared', actions: [{ label: 'Open' }] },
    { id: 'n2', app: 'mandate', level: 'info', title: 'Two new people on your floor', time: '2026-11-03T08:00:00Z' },
  ];
  if (open) {
    model.isOpen = true;
    model.view = open;
  }
  return model;
}

/** The example shell with a Home app drawn on the desktop. */
export function withHome(model: ShellModel) {
  model.apps = [{ id: 'home', name: 'Home', icon: 'home', line: 'What needs you' }, ...model.apps];
  model.desktop = 'home';
  return model;
}
