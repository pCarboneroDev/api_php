// const API_BASE = '../api';
const API_BASE = 'http://localhost/php-personas/api';


const form = document.querySelector('#clientForm');
const clientIdInput = document.querySelector('#clientId');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const cityInput = document.querySelector('#city');
const telephoneInput = document.querySelector('#telephone');
const submitButton = document.querySelector('#submitButton');
const cancelButton = document.querySelector('#cancelButton');
const refreshButton = document.querySelector('#refreshButton');
const statusMessage = document.querySelector('#statusMessage');
const clientsBody = document.querySelector('#clientsBody');
const clientCounter = document.querySelector('#clientCounter');

const fields = [nameInput, emailInput, cityInput, telephoneInput];

function buildQuery(params) {
  return new URLSearchParams(params).toString();
}

function setStatus(message, type = '') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`.trim();
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  refreshButton.disabled = isLoading;
  cancelButton.disabled = isLoading;
}

function getFormData() {
  return {
    id: clientIdInput.value,
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    city: cityInput.value.trim(),
    telephone: telephoneInput.value.trim(),
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character]));
}

function resetForm(clearStatus = true) {
  form.reset();
  clientIdInput.value = '';
  submitButton.textContent = 'Crear cliente';
  cancelButton.hidden = true;
  if (clearStatus) {
    setStatus('');
  }
}

function normalizeClient(client) {
  return {
    id: client.id ?? client.ID ?? '',
    name: client.name ?? '',
    email: client.email ?? '',
    city: client.city ?? '',
    telephone: client.telephone ?? '',
  };
}

function renderClients(clients) {
  const normalizedClients = clients.map(normalizeClient);
  clientCounter.textContent = `${normalizedClients.length} cliente${normalizedClients.length === 1 ? '' : 's'}`;

  if (!normalizedClients.length) {
    clientsBody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay clientes todavia.</td></tr>';
    return;
  }

  clientsBody.innerHTML = normalizedClients.map((client) => `
    <tr>
      <td>${escapeHtml(client.id)}</td>
      <td>${escapeHtml(client.name)}</td>
      <td>${escapeHtml(client.email)}</td>
      <td>${escapeHtml(client.city)}</td>
      <td>${escapeHtml(client.telephone)}</td>
      <td>
        <div class="actions">
          <button class="secondary-button" type="button" data-action="edit" data-id="${escapeHtml(client.id)}">Editar</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${escapeHtml(client.id)}">Borrar</button>
        </div>
      </td>
    </tr>
  `).join('');

  clientsBody.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => {
      const client = normalizedClients.find((item) => String(item.id) === button.dataset.id);
      startEdit(client);
    });
  });

  clientsBody.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => deleteClient(button.dataset.id));
  });
}

function startEdit(client) {
  if (!client) return;

  clientIdInput.value = client.id;
  nameInput.value = client.name;
  emailInput.value = client.email;
  cityInput.value = client.city;
  telephoneInput.value = client.telephone;
  submitButton.textContent = 'Guardar cambios';
  cancelButton.hidden = false;
  setStatus(`Editando cliente #${client.id}`);
  nameInput.focus();
}

async function loadClients() {
  setLoading(true);
  clientsBody.innerHTML = '<tr><td colspan="6" class="empty-state">Cargando clientes...</td></tr>';

  try {
    const response = await fetch(`${API_BASE}/get_all_client.php`);
    const clients = await response.json();

    if (!response.ok) {
      throw new Error('No se pudieron cargar los clientes.');
    }

    renderClients(Array.isArray(clients) ? clients : []);
  } catch (error) {
    clientsBody.innerHTML = '<tr><td colspan="6" class="empty-state">Error al cargar clientes.</td></tr>';
    setStatus(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function saveClient(event) {
  event.preventDefault();

  if (!fields.every((field) => field.value.trim())) {
    setStatus('Completa todos los campos.', 'error');
    return;
  }

  const data = getFormData();
  const isEditing = Boolean(data.id);
  const endpoint = isEditing ? 'update_client.php' : 'create_client.php';
  const method = isEditing ? 'PUT' : 'POST';
  const params = isEditing ? data : {
    name: data.name,
    email: data.email,
    city: data.city,
    telephone: data.telephone,
  };

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/${endpoint}?${buildQuery(params)}`, { method });

    if (!response.ok) {
      throw new Error(isEditing ? 'No se pudo actualizar el cliente.' : 'No se pudo crear el cliente.');
    }

    resetForm(false);
    setStatus(isEditing ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.', 'success');
    await loadClients();
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function deleteClient(id) {
  const confirmed = window.confirm(`Quieres borrar el cliente #${id}?`);
  if (!confirmed) return;

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/delete_client.php?${buildQuery({ id })}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('No se pudo borrar el cliente.');
    }

    resetForm(false);
    setStatus('Cliente borrado correctamente.', 'success');
    await loadClients();
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', saveClient);
cancelButton.addEventListener('click', resetForm);
refreshButton.addEventListener('click', loadClients);

loadClients();
