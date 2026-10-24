/**
 * United Restaurant - Authentication & Order Management Engine
 * Handles User Sign Up, Login, Profile Persistence,
 * Real Cash on Delivery Order Placement, and Order Tracking.
 */

const AUTH_STORAGE_KEY = 'ur_current_user';
const USERS_STORAGE_KEY = 'ur_registered_users';
const ORDERS_STORAGE_KEY = 'ur_restaurant_orders';
const RESTAURANT_WHATSAPP = '8801950177666'; // 01950-177666

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

  // Get all registered users from persistent storage
  getUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
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
    const existing = users.find(u => u.email === email);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser = {
      id: 'USR-' + Date.now().toString(36).toUpperCase(),
      name,
      email,
      password, // In a purely client-side setup, stored locally; Firebase Auth replaces this when plugged in
      phone,
      address,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Auto-login after signup
    this.setCurrentUser(newUser);
    return newUser;
  },

  // Log in existing user
  login(email, password) {
    email = (email || '').trim().toLowerCase();
    if (!email || !password) throw new Error('Please enter both email and password.');

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      // Convenience demo check: if no accounts yet, create demo admin or prompt
      throw new Error('Invalid email or password. Please verify or create an account.');
    }

    this.setCurrentUser(user);
    return user;
  },

  // Set active user session
  setCurrentUser(user) {
    // Exclude password from active session object for safety
    const safeUser = { ...user };
    delete safeUser.password;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
    this.updateNavbarAuthUI();
  },

  // Log out
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.updateNavbarAuthUI();
    // If on my-orders page or checkout, refresh view
    if (window.location.pathname.includes('my-orders')) {
      window.location.reload();
    }
  },

  // Update navbar across any page
  updateNavbarAuthUI() {
    const user = this.getCurrentUser();
    const containers = document.querySelectorAll('.nav-auth-container');
    
    containers.forEach(container => {
      if (user) {
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
              <a href="admin-orders.html" class="user-dropdown-item text-gold">
                <i class="fa-solid fa-clipboard-list"></i> Kitchen Order Manager
              </a>
              <button class="user-dropdown-item text-red" onclick="AuthEngine.logout();" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer;">
                <i class="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <button class="btn btn-outline btn-sm" onclick="openAuthModal('login');">
            <i class="fa-solid fa-arrow-right-to-bracket"></i> Log In / Sign Up
          </button>
        `;
      }
    });
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
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Save full orders list
  saveOrders(orders) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
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
      status: 'Pending', // 'Pending' -> 'Preparing' -> 'Out for Delivery' -> 'Delivered'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const orders = this.getAllOrders();
    orders.unshift(newOrder); // Newest first
    this.saveOrders(orders);

    // Save/update user's default phone and address if logged in
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
          <p id="authModalSubtitle" style="color: var(--text-muted); font-size: 0.88rem;">Access your saved orders and fast Cash on Delivery checkout</p>
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
    if (subtitle) subtitle.textContent = 'Access your saved orders and fast Cash on Delivery checkout';
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
    showAuthAlert(`Welcome back, ${user.name}!`, true);
    setTimeout(() => {
      closeAuthModal();
      // If order page, auto-fill fields
      if (typeof autofillOrderCustomerFields === 'function') {
        autofillOrderCustomerFields();
      }
    }, 600);
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
    showAuthAlert(`Account created successfully! Welcome, ${user.name}.`, true);
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

function toggleUserMenu(e) {
  e.stopPropagation();
  const panel = document.getElementById('userDropdownPanel');
  if (panel) {
    panel.classList.toggle('show');
  }
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
