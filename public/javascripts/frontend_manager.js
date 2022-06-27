class Contact {
  constructor(data) {
    this.id = data.id;
    this.fullName = data.full_name;
    this.email = data.email;
    this.phoneNumber = data.phone_number;
    this.tags = data.tags;
  }
}

class Manager {
  constructor() {
    this.contacts = [];
    this.initializeContacts();
  }

  initializeContacts() { // fetch contacts, create contact objects
    fetch('/api/contacts').then(async response => {
      let data;

      if (response.status === 200) {
        data = await response.json();
        data.forEach(entry => this.contacts.push(new Contact(entry)));
      }      
    });
  }

  findContact(id) {
    return this.contacts.filter(contact => contact.id === parseInt(id, 10));
  }
}

class App {
  constructor() {
    this.manager = Manager.new();
    this.view = View.new();
  } // get initial data, render display
}

class View {
  constructor() {
  }
}

// new App();

let manager = new Manager();

/*
Initial flow:
- Initialize Manager
  - Get initial data
  - Set up initial render
*/