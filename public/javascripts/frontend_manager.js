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

    // this.view = new View();
  }

  initializeContacts() { // fetch contacts, create contact objects
    fetch('/api/contacts').then(async response => {
      let data;

      if (response.status === 200) {
        data = await response.json();
        data.forEach(entry => this.contacts.push(new Contact(entry)));
      }
      
      console.log(this.contacts);
    });
  }
}

class View {
  constructor() {
    // this.render();
  }
}

new Manager();

/*
Initial flow:
- Initialize Manager
  - Get initial data
  - Set up initial render
*/