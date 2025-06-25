**STATUS:**
- Phase 1 (Backend CRUD): **DONE**
- Phase 2 (Dashboard template): **DONE**
- Phase 3 (Admin Tables & CRUD): **DONE**
  - Courses Table: **DONE**
  - Lessons Table: **DONE** 
  - Lesson View/Edit Page: **DONE** (with enhanced markdown preview & editor + MinIO integration)
  - Tests Table: **DONE**
  - MinIO Integration: **DONE** (file upload/delete/list/browse)
  - Media Browser: **DONE** (browse/reuse previously uploaded files)
  - Image Insert Dialog: **DONE** (upload to MinIO + browse existing)
  - Audio Insert Dialog: **DONE** (upload to MinIO + browse existing)
- Next: Create test view/edit page, implement question management.

---

# PHASED PLAN FOR LMS ADMIN DASHBOARD

---

## **PHASE 1: BACKEND API ENHANCEMENTS**

### **1.1. Analyze Models and Relationships**
- [x] **Course**: Has lessons (array of Lesson refs), tests (array of Test refs), level (A1, A2, B1, B2).
- [x] **Lesson**: Belongs to a course, has markdown content.
- [x] **Test**: Belongs to a course, has questions (array), each question has type, options, correctAnswer, etc.
- [x] **User**: Has progress, completedLessons, completedTests, etc.

### **1.2. Add CRUD Endpoints**
- [x] **Courses**: Create, Read, Update, Delete
- [x] **Lessons**: Create, Read, Update, Delete (linked to courses)
- [x] **Tests**: Create, Read, Update, Delete (linked to courses)
- [x] **Questions**: Managed as part of Test objects (nested CRUD)
- [x] **Users**: List, Update, Delete (no create, as registration is public)

**Tasks:**
- [x] Add POST `/api/courses` (create course)
- [x] Add PUT `/api/courses/:id` (update course)
- [x] Add DELETE `/api/courses/:id` (delete course)
- [x] Add POST `/api/courses/:courseId/lessons` (create lesson)
- [x] Add PUT `/api/courses/lessons/:lessonId` (update lesson)
- [x] Add DELETE `/api/courses/lessons/:lessonId` (delete lesson)
- [x] Add POST `/api/courses/:courseId/tests` (create test)
- [x] Add PUT `/api/courses/tests/:testId` (update test)
- [x] Add DELETE `/api/courses/tests/:testId` (delete test)
- [x] Add GET/PUT/DELETE for users

**Checkpoint:**  
You test all new endpoints with Postman or Swagger before we move to the frontend.

---

## **PHASE 2: NEXT.JS ADMIN DASHBOARD BOILERPLATE**

### **2.1. Choose a Next.js Admin Template**
- [x] Scaffold a Next.js app with your chosen admin template.
- [/] Set up authentication (simple JWT or session, or just a hardcoded admin for now).

**Checkpoint:**  
[ ] You confirm the template and basic login works.

---

## **PHASE 3: ADMIN TABLES & CRUD UI**

### **3.1. Courses Table**
- [x] List all courses, with actions: Edit, Delete, View Lessons, View Tests.
- [x] Add/Edit modal or page for course (fields: title, description, level).

### **3.2. Lessons Table**
- [x] Nested under a course.
- [x] List all lessons for a course, with actions: Edit, Delete.
- [x] Add/Edit modal for lesson (fields: title, order, markdown content).
- [x] Lesson View/Edit page with enhanced markdown preview and editor.

### **3.3. Tests Table**
- [x] Nested under a course.
- [x] List all tests for a course, with actions: Edit, Delete, View Questions.
- [x] Add/Edit modal for test (fields: title, description, order, passingScore, isFinal).
- [ ] Test View/Edit page with question management.

### **3.4. Questions Table**
- [ ] Nested under a test.
- [ ] List all questions, with actions: Edit, Delete.
- [ ] Add/Edit modal for question (fields depend on type: multiple-choice, matching, ordering, fill-in-blanks, input, categories).
- [ ] Support for complex question types (see your `test.tests.json` for structure).

### **3.5. Users Table**
- [ ] List all users, with actions: Edit, Delete, View Progress.
- [ ] Edit modal for user (fields: name, email, password, progress).

**Tasks:**
- [x] Implement Courses table + CRUD
- [x] Implement Lessons table + CRUD (nested)
- [x] Implement Lesson View/Edit page with enhanced markdown preview and editor
- [x] Implement Tests table + CRUD (nested)
- [x] Implement MinIO file storage integration (backend)
- [x] Implement file upload/delete endpoints
- [x] Implement file listing/browsing endpoints
- [x] Create MediaBrowser component for file management
- [x] Create ImageInsertDialog with MinIO integration
- [x] Create AudioInsertDialog with MinIO integration
- [ ] Implement Test View/Edit page with question management
- [ ] Implement Questions table + CRUD (nested)
- [ ] Implement Users table + CRUD

**Checkpoint after each table:**  
You test the table and CRUD before moving to the next.

---

## **PHASE 4: ADVANCED FEATURES**

### **4.1. Markdown Editor**
- [ ] Integrate a markdown editor (e.g., [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite)) for lessons and question explanations.

### **4.2. Rich Question Editor**
- [ ] Drag-and-drop for ordering/matching
- [ ] Image upload for questions/options
- [ ] Audio upload/link for questions

### **4.3. Progress Visualization**
- [ ] Show user progress (completed lessons/tests, scores) in user detail view.

### **4.4. Bulk Import/Export**
- [ ] Allow admin to import/export courses/tests as JSON (matching your current structure).

**Tasks:**
- [ ] Integrate markdown editor
- [ ] Add drag-and-drop for ordering/matching
- [ ] Add image/audio upload
- [ ] Add progress visualization
- [ ] Add import/export

**Checkpoint after each feature:**  
You test the feature before moving on.

---

## **PHASE 5: POLISH & DEPLOY**

### **5.1. UI Polish**
- [ ] Responsive design, error handling, loading states, etc.

### **5.2. Security**
- [ ] Protect admin routes, validate all inputs, sanitize markdown.

### **5.3. Deployment**
- [ ] Deploy backend (Heroku, Render, etc.)
- [ ] Deploy admin dashboard (Vercel, Netlify, etc.)

---

# **NEXT STEPS**

- [ ] You confirm the dashboard template is running.
- [ ] I guide you to set up the folder structure and first CRUD table.

---

**Let me know if you want to adjust the plan, or which admin template you want to use.**  
**Once confirmed, I'll start with the backend API changes.**

---

**References:**  
- [React Admin](https://marmelab.com/react-admin/)
- [Material Dashboard Next.js](https://mui.com/store/items/material-dashboard/)
- [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite)
- [Tabler React](https://tabler.io/)