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
  let tags = [];

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

    compileTags() {
      contacts.forEach(contact => {
        if (contact.tags) contact.tags.split(',').forEach(this.addTag);
      });
    }

    getTags() {
      return tags.slice();
    }

    addTag(tag) {
      if (!tags.includes(tag)) tags.push(tag);
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
  
    async createContact(data) { // accepts data object containing contact parameters
      let requestOptions = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        }
      }
  
      return fetch('/api/contacts', requestOptions).then(async response => {
        switch (response.status) {
          case 201:
          let contactData = await response.json();
          this.addToContacts(contactData);
          break;
        }
      });
    }

    async updateContact(id, data) {
      data.id = id;

      let requestOptions = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        }
      }
  
      return fetch(`/api/contacts/${id}`, requestOptions).then(async response => {
        switch (response.status) {
          case 201:
          let contactData = await response.json();
          this.findContact(id).update(contactData);
          break;
        }
      });
    }

    async deleteContact(id) {
      let requestOptions = {
        method: 'DELETE',
      }

      return fetch(`/api/contacts/${id}`, requestOptions).then(response => {
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
    this.manager.contactsLoaded.then(() => {
      this.manager.compileTags();
      this.displayContacts();
    });
    this.bindListeners();
  }

  async displayContacts() {
    let contacts = await this.manager.getContacts();
    this.view.renderContacts(contacts, 'There are no contacts.');
  }

  bindListeners() {
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    this.view.bindInputKeyupEvent();
  
    let addContact = document.querySelector('#addContact');
    addContact.addEventListener('click', event => {
      event.preventDefault();
      this.view.renderNewContactForm(this.manager.getTags());
      this.view.transitionToContactForm();
    });

    let search = document.querySelector('#search');
    search.addEventListener('submit', event => {
      event.preventDefault();
    });

    search.addEventListener('keyup', async event => {
      let searchTerm = event.target.value;
      let pattern = new RegExp(escapeRegExp(searchTerm), 'i');
      let contacts = await this.manager.getContacts();
      let matches = contacts.filter(contact => {
        return contact.full_name.search(pattern) !== -1;
      });

      this.view.renderContacts(matches, `There are no contacts that match ${searchTerm}`);
    });

    let contactForm = document.querySelector('#form');
    contactForm.addEventListener('submit', async event => {
      event.preventDefault();

      let form = event.target;
      let id = form.getAttribute('data-id');

      try {
        let validData = await this.view.validateForm();

        switch (form.name) {
          case 'create':
            await this.manager.createContact(validData);
            break;
          case 'edit':
            await this.manager.updateContact(id, validData);
            break;
        }

        this.displayContacts();
        this.view.transitionToMain();
      } catch (errorMsg) {
        console.log(errorMsg); // ... should it do something else here?
      }

    });

    contactForm.addEventListener('reset', () => {
      this.view.transitionToMain();
    });

    let contacts = document.querySelector('#contacts');
    contacts.addEventListener('click', async event => {
      let element = event.target;
      if (element.tagName === 'BUTTON') {
        let id = element.getAttribute('data-id');

        switch(element.name) {
          case 'edit':
            this.view.renderEditContactForm(this.manager.findContact(id), this.manager.getTags());
            this.view.transitionToContactForm();
            break;
          case 'delete':
            let confirmation = confirm(`Would you like to delete ${element.getAttribute('data-contact')}?`);

            if (confirmation) {
              await this.manager.deleteContact(id);
              this.displayContacts();
            }

            break;
        }
      }
    });
  }
}

let View = class View {
  constructor() {
    this.templates = {};
    this.compileHandlebars();
  }

  compileHandlebars() {
    Handlebars.registerHelper('handleTags', function(tags, selectedTags) {
      let tagsArray = [];
      if (typeof tags === 'string') tags = tags.split(',');

      if (tags && tags.length > 0) {
        tags.forEach(tag => {
          let tagObj = { name: tag };
          if (selectedTags && selectedTags.includes(tag)) tagObj.selected = true;
          tagsArray.push(tagObj);
        });
      } else {
        tagsArray.push({ name: 'none' });
      }

      return tagsArray;
    });

    Handlebars.registerHelper('selectTag', function(boolean) {
      return boolean ? 'checked' : '';
    });

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
    let section;
    
    if (selector instanceof HTMLElement) {
      section = selector;
    } else {
      section = document.querySelector(selector);
    }

    section.insertAdjacentHTML(position, this.templates[templateName](dataObject));
  }

  clearContents(selector) {
    let section;
    if (selector instanceof HTMLElement) {
      section = selector;
    } else {
      section = document.querySelector(selector);
    }

    section.textContent = '';
  }

  renderContacts(contacts, message) {
    let contactsSection = document.querySelector('#contacts');
    this.clearContents(contactsSection);
    if (contacts.length > 0) {
      this.insertHTML(contactsSection, 'contactList', { contacts });
    } else {
      contactsSection.textContent = message;
    }
  }

  renderNewContactForm(allTags) {
    let formSection = document.querySelector('#form');
    this.clearContents(formSection);
    this.insertHTML(
      formSection,
      'contactForm',
      {
        formTitle: 'Create Contact',
        formName: 'create',
        allTags,
      }
    );
  }

  renderEditContactForm(contactData, allTags) {
    let formSection = document.querySelector('#form');
    this.clearContents(formSection);
    this.insertHTML(
      formSection,
      'contactForm',
      { 
        formTitle: 'Edit Contact',
        formName: 'edit',
        allTags,
        ...contactData,
      }
    );
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
    return new Promise(async (resolve, reject) => {
      let inputs = document.querySelectorAll('#form input'); // get all the inputs to validate
      let formData = {};
      let validations = [];
      let selectedTags = [];

      inputs.forEach(input => {
        if (input.name === 'tags') {
          if (input.checked) selectedTags.push(input.value);
        } else { // for each input, create promise for their validation and store in validations
          validations.push(new Promise((resolve, reject) => {
            let alert = input.parentNode.querySelector('div.alert');
  
            this.validatePattern(input).then(validValue => { // if valid, put in formData, remove alert
              if (input.id) formData[input.id] = validValue;
              if (alert) alert.remove();
              resolve();
            }).catch(errorMsg => {
              if (!alert) this.displayError(input, errorMsg);
              reject(errorMsg);
            });
          }));
        }
      });

      try {
        await Promise.all(validations); // wait for all validations to complete
        resolve({ ...formData, tags: selectedTags.join(',') });  // if all successful, resolve
      } catch(errorMsg) {
        reject(errorMsg); // if one unsuccessful, reject
      }
    });
  }

  validatePattern(element) {
    let pattern = element.getAttribute('pattern');

    return new Promise((resolve, reject) => {
      if (pattern) {
        let patternMatch = element.value.search(pattern);
        if (patternMatch < 0) reject(element.getAttribute('data-alert')); 
      }

      resolve(element.value);
    });
  }

  displayError(element, message) {
    this.insertHTML(element, 'alert', { message }, 'afterend');
    let alert = element.parentNode.querySelector('div.alert');
  }

  bindInputKeyupEvent() {
    document.querySelector('#form').addEventListener('keyup', async event => {
      if (event.target.tagName === 'INPUT') {
        let alert = event.target.parentNode.querySelector('div.alert');
        if (alert) {
          try {
            await this.validatePattern(event.target);
            alert.remove();
          } catch (errorMsg) {
            alert.textContent = errorMsg;
          }
        }
      }
    });
  }
}

let start;

document.addEventListener('DOMContentLoaded', () => {
  start = new App();
});
