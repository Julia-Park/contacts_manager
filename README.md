# Contact Manager
A Launch School JS239 practice project.
Implementation of a front-end JavaScript web application for a contact manager.
Server-side API provided by Launch School.

# Features and Requirements:
- Should use Handlebars for templating
- There are some animations

**Add contact:**
- Add contact button on home page
- Display a Create Contact form with Full name, Email address, Telephone number, as well as a Submit and Cancel (closes/hides the form) button
  - Validation:
    - Name (must not be blank)
    - Email (must not be blank, must be valid)
    - Phone (must not be blank)

**Display contacts:**
- Display all contacts on the home page
  - Each contact has Name, Phone Number, Email
  - Each contact has an Edit and Delete button
    - Delete button results in a prompt to confirm deletion (cancel, ok)
    - Edit button results in a pre-populated form similiar to the create contact form with same validations and buttons
- If there are no contacts, display a "There is no contacts." message and an Add Contact button below it.

**Search**
- Seems to search based on matching the name, not case sensitive (on keyup); doesn't seem to be any throttling
- If there are no matching results: 'there is no contacts starting with xx'

**Tagging**
- Allow for creation of tags ("marketing", "sales", "engineering")
- Allow for selection of a tag to attach at contact creation
- Allow for displaying of all contacts for a given tag
