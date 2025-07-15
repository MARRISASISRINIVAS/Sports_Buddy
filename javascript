import { db, auth } from './firebaseConfig.js';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = regName.value;
  const email = regEmail.value;
  const password = regPassword.value;
  const role = regRole.value;

  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(userCred.user.uid).set({ name, email, role });
    alert("Registered successfully!");
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const doc = await db.collection('users').doc(cred.user.uid).get();
    if (!doc.exists) {
      alert("No profile found in database.");
      return;
    }
    const role = doc.data().role;

    if (role === 'user') {
      userSection.style.display = 'block';
      adminSection.style.display = 'none';
      loadEvents();
    } else {
      adminSection.style.display = 'block';
      userSection.style.display = 'none';
    }
    alert("Login successful!");
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('eventForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = eventName.value;
  const city = eventCity.value;
  const area = eventArea.value;
  const time = eventTime.value;
  const category = eventCategory.value;

  try {
    await db.collection('events').add({ name, city, area, time, category });
    alert("Event added!");
    loadEvents();
  } catch (err) {
    alert(err.message);
  }
});

async function loadEvents() {
  eventsList.innerHTML = '';
  const snapshot = await db.collection('events').get();
  snapshot.forEach(doc => {
    const ev = doc.data();
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <strong>${ev.name}</strong><br>
      ${ev.city}, ${ev.area}<br>
      ${new Date(ev.time).toLocaleString()}<br>
      Category: ${ev.category}
    `;
    eventsList.appendChild(div);
  });
}

adminCategoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Category added: " + newCategory.value);
});

adminCityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert("City added: " + newCity.value);
});

adminAreaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert(`Area ${newArea.value} in City ${areaCity.value} added`);
});
async function loadEvents() {
  eventsList.innerHTML = '';
  const snapshot = await db.collection('events').get();

  snapshot.forEach(doc => {
    const ev = doc.data();
    const div = document.createElement('div');
    div.className = 'event';

    div.innerHTML = `
      <strong>${ev.name}</strong><br>
      ${ev.city}, ${ev.area}<br>
      ${new Date(ev.time).toLocaleString()}<br>
      Category: ${ev.category}<br>
      <button onclick="editEvent('${doc.id}', '${ev.name}', '${ev.city}', '${ev.area}', '${ev.time}', '${ev.category}')">Edit</button>
      <button onclick="deleteEvent('${doc.id}')">Delete</button>
    `;

    eventsList.appendChild(div);
  });
}
window.editEvent = (id, name, city, area, time, category) => {
  const updatedName = prompt("Edit Event Name:", name);
  const updatedCity = prompt("Edit City:", city);
  const updatedArea = prompt("Edit Area:", area);
  const updatedTime = prompt("Edit Time (YYYY-MM-DDTHH:MM):", time);
  const updatedCategory = prompt("Edit Category:", category);

  if (updatedName && updatedCity && updatedArea && updatedTime && updatedCategory) {
    db.collection('events').doc(id).update({
      name: updatedName,
      city: updatedCity,
      area: updatedArea,
      time: updatedTime,
      category: updatedCategory
    }).then(() => {
      alert("Event updated successfully!");
      loadEvents();
    }).catch(err => alert("Update failed: " + err.message));
  }
};

window.deleteEvent = (id) => {
  if (confirm("Are you sure you want to delete this event?")) {
    db.collection('events').doc(id).delete()
      .then(() => {
        alert("Event deleted.");
        loadEvents();
      })
      .catch(err => alert("Delete failed: " + err.message));
  }
};

