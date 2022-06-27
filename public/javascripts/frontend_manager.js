class Contact {
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
    return this.contacts.filter(contact => contact.id === parseInt(id, 10))[0];
  }

  createContact() {
    // make request
    let requestOptions = {
      method: 'POST',
      body: '',
    }

    fetch('/api/contacts', requestOptions);
  }

  updateContact(id) {
    // make request
    let requestOptions = {
      method: 'PUT',
      body: JSON.stringify(),
    }

    fetch(`/api/contacts${id}`, requestOptions);
    // update internal collection with new data
    // re-render
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