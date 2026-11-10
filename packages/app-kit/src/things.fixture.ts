// Every thing in the knowledge graph review's store (42), as Alex sees them on Fri 20 Nov 2026 from the team
// floor and her own, filled by the generic shape's slot rules. Nothing on Harry's or Sam's own floors is here.
// Generated, not hand-tuned: where the data can't make a plain line, the line shows that. Do not edit by hand.
import type { ThingView } from "./thing.js";

export const THINGS: ThingView[] = [
 {
  "id": "alex",
  "name": "Alex",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [],
  "problems": [],
  "facts": [],
  "around": [],
  "total": 0,
  "reports": 0
 },
 {
  "id": "ardmor",
  "name": "Ardmor",
  "kind": {
   "name": "City",
   "icon": "place"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Discharging here MV Saltmarsh Heron",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Discharging here",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "mv-tern-bay",
    "relation": "Mentioned with it",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "brannock-lines",
    "relation": "Head office here",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "marta-kowal",
    "relation": "Based here",
    "name": "Marta Kowal",
    "group": "People"
   }
  ],
  "total": 8,
  "reports": 9
 },
 {
  "id": "brannock-lines",
  "name": "Brannock Lines",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "what",
    "value": "Berth 3 on Tuesdays and Fridays",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-15",
     "title": "Steward note: Brannock Lines at Kessick"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Customs holds this year",
    "value": "1",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-16",
     "title": "Customs hold on Heron containers"
    }
   },
   {
    "label": "Berth deal ends",
    "value": "31 Oct 2028",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-15",
     "title": "Steward note: Brannock Lines at Kessick"
    }
   },
   {
    "label": "Berth agreement renewed",
    "value": "Sun 1 Nov",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-15",
     "title": "Steward note: Brannock Lines at Kessick"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-tern-bay",
    "relation": "Runs",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Runs",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "ardmor",
    "relation": "Head office",
    "name": "Ardmor",
    "group": "Places"
   },
   {
    "id": "kessick-berth-3",
    "relation": "Priority berth",
    "name": "Berth 3, Kessick",
    "group": "Places"
   },
   {
    "id": "port-of-kessick",
    "relation": "Berth agreement with",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "lowmere-freight-partners",
    "relation": "Their main customer",
    "name": "Lowmere Freight Partners",
    "group": "Companies"
   },
   {
    "id": "carrow-marine-fuels",
    "relation": "Mentioned with it",
    "name": "Carrow Marine Fuels",
    "group": "Companies"
   },
   {
    "id": "tern-bay-mooring-line-incident",
    "relation": "Informed of",
    "name": "Mooring line parted on MV Tern Bay, 14 Nov",
    "group": "Events"
   }
  ],
  "total": 14,
  "reports": 8,
  "aliases": [
   "Brannock"
  ]
 },
 {
  "id": "carrow-marine-fuels",
  "name": "Carrow Marine Fuels",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "last-heard",
    "value": "Delivery complete, 85.0 t",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-08",
     "title": "Bunkering: Saltmarsh Heron"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Bunkerings this week",
    "value": "One bunkering at Kessick, 85 tonnes",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Alex",
     "on": "2026-11-11",
     "title": "Weekly partner summary, week 45 (re-published)",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "port-of-kessick",
    "relation": "Bunkered at",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "brannock-lines",
    "relation": "Annual contract with",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Fuel supplier for",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   }
  ],
  "total": 5,
  "reports": 3
 },
 {
  "id": "company-board",
  "name": "The board",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [],
  "problems": [],
  "facts": [],
  "around": [],
  "total": 0,
  "reports": 0,
  "aliases": [
   "the board"
  ]
 },
 {
  "id": "crane-c1",
  "name": "Crane C1",
  "kind": {
   "name": "Equipment",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "At Berth 3, Kessick",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Fault",
    "value": "Spreader fault causing a 50-minute stop",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-07",
     "title": "Discharge count, 7 Nov (Port Services)"
    },
    "adopted": false
   },
   {
    "label": "Move rate",
    "value": "Roughly 22 moves an hour",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "kessick-berth-3",
    "relation": "At",
    "name": "Berth 3, Kessick",
    "group": "Places"
   }
  ],
  "total": 3,
  "reports": 2,
  "aliases": [
   "C1"
  ]
 },
 {
  "id": "crane-c2",
  "name": "Crane C2",
  "kind": {
   "name": "Equipment",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "last-heard",
    "value": "Not yet back in service",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-04",
     "title": "Heron delayed by weather"
    }
   }
  ],
  "problems": [
   {
    "kind": "problem",
    "text": "Defect: Cracked gearbox casing",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    }
   }
  ],
  "facts": [
   {
    "label": "Returned to service",
    "value": "Fri 6 Nov 11:00",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-06",
     "title": "Arrival: Saltmarsh Heron"
    },
    "adopted": false
   },
   {
    "label": "Performance",
    "value": "Performed well after the gearbox replacement",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-09",
     "title": "Departure: Saltmarsh Heron"
    },
    "adopted": false
   },
   {
    "label": "Load test result",
    "value": "Failed",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "marta-kowal",
    "relation": "Mentioned with it",
    "name": "Marta Kowal",
    "group": "People"
   },
   {
    "id": "port-services",
    "relation": "Mentioned with it",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "kessick-berth-3",
    "relation": "At",
    "name": "Berth 3, Kessick",
    "group": "Places"
   },
   {
    "id": "crane-c2-replacement-gearbox",
    "relation": "Mentioned with it",
    "name": "Replacement gearbox for crane C2",
    "group": "Things"
   }
  ],
  "total": 15,
  "reports": 5,
  "aliases": [
   "C2"
  ]
 },
 {
  "id": "crane-c2-replacement-gearbox",
  "name": "Replacement gearbox for crane C2",
  "kind": {
   "name": "Equipment",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "last-heard",
    "value": "Ordered from the manufacturer",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    }
   }
  ],
  "problems": [
   {
    "kind": "slipped",
    "text": "Due Thu 5 Nov has passed, with nothing newer",
    "source": {
     "how": "forecast",
     "reports": 2,
     "who": "Harry",
     "on": "2026-11-04",
     "title": "Heron delayed by weather"
    }
   }
  ],
  "facts": [
   {
    "label": "Weight",
    "value": "About 380 kg",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "crane-c2",
    "relation": "Installed in",
    "name": "Crane C2",
    "group": "Things"
   }
  ],
  "total": 5,
  "reports": 3,
  "aliases": [
   "replacement gearbox",
   "new gearbox"
  ]
 },
 {
  "id": "customs",
  "name": "Customs",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Holds containers from MV Saltmarsh Heron",
    "source": {
     "how": "as-written",
     "reports": 4,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Hold reason",
    "value": "Missing phytosanitary certificates for the timber packaging",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-16",
     "title": "Customs hold on Heron containers"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Holds containers from",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   }
  ],
  "total": 3,
  "reports": 5
 },
 {
  "id": "dana-holt",
  "name": "Dana Holt",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Leads Project Gantry",
    "source": {
     "how": "as-written",
     "reports": 3,
     "who": "Jo",
     "on": "2026-11-15",
     "title": "Steward note: Brannock Lines at Kessick"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "project-gantry",
    "relation": "Leads",
    "name": "Project Gantry",
    "group": "Things"
   }
  ],
  "total": 3,
  "reports": 4
 },
 {
  "id": "dunmore",
  "name": "Dunmore",
  "kind": {
   "name": "City",
   "icon": "place"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Named with Osprey Logistics",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-18",
     "title": "Dunmore road convoy"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "osprey-logistics",
    "relation": "Mentioned with it",
    "name": "Osprey Logistics",
    "group": "Companies"
   },
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Mentioned with it",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   }
  ],
  "total": 4,
  "reports": 5
 },
 {
  "id": "finance",
  "name": "Finance",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "last-heard",
    "value": "Holds pricing for Osprey Logistics",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-05",
     "title": "Osprey Logistics onboarding",
     "byYou": true
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "marta-kowal",
    "relation": "Handling request from",
    "name": "Marta Kowal",
    "group": "People"
   }
  ],
  "total": 2,
  "reports": 2
 },
 {
  "id": "fleet",
  "name": "Fleet",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [],
  "problems": [],
  "facts": [],
  "around": [],
  "total": 0,
  "reports": 0
 },
 {
  "id": "gantry-new-crane-1",
  "name": "Gantry new ship-to-shore crane 1",
  "kind": {
   "name": "Equipment",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Came to Port of Kessick",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   }
  ],
  "problems": [
   {
    "kind": "problem",
    "text": "Arrival variance: One day later than the 2026-11-12 forecast",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   }
  ],
  "facts": [
   {
    "label": "Came",
    "value": "Fri 13 Nov",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   },
   {
    "label": "Rated load",
    "value": "65 tonnes under spreader",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   },
   {
    "label": "Outreach",
    "value": "51 metres",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "port-of-kessick",
    "relation": "Came to",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "kessick-berth-8",
    "relation": "Rolled ashore at",
    "name": "Berth 8, Kessick",
    "group": "Places"
   },
   {
    "id": "mv-hollin-star",
    "relation": "Delivered by",
    "name": "MV Hollin Star",
    "group": "Things"
   },
   {
    "id": "project-gantry",
    "relation": "Part of",
    "name": "Project Gantry",
    "group": "Things"
   }
  ],
  "total": 9,
  "reports": 3,
  "aliases": [
   "first new crane",
   "first crane"
  ]
 },
 {
  "id": "gantry-new-crane-2",
  "name": "Gantry new ship-to-shore crane 2",
  "kind": {
   "name": "Equipment",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "next",
    "value": "Fri 27 Nov",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Rated load",
    "value": "65 tonnes under spreader",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   },
   {
    "label": "Outreach",
    "value": "51 metres",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "project-gantry",
    "relation": "Part of",
    "name": "Project Gantry",
    "group": "Things"
   }
  ],
  "total": 4,
  "reports": 2,
  "aliases": [
   "second new crane",
   "second crane"
  ]
 },
 {
  "id": "halverton",
  "name": "Halverton",
  "kind": {
   "name": "Place",
   "icon": "place"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Named with Osprey Logistics",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-18",
     "title": "Dunmore road convoy"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "osprey-logistics",
    "relation": "Mentioned with it",
    "name": "Osprey Logistics",
    "group": "Companies"
   }
  ],
  "total": 1,
  "reports": 1
 },
 {
  "id": "hana-okonjo",
  "name": "Hana Okonjo",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Master of MV Tern Bay",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "mv-tern-bay",
    "relation": "Master of",
    "name": "MV Tern Bay",
    "group": "Things"
   }
  ],
  "total": 1,
  "reports": 1,
  "aliases": [
   "Captain Hana Okonjo"
  ]
 },
 {
  "id": "ivo-renner",
  "name": "Ivo Renner",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Master of MV Saltmarsh Heron",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Reported",
    "value": "A smooth final approach once the wind dropped",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-06",
     "title": "Arrival: Saltmarsh Heron"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Master of",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   }
  ],
  "total": 2,
  "reports": 3,
  "aliases": [
   "Captain Ivo Renner",
   "Captain Renner"
  ]
 },
 {
  "id": "jo",
  "name": "Jo",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [],
  "problems": [],
  "facts": [],
  "around": [],
  "total": 0,
  "reports": 0
 },
 {
  "id": "kessick-berth-3",
  "name": "Berth 3, Kessick",
  "kind": {
   "name": "Facility",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "last-heard",
    "value": "Free until the next Brannock call",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-09",
     "title": "Departure: Saltmarsh Heron"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Working crane count",
    "value": "1",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Usual move rate",
    "value": "45 moves an hour for both cranes together",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Planned here",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "mv-tern-bay",
    "relation": "Given this berth",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "crane-c1",
    "relation": "Is here",
    "name": "Crane C1",
    "group": "Things"
   },
   {
    "id": "crane-c2",
    "relation": "Is here",
    "name": "Crane C2",
    "group": "Things"
   },
   {
    "id": "port-services",
    "relation": "Mentioned with it",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "brannock-lines",
    "relation": "Mentioned with it",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "tern-bay-mooring-line-incident",
    "relation": "Is here",
    "name": "Mooring line parted on MV Tern Bay, 14 Nov",
    "group": "Events"
   }
  ],
  "total": 14,
  "reports": 9,
  "aliases": [
   "berth 3"
  ]
 },
 {
  "id": "kessick-berth-7",
  "name": "Berth 7, Kessick",
  "kind": {
   "name": "Facility",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Works here Project Gantry",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "project-gantry",
    "relation": "Works here",
    "name": "Project Gantry",
    "group": "Things"
   }
  ],
  "total": 1,
  "reports": 2,
  "aliases": [
   "berth 7"
  ]
 },
 {
  "id": "kessick-berth-8",
  "name": "Berth 8, Kessick",
  "kind": {
   "name": "Facility",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Works here Project Gantry",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "project-gantry",
    "relation": "Works here",
    "name": "Project Gantry",
    "group": "Things"
   },
   {
    "id": "gantry-new-crane-1",
    "relation": "Mentioned with it",
    "name": "Gantry new ship-to-shore crane 1",
    "group": "Things"
   }
  ],
  "total": 2,
  "reports": 3,
  "aliases": [
   "berth 8"
  ]
 },
 {
  "id": "kessick-yard-block-d",
  "name": "Yard block D, Kessick",
  "kind": {
   "name": "Facility",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Part of Port of Kessick",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-16",
     "title": "Customs hold on Heron containers"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "port-of-kessick",
    "relation": "Part of",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Holds containers from",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   }
  ],
  "total": 2,
  "reports": 1,
  "aliases": [
   "yard block D"
  ]
 },
 {
  "id": "kofi-mensah",
  "name": "Kofi Mensah",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [
   {
    "key": "what",
    "value": "Leads operations",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-15",
     "title": "Steward note: Brannock Lines at Kessick"
    }
   }
  ],
  "problems": [
   {
    "kind": "conflict",
    "text": "Job: Operations lead or Leads operations",
    "source": {
     "how": "as-written",
     "reports": 4,
     "who": "Alex",
     "on": "2026-11-11",
     "title": "Weekly partner summary, week 45 (re-published)",
     "byYou": true
    }
   }
  ],
  "facts": [],
  "around": [
   {
    "id": "osprey-logistics",
    "relation": "Works for",
    "name": "Osprey Logistics",
    "group": "Companies"
   }
  ],
  "total": 4,
  "reports": 5
 },
 {
  "id": "legal-and-compliance",
  "name": "Legal and Compliance",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Would need to know about Osprey Logistics",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-13",
     "title": "Hunch about Osprey trucks",
     "byYou": true,
     "yours": true
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "osprey-logistics",
    "relation": "Would need to know about",
    "name": "Osprey Logistics",
    "group": "Companies"
   }
  ],
  "total": 1,
  "reports": 1
 },
 {
  "id": "linnet-two",
  "name": "Linnet Two",
  "kind": {
   "name": "Ship",
   "icon": "vessel"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Named with MV Saltmarsh Heron",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-08",
     "title": "Bunkering: Saltmarsh Heron"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Mentioned with it",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   }
  ],
  "total": 1,
  "reports": 1,
  "aliases": [
   "barge Linnet Two"
  ]
 },
 {
  "id": "lowmere-ardmor-depot",
  "name": "Lowmere Ardmor depot",
  "kind": {
   "name": "Facility",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "now",
    "value": "Not being sold; no plans to sell",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Future use",
    "value": "Empty containers and repairs",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "lowmere-freight-partners",
    "relation": "Owned by",
    "name": "Lowmere Freight Partners",
    "group": "Companies"
   }
  ],
  "total": 3,
  "reports": 1,
  "aliases": [
   "Ardmor depot"
  ]
 },
 {
  "id": "lowmere-dunmore-depot",
  "name": "Lowmere Dunmore depot",
  "kind": {
   "name": "Facility",
   "icon": "facility"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Named with MV Saltmarsh Heron",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-07",
     "title": "Lowmere shipment report, 7 Nov",
     "byYou": true
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Cargo received by road this week",
    "value": "1,410 tonnes",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-11",
     "title": "Weekly partner summary, week 45 (re-published)",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Handles traffic from",
    "value": "Most of the Kessick traffic",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Distance from kessick",
    "value": "About 140 km inland",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-05",
     "title": "Osprey Logistics onboarding",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Mentioned with it",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "osprey-logistics",
    "relation": "Mentioned with it",
    "name": "Osprey Logistics",
    "group": "Companies"
   }
  ],
  "total": 6,
  "reports": 5,
  "aliases": [
   "Dunmore depot",
   "Lowmere depot at Dunmore"
  ]
 },
 {
  "id": "lowmere-freight-partners",
  "name": "Lowmere Freight Partners",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Carries cargo for them MV Saltmarsh Heron",
    "source": {
     "how": "as-written",
     "reports": 4,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Agreed to pay storage",
    "value": "45 pounds a day per held container",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-16",
     "title": "Customs hold on Heron containers"
    },
    "adopted": false
   },
   {
    "label": "October storage charged",
    "value": "14 days of yard storage on 30 containers",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    },
    "adopted": false
   },
   {
    "label": "October storage own records",
    "value": "9 days",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    },
    "adopted": false
   },
   {
    "label": "Requested certificates from shipper",
    "value": "Certificates expected by 2026-11-18",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-16",
     "title": "Customs hold on Heron containers"
    },
    "adopted": false
   },
   {
    "label": "Storage move",
    "value": "Moving some storage from Ardmor to Dunmore",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Requested",
    "value": "Trucks ready from 06:00 on 2026-11-08",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-07",
     "title": "Lowmere shipment report, 7 Nov",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Figures source",
    "value": "Their own agent on the quay, not the terminal system",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-07",
     "title": "Lowmere shipment report, 7 Nov",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Carries cargo for them",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "mv-tern-bay",
    "relation": "Carries cargo for them",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "lowmere-ardmor-depot",
    "relation": "Mentioned with it",
    "name": "Lowmere Ardmor depot",
    "group": "Places"
   },
   {
    "id": "brannock-lines",
    "relation": "Main customer of",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "osprey-logistics",
    "relation": "Asked earlier start for",
    "name": "Osprey Logistics",
    "group": "Companies"
   },
   {
    "id": "marta-kowal",
    "relation": "Employs",
    "name": "Marta Kowal",
    "group": "People"
   },
   {
    "id": "ruth-adeyemi",
    "relation": "Contact",
    "name": "Ruth Adeyemi",
    "group": "People"
   }
  ],
  "total": 16,
  "reports": 11,
  "aliases": [
   "LFP",
   "Lowmere"
  ]
 },
 {
  "id": "marta-kowal",
  "name": "Marta Kowal",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [
   {
    "key": "what",
    "value": "Crane engineer",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-15",
     "title": "Steward note: Brannock Lines at Kessick"
    }
   }
  ],
  "problems": [
   {
    "kind": "duplicate",
    "text": "Works for: Lowmere Freight Partners or Port Services",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    }
   }
  ],
  "facts": [
   {
    "label": "Team",
    "value": "Procurement office",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    }
   },
   {
    "label": "Requested",
    "value": "Gate-in and gate-out times for each container",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    },
    "adopted": false
   },
   {
    "label": "Approves",
    "value": "Approves all Lowmere port service invoices above 5,000 pounds",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    }
   },
   {
    "label": "Asked",
    "value": "Whether the storage rate will change in January; confirmation promised in December",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    },
    "adopted": false
   },
   {
    "label": "Joined",
    "value": "2026-09",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    }
   }
  ],
  "around": [
   {
    "id": "port-services",
    "relation": "Works for",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "finance",
    "relation": "Mentioned with it",
    "name": "Finance",
    "group": "Companies"
   },
   {
    "id": "ardmor",
    "relation": "Based in",
    "name": "Ardmor",
    "group": "Places"
   },
   {
    "id": "port-of-kessick",
    "relation": "Works at",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "ruth-adeyemi",
    "relation": "Mentioned with it",
    "name": "Ruth Adeyemi",
    "group": "People"
   },
   {
    "id": "crane-c2",
    "relation": "Inspected",
    "name": "Crane C2",
    "group": "Things"
   }
  ],
  "total": 16,
  "reports": 5
 },
 {
  "id": "mv-hollin-star",
  "name": "MV Hollin Star",
  "kind": {
   "name": "Ship",
   "icon": "vessel"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Delivered Gantry new ship-to-shore crane 1",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "gantry-new-crane-1",
    "relation": "Delivered",
    "name": "Gantry new ship-to-shore crane 1",
    "group": "Things"
   }
  ],
  "total": 1,
  "reports": 1,
  "aliases": [
   "Hollin Star",
   "heavy-lift vessel"
  ]
 },
 {
  "id": "mv-saltmarsh-heron",
  "name": "MV Saltmarsh Heron",
  "kind": {
   "name": "Ship",
   "icon": "vessel"
  },
  "answer": [
   {
    "key": "now",
    "value": "Discharging at Ardmor",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   },
   {
    "key": "next",
    "value": "Port of Kessick, Tue 24 Nov",
    "source": {
     "how": "forecast",
     "reports": 3,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   }
  ],
  "problems": [
   {
    "kind": "conflict",
    "text": "Came off: 186 or 204",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-07",
     "title": "Discharge count, 7 Nov (Port Services)"
    }
   },
   {
    "kind": "conflict",
    "text": "Left by road: 28 or 40",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-07",
     "title": "Discharge count, 7 Nov (Port Services)"
    }
   },
   {
    "kind": "problem",
    "text": "Held by customs: 12, still held",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   },
   {
    "kind": "problem",
    "text": "Held containers expected clearance: 12 held containers expected to clear customs this week",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    }
   },
   {
    "kind": "problem",
    "text": "Why it is late: A gale in the approaches",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-04",
     "title": "Heron delayed by weather"
    }
   }
  ],
  "facts": [
   {
    "label": "Sails",
    "value": "Thu 26 Nov",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   },
   {
    "label": "Cargo status",
    "value": "212 TEU discharged and released by customs, except 12 containers held",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Alex",
     "on": "2026-11-11",
     "title": "Weekly partner summary, week 45 (re-published)",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Condition",
    "value": "Safe, no damage reported",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-04",
     "title": "Heron delayed by weather"
    },
    "adopted": false
   },
   {
    "label": "Discharged cargo",
    "value": "212 TEU",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    },
    "adopted": false
   },
   {
    "label": "Fuel taken on",
    "value": "85 tonnes of marine gas oil",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-08",
     "title": "Bunkering: Saltmarsh Heron"
    },
    "adopted": false
   },
   {
    "label": "Bunkering window",
    "value": "09:30 to 13:10",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-08",
     "title": "Bunkering: Saltmarsh Heron"
    },
    "adopted": false
   },
   {
    "label": "Fuel density",
    "value": "0.845 at 15 C",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-08",
     "title": "Bunkering: Saltmarsh Heron"
    },
    "adopted": false
   },
   {
    "label": "Empties landed",
    "value": "6 empty containers for Brannock Lines landed as planned",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-09",
     "title": "Departure: Saltmarsh Heron"
    },
    "adopted": false
   },
   {
    "label": "Average discharge rate",
    "value": "41 moves an hour",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-07",
     "title": "Discharge count, 7 Nov (Port Services)"
    },
    "adopted": false
   },
   {
    "label": "Left by road",
    "value": "28",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-07",
     "title": "Discharge count, 7 Nov (Port Services)"
    }
   }
  ],
  "around": [
   {
    "id": "lowmere-freight-partners",
    "relation": "Carrying for",
    "name": "Lowmere Freight Partners",
    "group": "Companies"
   },
   {
    "id": "customs",
    "relation": "Mentioned with it",
    "name": "Customs",
    "group": "Companies"
   },
   {
    "id": "brannock-lines",
    "relation": "Operated by",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "carrow-marine-fuels",
    "relation": "Mentioned with it",
    "name": "Carrow Marine Fuels",
    "group": "Companies"
   },
   {
    "id": "port-services",
    "relation": "Mentioned with it",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "ivo-renner",
    "relation": "Master",
    "name": "Ivo Renner",
    "group": "People"
   },
   {
    "id": "ardmor",
    "relation": "Sailed for",
    "name": "Ardmor",
    "group": "Places"
   },
   {
    "id": "dunmore",
    "relation": "Cargo onward destination",
    "name": "Dunmore",
    "group": "Places"
   },
   {
    "id": "kessick-yard-block-d",
    "relation": "Mentioned with it",
    "name": "Yard block D, Kessick",
    "group": "Places"
   },
   {
    "id": "kessick-berth-3",
    "relation": "Sailed from",
    "name": "Berth 3, Kessick",
    "group": "Places"
   },
   {
    "id": "port-of-kessick",
    "relation": "Bunkered at",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "tug-osprey",
    "relation": "Mentioned with it",
    "name": "Osprey (harbour tug)",
    "group": "Things"
   },
   {
    "id": "linnet-two",
    "relation": "Bunkered from",
    "name": "Linnet Two",
    "group": "Things"
   }
  ],
  "total": 73,
  "reports": 14,
  "aliases": [
   "Saltmarsh Heron",
   "Heron"
  ]
 },
 {
  "id": "mv-tern-bay",
  "name": "MV Tern Bay",
  "kind": {
   "name": "Ship",
   "icon": "vessel"
  },
  "answer": [
   {
    "key": "now",
    "value": "On her way to Kessick light ship",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    }
   }
  ],
  "problems": [
   {
    "kind": "problem",
    "text": "Schedule variance: Left dry dock a day earlier than the planned 2026-11-12",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    }
   }
  ],
  "facts": [
   {
    "label": "Shaft",
    "value": "Not damaged; no shaft replacement needed",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    }
   },
   {
    "label": "Type",
    "value": "Feeder",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    }
   },
   {
    "label": "Size",
    "value": "1,100 TEU",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    }
   },
   {
    "label": "Left dry dock",
    "value": "Wed 11 Nov",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   },
   {
    "label": "Dry dock until",
    "value": "Thu 12 Nov",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-01",
     "title": "Fleet weekly plan, week 45"
    },
    "adopted": false
   },
   {
    "label": "Moved along quay",
    "value": "About 4 metres",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    },
    "adopted": false
   },
   {
    "label": "Dry dock reason",
    "value": "Propeller work",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-01",
     "title": "Fleet weekly plan, week 45"
    },
    "adopted": false
   },
   {
    "label": "Earlier shaft finding",
    "value": "Shaft damage suspected by the yard's first inspection in October, since contradicted",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-12",
     "title": "Tern Bay leaves dry dock early"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "brannock-lines",
    "relation": "Operated by",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "lowmere-freight-partners",
    "relation": "Carrying for",
    "name": "Lowmere Freight Partners",
    "group": "Companies"
   },
   {
    "id": "port-services",
    "relation": "Mentioned with it",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "kessick-berth-3",
    "relation": "Assigned berth",
    "name": "Berth 3, Kessick",
    "group": "Places"
   },
   {
    "id": "port-of-kessick",
    "relation": "Called at",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "ardmor",
    "relation": "Dry dock location",
    "name": "Ardmor",
    "group": "Places"
   },
   {
    "id": "hana-okonjo",
    "relation": "Master",
    "name": "Hana Okonjo",
    "group": "People"
   },
   {
    "id": "tug-osprey",
    "relation": "Mentioned with it",
    "name": "Osprey (harbour tug)",
    "group": "Things"
   },
   {
    "id": "tern-bay-mooring-line-incident",
    "relation": "Involved",
    "name": "Mooring line parted on MV Tern Bay, 14 Nov",
    "group": "Events"
   }
  ],
  "total": 25,
  "reports": 7,
  "aliases": [
   "Tern Bay"
  ]
 },
 {
  "id": "note-author",
  "name": "Note author",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [],
  "problems": [],
  "facts": [],
  "around": [],
  "total": 0,
  "reports": 0
 },
 {
  "id": "osprey-logistics",
  "name": "Osprey Logistics",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "what",
    "value": "Road haulage partner",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-05",
     "title": "Osprey Logistics onboarding",
     "byYou": true
    }
   }
  ],
  "problems": [
   {
    "kind": "problem",
    "text": "Performance gap cause: Driver induction; expected to close this week",
    "source": {
     "how": "forecast",
     "reports": 2,
     "who": "Alex",
     "on": "2026-11-11",
     "title": "Weekly partner summary, week 45 (re-published)",
     "byYou": true
    }
   }
  ],
  "facts": [
   {
    "label": "Average containers per day",
    "value": "37",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    },
    "adopted": false
   },
   {
    "label": "Gate pass status",
    "value": "Not ready yet",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-07",
     "title": "Lowmere shipment report, 7 Nov",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Containers moved week46",
    "value": "186",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-18",
     "title": "Dunmore road convoy"
    },
    "adopted": false
   },
   {
    "label": "Average transit time",
    "value": "2 hours 10 minutes for 140 km",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-18",
     "title": "Dunmore road convoy"
    },
    "adopted": false
   },
   {
    "label": "On time rate",
    "value": "94 per cent",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-18",
     "title": "Dunmore road convoy"
    },
    "adopted": false
   },
   {
    "label": "Portal loads week46",
    "value": "186",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-18",
     "title": "Dunmore road convoy"
    },
    "adopted": false
   },
   {
    "label": "First day containers moved",
    "value": "31 against a target of 40",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Alex",
     "on": "2026-11-11",
     "title": "Weekly partner summary, week 45 (re-published)",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Trial review date",
    "value": "Fri 4 Dec",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Company type",
    "value": "Family firm",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-05",
     "title": "Osprey Logistics onboarding",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Fleet",
    "value": "18 tractor units and 30 trailers",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-05",
     "title": "Osprey Logistics onboarding",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "port-of-kessick",
    "relation": "Serves route from",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "dunmore",
    "relation": "Serves route to",
    "name": "Dunmore",
    "group": "Places"
   },
   {
    "id": "halverton",
    "relation": "Breakdown location",
    "name": "Halverton",
    "group": "Places"
   },
   {
    "id": "kofi-mensah",
    "relation": "Employs",
    "name": "Kofi Mensah",
    "group": "People"
   },
   {
    "id": "finance",
    "relation": "Mentioned with it",
    "name": "Finance",
    "group": "Companies"
   },
   {
    "id": "legal-and-compliance",
    "relation": "Mentioned with it",
    "name": "Legal and Compliance",
    "group": "Companies"
   },
   {
    "id": "lowmere-freight-partners",
    "relation": "Mentioned with it",
    "name": "Lowmere Freight Partners",
    "group": "Companies"
   },
   {
    "id": "port-services",
    "relation": "Mentioned with it",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "tug-osprey",
    "relation": "Not related to",
    "name": "Osprey (harbour tug)",
    "group": "Things"
   }
  ],
  "total": 34,
  "reports": 10,
  "aliases": [
   "Osprey Logistics Ltd",
   "Osprey Logistics"
  ]
 },
 {
  "id": "partner-meeting-2026-11-17",
  "name": "Partner meeting, 17 Nov",
  "kind": {
   "name": "Meeting",
   "icon": "calendar"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Named with Ruth Adeyemi",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Discussed",
    "value": "Rumour that Lowmere is selling its Ardmor depot",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-17",
     "title": "Lowmere denies depot sale",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "ruth-adeyemi",
    "relation": "Mentioned with it",
    "name": "Ruth Adeyemi",
    "group": "People"
   }
  ],
  "total": 2,
  "reports": 1,
  "aliases": [
   "today's partner meeting"
  ]
 },
 {
  "id": "port-of-kessick",
  "name": "Port of Kessick",
  "kind": {
   "name": "Port",
   "icon": "port"
  },
  "answer": [
   {
    "key": "next",
    "value": "Due here: MV Saltmarsh Heron, Tue 24 Nov",
    "source": {
     "how": "forecast",
     "reports": 3,
     "who": "Jo",
     "on": "2026-11-19",
     "title": "Heron next call forecast"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Brannock calls nov1to20",
    "value": "2",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    },
    "adopted": false
   },
   {
    "label": "Yard full",
    "value": "71 per cent",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-07",
     "title": "Discharge count, 7 Nov (Port Services)"
    }
   },
   {
    "label": "Wind",
    "value": "18 knots from the south-west",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Gate traffic",
    "value": "340 trucks",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Visibility",
    "value": "Good",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   },
   {
    "label": "Safety incidents",
    "value": "None",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Due here",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "mv-tern-bay",
    "relation": "Due here",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "gantry-new-crane-1",
    "relation": "Came here",
    "name": "Gantry new ship-to-shore crane 1",
    "group": "Things"
   },
   {
    "id": "project-gantry",
    "relation": "Is here",
    "name": "Project Gantry",
    "group": "Things"
   },
   {
    "id": "osprey-logistics",
    "relation": "Mentioned with it",
    "name": "Osprey Logistics",
    "group": "Companies"
   },
   {
    "id": "carrow-marine-fuels",
    "relation": "Mentioned with it",
    "name": "Carrow Marine Fuels",
    "group": "Companies"
   },
   {
    "id": "brannock-lines",
    "relation": "Berth deal with",
    "name": "Brannock Lines",
    "group": "Companies"
   },
   {
    "id": "kessick-yard-block-d",
    "relation": "Has part",
    "name": "Yard block D, Kessick",
    "group": "Places"
   },
   {
    "id": "marta-kowal",
    "relation": "Works here",
    "name": "Marta Kowal",
    "group": "People"
   }
  ],
  "total": 18,
  "reports": 16,
  "aliases": [
   "Kessick",
   "KSK"
  ]
 },
 {
  "id": "port-services",
  "name": "Port Services",
  "kind": {
   "name": "Organisation",
   "icon": "org"
  },
  "answer": [
   {
    "key": "now",
    "value": "Will review mooring at Berth 3, Kessick",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Release commitment",
    "value": "Release within four hours of customs clearance",
    "source": {
     "how": "forecast",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-16",
     "title": "Customs hold on Heron containers"
    },
    "adopted": false
   },
   {
    "label": "Holds weighbridge records",
    "value": "Weighbridge printouts for 9 to 13 November to be requested",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-13",
     "title": "Hunch about Osprey trucks",
     "byYou": true,
     "yours": true
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "project-gantry",
    "relation": "Hands over to them",
    "name": "Project Gantry",
    "group": "Things"
   },
   {
    "id": "mv-tern-bay",
    "relation": "Assigned berth to",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Reported discharge count for",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "marta-kowal",
    "relation": "Employs",
    "name": "Marta Kowal",
    "group": "People"
   },
   {
    "id": "osprey-logistics",
    "relation": "Arranging gate passes for",
    "name": "Osprey Logistics",
    "group": "Companies"
   }
  ],
  "total": 9,
  "reports": 10,
  "aliases": [
   "Kessick Port Services"
  ]
 },
 {
  "id": "project-gantry",
  "name": "Project Gantry",
  "kind": {
   "name": "Project",
   "icon": "folder"
  },
  "answer": [
   {
    "key": "next",
    "value": "Due to start: Fri 11 Dec",
    "source": {
     "how": "forecast",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   }
  ],
  "problems": [
   {
    "kind": "problem",
    "text": "Why it is late: Late crane arrival and rigger shortage",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   },
   {
    "kind": "problem",
    "text": "Risk: The heavy-lift vessel's schedule",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    }
   }
  ],
  "facts": [
   {
    "label": "Budget",
    "value": "4.2 million pounds",
    "source": {
     "how": "as-written",
     "reports": 2,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   },
   {
    "label": "Priority",
    "value": "The port's top capital project for the year",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    },
    "adopted": false
   },
   {
    "label": "Spent",
    "value": "2.9 million pounds",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-13",
     "title": "Project Gantry status, 13 Nov"
    }
   },
   {
    "label": "Scope",
    "value": "Replaces the two old ship-to-shore cranes at berths 7 and 8 with two new cranes",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   },
   {
    "label": "What it is",
    "value": "North terminal crane replacement",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-01",
     "title": "Fleet weekly plan, week 45"
    }
   },
   {
    "label": "Handover milestone",
    "value": "End of December",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   },
   {
    "label": "Civil works completed",
    "value": "Fri 30 Oct",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-03",
     "title": "Project Gantry status, 3 Nov"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "dana-holt",
    "relation": "Led by",
    "name": "Dana Holt",
    "group": "People"
   },
   {
    "id": "kessick-berth-7",
    "relation": "Works at berth",
    "name": "Berth 7, Kessick",
    "group": "Places"
   },
   {
    "id": "port-of-kessick",
    "relation": "At",
    "name": "Port of Kessick",
    "group": "Places"
   },
   {
    "id": "port-services",
    "relation": "Hands over to",
    "name": "Port Services",
    "group": "Companies"
   },
   {
    "id": "gantry-new-crane-1",
    "relation": "Has part",
    "name": "Gantry new ship-to-shore crane 1",
    "group": "Things"
   },
   {
    "id": "gantry-new-crane-2",
    "relation": "Has part",
    "name": "Gantry new ship-to-shore crane 2",
    "group": "Things"
   }
  ],
  "total": 24,
  "reports": 6,
  "aliases": [
   "Gantry",
   "north terminal crane replacement"
  ]
 },
 {
  "id": "ruth-adeyemi",
  "name": "Ruth Adeyemi",
  "kind": {
   "name": "Person",
   "icon": "person"
  },
  "answer": [
   {
    "key": "known-for",
    "value": "Copied on thread with Marta Kowal",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-12",
     "title": "Invoice query from Lowmere"
    }
   }
  ],
  "problems": [],
  "facts": [],
  "around": [
   {
    "id": "marta-kowal",
    "relation": "Copied on thread with",
    "name": "Marta Kowal",
    "group": "People"
   },
   {
    "id": "partner-meeting-2026-11-17",
    "relation": "Attended",
    "name": "Partner meeting, 17 Nov",
    "group": "Events"
   },
   {
    "id": "lowmere-freight-partners",
    "relation": "Mentioned with it",
    "name": "Lowmere Freight Partners",
    "group": "Companies"
   }
  ],
  "total": 3,
  "reports": 3
 },
 {
  "id": "tern-bay-mooring-line-incident",
  "name": "Mooring line parted on MV Tern Bay, 14 Nov",
  "kind": {
   "name": "Event",
   "icon": "event"
  },
  "answer": [
   {
    "key": "what",
    "value": "Stern mooring line parted during a squall",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    }
   },
   {
    "key": "when",
    "value": "Sat 14 Nov 21:35",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Wind gusts",
    "value": "38 knots",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    },
    "adopted": false
   },
   {
    "label": "Parted line age",
    "value": "8 years; sent for testing",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    },
    "adopted": false
   },
   {
    "label": "Anyone hurt",
    "value": "None",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Sam",
     "on": "2026-11-14",
     "title": "Incident: mooring line parted at berth 3"
    }
   },
   {
    "label": "Damage",
    "value": "None",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Jo",
     "on": "2026-11-20",
     "title": "Operations summary, 1 to 20 November"
    }
   }
  ],
  "around": [
   {
    "id": "kessick-berth-3",
    "relation": "At",
    "name": "Berth 3, Kessick",
    "group": "Places"
   },
   {
    "id": "mv-tern-bay",
    "relation": "Ship",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "brannock-lines",
    "relation": "Mentioned with it",
    "name": "Brannock Lines",
    "group": "Companies"
   }
  ],
  "total": 10,
  "reports": 2,
  "aliases": [
   "mooring line incident at berth 3",
   "parted mooring line"
  ]
 },
 {
  "id": "tug-osprey",
  "name": "Osprey (harbour tug)",
  "kind": {
   "name": "Ship",
   "icon": "vessel"
  },
  "answer": [
   {
    "key": "last-heard",
    "value": "Monthly inspection completed",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    }
   }
  ],
  "problems": [],
  "facts": [
   {
    "label": "Free?",
    "value": "Available",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Alex",
     "on": "2026-11-02",
     "title": "Port Services daily log, 2 Nov",
     "byYou": true
    }
   },
   {
    "label": "Booking date",
    "value": "Fri 6 Nov",
    "source": {
     "how": "as-written",
     "reports": 1,
     "who": "Harry",
     "on": "2026-11-04",
     "title": "Heron delayed by weather"
    },
    "adopted": false
   }
  ],
  "around": [
   {
    "id": "mv-tern-bay",
    "relation": "Booked to assist",
    "name": "MV Tern Bay",
    "group": "Things"
   },
   {
    "id": "mv-saltmarsh-heron",
    "relation": "Assisted unberthing",
    "name": "MV Saltmarsh Heron",
    "group": "Things"
   },
   {
    "id": "osprey-logistics",
    "relation": "Mentioned with it",
    "name": "Osprey Logistics",
    "group": "Companies"
   }
  ],
  "total": 9,
  "reports": 8,
  "aliases": [
   "Osprey",
   "harbour tug Osprey"
  ]
 }
];

/** A kind the shape has never seen: a hull survey (class "Survey", not in the ontology), from one booking. */
export const NEW_KIND_THING: ThingView = {
 "id": "hull-survey-tern-bay",
 "name": "Hull survey, MV Tern Bay",
 "kind": {
  "name": "Survey",
  "icon": "structure"
 },
 "answer": [
  {
   "key": "next",
   "value": "Scheduled survey date: Fri 27 Nov",
   "source": {
    "how": "forecast",
    "reports": 1,
    "who": "Jo",
    "on": "2026-11-18",
    "title": "Class survey booking"
   }
  }
 ],
 "problems": [],
 "facts": [
  {
   "label": "Scope",
   "value": "Hull and propeller after the dry dock work",
   "source": {
    "how": "as-written",
    "reports": 1,
    "who": "Jo",
    "on": "2026-11-18",
    "title": "Class survey booking"
   },
   "adopted": false
  },
  {
   "label": "Certificate expires",
   "value": "31 Jan 2027",
   "source": {
    "how": "as-written",
    "reports": 1,
    "who": "Jo",
    "on": "2026-11-18",
    "title": "Class survey booking"
   },
   "adopted": false
  },
  {
   "label": "Outstanding finding",
   "value": "Propeller blade tip repair not signed off",
   "source": {
    "how": "as-written",
    "reports": 1,
    "who": "Jo",
    "on": "2026-11-18",
    "title": "Class survey booking"
   },
   "adopted": false
  }
 ],
 "around": [
  {
   "id": "port-services",
   "relation": "Surveyor",
   "name": "Port Services",
   "group": "Companies"
  },
  {
   "id": "kessick-berth-3",
   "relation": "Survey location",
   "name": "Berth 3, Kessick",
   "group": "Places"
  },
  {
   "id": "mv-tern-bay",
   "relation": "Survey of",
   "name": "MV Tern Bay",
   "group": "Things"
  }
 ],
 "total": 7,
 "reports": 1
};
