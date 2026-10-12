// Local gallery record storage and CRUD interactions.
(() => {
  const storageKey = 'gallery-notes-records-v1';
  const sampleGalleries = [
    { id: 'seed-tate', name: 'Tate Modern', city: 'London', country: 'United Kingdom', type: 'Museum', founded: 2000, visitors: 4700000, website: 'https://www.tate.org.uk/visit/tate-modern' },
    { id: 'seed-louvre', name: 'Musée du Louvre', city: 'Paris', country: 'France', type: 'Museum', founded: 1793, visitors: 8900000, website: 'https://www.louvre.fr/en' },
    { id: 'seed-met', name: 'The Metropolitan Museum of Art', city: 'New York', country: 'United States', type: 'Museum', founded: 1870, visitors: 5800000, website: 'https://www.metmuseum.org/' },
    { id: 'seed-national-gallery', name: 'National Gallery', city: 'London', country: 'United Kingdom', type: 'Public', founded: 1824, visitors: 4000000, website: 'https://www.nationalgallery.org.uk/' },
    { id: 'seed-virtual', name: 'Google Arts & Culture', city: 'Mountain View', country: 'United States', type: 'Virtual', founded: 2011, visitors: 25000000, website: 'https://artsandculture.google.com/' }
  ];
  const form = document.querySelector('#gallery-form');
  const rows = document.querySelector('#gallery-rows');
  const message = document.querySelector('#form-message');
  const search = document.querySelector('#gallery-search');
  const cancelButton = document.querySelector('#cancel-edit');
  let galleries = loadGalleries();

  function loadGalleries() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === null) {
        localStorage.setItem(storageKey, JSON.stringify(sampleGalleries));
        return [...sampleGalleries];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [...sampleGalleries];
    } catch {
      setMessage('Gallery storage is unavailable. Check your browser settings.', true);
      return [...sampleGalleries];
    }
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(galleries));
      return true;
    } catch {
      setMessage('Could not save changes to local storage.', true);
      return false;
    }
  }

  function setMessage(text, isError = false) {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('is-error', isError);
  }

  function makeCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visibleGalleries = galleries.filter((gallery) => `${gallery.name} ${gallery.city} ${gallery.country} ${gallery.type}`.toLocaleLowerCase().includes(query));
    rows.replaceChildren();
    visibleGalleries.forEach((gallery) => {
      const row = document.createElement('tr');
      row.append(makeCell(gallery.name), makeCell(`${gallery.city}, ${gallery.country}`), makeCell(gallery.type), makeCell(String(gallery.founded)), makeCell(Number(gallery.visitors).toLocaleString()));
      const websiteCell = document.createElement('td');
      const website = document.createElement('a');
      website.href = gallery.website;
      website.target = '_blank';
      website.rel = 'noopener noreferrer';
      website.textContent = 'Visit ↗';
      website.setAttribute('aria-label', `Visit ${gallery.name} website`);
      websiteCell.append(website);
      row.append(websiteCell);
      const actionsCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.setAttribute('aria-label', `Edit ${gallery.name}`);
      editButton.addEventListener('click', () => editGallery(gallery.id));
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete ${gallery.name}`);
      deleteButton.addEventListener('click', () => deleteGallery(gallery.id));
      actions.append(editButton, deleteButton);
      actionsCell.append(actions);
      row.append(actionsCell);
      rows.append(row);
    });
    document.querySelector('#empty-state').hidden = visibleGalleries.length > 0;
  }

  function editGallery(id) {
    const gallery = galleries.find((item) => item.id === id);
    if (!gallery) return;
    for (const field of form.elements) {
      if (field.name in gallery) field.value = gallery[field.name];
    }
    document.querySelector('#form-title').textContent = 'Edit a gallery';
    document.querySelector('#save-gallery').innerHTML = 'Update gallery <span aria-hidden="true">↗</span>';
    cancelButton.hidden = false;
    form.querySelector('#gallery-name').focus();
    setMessage(`Editing ${gallery.name}.`);
  }

  function resetForm() {
    form.reset();
    document.querySelector('#gallery-id').value = '';
    document.querySelector('#form-title').textContent = 'Add a gallery';
    document.querySelector('#save-gallery').innerHTML = 'Save gallery <span aria-hidden="true">↗</span>';
    cancelButton.hidden = true;
  }

  function deleteGallery(id) {
    const gallery = galleries.find((item) => item.id === id);
    if (!gallery || !window.confirm(`Delete ${gallery.name} from your gallery records?`)) return;
    galleries = galleries.filter((item) => item.id !== id);
    if (!persist()) return;
    if (document.querySelector('#gallery-id').value === id) resetForm();
    render();
    setMessage(`${gallery.name} was deleted.`);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      setMessage('Please check the highlighted fields and try again.', true);
      return;
    }
    const values = Object.fromEntries(new FormData(form));
    const year = Number(values.founded);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
      setMessage(`Enter a founding year from 1000 to ${currentYear}.`, true);
      return;
    }
    const websiteUrl = new URL(values.website);
    if (!['http:', 'https:'].includes(websiteUrl.protocol)) {
      setMessage('Website URL must begin with http:// or https://.', true);
      return;
    }
    const record = { id: values.id || `gallery-${Date.now()}`, name: values.name.trim(), city: values.city.trim(), country: values.country.trim(), type: values.type, founded: year, visitors: Number(values.visitors), website: websiteUrl.href };
    const isUpdate = Boolean(values.id);
    galleries = isUpdate ? galleries.map((item) => item.id === record.id ? record : item) : [record, ...galleries];
    if (!persist()) return;
    render();
    resetForm();
    setMessage(isUpdate ? `${record.name} was updated.` : `${record.name} was added.`);
  });

  cancelButton.addEventListener('click', () => { resetForm(); setMessage('Edit cancelled.'); });
  search.addEventListener('input', render);
  render();
})();