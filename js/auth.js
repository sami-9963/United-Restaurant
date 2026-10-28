/**
 * United Restaurant - Authentication & Order Management Engine
 * Handles User Sign Up, Login, Profile Persistence,
 * Real Cash on Delivery Order Placement, and Order Tracking.
 */

const AUTH_STORAGE_KEY = 'ur_current_user';
const USERS_STORAGE_KEY = 'ur_registered_users';
const ORDERS_STORAGE_KEY = 'ur_restaurant_orders';
const RESTAURANT_WHATSAPP = '8801950177666'; // 01950-177666

// Strictly hardcoded authorized Super Admin email
const AUTHORIZED_ADMIN_EMAIL = 'alxami.islam@gmail.com';

// ==========================================
// 1. USER AUTHENTICATION API
// ==========================================

const AuthEngine = {
  // Get currently logged-in user
  getCurrentUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Check if currently logged in user is the authorized admin
  isAdmin() {
    const user = this.getCurrentUser();
    if (!user || !user.email) return false;
    return (user.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL || user.role === 'admin';
  },

  // Check if user has Staff or Admin privileges
  isStaff() {
    const user = this.getCurrentUser();
    if (!user) return false;
    return this.isAdmin() || user.role === 'staff';
  },

  // Get all registered users from persistent storage
  getUsers() {
    try {
      let data = localStorage.getItem(USERS_STORAGE_KEY);
      let users = data ? JSON.parse(data) : [];

      let modified = false;

      // Strictly ensure only the authorized email has admin role
      users.forEach(u => {
        const isAuthAdmin = (u.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
        if (isAuthAdmin) {
          if (u.role !== 'admin') {
            u.role = 'admin';
            modified = true;
          }
        } else {
          // Valid non-admin roles: 'staff' or 'customer'
          if (u.role !== 'staff' && u.role !== 'customer') {
            u.role = 'customer';
            modified = true;
          }
        }
      });

      // Auto-seed Owner account if not already present
      const ownerExists = users.some(u => (u.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL);
      if (!ownerExists) {
        users.unshift({
          id: 'USR-OWNER-001',
          name: 'Al Sami Islam (Owner)',
          email: AUTHORIZED_ADMIN_EMAIL,
          password: 'admin123', // Initial owner password
          phone: '01950-177666',
          address: 'United City, Gulshan-2, Dhaka',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        modified = true;
      }

      if (modified) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }

      return users;
    } catch (e) {
      return [];
    }
  },

  // Merge registered users from Google Cloud Firestore
  mergeCloudUsers(cloudUsers) {
    if (!Array.isArray(cloudUsers) || cloudUsers.length === 0) return this.getUsers();
    try {
      const currentUsers = this.getUsers();
      const map = new Map();
      currentUsers.forEach(u => { if (u && u.email) map.set(u.email.toLowerCase(), u); });
      cloudUsers.forEach(cu => {
        if (cu && cu.email) {
          const key = cu.email.toLowerCase();
          const isAuthAdmin = key === AUTHORIZED_ADMIN_EMAIL;
          const existing = map.get(key) || {};
          // Preserve staff role if assigned in cloud
          const role = isAuthAdmin ? 'admin' : (cu.role === 'staff' || existing.role === 'staff' ? 'staff' : (cu.role === 'admin' ? 'admin' : 'customer'));
          map.set(key, { ...existing, ...cu, role });
        }
      });
      const merged = Array.from(map.values());
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      return this.getUsers();
    }
  },

  // Update user role (Admin only: promote to 'staff' or demote to 'customer')
  updateUserRole(userId, newRole) {
    if (!this.isAdmin()) {
      throw new Error('Access Denied: Only the Restaurant Owner can modify roles.');
    }
    if (newRole !== 'customer' && newRole !== 'staff') {
      throw new Error('Invalid role specified. Only "customer" or "staff" allowed.');
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId || (u.email && u.email.toLowerCase() === userId.toLowerCase()));
    if (!user) throw new Error('User account not found.');

    if ((user.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
      throw new Error('The Restaurant Owner & Super Admin account cannot be modified.');
    }

    user.role = newRole;
    user.updatedAt = new Date().toISOString();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Update active session if target user is currently logged in on this browser
    const currentUser = this.getCurrentUser();
    if (currentUser && ((currentUser.id && currentUser.id === user.id) || (currentUser.email && currentUser.email.toLowerCase() === user.email.toLowerCase()))) {
      currentUser.role = newRole;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      this.updateNavbarAuthUI();
      this.updateAdminFloatingBar();
    }

    // Sync to Google Cloud Firestore
    if (window.urDb) {
      window.urDb.collection('users').doc(user.id).set({
        role: newRole,
        updatedAt: user.updatedAt
      }, { merge: true })
      .then(() => console.log('🔥 User role updated in Cloud Firestore:', user.email, '->', newRole))
      .catch(err => console.warn('Cloud role update warning:', err.message));
    }

    return user;
  },

  // Customer Profile Editor: Update display name and contact info
  updateProfile({ name, phone, address }) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in to update your profile.');

    name = (name || '').trim();
    phone = (phone || '').trim();
    address = (address || '').trim();

    if (!name) throw new Error('Display Name is required.');
    if (!phone) throw new Error('Contact Phone number is required.');

    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.address = address;
    currentUser.updatedAt = new Date().toISOString();

    // Update in persistent users list
    const users = this.getUsers();
    const idx = users.findIndex(u => (u.id && u.id === currentUser.id) || (u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()));
    if (idx >= 0) {
      users[idx].name = name;
      users[idx].phone = phone;
      users[idx].address = address;
      users[idx].updatedAt = currentUser.updatedAt;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    this.updateNavbarAuthUI();

    // Sync profile to Google Cloud Firestore
    if (window.urDb) {
      window.urDb.collection('users').doc(currentUser.id).set({
        name,
        phone,
        address,
        updatedAt: currentUser.updatedAt
      }, { merge: true })
      .then(() => console.log('🔥 Profile updated in Cloud Firestore:', currentUser.email))
      .catch(err => console.warn('Cloud profile update notice:', err.message));
    }

    return currentUser;
  },

  // Upload and set Profile Picture (Instant Client-Side Compression + Cloud Firestore Sync + Optional Storage Offload)
  async uploadProfilePhoto(file) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in to upload a profile picture.');
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file (PNG, JPG, WebP, etc.).');
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Image size must be less than 20MB.');
    }

    // 1. Instantly compress and center-crop to a clean 320x320 square avatar (~18KB)
    const photoURL = await this.compressImageToDataURL(file, 320, 320, 0.82);

    // 2. Instantly persist to user record, localStorage, UI navbar, and Cloud Firestore (< 250ms)
    const updatedUser = await this.saveProfilePhoto(photoURL);

    // 3. Resilient background Cloud Storage upload (non-blocking, never freezes or hangs UI)
    if (window.urStorage && window.urDb) {
      const userDocId = currentUser.id || (currentUser.email ? currentUser.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'user');
      const ext = (file.name && file.name.split('.').pop()) || 'jpg';
      try {
        const fileRef = window.urStorage.ref().child(`profile_pictures/${userDocId}_${Date.now()}.${ext}`);
        
        // Wrap with a 2.5s timeout race so uninitialized buckets never cause background retries
        const uploadTask = fileRef.put(file, { contentType: file.type });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
          try { uploadTask.cancel(); } catch (e) {}
          reject(new Error('Firebase Storage timeout (using direct cloud database storage)'));
        }, 2500));

        Promise.race([
          uploadTask.then(snap => snap.ref.getDownloadURL()),
          timeoutPromise
        ]).then(async (cloudUrl) => {
          if (cloudUrl) {
            await this.saveProfilePhoto(cloudUrl);
            console.log('🔥 Profile picture successfully offloaded to Firebase Storage:', cloudUrl);
          }
        }).catch(err => {
          console.log('Firebase Storage notice:', err.message);
        });
      } catch (err) {
        console.warn('Firebase Storage upload dispatch note:', err.message);
      }
    }

    return updatedUser;
  },

  // Save profile photo URL to user document and localStorage
  async saveProfilePhoto(photoURL) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in.');

    currentUser.photoURL = photoURL;
    currentUser.updatedAt = new Date().toISOString();

    const userDocId = currentUser.id || (currentUser.email ? currentUser.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'user');

    // Update in stored users array
    const users = this.getUsers();
    const idx = users.findIndex(u => (u.id && u.id === currentUser.id) || (u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()));
    if (idx >= 0) {
      users[idx].photoURL = photoURL;
      users[idx].updatedAt = currentUser.updatedAt;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    this.updateNavbarAuthUI();

    // Sync to Cloud Firestore users collection
    if (window.urDb) {
      try {
        await window.urDb.collection('users').doc(userDocId).set({
          photoURL,
          updatedAt: currentUser.updatedAt
        }, { merge: true });
        console.log('🔥 Profile photo URL saved to Cloud Firestore for:', currentUser.email);
      } catch (dbErr) {
        console.warn('Cloud Firestore photo sync note:', dbErr.message);
      }
    }

    return currentUser;
  },

  // Remove profile photo (reset back to standard blank silhouette)
  async removeProfilePhoto() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in.');

    currentUser.photoURL = '';
    currentUser.updatedAt = new Date().toISOString();

    const userDocId = currentUser.id || (currentUser.email ? currentUser.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'user');

    const users = this.getUsers();
    const idx = users.findIndex(u => (u.id && u.id === currentUser.id) || (u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()));
    if (idx >= 0) {
      users[idx].photoURL = '';
      users[idx].updatedAt = currentUser.updatedAt;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    this.updateNavbarAuthUI();

    if (window.urDb) {
      try {
        await window.urDb.collection('users').doc(userDocId).set({
          photoURL: '',
          updatedAt: currentUser.updatedAt
        }, { merge: true });
        console.log('🔥 Profile photo reset in Cloud Firestore for:', currentUser.email);
      } catch (e) {
        console.warn('Cloud photo clear note:', e);
      }
    }

    return currentUser;
  },

  // Compress image to optimized Data URL with square center-crop
  compressImageToDataURL(file, maxWidth = 320, maxHeight = 320, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Square center-crop for a clean circular avatar
          let sx = 0, sy = 0, sWidth = width, sHeight = height;
          if (width > height) {
            sx = Math.round((width - height) / 2);
            sWidth = height;
          } else if (height > width) {
            sy = Math.round((height - width) / 2);
            sHeight = width;
          }

          const canvas = document.createElement('canvas');
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, maxWidth, maxHeight);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } else {
            resolve(e.target.result);
          }
        };
        img.onerror = () => reject(new Error('Failed to parse the selected image file.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read the selected file.'));
      reader.readAsDataURL(file);
    });
  },

  // Sign up new user
  signUp({ name, email, password, phone = '', address = '' }) {
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    phone = (phone || '').trim();
    address = (address || '').trim();

    if (!name) throw new Error('Please enter your full name.');
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');
    if (!phone) throw new Error('Please enter your phone number.');

    const users = this.getUsers();
    const existingIndex = users.findIndex(u => (u.email || '').toLowerCase() === email);

    const isOwner = email === AUTHORIZED_ADMIN_EMAIL;
    const role = isOwner ? 'admin' : 'customer';

    let userObj;
    if (existingIndex >= 0) {
      // If the authorized owner is re-registering, allow updating credentials
      if (isOwner) {
        users[existingIndex].password = password;
        users[existingIndex].name = name;
        users[existingIndex].phone = phone;
        users[existingIndex].address = address;
        users[existingIndex].role = 'admin';
        userObj = users[existingIndex];
      } else {
        throw new Error('An account with this email already exists. Please log in.');
      }
    } else {
      userObj = {
        id: isOwner ? 'USR-OWNER-' + Date.now().toString(36).toUpperCase() : 'USR-' + Date.now().toString(36).toUpperCase(),
        name,
        email,
        password,
        phone,
        address,
        role,
        createdAt: new Date().toISOString()
      };
      users.push(userObj);
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Sync user profile to Google Cloud Firestore
    if (window.urDb) {
      const safeCloudUser = { ...userObj };
      window.urDb.collection('users').doc(userObj.id).set(safeCloudUser)
        .then(() => console.log('🔥 User profile synced to Google Cloud Firestore:', userObj.email))
        .catch(err => console.warn('Cloud user sync note:', err.message));
    }

    // Auto-login after signup
    this.setCurrentUser(userObj);
    return userObj;
  },

  // Log in existing user
  login(email, password) {
    email = (email || '').trim().toLowerCase();
    if (!email || !password) throw new Error('Please enter both email and password.');

    const users = this.getUsers();
    let user = users.find(u => (u.email || '').toLowerCase() === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const isOwner = (user.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
    user.role = isOwner ? 'admin' : (user.role === 'staff' ? 'staff' : (user.role === 'admin' ? 'admin' : 'customer'));

    if (isOwner) {
      sessionStorage.setItem('ur_admin_unlocked', 'true');
      sessionStorage.setItem('ur_staff_unlocked', 'true');
    } else if (user.role === 'staff') {
      sessionStorage.setItem('ur_staff_unlocked', 'true');
      sessionStorage.removeItem('ur_admin_unlocked');
    } else {
      sessionStorage.removeItem('ur_admin_unlocked');
      sessionStorage.removeItem('ur_staff_unlocked');
    }

    this.setCurrentUser(user);
    return user;
  },

  // Set active user session
  setCurrentUser(user) {
    const safeUser = { ...user };
    delete safeUser.password;
    const isOwner = (safeUser.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
    safeUser.role = isOwner ? 'admin' : (safeUser.role === 'staff' ? 'staff' : (safeUser.role === 'admin' ? 'admin' : 'customer'));

    if (isOwner) {
      sessionStorage.setItem('ur_admin_unlocked', 'true');
      sessionStorage.setItem('ur_staff_unlocked', 'true');
    } else if (safeUser.role === 'staff') {
      sessionStorage.setItem('ur_staff_unlocked', 'true');
      sessionStorage.removeItem('ur_admin_unlocked');
    } else {
      sessionStorage.removeItem('ur_admin_unlocked');
      sessionStorage.removeItem('ur_staff_unlocked');
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
    this.updateNavbarAuthUI();
    this.updateAdminFloatingBar();
  },

  // Log out
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('ur_admin_unlocked');
    sessionStorage.removeItem('ur_staff_unlocked');
    this.updateNavbarAuthUI();
    this.updateAdminFloatingBar();
    if (window.location.pathname.includes('my-orders') || 
        window.location.pathname.includes('admin-orders') || 
        window.location.pathname.includes('staff-dashboard') || 
        window.location.pathname.includes('profile')) {
      window.location.reload();
    }
  },

  // Update navbar across any page
  updateNavbarAuthUI() {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdmin();
    const isStaff = this.isStaff();
    const containers = document.querySelectorAll('.nav-auth-container');
    
    containers.forEach(container => {
      if (user) {
        const photoHtml = user.photoURL 
          ? `<img src="${this.escapeHtml(user.photoURL)}" alt="${this.escapeHtml(user.name)}" class="nav-avatar-img">`
          : null;

        if (isAdmin) {
          container.innerHTML = `
            <div class="user-menu-dropdown">
              <button class="btn btn-primary btn-sm user-menu-btn" style="background: linear-gradient(135deg, #b91c1c, #7f1d1d); border: 1px solid var(--gold-accent); box-shadow: 0 0 15px rgba(234, 179, 8, 0.35);" onclick="toggleUserMenu(event)">
                ${photoHtml || '<i class="fa-solid fa-crown text-gold"></i>'}
                <span class="nav-user-text">Owner: ${this.escapeHtml(user.name.split(' ')[0])}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; margin-left: 0.2rem;"></i>
              </button>
              <div class="user-dropdown-panel" id="userDropdownPanel" style="width: 280px;">
                <div class="user-dropdown-header" style="background: rgba(234, 179, 8, 0.08); border-bottom: 1px solid rgba(234, 179, 8, 0.25);">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid var(--gold-accent); overflow: hidden; background: #121218; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${user.photoURL ? `<img src="${this.escapeHtml(user.photoURL)}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fa-solid fa-crown text-gold" style="font-size: 1.1rem;"></i>'}
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; color: var(--gold-accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        Restaurant Owner / Admin
                      </div>
                      <strong style="color: #fff; font-size: 0.95rem;">${this.escapeHtml(user.name)}</strong>
                      <small style="color: var(--text-muted); display: block;">${this.escapeHtml(user.email)}</small>
                    </div>
                  </div>
                </div>
                <a href="admin-orders.html?v=3.3" class="user-dropdown-item text-gold" style="font-weight: 700;">
                  <i class="fa-solid fa-clipboard-list text-gold"></i> Kitchen Live Orders Terminal
                </a>
                <a href="admin-orders.html?v=3.3#users" class="user-dropdown-item" style="color: #c7d2fe; font-weight: 600;">
                  <i class="fa-solid fa-users-gear text-gold"></i> User Management & Roles
                </a>
                <a href="admin-orders.html?v=3.3#menu" class="user-dropdown-item" style="color: #fde047;">
                  <i class="fa-solid fa-pen-to-square text-gold"></i> Restaurant Menu Editor
                </a>
                <a href="profile.html" class="user-dropdown-item">
                  <i class="fa-solid fa-id-badge"></i> My Profile & Info
                </a>
                <a href="order-online.html" class="user-dropdown-item">
                  <i class="fa-solid fa-utensils"></i> Customer Menu & Order
                </a>
                <a href="my-orders.html" class="user-dropdown-item">
                  <i class="fa-solid fa-box-open"></i> Customer Orders View
                </a>
                <button class="user-dropdown-item text-red" onclick="AuthEngine.logout();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.08);">
                  <i class="fa-solid fa-right-from-bracket"></i> Log Out
                </button>
              </div>
            </div>
          `;
        } else if (isStaff) {
          container.innerHTML = `
            <div class="user-menu-dropdown">
              <button class="btn btn-outline btn-sm user-menu-btn" style="border-color: #6366f1; color: #c7d2fe; background: rgba(99, 102, 241, 0.1);" onclick="toggleUserMenu(event)">
                ${photoHtml || '<i class="fa-solid fa-shield-halved" style="color: #818cf8;"></i>'}
                <span class="nav-user-text">Staff: ${this.escapeHtml(user.name.split(' ')[0])}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; margin-left: 0.2rem;"></i>
              </button>
              <div class="user-dropdown-panel" id="userDropdownPanel" style="width: 270px;">
                <div class="user-dropdown-header" style="background: rgba(99, 102, 241, 0.12); border-bottom: 1px solid rgba(99, 102, 241, 0.25);">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #818cf8; overflow: hidden; background: #121218; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${user.photoURL ? `<img src="${this.escapeHtml(user.photoURL)}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fa-solid fa-shield-halved" style="color: #818cf8; font-size: 1.1rem;"></i>'}
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; color: #818cf8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        Kitchen Staff Account
                      </div>
                      <strong style="color: #fff; font-size: 0.95rem;">${this.escapeHtml(user.name)}</strong>
                      <small style="color: var(--text-muted); display: block;">${this.escapeHtml(user.email)}</small>
                    </div>
                  </div>
                </div>
                <a href="staff-dashboard.html" class="user-dropdown-item" style="color: #a5b4fc; font-weight: 700;">
                  <i class="fa-solid fa-clipboard-check text-gold"></i> Kitchen Staff Dashboard
                </a>
                <a href="profile.html" class="user-dropdown-item">
                  <i class="fa-solid fa-id-badge"></i> My Profile & Info
                </a>
                <a href="order-online.html" class="user-dropdown-item">
                  <i class="fa-solid fa-utensils"></i> Order Food
                </a>
                <a href="my-orders.html" class="user-dropdown-item">
                  <i class="fa-solid fa-box-open"></i> Customer Orders View
                </a>
                <button class="user-dropdown-item text-red" onclick="AuthEngine.logout();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.08);">
                  <i class="fa-solid fa-right-from-bracket"></i> Log Out
                </button>
              </div>
            </div>
          `;
        } else {
          // Standard Customer
          container.innerHTML = `
            <div class="user-menu-dropdown">
              <button class="btn btn-outline btn-sm user-menu-btn" onclick="toggleUserMenu(event)">
                ${photoHtml || '<i class="fa-solid fa-circle-user text-gold"></i>'}
                <span class="nav-user-text">${this.escapeHtml(user.name.split(' ')[0])}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; margin-left: 0.2rem;"></i>
              </button>
              <div class="user-dropdown-panel" id="userDropdownPanel" style="width: 250px;">
                <div class="user-dropdown-header">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border-red); overflow: hidden; background: #121218; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${user.photoURL ? `<img src="${this.escapeHtml(user.photoURL)}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fa-solid fa-circle-user text-gold" style="font-size: 1.1rem;"></i>'}
                    </div>
                    <div>
                      <div style="font-size: 0.72rem; color: var(--gold-accent); font-weight: 700; text-transform: uppercase;">
                        Customer Profile
                      </div>
                      <strong style="color: #fff;">${this.escapeHtml(user.name)}</strong>
                      <small style="color: var(--text-muted); display: block;">${this.escapeHtml(user.email)}</small>
                    </div>
                  </div>
                </div>
                <a href="profile.html" class="user-dropdown-item" style="font-weight: 600;">
                  <i class="fa-solid fa-id-badge text-gold"></i> My Profile & Contact
                </a>
                <a href="profile.html#orders" class="user-dropdown-item">
                  <i class="fa-solid fa-clock-rotate-left"></i> My Order History
                </a>
                <a href="order-online.html" class="user-dropdown-item">
                  <i class="fa-solid fa-utensils"></i> Order Food Online
                </a>
                <button class="user-dropdown-item text-red" onclick="AuthEngine.logout();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.08);">
                  <i class="fa-solid fa-right-from-bracket"></i> Log Out
                </button>
              </div>
            </div>
          `;
        }
      } else {
        container.innerHTML = `
          <button class="btn btn-outline btn-sm nav-auth-btn" onclick="openAuthModal('login');" title="Log In / Sign Up">
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            <span class="nav-auth-text">Log In</span>
          </button>
        `;
      }
    });

    // Update Mobile Navigation Menu Drawer (.nav-links)
    const navMenus = document.querySelectorAll('.nav-links');
    navMenus.forEach(navMenu => {
      let authCard = navMenu.querySelector('.mobile-nav-auth-card');
      if (!authCard) {
        authCard = document.createElement('div');
        authCard.className = 'mobile-nav-auth-card';
        navMenu.appendChild(authCard);
      }

      if (user) {
        const photoOrSilhouette = user.photoURL 
          ? `<img src="${this.escapeHtml(user.photoURL)}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-accent);">`
          : null;

        if (isAdmin) {
          authCard.innerHTML = `
            <div class="mobile-owner-box">
              <div class="mobile-owner-header">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  ${photoOrSilhouette || '<div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(234,179,8,0.15); border: 2px solid var(--gold-accent); display: flex; align-items: center; justify-content: center; color: var(--gold-accent);"><i class="fa-solid fa-crown"></i></div>'}
                  <div>
                    <div class="mobile-owner-badge">
                      <i class="fa-solid fa-crown text-gold"></i> RESTAURANT OWNER / ADMIN
                    </div>
                    <strong class="mobile-owner-name">${this.escapeHtml(user.name)}</strong>
                    <small class="mobile-owner-email">${this.escapeHtml(user.email)}</small>
                  </div>
                </div>
              </div>

              <div class="mobile-owner-links">
                <a href="admin-orders.html?v=3.3" class="mobile-admin-btn gold-link">
                  <i class="fa-solid fa-clipboard-list text-gold"></i>
                  <span>Kitchen Live Orders Terminal</span>
                </a>
                <a href="admin-orders.html?v=3.3#users" class="mobile-admin-btn" style="color: #c7d2fe;">
                  <i class="fa-solid fa-users-gear text-gold"></i>
                  <span>User Management & Roles</span>
                </a>
                <a href="admin-orders.html?v=3.3#menu" class="mobile-admin-btn" style="color: #fde047;">
                  <i class="fa-solid fa-pen-to-square text-gold"></i>
                  <span>Restaurant Menu Editor</span>
                </a>
                <a href="profile.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-id-badge"></i>
                  <span>My Profile & Info</span>
                </a>
                <a href="order-online.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-utensils"></i>
                  <span>Customer Menu & Order</span>
                </a>
                <a href="my-orders.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-box-open"></i>
                  <span>Customer Orders View</span>
                </a>
              </div>

              <button type="button" class="btn btn-outline mobile-nav-logout-btn" onclick="AuthEngine.logout();">
                <i class="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          `;
        } else if (isStaff) {
          authCard.innerHTML = `
            <div class="mobile-owner-box mobile-staff-box">
              <div class="mobile-owner-header">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  ${photoOrSilhouette || '<div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(99,102,241,0.15); border: 2px solid #818cf8; display: flex; align-items: center; justify-content: center; color: #818cf8;"><i class="fa-solid fa-shield-halved"></i></div>'}
                  <div>
                    <div class="mobile-owner-badge mobile-staff-badge">
                      <i class="fa-solid fa-shield-halved"></i> KITCHEN STAFF ACCOUNT
                    </div>
                    <strong class="mobile-owner-name">${this.escapeHtml(user.name)}</strong>
                    <small class="mobile-owner-email">${this.escapeHtml(user.email)}</small>
                  </div>
                </div>
              </div>

              <div class="mobile-owner-links">
                <a href="staff-dashboard.html" class="mobile-admin-btn staff-link">
                  <i class="fa-solid fa-clipboard-check text-gold"></i>
                  <span>Kitchen Staff Terminal</span>
                </a>
                <a href="profile.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-id-badge"></i>
                  <span>My Profile & Info</span>
                </a>
                <a href="order-online.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-utensils"></i>
                  <span>Customer Menu & Order</span>
                </a>
                <a href="my-orders.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-box-open"></i>
                  <span>Customer Orders View</span>
                </a>
              </div>

              <button type="button" class="btn btn-outline mobile-nav-logout-btn" onclick="AuthEngine.logout();">
                <i class="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          `;
        } else {
          // Standard Customer Mobile Card
          authCard.innerHTML = `
            <div class="mobile-owner-box mobile-customer-box">
              <div class="mobile-owner-header">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  ${photoOrSilhouette || '<div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: var(--gold-accent);"><i class="fa-solid fa-circle-user"></i></div>'}
                  <div>
                    <div class="mobile-owner-badge">
                      <i class="fa-solid fa-circle-user text-gold"></i> CUSTOMER ACCOUNT
                    </div>
                    <strong class="mobile-owner-name">${this.escapeHtml(user.name)}</strong>
                    <small class="mobile-owner-email">${this.escapeHtml(user.email)}</small>
                  </div>
                </div>
              </div>

              <div class="mobile-owner-links">
                <a href="profile.html" class="mobile-admin-btn gold-link">
                  <i class="fa-solid fa-id-badge text-gold"></i>
                  <span>My Profile & Contact</span>
                </a>
                <a href="profile.html#orders" class="mobile-admin-btn">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <span>My Order History</span>
                </a>
                <a href="order-online.html" class="mobile-admin-btn">
                  <i class="fa-solid fa-utensils"></i>
                  <span>Browse Menu & Order</span>
                </a>
              </div>

              <button type="button" class="btn btn-outline mobile-nav-logout-btn" onclick="AuthEngine.logout();">
                <i class="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          `;
        }
      } else {
        authCard.innerHTML = `
          <div class="mobile-guest-box" style="padding-top: 0.5rem;">
            <button type="button" class="btn btn-primary btn-sm" style="width: 100%; justify-content: center; padding: 0.85rem;" onclick="openAuthModal('login');">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Log In / Sign Up
            </button>
          </div>
        `;
      }
    });

    this.updateAdminFloatingBar();
  },

  // Floating admin & staff quick bar at bottom-right of screen
  updateAdminFloatingBar() {
    let bar = document.getElementById('adminFloatingBar');
    const isAdmin = this.isAdmin();
    const isStaff = this.isStaff();

    if (isAdmin) {
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'adminFloatingBar';
        bar.className = 'admin-floating-bar';
        document.body.appendChild(bar);
      }

      const orders = OrderEngine.getAllOrders();
      const pendingCount = orders.filter(o => o.status === 'Pending').length;

      bar.innerHTML = `
        <span class="badge badge-gold" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">
          <i class="fa-solid fa-crown"></i> OWNER
        </span>
        <a href="admin-orders.html?v=3.3" class="admin-float-btn">
          <i class="fa-solid fa-bell"></i> Kitchen Orders
          <span class="admin-badge-count">${pendingCount}</span>
        </a>
      `;
      bar.style.display = 'flex';
    } else if (isStaff) {
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'adminFloatingBar';
        bar.className = 'admin-floating-bar';
        document.body.appendChild(bar);
      }

      const orders = OrderEngine.getAllOrders();
      const pendingCount = orders.filter(o => o.status === 'Pending').length;

      bar.innerHTML = `
        <span class="badge badge-staff" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">
          <i class="fa-solid fa-shield-halved"></i> STAFF
        </span>
        <a href="staff-dashboard.html?v=3.3" class="admin-float-btn" style="background: rgba(99, 102, 241, 0.2); border-color: #6366f1;">
          <i class="fa-solid fa-bell"></i> Live Orders
          <span class="admin-badge-count">${pendingCount}</span>
        </a>
      `;
      bar.style.display = 'flex';
    } else {
      if (bar) bar.style.display = 'none';
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

// Admin & Staff Header Auto-Enforce (Home button & borderless header)
(function enforceAdminHeaderHome() {
  function applyHeaderFix() {
    const headers = document.querySelectorAll('.site-header, header');
    headers.forEach(h => {
      h.style.setProperty('border-bottom', 'none', 'important');
    });

    const headerLinks = document.querySelectorAll('.site-header a, header a');
    headerLinks.forEach(a => {
      const text = (a.textContent || '').trim().toLowerCase();
      const href = a.getAttribute('href') || '';
      if (text.includes('customer menu') || href.includes('order-online.html')) {
        if (a.classList.contains('btn') || a.closest('.header-container')) {
          a.setAttribute('href', 'index.html');
          a.innerHTML = '<i class="fa-solid fa-house"></i> Home';
          a.title = 'Back to Homepage';
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeaderFix);
  } else {
    applyHeaderFix();
  }
  setInterval(applyHeaderFix, 800);
})();

// ==========================================
// 2. ORDER DATABASE & MANAGEMENT API
// ==========================================

const OrderEngine = {
  // Get all orders from persistent storage
  getAllOrders() {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      let orders = data ? JSON.parse(data) : [];

      // If brand new, seed 1 initial pending order so admin can see it working immediately
      if (orders.length === 0) {
        orders = [
          {
            id: 'UR-2026-8492',
            customerName: 'Tanvir Ahmed',
            customerPhone: '01711-223344',
            customerEmail: 'tanvir.ahmed@example.com',
            userId: 'USR-SAMPLE-1',
            deliveryAddress: 'House 18, Road 11, Gulshan-2, Dhaka',
            orderNotes: 'Please deliver extra mint chutney and make biryani spicy.',
            items: [
              { id: 'bd-1', name: 'Kacchi Biryani', price: 780, qty: 2, itemTotal: 1560 },
              { id: 'dr-1', name: 'Gulshan Crimson Sunset Mocktail', price: 320, qty: 2, itemTotal: 640 }
            ],
            subtotal: 2200,
            deliveryFee: 0,
            total: 2200,
            paymentMethod: 'Cash on Delivery (COD)',
            status: 'Pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      }

      return orders;
    } catch (e) {
      return [];
    }
  },

  // Save full orders list
  saveOrders(orders) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    if (typeof AuthEngine !== 'undefined') {
      AuthEngine.updateAdminFloatingBar();
    }
  },

  // Place a new Cash on Delivery order
  placeOrder({ items, subtotal, deliveryFee = 0, total, customerName, customerPhone, deliveryAddress, orderNotes = '' }) {
    if (!items || items.length === 0) throw new Error('Your cart is empty. Please select food items.');
    if (!customerName || !customerName.trim()) throw new Error('Please enter your full name.');
    if (!customerPhone || !customerPhone.trim()) throw new Error('Please enter your phone number.');
    if (!deliveryAddress || !deliveryAddress.trim()) throw new Error('Please enter your full delivery address in Dhaka.');

    const user = AuthEngine.getCurrentUser();
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderId = `UR-${new Date().getFullYear()}-${orderNumber}`;

    const newOrder = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: user ? user.email : '',
      userId: user ? user.id : 'GUEST',
      deliveryAddress: deliveryAddress.trim(),
      orderNotes: (orderNotes || '').trim(),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        itemTotal: item.price * item.qty
      })),
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      total: Number(total),
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const orders = this.getAllOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Sync new Cash on Delivery order to Google Cloud Firestore in real time
    if (window.urDb) {
      window.urDb.collection('orders').doc(newOrder.id).set(newOrder)
        .then(() => console.log('🔥 Order synced to Cloud Firestore in real time:', newOrder.id))
        .catch(err => console.warn('Cloud order sync note:', err.message));
    }

    if (user) {
      user.phone = customerPhone.trim();
      user.address = deliveryAddress.trim();
      AuthEngine.setCurrentUser(user);
    }

    return newOrder;
  },

  // Merge orders synced from Google Cloud Firestore
  mergeCloudOrders(cloudOrders) {
    if (!Array.isArray(cloudOrders) || cloudOrders.length === 0) return this.getAllOrders();
    try {
      const currentOrders = this.getAllOrders();
      const map = new Map();
      currentOrders.forEach(o => { if (o && o.id) map.set(o.id, o); });
      cloudOrders.forEach(co => {
        if (co && co.id) {
          map.set(co.id, { ...(map.get(co.id) || {}), ...co });
        }
      });
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      this.saveOrders(merged);
      return merged;
    } catch (e) {
      return this.getAllOrders();
    }
  },

  // Get orders placed by a specific user
  getCustomerOrders(emailOrId) {
    const orders = this.getAllOrders();
    if (!emailOrId) return [];
    return orders.filter(o => 
      (o.customerEmail && o.customerEmail.toLowerCase() === emailOrId.toLowerCase()) || 
      o.userId === emailOrId ||
      o.customerPhone === emailOrId
    );
  },

  // Update order status (Admin / Kitchen manager)
  updateStatus(orderId, newStatus) {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      this.saveOrders(orders);

      // Sync status change to Google Cloud Firestore
      if (window.urDb) {
        window.urDb.collection('orders').doc(orderId).update({
          status: newStatus,
          updatedAt: order.updatedAt
        }).then(() => console.log('🔥 Status updated in Cloud Firestore:', orderId, newStatus))
          .catch(err => console.warn('Cloud status update note:', err.message));
      }

      return order;
    }
    return null;
  },

  // Format pre-filled WhatsApp message for order dispatch
  generateWhatsAppUrl(order) {
    let msg = `*NEW ORDER - UNITED RESTAURANT*\n`;
    msg += `*Order ID:* #${order.id}\n`;
    msg += `*Customer:* ${order.customerName}\n`;
    msg += `*Phone:* ${order.customerPhone}\n`;
    msg += `*Delivery Address:* ${order.deliveryAddress}\n`;
    if (order.orderNotes) {
      msg += `*Special Instructions:* ${order.orderNotes}\n`;
    }
    msg += `*Payment Method:* Cash on Delivery (৳${order.total})\n`;
    msg += `------------------------------------\n`;
    msg += `*ORDER ITEMS:*\n`;
    order.items.forEach(it => {
      msg += `• ${it.qty}x ${it.name} - ৳${it.itemTotal}\n`;
    });
    msg += `------------------------------------\n`;
    msg += `*Subtotal:* ৳${order.subtotal}\n`;
    msg += `*Delivery:* FREE\n`;
    msg += `*TOTAL CASH TO PAY:* ৳${order.total}\n\n`;
    msg += `Please confirm my order. Thank you!`;

    return `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }
};

// ==========================================
// 3. AUTH MODAL INJECTION & CONTROLLERS
// ==========================================

function injectAuthModalDOM() {
  if (document.getElementById('authModal')) return;

  const modalHtml = `
    <div class="checkout-modal-backdrop" id="authModal">
      <div class="checkout-modal auth-modal-box">
        <button class="checkout-close-btn" onclick="closeAuthModal();" aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Crest Icon -->
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <div class="logo-crest" style="margin: 0 auto 0.5rem; width: 44px; height: 44px; font-size: 1.2rem;">
            <i class="fa-solid fa-crown"></i>
          </div>
          <h3 id="authModalTitle" style="color: #fff; font-size: 1.5rem; margin-bottom: 0.25rem;">Log In to United Restaurant</h3>
          <p id="authModalSubtitle" style="color: var(--text-muted); font-size: 0.88rem;">Access your saved orders, live order tracking, and Cash on Delivery checkout</p>
        </div>

        <!-- Auth Toggle Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab-btn active" id="tabBtnLogin" onclick="switchAuthMode('login');">
            <i class="fa-solid fa-right-to-bracket"></i> Log In
          </button>
          <button class="auth-tab-btn" id="tabBtnSignup" onclick="switchAuthMode('signup');">
            <i class="fa-solid fa-user-plus"></i> Create Account
          </button>
        </div>

        <!-- Error / Success Alert Box -->
        <div id="authAlertBox" class="auth-alert" style="display: none;"></div>

        <!-- Login Form -->
        <form id="formLogin" onsubmit="handleLoginSubmit(event);">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-envelope"></i> Email Address</label>
            <input type="email" id="loginEmail" class="form-control" placeholder="e.g. yourname@gmail.com" required>
          </div>
          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-lock"></i> Password</label>
            <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-check"></i> Sign In to Account
          </button>

          <div style="text-align: center; margin-top: 1.25rem; font-size: 0.85rem; color: var(--text-muted);">
            Don't have an account yet? 
            <a href="javascript:void(0)" onclick="switchAuthMode('signup');" style="color: var(--gold-accent); font-weight: 600;">Sign up free</a>
          </div>
        </form>

        <!-- Signup Form -->
        <form id="formSignup" onsubmit="handleSignupSubmit(event);" style="display: none;">
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-user"></i> Full Name</label>
            <input type="text" id="signupName" class="form-control" placeholder="e.g. Your Full Name" required>
          </div>
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-envelope"></i> Email Address</label>
            <input type="email" id="signupEmail" class="form-control" placeholder="e.g. yourname@gmail.com" required>
          </div>
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-phone"></i> Phone Number (WhatsApp)</label>
            <input type="tel" id="signupPhone" class="form-control" placeholder="e.g. 01950-177666" required>
          </div>
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-location-dot"></i> Default Delivery Address in Dhaka</label>
            <input type="text" id="signupAddress" class="form-control" placeholder="e.g. House 14, Road 5, United City, Gulshan-2">
          </div>
          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-lock"></i> Create Password (min 6 chars)</label>
            <input type="password" id="signupPassword" class="form-control" placeholder="Create a secure password" minlength="6" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-user-plus"></i> Create Account & Proceed
          </button>
          <div style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
            Already have an account? 
            <a href="javascript:void(0)" onclick="switchAuthMode('login');" style="color: var(--gold-accent); font-weight: 600;">Log in here</a>
          </div>
        </form>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openAuthModal(mode = 'login') {
  injectAuthModalDOM();
  switchAuthMode(mode);
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('open');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
}

function switchAuthMode(mode) {
  const formLogin = document.getElementById('formLogin');
  const formSignup = document.getElementById('formSignup');
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabSignup = document.getElementById('tabBtnSignup');
  const title = document.getElementById('authModalTitle');
  const subtitle = document.getElementById('authModalSubtitle');
  const alertBox = document.getElementById('authAlertBox');

  if (alertBox) alertBox.style.display = 'none';

  if (mode === 'signup') {
    if (formLogin) formLogin.style.display = 'none';
    if (formSignup) formSignup.style.display = 'block';
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabSignup) tabSignup.classList.add('active');
    if (title) title.textContent = 'Create Your Free Account';
    if (subtitle) subtitle.textContent = 'Sign up to place real Cash on Delivery orders and track meals';
  } else {
    if (formLogin) formLogin.style.display = 'block';
    if (formSignup) formSignup.style.display = 'none';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
    if (title) title.textContent = 'Log In to United Restaurant';
    if (subtitle) subtitle.textContent = 'Access your saved orders, live order tracking, and Cash on Delivery checkout';
  }
}

function showAuthAlert(msg, isSuccess = false) {
  const box = document.getElementById('authAlertBox');
  if (!box) return;
  box.textContent = msg;
  box.className = `auth-alert ${isSuccess ? 'success' : 'error'}`;
  box.style.display = 'block';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;

  try {
    const user = AuthEngine.login(email, pass);
    const isAdmin = AuthEngine.isAdmin();
    showAuthAlert(`Welcome back, ${user.name}! ${isAdmin ? '👑 (Admin Access Granted)' : ''}`, true);
    setTimeout(() => {
      closeAuthModal();
      if (typeof autofillOrderCustomerFields === 'function') {
        autofillOrderCustomerFields();
      }
      if (window.location.pathname.includes('admin-orders')) {
        window.location.reload();
      }
    }, 700);
  } catch (err) {
    showAuthAlert(err.message, false);
  }
}

function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const address = document.getElementById('signupAddress').value;
  const pass = document.getElementById('signupPassword').value;

  try {
    const user = AuthEngine.signUp({ name, email, password: pass, phone, address });
    const isAdmin = AuthEngine.isAdmin();
    showAuthAlert(`Account created successfully! Welcome, ${user.name}. ${isAdmin ? '👑 (Admin Access Granted)' : ''}`, true);
    setTimeout(() => {
      closeAuthModal();
      if (typeof autofillOrderCustomerFields === 'function') {
        autofillOrderCustomerFields();
      }
      if (window.location.pathname.includes('admin-orders')) {
        window.location.reload();
      }
    }, 800);
  } catch (err) {
    showAuthAlert(err.message, false);
  }
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const panel = document.getElementById('userDropdownPanel');
  if (panel) {
    panel.classList.toggle('show');
  }
}

// Modal for viewing registered customers & roles (Admin only)
function openRegisteredUsersModal() {
  if (!AuthEngine.isAdmin()) {
    alert('Access Denied: Only the authorized restaurant owner (alxami.islam@gmail.com) can access this user database.');
    return;
  }
  let modal = document.getElementById('registeredUsersModal');
  if (!modal) {
    const html = `
      <div class="checkout-modal-backdrop" id="registeredUsersModal">
        <div class="checkout-modal" style="max-width: 780px;">
          <button class="checkout-close-btn" onclick="document.getElementById('registeredUsersModal').classList.remove('open');">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div style="margin-bottom: 1.25rem;">
            <span class="badge badge-gold"><i class="fa-solid fa-crown"></i> Admin Control</span>
            <h3 style="color: #fff; font-size: 1.5rem; margin-top: 0.35rem;">User Management & RBAC Roles</h3>
            <p style="color: var(--text-muted); font-size: 0.88rem;">Manage Customer, Staff, and Owner permissions</p>
          </div>
          <div style="margin-bottom: 1rem; position: relative;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-dim);"></i>
            <input type="text" id="modalUserSearch" class="form-control" placeholder="Search user by name, email, or phone..." style="padding-left: 2.5rem;" oninput="renderModalUsersList();">
          </div>
          <div id="usersTableWrap" style="max-height: 420px; overflow-y: auto;"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('registeredUsersModal');
  }

  renderModalUsersList();
  modal.classList.add('open');
}

function renderModalUsersList() {
  const query = (document.getElementById('modalUserSearch')?.value || '').toLowerCase().trim();
  const users = AuthEngine.getUsers();
  const wrap = document.getElementById('usersTableWrap');
  if (!wrap) return;

  const filtered = users.filter(u => 
    !query || 
    (u.name && u.name.toLowerCase().includes(query)) ||
    (u.email && u.email.toLowerCase().includes(query)) ||
    (u.phone && u.phone.includes(query)) ||
    (u.role && u.role.toLowerCase().includes(query))
  );

  let tableHtml = `
    <table class="rbac-user-table" style="font-size: 0.85rem;">
      <thead>
        <tr>
          <th>User / Customer</th>
          <th>Contact</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (filtered.length === 0) {
    tableHtml += `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">No users found matching "${query}".</td></tr>`;
  } else {
    filtered.forEach(u => {
      const isOwner = (u.email || '').toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
      const role = isOwner ? 'admin' : (u.role || 'customer');
      const orders = OrderEngine.getCustomerOrders(u.email || u.id);

      tableHtml += `
        <tr>
          <td>
            <strong style="color: #fff;">${AuthEngine.escapeHtml(u.name)}</strong>
            <div style="color: var(--text-muted); font-size: 0.75rem;">${AuthEngine.escapeHtml(u.address || 'No address set')}</div>
          </td>
          <td>
            <div style="color: var(--text-light);">${AuthEngine.escapeHtml(u.email)}</div>
            <div style="color: #4ade80; font-size: 0.78rem;">${AuthEngine.escapeHtml(u.phone || 'N/A')}</div>
          </td>
          <td>
            <span class="role-pill ${role}">
              ${role === 'admin' ? '<i class="fa-solid fa-crown text-gold"></i> OWNER' : (role === 'staff' ? '<i class="fa-solid fa-shield-halved"></i> STAFF' : '<i class="fa-solid fa-user"></i> CUSTOMER')}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              ${isOwner ? `
                <span style="font-size: 0.75rem; color: var(--gold-accent); font-weight: 700;">Owner (Protected)</span>
              ` : (role === 'staff' ? `
                <button type="button" class="btn-demote" onclick="handleRoleChange('${u.id}', 'customer');" title="Demote to Customer">
                  <i class="fa-solid fa-arrow-down"></i> Demote
                </button>
              ` : `
                <button type="button" class="btn-promote" onclick="handleRoleChange('${u.id}', 'staff');" title="Promote to Kitchen Staff">
                  <i class="fa-solid fa-arrow-up"></i> Promote Staff
                </button>
              `)}
              <button type="button" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="viewUserOrdersModal('${u.email || u.id}', '${AuthEngine.escapeHtml(u.name)}');" title="View complete order history">
                <i class="fa-solid fa-receipt"></i> Orders (${orders.length})
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  tableHtml += `</tbody></table>`;
  wrap.innerHTML = tableHtml;
}

function handleRoleChange(userId, newRole) {
  try {
    const user = AuthEngine.updateUserRole(userId, newRole);
    renderModalUsersList();
    if (typeof renderUsersTab === 'function') {
      renderUsersTab();
    }
  } catch (err) {
    alert(err.message);
  }
}

// User Complete Order History Modal
function viewUserOrdersModal(userEmailOrId, userName) {
  const orders = OrderEngine.getCustomerOrders(userEmailOrId);
  let modal = document.getElementById('userOrderHistoryModal');
  if (!modal) {
    const html = `
      <div class="checkout-modal-backdrop" id="userOrderHistoryModal">
        <div class="checkout-modal" style="max-width: 720px;">
          <button class="checkout-close-btn" onclick="document.getElementById('userOrderHistoryModal').classList.remove('open');">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div style="margin-bottom: 1.25rem;">
            <span class="badge badge-gold"><i class="fa-solid fa-clock-rotate-left"></i> Customer Order History</span>
            <h3 id="userOrdersModalTitle" style="color: #fff; font-size: 1.4rem; margin-top: 0.35rem;">Orders for Customer</h3>
            <p id="userOrdersModalSubtitle" style="color: var(--text-muted); font-size: 0.85rem;"></p>
          </div>
          <div id="userOrdersModalFeed" style="max-height: 480px; overflow-y: auto;"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('userOrderHistoryModal');
  }

  const titleEl = document.getElementById('userOrdersModalTitle');
  const subEl = document.getElementById('userOrdersModalSubtitle');
  const feed = document.getElementById('userOrdersModalFeed');

  if (titleEl) titleEl.textContent = `Order History: ${userName}`;
  if (subEl) subEl.textContent = `${orders.length} total orders found for ${userEmailOrId}`;

  if (orders.length === 0) {
    feed.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-receipt" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--text-dim);"></i>
        <h4 style="color: #fff;">No Orders Placed Yet</h4>
        <p style="font-size: 0.85rem;">This customer hasn't placed any Cash on Delivery orders yet.</p>
      </div>
    `;
  } else {
    let html = '';
    orders.forEach(order => {
      const dateFormatted = new Date(order.createdAt).toLocaleString();
      let statusClass = 'status-pending';
      if (order.status === 'Preparing') statusClass = 'status-preparing';
      else if (order.status === 'Out for Delivery') statusClass = 'status-onway';
      else if (order.status === 'Delivered') statusClass = 'status-delivered';
      else if (order.status === 'Cancelled') statusClass = 'status-cancelled';

      html += `
        <div class="order-card" style="margin-bottom: 1rem;">
          <div class="order-card-header">
            <div>
              <span class="order-card-id">#${order.id}</span>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
                <i class="fa-regular fa-calendar"></i> ${dateFormatted}
              </div>
            </div>
            <div style="text-align: right;">
              <span class="status-badge ${statusClass}">${order.status}</span>
              <div style="color: #4ade80; font-weight: 700; font-size: 1rem; margin-top: 0.25rem;">
                ৳${order.total} (COD)
              </div>
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.25); border-radius: 6px; padding: 0.6rem 0.85rem; margin-bottom: 0.6rem; font-size: 0.82rem;">
            <strong>📍 Address:</strong> ${order.deliveryAddress || 'No address'}<br>
            <strong>📞 Phone:</strong> ${order.customerPhone || 'N/A'}
          </div>
          <table class="order-items-table" style="font-size: 0.82rem;">
            <tbody>
              ${(order.items || []).map(it => `
                <tr>
                  <td><strong style="color: #fff;">${it.name}</strong></td>
                  <td style="text-align: center; color: var(--gold-accent);">x${it.qty}</td>
                  <td class="price-col">৳${it.itemTotal}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });
    feed.innerHTML = html;
  }

  modal.classList.add('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  const panel = document.getElementById('userDropdownPanel');
  if (panel && panel.classList.contains('show')) {
    panel.classList.remove('show');
  }
});

// Real-time synchronization with Google Cloud Firestore
function initFirebaseSync() {
  if (!window.urDb) return;

  try {
    // 1. Real-time listener for incoming & updated orders
    window.urDb.collection('orders').onSnapshot(snapshot => {
      const cloudOrders = [];
      snapshot.forEach(doc => cloudOrders.push(doc.data()));
      if (cloudOrders.length > 0) {
        OrderEngine.mergeCloudOrders(cloudOrders);
        if (typeof renderAdminDashboard === 'function') {
          renderAdminDashboard();
        }
        if (typeof renderStaffDashboard === 'function') {
          renderStaffDashboard();
        }
        if (typeof displayFilteredOrders === 'function') {
          displayFilteredOrders();
        }
        if (typeof renderProfileOrderHistory === 'function') {
          renderProfileOrderHistory();
        }
      }
    }, err => {
      console.warn('Firestore orders sync notice:', err.message);
    });

    // 2. Real-time sync for registered users & RBAC roles
    window.urDb.collection('users').onSnapshot(snapshot => {
      const cloudUsers = [];
      snapshot.forEach(doc => cloudUsers.push(doc.data()));
      if (cloudUsers.length > 0) {
        AuthEngine.mergeCloudUsers(cloudUsers);
        
        // Sync active user role if updated remotely
        const cur = AuthEngine.getCurrentUser();
        if (cur) {
          const fresh = cloudUsers.find(u => (u.id && u.id === cur.id) || (u.email && u.email.toLowerCase() === cur.email.toLowerCase()));
          if (fresh && fresh.role && fresh.role !== cur.role && cur.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
            cur.role = fresh.role;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(cur));
            AuthEngine.updateNavbarAuthUI();
            AuthEngine.updateAdminFloatingBar();
          }
        }

        if (typeof renderUsersTab === 'function') {
          renderUsersTab();
        }
        if (typeof renderModalUsersList === 'function' && document.getElementById('registeredUsersModal')?.classList.contains('open')) {
          renderModalUsersList();
        }
      }
    }, err => {
      console.warn('Firestore users sync notice:', err.message);
    });

    // 3. Real-time sync for Menu Items Catalog
    window.urDb.collection('menu_items').onSnapshot(snapshot => {
      const cloudItems = [];
      snapshot.forEach(doc => cloudItems.push(doc.data()));
      if (cloudItems.length > 0 && typeof MenuEngine !== 'undefined') {
        MenuEngine.mergeCloudMenuItems(cloudItems);
        if (typeof renderMenuItems === 'function') {
          renderMenuItems();
        }
        if (typeof renderMenuManagementTab === 'function') {
          renderMenuManagementTab();
        }
      }
    }, err => {
      console.warn('Firestore menu sync notice:', err.message);
    });
  } catch (err) {
    console.warn('Firestore sync error:', err);
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  injectAuthModalDOM();
  AuthEngine.updateNavbarAuthUI();
  initFirebaseSync();
});
