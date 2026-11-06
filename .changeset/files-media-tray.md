---
'@augur/app-kit': minor
---

Files and media drawn as Tray (picked 6 Nov 2026). DropZone is now a well that owns its section, its Choose button a small key; dragging over lightens it and turns its edge ink, no longer green (green means "needs you"). New parts: `UploadList` (rows in a well, each file's progress a line along its row's foot, a failed file red with its reason and Retry, past `show` rows the rest fold into "N more" so it never scrolls), `Attachment` (a file on a message or record as a small key, with a sending line, a red edge when it fails and a round remove button), `Picture` (an image that keeps its shape while it loads and says so if it can't), and `FilePreview` (a file to read in place, paged with Back and On, or why it can't be shown, with Download). Helpers `fileIcon`, `fileSize` and `splitName`. Story pages under Quill/Files. No changes to existing props.
