<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# CodeForge🎯

## Basic Details

### Team Name: Name
CodeForge

### Team Members
- Member 1: Thresia Stefi - Government Engineering College Sreekrishnapuram
- Member 2: Aswani k - Government Engineering College Sreekrishnapuram

### Hosted Project Link
[mention your project hosted link here]

### Project Description
CodeForge is a student project collaboration hub where developers, designers, and builders can discover open projects, form teams based on complementary skills, and track project progress — all in one place. It calculates a real-time compatibility score between a user's skillset and any project's requirements, making team formation smarter and faster.

### The Problem statement
Students with project ideas struggle to find teammates with the right skills, while skilled students can't discover projects that need them. There's no centralized platform designed for student project collaboration — resulting in great ideas dying due to incomplete teams, and talented individuals sitting on the sidelines.

### The Solution
CodeForge lets students create profiles with their skills, post projects with required skillsets, and browse open projects with an AI-style compatibility score. The platform automatically matches users to projects based on skill overlap, highlights what skills they bring vs. what's missing, and manages the entire join-request and team formation workflow — from request to accepted member.



## Technical Details

### Technologies/Components Used

**For Software:**
- Languages used:  HTML5, CSS3, JavaScript (ES6+)
- Frameworks used: None — pure vanilla JS (no frameworks)
- Libraries used: Google Fonts (Syne + DM Sans via CDN)
- Tools used:  VS Code, Git, GitHub, Live Server extension, Browser DevTools

**For Hardware:**
Not applicable — this is a web application.



## Features

List the key features of your project:
- Feature 1: User Registration & Profile: Sign up with name, email, department, year, bio, and multi-select skill chips (40+ skills). Edit profile at any time. Demo account available for instant access.
- Feature 2:Project Creation: Create projects with title, description, category (AI/ML, Web, Mobile, DevTools, etc.), team size, and required skills. Projects are automatically marked "Open for Teammates."
- Feature 3:Browse & Smart Matching: Browse all open projects with live search (by keyword or skill) and category filters. Each project card shows a real-time compatibility % score based on your skills vs. required skills — matched skills highlighted in green, missing skills shown in red.
- Feature 4: Join Request System: Request to join any open project with an optional message. Project creators receive a notification and can accept or decline from the Requests tab, viewing the applicant's full profile and compatibility score before deciding.
- Feature 5: Project Dashboard: A full per-project management panel with 5 tabs — Overview (description + compat), Team (all members + skill chips + remove), Updates (post announcements, notifies all members), Tasks (add/assign/complete/delete with checkboxes), and Requests (accept/decline join requests).
- Feature 6: Notification System: Bell icon with an unread badge. Users are notified about join requests received, acceptance/rejection of their requests, new project updates, and being removed from a team. Mark individual or all notifications as read.
- Feature 7: Responsive Design: Fully mobile-friendly dark industrial-tech UI with gold accents, smooth page transitions, toast notifications, and modal dialogs.

---

## Implementation

### For Software:

#### Installation
```bash
# No installation required — pure HTML/CSS/JS
# Option 1: Clone and open
git clone https://github.com/yourusername/codeforge.git
cd codeforge

# Option 2: Simply download and open index.html in any browser
```

#### Run
```bash
# Option 1: Open directly
open index.html   # macOS
start index.html  # Windows

# Option 2: Use VS Code Live Server
# Right-click index.html → "Open with Live Server"

# Option 3: Quick Python server
python -m http.server 3000
# Then visit http://localhost:3000
```

### For Hardware:

#### Components Required
[List all components needed with specifications]

#### Circuit Setup
[Explain how to set up the circuit]

---

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

![Screenshot1]
![alt text](image-1.png)
Login & Registration screen — sign up with skills, department, bio, or use the one-click demo account

![Screenshot2]
![alt text](image-2.png)
Browse Projects page — search bar, category filters, compatibility scores, and color-coded skill chips on each project card

![Screenshot3]
![alt text](image-3.png)
Project Dashboard — 5-tab management panel showing team members, tasks with checkboxes, update feed, and join request review with applicant profiles

#### Diagrams

**System Architecture:**

![Architecture Diagram]
![alt text](image-4.png)
CodeForge runs entirely in the browser — no server, no backend needed.
Structure
The whole app is one HTML file. All four pages (Home, Projects, Dashboard, Profile) are hidden sections inside it. JavaScript shows and hides them on navigation — no page reloads.
JavaScript
Logic is split across 7 modules. data.js sits at the base — every other module depends on it for reading/writing data and calculating compatibility scores. ui.js provides shared tools like modals and toasts. The remaining five modules (auth, profile, projects, dashboard, notifications) each own one feature and talk to each other only through data.js and ui.js.
Storage
The browser's localStorage acts as the database. All users, projects, requests, and notifications are stored as JSON and persist across refreshes — no external database required.
Flow
User action → JS module → data.js → localStorage → updated data rendered back on screen.

**Application Workflow:**

![Workflow]
![alt text](image-5.png)
App opens → checks if user is logged in
Not logged in → Auth Screen (register or login) → on success, go to Home

Home Page → shows best-matched open projects sorted by compatibility %
From Home, user can go to:

Browse Projects → search/filter → view compat score → send join request with message → notification sent to project creator

Dashboard → manage your projects → 5 tabs: Overview, Team, Updates, Tasks, Requests → accept or decline join requests → accepted user gets added to team + notified

Profile → view stats, edit skills/bio, see history of requests sent


Notifications → triggered any time a request is sent, accepted, declined, or an update is posted

---

### For Hardware:

#### Schematic & Circuit

![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*

#### Build Photos

![Team](Add photo of your team here)

![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
![alt text](image-6.png)

---

## Additional Documentation
API / Data Layer Documentation
Since CodeForge uses localStorage as its data store, the data.js module acts as the API layer.

in words3:41 PMThe app uses five localStorage keys as its database.
cf_users stores every registered account as an array of user objects — each containing the user's name, email, skills, department, year, bio, and the list of projects they created or joined.
cf_current_user holds the single currently logged-in user as an object. This is what the app checks on startup to decide whether to show the login screen or go straight to the home page.
cf_projects stores all created projects — each with its title, description, required skills, team size, member list, tasks, updates, and open/closed status.
cf_requests tracks every join request ever made, along with its current status — pending, accepted, or rejected. This lets both the requester and the project creator see the history.
cf_notifications holds all notifications for all users. Each notification is tied to a specific user ID, so the bell icon only shows notifications relevant to the person currently logged in.

### For Web Projects with Backend:
CodeForge has no backend — it is a fully frontend-only project. There is no server, no API, and no database server.

#### API Documentation
CodeForge has no backend API. It is a fully frontend-only project — no server, no HTTP requests, no endpoints. All data operations happen locally in the browser through the data.js module using localStorage. This replaces what would normally be API calls. No base URL exists because no network requests are made.

**Base URL:** `https://api.yourproject.com`

##### Endpoints

**GET /api/endpoint**
- **Description:** 
- **Parameters:**
  - `param1` (string): [Description]
  - `param2` (integer): [Description]
- **Response:**
```json
{
  "status": "success",
  "data": {}
}
```

**POST /api/endpoint**
- **Description:** [What it does]
- **Request Body:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Operation completed"
}
```

[Add more endpoints as needed...]

---

### For Mobile Apps:

#### App Flow Diagram

![App Flow](docs/app-flow.png)
*Explain the user flow through your application*

#### Installation Guide

**For Android (APK):**
1. Download the APK from [Release Link]
2. Enable "Install from Unknown Sources" in your device settings:
   - Go to Settings > Security
   - Enable "Unknown Sources"
3. Open the downloaded APK file
4. Follow the installation prompts
5. Open the app and enjoy!

**For iOS (IPA) - TestFlight:**
1. Download TestFlight from the App Store
2. Open this TestFlight link: [Your TestFlight Link]
3. Click "Install" or "Accept"
4. Wait for the app to install
5. Open the app from your home screen

**Building from Source:**
CodeForge has no build process — there is nothing to compile, bundle, or install.
It is built with plain HTML, CSS, and vanilla JavaScript. No frameworks, no npm packages, no build tools like Webpack or Vite. The code runs directly in the browser as-is.

---

### For Hardware Projects:

#### Bill of Materials (BOM)

| Component | Quantity | Specifications | Price | Link/Source |
|-----------|----------|----------------|-------|-------------|
| Arduino Uno | 1 | ATmega328P, 16MHz | ₹450 | [Link] |
| LED | 5 | Red, 5mm, 20mA | ₹5 each | [Link] |
| Resistor | 5 | 220Ω, 1/4W | ₹1 each | [Link] |
| Breadboard | 1 | 830 points | ₹100 | [Link] |
| Jumper Wires | 20 | Male-to-Male | ₹50 | [Link] |
| [Add more...] | | | | |

**Total Estimated Cost:** ₹[Amount]

#### Assembly Instructions

**Step 1: Prepare Components**
1. Gather all components listed in the BOM
2. Check component specifications
3. Prepare your workspace
![Step 1](images/assembly-step1.jpg)
*Caption: All components laid out*

**Step 2: Build the Power Supply**
1. Connect the power rails on the breadboard
2. Connect Arduino 5V to breadboard positive rail
3. Connect Arduino GND to breadboard negative rail
![Step 2](images/assembly-step2.jpg)
*Caption: Power connections completed*

**Step 3: Add Components**
1. Place LEDs on breadboard
2. Connect resistors in series with LEDs
3. Connect LED cathodes to GND
4. Connect LED anodes to Arduino digital pins (2-6)
![Step 3](images/assembly-step3.jpg)
*Caption: LED circuit assembled*

**Step 4: [Continue for all steps...]**

**Final Assembly:**
![Final Build](images/final-build.jpg)
*Caption: Completed project ready for testing*

---

### For Scripts/CLI Tools:

#### Command Reference

**Basic Usage:**
```bash
python script.py [options] [arguments]
```

**Available Commands:**
- `command1 [args]` - Description of what command1 does
- `command2 [args]` - Description of what command2 does
- `command3 [args]` - Description of what command3 does

**Options:**
- `-h, --help` - Show help message and exit
- `-v, --verbose` - Enable verbose output
- `-o, --output FILE` - Specify output file path
- `-c, --config FILE` - Specify configuration file
- `--version` - Show version information

**Examples:**

```bash
# Example 1: Basic usage
python script.py input.txt

# Example 2: With verbose output
python script.py -v input.txt

# Example 3: Specify output file
python script.py -o output.txt input.txt

# Example 4: Using configuration
python script.py -c config.json --verbose input.txt
```

#### Demo Output

**Example 1: Basic Processing**

**Input:**
```
This is a sample input file
with multiple lines of text
for demonstration purposes
```

**Command:**
```bash
python script.py sample.txt
```

**Output:**
```
Processing: sample.txt
Lines processed: 3
Characters counted: 86
Status: Success
Output saved to: output.txt
```

**Example 2: Advanced Usage**

**Input:**
```json
{
  "name": "test",
  "value": 123
}
```

**Command:**
```bash
python script.py -v --format json data.json
```

**Output:**
```
[VERBOSE] Loading configuration...
[VERBOSE] Parsing JSON input...
[VERBOSE] Processing data...
{
  "status": "success",
  "processed": true,
  "result": {
    "name": "test",
    "value": 123,
    "timestamp": "2024-02-07T10:30:00"
  }
}
[VERBOSE] Operation completed in 0.23s
```

---

## Project Demo

### Video
<video controls src="20260228-1028-53.2277689.mp4" title="DEMO VIDEO"></video>



The video covers the entire working of the website

### Additional Demos
[Add any extra demo materials/links - Live site, APK download, online demo, etc.]

---

## AI Tools Used (Optional - For Transparency Bonus)

**Tool Used:** 

VS Code
Live Server
Chrome DevTools
Git & GitHub
Google Fonts
CodePen
Claude (Anthropic)
Browser localStorage
**Purpose:** [What you used it for]
- CodeForge exists to solve one core problem — students with project ideas can't find the right teammates, and skilled students can't find projects that need them.
The purpose of CodeForge is to be a dedicated collaboration hub for students, where they can:

Post projects they are building and advertise what skills they need
Discover projects that match their skillset through a compatibility score
Form teams by sending and managing join requests
Track progress together through shared tasks, updates, and team management

It replaces the chaos of asking around in group chats or hoping to meet the right person by chance. Instead, every student has a skill-based profile, every project has a required skillset, and the platform automatically surfaces the best matches — showing exactly what skills you bring to a project and what skills are still missing.
The goal is to make sure no good project idea dies because the builder couldn't find a team, and no skilled student sits idle because they couldn't find a project worth joining.

**Key Prompts Used:**
-"Build a Project Hub web application using HTML, CSS, and JavaScript with user registration, project creation, browse/join, compatibility scoring, dashboard, and notifications"
"Add suboptions under Frontend, Backend, UX/UI skill chips with multi-select"
"When clicked Fill Project Details it should open a filling space on the same page"
"I pasted it on CodePen, buttons are not working — make it a single combined file"
"Make the architecture and workflow diagrams as PNG images"

Percentage of AI-generated code: approximately 95%


**Percentage of AI-generated code:** 
Tool Used: Claude by Anthropic
Purpose: Full application development from concept to working prototype.

Designed the complete 7-module JavaScript architecture
Built all HTML structure, CSS design system, and responsive UI
Implemented localStorage CRUD operations and the compatibility scoring engine
Created the join request, notification, task, and team management systems
Debugged and packaged the entire app into a single self-contained file for CodePen

**Human Contributions:**
Project concept and problem statement definition
Feature requirements and scope decisions
Testing, feedback, and iterative refinement across multiple sessions
Documentation writing and README completion
Deployment and submission

## Team Contributions

- Aswani k: Specific contributions - e.g., Frontend development, idea contribution
- Thresia Stefi: Specific contributions - e.g., Backend development, Readme completion .



## License

This project is licensed under the MIT License. This means anyone is free to use, copy, modify, and distribute the code for any purpose, including commercially, as long as the original copyright notice is included. MIT was chosen because CodeForge is an open educational tool intended to help students — keeping it as open and permissive as possible aligns with that goal.

**Common License Options:**
- MIT License (Permissive, widely used)
- Apache 2.0 (Permissive with patent grant)
- GPL v3 (Copyleft, requires derivative works to be open source)

---

Made with ❤️ at TinkerHub
