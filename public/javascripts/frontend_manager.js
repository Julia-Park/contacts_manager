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
  let contacts;

  return class Manager {
    constructor() {
      this.loadContacts();
    }
  
    loadContacts() { // fetch contacts, create contact objects
      fetch('/api/contacts').then(async response => {
        let data;

        if (response.status === 200) {
          contacts = [];
          data = await response.json();
          data.forEach(this.addToContacts);
        }
      });
    }
  
    addToContacts(contactData) {
      contacts.push(new Contact(contactData));
    }

    removeFromContacts(id) {
      let idx = contacts.findIndex(contact => contact.id === parseInt(id, 10));
      contacts.splice(idx, 1);
    }

    getContacts() {
      return contacts.slice();
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
          this.addToContacts(contactData);
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

    deleteContact(id) {
      let requestOptions = {
        method: 'DELETE',
      }

      fetch(`/api/contacts/${id}`, requestOptions).then(response => {
        switch (response.status) {
          case 204:
            this.removeFromContacts(id);
            break;
        }
      });
    }
  }
})();

let App = class App {
  constructor() {
    this.manager = new Manager();
    this.view = new View(manager.getContacts());
  } // get initial data, render display
}

let View = class View {
  constructor(contacts) {
    this.templates = {};
    this.compileTemplates();
    // register Handlebars templates and partials
    Handbars.
    // if there are contacts, display contacts with Handlebar
  }

  compileHandlebars() {
    let hbTemplates = document.querySelectorAll('script[type="text/x-handlebars"]');
    hbTemplates.forEach(template => {
      templates[template.id] = Handlebars.compile(template.innerHTML());
      if (template.classList.contains('hbPartial')) {
        Handlebars.registerPartial(template.id, template.innerHTML());
      }
    });
  }
}

new App();


/*
Initial flow:
- Initialize Manager
  - Get initial data
  - Set up initial render
*/