let Contact = class Contact {
  constructor(data) {
    this.id = data.id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.tags = data.tags;
  }

  update(data) {
    Object.keys(data).forEach(key => this[key] = data[key]);
  }
}

let Manager = (function() {
  let contacts = [];

  return class Manager {
    constructor() {
      this.initializeContacts();
    }
  
    initializeContacts() { // fetch contacts, create contact objects
      fetch('/api/contacts').then(async response => {
        let data;
  
        if (response.status === 200) {
          data = await response.json();
          data.forEach(this.addContact);
        }
      });
    }
  
    addContact(data) {
      contacts.push(new Contact(data));
    }
  
    findContact(id) {
      return contacts.filter(contact => contact.id === parseInt(id, 10))[0];
    }
  
    createContact(data) { // accepts data object containing contact parameters
      let requestOptions = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        }
      }
  
      fetch('/api/contacts', requestOptions).then(async response => {
        switch (response.status) {
          case 201:
          let contactData = await response.json();
          this.addContact(contactData);
          break;
        }
      });
    }

    updateContact(id, data) {
      data.id = id;

      let requestOptions = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        }
      }
  
      fetch(`/api/contacts/${id}`, requestOptions).then(async response => {
        switch (response.status) {
          case 201:
          let contactData = await response.json();
          this.findContact(id).update(contactData);
          break;
        }
      });
    }
  }
})();

let App = class App {
  constructor() {
    this.manager = Manager.new();
    this.view = View.new();
  } // get initial data, render display
}

let View = class View {
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