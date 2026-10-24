/**
 * United Restaurant - Authentication & Order Management Engine
 * Handles User Sign Up, Login, Profile Persistence,
 * Real Cash on Delivery Order Placement, and Order Tracking.
 */

const AUTH_STORAGE_KEY = 'ur_current_user';
const USERS_STORAGE_KEY = 'ur_registered_users';
const ORDERS_STORAGE_KEY = 'ur_restaurant_orders';
const RESTAURANT_WHATSAPP = '8801950177666'; // 01950-177666

// Recognized Owner / Admin Emails with Super Admin Powers
const ADMIN_EMAILS = [
  'alxami.islam@gmail.com',
  'admin@unitedrestaurant.com'
];

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

  // Check if currently logged in user has admin powers
  isAdmin() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === 'admin' || ADMIN_EMAILS.includes((user.email || '').toLowerCase())));
  },

  // Get all registered users from persistent storage
  getUsers() {
    try {
      let data = localStorage.getItem(USERS_STORAGE_KEY);
      let users = data ? JSON.parse(data) : [];

      // Auto-seed Owner account if not already present
      const ownerExists = users.some(u => u.email.toLowerCase() === 'alxami.islam@gmail.com');
      if (!ownerExists) {
        users.unshift({
          id: 'USR-OWNER-001',
          name: 'Al Sami Islam (Owner)',
          email: 'alxami.islam@gmail.com',
          password: 'admin123', // Default owner password
          phone: '01950-177666',
          address: 'United City, Gulshan-2, Dhaka',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }

      return users;
    } catch (e) {
      return [];
    }
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
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    const isOwnerEmail = ADMIN_EMAILS.includes(email.toLowerCase());
    const role = isOwnerEmail ? 'admin' : 'customer';

    let userObj;
    if (existingIndex >= 0) {
      // If owner is re-registering with their own chosen password, update it
      if (isOwnerEmail) {
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
        id: isOwnerEmail ? 'USR-OWNER-' + Date.now().toString(36).toUpperCase() : 'USR-' + Date.now().toString(36).toUpperCase(),
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

    // Auto-login after signup
    this.setCurrentUser(userObj);
    return userObj;
  },

  // Log in existing user
  login(email, password) {
    email = (email || '').trim().toLowerCase();
    if (!email || !password) throw new Error('Please enter both email and password.');

    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email && u.password === password);

    // If owner email matches, make sure role is admin
    if (user && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      user.role = 'admin';
      sessionStorage.setItem('ur_admin_unlocked', 'true');
    }

    if (!user) {
      throw new Error('Invalid email or password. Please verify or use the Owner 1-click button.');
    }

    this.setCurrentUser(user);
    return user;
  },

  // Set active user session
  setCurrentUser(user) {
    const safeUser = { ...user };
    delete safeUser.password;
    if (ADMIN_EMAILS.includes((safeUser.email || '').toLowerCase())) {
      safeUser.role = 'admin';
      sessionStorage.setItem('ur_admin_unlocked', 'true');
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
    this.updateNavbarAuthUI();
    this.updateAdminFloatingBar();
  },

  // Log out
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('ur_admin_unlocked');
    this.updateNavbarAuthUI();
    this.updateAdminFloatingBar();
    if (window.location.pathname.includes('my-orders') || window.location.pathname.includes('admin-orders')) {
      window.location.reload();
    }
  },

  // Update navbar across any page
  updateNavbarAuthUI() {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdmin();
    const containers = document.querySelectorAll('.nav-auth-container');
    
    containers.forEach(container => {
      if (user) {
        if (isAdmin) {
          container.innerHTML = `
            <div class="user-menu-dropdown">
              <button class="btn btn-primary btn-sm user-menu-btn" style="background: linear-gradient(135deg, #b91c1c, #7f1d1d); border: 1px solid var(--gold-accent); box-shadow: 0 0 15px rgba(234, 179, 8, 0.35);" onclick="toggleUserMenu(event)">
                <i class="fa-solid fa-crown text-gold"></i>
                <span>Owner: ${this.escapeHtml(user.name.split(' ')[0])}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; margin-left: 0.2rem;"></i>
              </button>
              <div class="user-dropdown-panel" id="userDropdownPanel" style="width: 270px;">
                <div class="user-dropdown-header" style="background: rgba(234, 179, 8, 0.08); border-bottom: 1px solid rgba(234, 179, 8, 0.25);">
                  <div style="font-size: 0.72rem; color: var(--gold-accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                    <i class="fa-solid fa-crown"></i> Restaurant Owner / Admin
                  </div>
                  <strong style="color: #fff; font-size: 0.95rem;">${this.escapeHtml(user.name)}</strong>
                  <small style="color: var(--text-muted);">${this.escapeHtml(user.email)}</small>
                </div>
                <a href="admin-orders.html" class="user-dropdown-item text-gold" style="font-weight: 700;">
                  <i class="fa-solid fa-clipboard-list text-gold"></i> Kitchen Live Orders Terminal
                </a>
                <a href="order-online.html" class="user-dropdown-item">
                  <i class="fa-solid fa-utensils"></i> Customer Menu & Order
                </a>
                <a href="my-orders.html" class="user-dropdown-item">
                  <i class="fa-solid fa-box-open"></i> Customer Orders View
                </a>
                <button class="user-dropdown-item" onclick="openRegisteredUsersModal();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer; color: var(--text-light);">
                  <i class="fa-solid fa-users"></i> Registered Customers List
                </button>
                <button class="user-dropdown-item text-red" onclick="AuthEngine.logout();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.08);">
                  <i class="fa-solid fa-right-from-bracket"></i> Log Out
                </button>
              </div>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="user-menu-dropdown">
              <button class="btn btn-outline btn-sm user-menu-btn" onclick="toggleUserMenu(event)">
                <i class="fa-solid fa-circle-user text-gold"></i>
                <span>${this.escapeHtml(user.name.split(' ')[0])}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; margin-left: 0.2rem;"></i>
              </button>
              <div class="user-dropdown-panel" id="userDropdownPanel">
                <div class="user-dropdown-header">
                  <strong>${this.escapeHtml(user.name)}</strong>
                  <small>${this.escapeHtml(user.email)}</small>
                </div>
                <a href="order-online.html" class="user-dropdown-item">
                  <i class="fa-solid fa-utensils"></i> Order Food
                </a>
                <a href="my-orders.html" class="user-dropdown-item">
                  <i class="fa-solid fa-box-open"></i> My Orders & Receipts
                </a>
                <button class="user-dropdown-item text-red" onclick="AuthEngine.logout();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer;">
                  <i class="fa-solid fa-right-from-bracket"></i> Log Out
                </button>
              </div>
            </div>
          `;
        }
      } else {
        container.innerHTML = `
          <button class="btn btn-outline btn-sm" onclick="openAuthModal('login');">
            <i class="fa-solid fa-arrow-right-to-bracket"></i> Log In / Sign Up
          </button>
        `;
      }
    });

    this.updateAdminFloatingBar();
  },

  // Floating admin quick bar at bottom-right of screen
  updateAdminFloatingBar() {
    let bar = document.getElementById('adminFloatingBar');
    const isAdmin = this.isAdmin();

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
        <a href="admin-orders.html" class="admin-float-btn">
          <i class="fa-solid fa-bell"></i> Kitchen Orders
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

    if (user) {
      user.phone = customerPhone.trim();
      user.address = deliveryAddress.trim();
      AuthEngine.setCurrentUser(user);
    }

    return newOrder;
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
          <p id="authModalSubtitle" style="color: var(--text-muted); font-size: 0.88rem;">Access your saved orders, Cash on Delivery checkout, and owner powers</p>
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

          <!-- Owner / Creator 1-Click Fill Helper -->
          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.12); text-align: center;">
            <div style="font-size: 0.78rem; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-crown"></i> Website Creator & Restaurant Owner
            </div>
            <button type="button" class="btn btn-outline btn-sm" style="width: 100%; border-color: rgba(234, 179, 8, 0.45); color: var(--gold-accent); font-size: 0.82rem; justify-content: center;" onclick="fillAdminCredentials();">
              <i class="fa-solid fa-key text-gold"></i> Fill Owner Login (alxami.islam@gmail.com)
            </button>
            <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 0.35rem;">
              Owner Default Pass: <code>admin123</code> (Instant Admin Powers)
            </div>
          </div>

          <div style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
            Don't have an account yet? 
            <a href="javascript:void(0)" onclick="switchAuthMode('signup');" style="color: var(--gold-accent); font-weight: 600;">Sign up free</a>
          </div>
        </form>

        <!-- Signup Form -->
        <form id="formSignup" onsubmit="handleSignupSubmit(event);" style="display: none;">
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-user"></i> Full Name</label>
            <input type="text" id="signupName" class="form-control" placeholder="e.g. Al Sami Islam" required>
          </div>
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.85rem;"><i class="fa-solid fa-envelope"></i> Email Address</label>
            <input type="email" id="signupEmail" class="form-control" placeholder="e.g. alxami.islam@gmail.com" required>
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

// 1-Click fill for the creator / owner
function fillAdminCredentials() {
  switchAuthMode('login');
  const emailEl = document.getElementById('loginEmail');
  const passEl = document.getElementById('loginPassword');
  if (emailEl) emailEl.value = 'alxami.islam@gmail.com';
  if (passEl) passEl.value = 'admin123';
  showAuthAlert('👑 Owner credentials loaded! Click "Sign In to Account" to activate Admin Powers.', true);
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
    if (subtitle) subtitle.textContent = 'Access your saved orders, Cash on Delivery checkout, and owner powers';
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
    showAuthAlert(`Welcome back, ${user.name}! ${isAdmin ? '👑 (Owner / Admin Powers Active)' : ''}`, true);
    setTimeout(() => {
      closeAuthModal();
      if (typeof autofillOrderCustomerFields === 'function') {
        autofillOrderCustomerFields();
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
    showAuthAlert(`Account created successfully! Welcome, ${user.name}. ${isAdmin ? '👑 (Owner Powers Active)' : ''}`, true);
    setTimeout(() => {
      closeAuthModal();
      if (typeof autofillOrderCustomerFields === 'function') {
        autofillOrderCustomerFields();
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

// Modal for viewing registered customers (Admin only)
function openRegisteredUsersModal() {
  let modal = document.getElementById('registeredUsersModal');
  if (!modal) {
    const html = `
      <div class="checkout-modal-backdrop" id="registeredUsersModal">
        <div class="checkout-modal" style="max-width: 650px;">
          <button class="checkout-close-btn" onclick="document.getElementById('registeredUsersModal').classList.remove('open');">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div style="margin-bottom: 1.25rem;">
            <span class="badge badge-gold"><i class="fa-solid fa-crown"></i> Admin Control</span>
            <h3 style="color: #fff; font-size: 1.5rem; margin-top: 0.35rem;">Registered Customers Database</h3>
            <p style="color: var(--text-muted); font-size: 0.88rem;">All customers who have registered on United Restaurant</p>
          </div>
          <div id="usersTableWrap" style="max-height: 400px; overflow-y: auto;"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('registeredUsersModal');
  }

  const users = AuthEngine.getUsers();
  const wrap = document.getElementById('usersTableWrap');
  if (wrap) {
    let tableHtml = `
      <table class="order-items-table" style="font-size: 0.85rem;">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
    `;
    users.forEach(u => {
      tableHtml += `
        <tr>
          <td>
            <strong style="color: #fff;">${AuthEngine.escapeHtml(u.name)}</strong>
            <div style="color: var(--text-muted); font-size: 0.75rem;">${AuthEngine.escapeHtml(u.address || 'No address')}</div>
          </td>
          <td>
            <div>${AuthEngine.escapeHtml(u.email)}</div>
            <div style="color: #4ade80;">${AuthEngine.escapeHtml(u.phone || 'N/A')}</div>
          </td>
          <td>
            <span class="badge ${u.role === 'admin' ? 'badge-gold' : 'badge-red'}" style="font-size: 0.7rem;">
              ${u.role === 'admin' ? '👑 OWNER' : 'CUSTOMER'}
            </span>
          </td>
        </tr>
      `;
    });
    tableHtml += `</tbody></table>`;
    wrap.innerHTML = tableHtml;
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

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  injectAuthModalDOM();
  AuthEngine.updateNavbarAuthUI();
});
