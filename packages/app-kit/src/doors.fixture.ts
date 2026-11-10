// The draft 4 corpus (26 synthetic reports, 1 to 20 November 2026) replayed as door signals, for Alex (an
// operator on the team floor) and Jo (its steward), one visit each weekday. Meetings are assumed weekly on
// Tuesdays: AUGUR has no calendar. `expected` is each door's step under the default rule; `important` lists
// the doors that held something important that day. Written by the design round's replay script; edit there.
import type { DoorSignal, DoorStep } from './doors.js';

export interface CorpusDay {
  person: 'alex' | 'jo';
  day: string;
  signals: DoorSignal[];
  expected: Record<string, DoorStep>;
  important: string[];
}

export const CORPUS_DAYS: CorpusDay[] = [
 {
  "person": "alex",
  "day": "2026-11-02",
  "signals": [
   {
    "kind": "moved",
    "reason": "Fleet weekly plan, week 45",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Fleet weekly plan, week 45 (more)",
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Fleet weekly plan, week 45 (more)",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "meeting",
    "when": "tomorrow",
    "reason": "The partner review is tomorrow"
   }
  ],
  "expected": {
   "get-ready": "present",
   "changed": "strong",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-03",
  "signals": [
   {
    "kind": "change",
    "reason": "Port Services daily log",
    "yours": true
   },
   {
    "kind": "coming",
    "reason": "Due 4 Nov: Heron due"
   },
   {
    "kind": "meeting",
    "when": "today",
    "reason": "The partner review is today"
   }
  ],
  "expected": {
   "get-ready": "strong",
   "changed": "quiet",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-04",
  "signals": [
   {
    "kind": "change",
    "reason": "Project Gantry status, 3 Nov",
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Project Gantry status, 3 Nov",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Project Gantry status, 3 Nov"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Project Gantry status, 3 Nov"
   },
   {
    "kind": "coming",
    "reason": "Due 4 Nov: Heron due"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-05",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron is delayed by weather",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "The Heron is delayed by weather (more)",
    "yours": false
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "strong",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-06",
  "signals": [
   {
    "kind": "change",
    "reason": "Osprey Logistics onboarding",
    "yours": true
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Osprey Logistics onboarding"
   },
   {
    "kind": "coming",
    "reason": "Due 6 Nov: Heron due (revised)"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "quiet",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-09",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron arrived at Kessick",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "The Heron arrived at Kessick (more)",
    "yours": false
   },
   {
    "kind": "moved",
    "reason": "Discharge count: 186 by 18:00 on 7 Nov",
    "important": true,
    "yours": false
   },
   {
    "kind": "moved",
    "reason": "Lowmere’s count: 204 by 18:00 on 7 Nov",
    "important": true,
    "yours": true
   },
   {
    "kind": "change",
    "reason": "The Heron took on 85 tonnes of fuel",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from The Heron took on 85 tonnes of fuel"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from The Heron took on 85 tonnes of fuel"
   },
   {
    "kind": "meeting",
    "when": "tomorrow",
    "reason": "The partner review is tomorrow"
   },
   {
    "kind": "contradiction",
    "seen": false,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   }
  ],
  "expected": {
   "get-ready": "present",
   "changed": "strong",
   "put-right": "strong",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed",
   "put-right"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-10",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron sailed for Ardmor",
    "important": true,
    "yours": false
   },
   {
    "kind": "meeting",
    "when": "today",
    "reason": "The partner review is today"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   }
  ],
  "expected": {
   "get-ready": "strong",
   "changed": "strong",
   "put-right": "present",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-11",
  "signals": [
   {
    "kind": "change",
    "reason": "Weekly partner summary, week 45",
    "yours": true
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: Tern Bay out of dry dock"
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: first Gantry crane"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "quiet",
   "put-right": "present",
   "keep-an-eye": "strong"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-12",
  "signals": [
   {
    "kind": "change",
    "reason": "Weekly partner summary, re-published",
    "yours": true
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: Tern Bay out of dry dock"
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: first Gantry crane"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "quiet",
   "put-right": "present",
   "keep-an-eye": "strong"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-13",
  "signals": [
   {
    "kind": "change",
    "reason": "Invoice query from Lowmere",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Invoice query from Lowmere"
   },
   {
    "kind": "moved",
    "reason": "The Tern Bay left dry dock early",
    "important": true,
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from The Tern Bay left dry dock early"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "contradiction",
    "seen": false,
    "wroteOneSide": false,
    "reason": "Two sources disagree: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "strong",
   "put-right": "strong",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed",
   "put-right"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-16",
  "signals": [
   {
    "kind": "moved",
    "reason": "Gantry commissioning moved to 11 Dec",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Gantry commissioning moved to 11 Dec (more)",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Gantry commissioning moved to 11 Dec"
   },
   {
    "kind": "incident",
    "reason": "A mooring line parted on the Tern Bay",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Steward note: Brannock Lines at Kessick",
    "yours": false
   },
   {
    "kind": "meeting",
    "when": "tomorrow",
    "reason": "The partner review is tomorrow"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": false,
    "reason": "Two sources disagree: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "present",
   "changed": "strong",
   "put-right": "present",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-17",
  "signals": [
   {
    "kind": "moved",
    "reason": "12 Heron containers held by customs",
    "important": true,
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from 12 Heron containers held by customs"
   },
   {
    "kind": "meeting",
    "when": "today",
    "reason": "The partner review is today"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": false,
    "reason": "Two sources disagree: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "strong",
   "changed": "strong",
   "put-right": "present",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "alex",
  "day": "2026-11-18",
  "signals": [
   {
    "kind": "change",
    "reason": "Lowmere denies the depot sale",
    "yours": true
   },
   {
    "kind": "coming",
    "reason": "Due 18 Nov: customs certificates"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": false,
    "reason": "Two sources disagree: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "quiet",
   "put-right": "present",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-19",
  "signals": [
   {
    "kind": "change",
    "reason": "Dunmore road convoy",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Dunmore road convoy"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": false,
    "reason": "Two sources disagree: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "present",
   "keep-an-eye": "quiet"
  },
  "important": []
 },
 {
  "person": "alex",
  "day": "2026-11-20",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron’s next call: 24 Nov",
    "important": true,
    "yours": false
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": true,
    "reason": "Two sources disagree: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "contradiction",
    "seen": true,
    "wroteOneSide": false,
    "reason": "Two sources disagree: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "strong",
   "put-right": "present",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-02",
  "signals": [
   {
    "kind": "moved",
    "reason": "Fleet weekly plan, week 45",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Fleet weekly plan, week 45 (more)",
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Fleet weekly plan, week 45 (more)",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Fleet weekly plan, week 45"
   },
   {
    "kind": "meeting",
    "when": "tomorrow",
    "reason": "The partner review is tomorrow"
   }
  ],
  "expected": {
   "get-ready": "present",
   "changed": "strong",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-03",
  "signals": [
   {
    "kind": "change",
    "reason": "Port Services daily log",
    "yours": false
   },
   {
    "kind": "coming",
    "reason": "Due 4 Nov: Heron due"
   },
   {
    "kind": "meeting",
    "when": "today",
    "reason": "The partner review is today"
   }
  ],
  "expected": {
   "get-ready": "strong",
   "changed": "present",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-04",
  "signals": [
   {
    "kind": "change",
    "reason": "Project Gantry status, 3 Nov",
    "yours": true
   },
   {
    "kind": "change",
    "reason": "Project Gantry status, 3 Nov",
    "yours": true
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Project Gantry status, 3 Nov"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Project Gantry status, 3 Nov"
   },
   {
    "kind": "coming",
    "reason": "Due 4 Nov: Heron due"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "quiet",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-05",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron is delayed by weather",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "The Heron is delayed by weather (more)",
    "yours": false
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "strong",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-06",
  "signals": [
   {
    "kind": "change",
    "reason": "Osprey Logistics onboarding",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Osprey Logistics onboarding"
   },
   {
    "kind": "coming",
    "reason": "Due 6 Nov: Heron due (revised)"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-09",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron arrived at Kessick",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "The Heron arrived at Kessick (more)",
    "yours": false
   },
   {
    "kind": "moved",
    "reason": "Discharge count: 186 by 18:00 on 7 Nov",
    "important": true,
    "yours": true
   },
   {
    "kind": "moved",
    "reason": "Lowmere’s count: 204 by 18:00 on 7 Nov",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "The Heron took on 85 tonnes of fuel",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from The Heron took on 85 tonnes of fuel"
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from The Heron took on 85 tonnes of fuel"
   },
   {
    "kind": "meeting",
    "when": "tomorrow",
    "reason": "The partner review is tomorrow"
   },
   {
    "kind": "queue",
    "canAct": true,
    "reason": "Settle it: counts 186 v 204, 28 v 40"
   },
   {
    "kind": "queue",
    "canAct": true,
    "reason": "Keep or drop: R11 text addressing the system"
   }
  ],
  "expected": {
   "get-ready": "present",
   "changed": "strong",
   "put-right": "needs",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-10",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron sailed for Ardmor",
    "important": true,
    "yours": true
   },
   {
    "kind": "meeting",
    "when": "today",
    "reason": "The partner review is today"
   }
  ],
  "expected": {
   "get-ready": "strong",
   "changed": "quiet",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-11",
  "signals": [
   {
    "kind": "change",
    "reason": "Weekly partner summary, week 45",
    "yours": false
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: Tern Bay out of dry dock"
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: first Gantry crane"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "quiet",
   "keep-an-eye": "strong"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-12",
  "signals": [
   {
    "kind": "change",
    "reason": "Weekly partner summary, re-published",
    "yours": false
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: Tern Bay out of dry dock"
   },
   {
    "kind": "coming",
    "reason": "Due 12 Nov: first Gantry crane"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "quiet",
   "keep-an-eye": "strong"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-13",
  "signals": [
   {
    "kind": "change",
    "reason": "Invoice query from Lowmere",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Invoice query from Lowmere"
   },
   {
    "kind": "moved",
    "reason": "The Tern Bay left dry dock early",
    "important": true,
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from The Tern Bay left dry dock early"
   },
   {
    "kind": "queue",
    "canAct": true,
    "reason": "Settle it: Marta Kowal: two employers"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "strong",
   "put-right": "needs",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-16",
  "signals": [
   {
    "kind": "moved",
    "reason": "Gantry commissioning moved to 11 Dec",
    "important": true,
    "yours": true
   },
   {
    "kind": "change",
    "reason": "Gantry commissioning moved to 11 Dec (more)",
    "yours": true
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Gantry commissioning moved to 11 Dec"
   },
   {
    "kind": "incident",
    "reason": "A mooring line parted on the Tern Bay",
    "important": true,
    "yours": false
   },
   {
    "kind": "change",
    "reason": "Steward note: Brannock Lines at Kessick",
    "yours": true
   },
   {
    "kind": "meeting",
    "when": "tomorrow",
    "reason": "The partner review is tomorrow"
   }
  ],
  "expected": {
   "get-ready": "present",
   "changed": "strong",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-17",
  "signals": [
   {
    "kind": "moved",
    "reason": "12 Heron containers held by customs",
    "important": true,
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from 12 Heron containers held by customs"
   },
   {
    "kind": "meeting",
    "when": "today",
    "reason": "The partner review is today"
   }
  ],
  "expected": {
   "get-ready": "strong",
   "changed": "strong",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": [
   "changed"
  ]
 },
 {
  "person": "jo",
  "day": "2026-11-18",
  "signals": [
   {
    "kind": "change",
    "reason": "Lowmere denies the depot sale",
    "yours": false
   },
   {
    "kind": "coming",
    "reason": "Due 18 Nov: customs certificates"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "quiet",
   "keep-an-eye": "present"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-19",
  "signals": [
   {
    "kind": "change",
    "reason": "Dunmore road convoy",
    "yours": false
   },
   {
    "kind": "new-thing",
    "reason": "New on your floor, from Dunmore road convoy"
   },
   {
    "kind": "queue",
    "canAct": true,
    "reason": "Keep or drop: R23 text addressing the system"
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "present",
   "put-right": "needs",
   "keep-an-eye": "quiet"
  },
  "important": []
 },
 {
  "person": "jo",
  "day": "2026-11-20",
  "signals": [
   {
    "kind": "moved",
    "reason": "The Heron’s next call: 24 Nov",
    "important": true,
    "yours": true
   }
  ],
  "expected": {
   "get-ready": "quiet",
   "changed": "quiet",
   "put-right": "quiet",
   "keep-an-eye": "quiet"
  },
  "important": []
 }
];
