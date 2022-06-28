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
      this.contactsLoaded = this.loadContacts();
    }
  
    async loadContacts() { // fetch contacts, create contact objects
      let response = await fetch('/api/contacts');
      
      let data;

      if (response.status === 200) {
        contacts = [];
        data = await response.json();
        data.forEach(this.addToContacts);
      }
    }
  
    addToContacts(contactData) {
      contacts.push(new Contact(contactData));
    }

    removeFromContacts(id) {
      let idx = contacts.findIndex(contact => contact.id === parseInt(id, 10));
      contacts.splice(idx, 1);
    }

    async getContacts() {
      await this.contactsLoaded;
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
    this.view = new View();
    this.manager.contactsLoaded.then(() => this.displayContacts());
    this.view.renderNewContactForm();
    this.addListeners();
  }

  async displayContacts() {
    let contacts = await this.manager.getContacts();
    this.view.renderContacts(contacts);
  }

  addListeners() {
    let addContact = document.querySelector('#addContact');
    addContact.addEventListener('click', event => {
      event.preventDefault();
      this.view.transitionToContactForm();
    });

    let newContact = document.querySelector('#form');
    newContact.addEventListener('submit', async event => {
      event.preventDefault();

      try {
        let validData = await this.view.validateForm();
        this.manager.createContact(validData);
      } catch (errorMsg) {
        console.log(errorMsg);
      }

    });

    newContact.addEventListener('reset', () => {
      this.view.transitionToMain();
    });

  }
}

let View = class View {
  constructor() {
    this.templates = {};
    this.compileHandlebars();
  }

  compileHandlebars() {
    let hbTemplates = document.querySelectorAll('script[type="text/x-handlebars"]');
    let templates = this.templates;

    hbTemplates.forEach(template => {
      templates[template.id] = Handlebars.compile(template.innerHTML);
      if (template.classList.contains('hbPartial')) {
        Handlebars.registerPartial(template.id, template.innerHTML);
      }
    });
  }

  insertHTML(selector, templateName, dataObject, position = 'beforeend') {
    let section = document.querySelector(selector);
    section.insertAdjacentHTML(position, this.templates[templateName](dataObject));
  }

  renderContacts(contacts) {
    this.insertHTML('#contacts', 'contactList', { contacts });
  }

  renderNewContactForm() {
    this.insertHTML('#form', 'contactForm', { formTitle: 'Create Contact' });
  }

  transitionToContactForm() {
    document.querySelector('main').style.display = 'none';
    document.querySelector('#form').style.display = 'inline';
  }

  transitionToMain() {
    document.querySelector('#form').style.display = 'none';
    document.querySelector('main').style.display = 'inline';
  }
  
  validateForm() {
    return new Promise((resolve, reject) => {
      let inputs = document.querySelectorAll('#form input');
      let formData = {};

      inputs.forEach(input => {
        let pattern = input.getAttribute('pattern');
        if (pattern) {
          let patternMatch = input.value.search(pattern);
          if (patternMatch < 0) reject(input.getAttribute('data-alert'));
        }

        if (input.id) {
          formData[input.id] = input.value;
        }
      });

      resolve(formData);
    });
  }
}

let start;

document.addEventListener('DOMContentLoaded', () => {
  start = new App();
});
