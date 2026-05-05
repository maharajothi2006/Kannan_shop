const state = {
    view: 'auth', // 'auth', 'shop', 'product', 'checkout', 'orders'
    isLoginMode: true,
    authStep: 'credentials', // 'credentials', 'otp'
    user: null,
    tempUser: null,
    activeProduct: null,
    cart: [],
    activeCategory: 'All',
    searchQuery: '',
    checkoutItems: [],
    isCartCheckout: false,
    orders: []
};

// Main App Container
const appElement = document.getElementById('app');

// Render functions
function renderApp() {
    appElement.innerHTML = ''; // clear

    if (state.view === 'auth') {
        appElement.appendChild(createAuthView());
    } else if (state.view === 'shop') {
        appElement.appendChild(createShopView());
    } else if (state.view === 'product') {
        appElement.appendChild(createProductView());
    } else if (state.view === 'checkout') {
        appElement.appendChild(createCheckoutView());
    } else if (state.view === 'orders') {
        appElement.appendChild(createOrdersView());
    } else if (state.view === 'profile') {
        appElement.appendChild(createProfileView());
    }
}

function switchView(newView) {
    state.view = newView;
    window.scrollTo(0,0);
    renderApp();
}

function getUsers() {
    return JSON.parse(localStorage.getItem('kannanShopUsers') || '[]');
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('kannanShopUsers', JSON.stringify(users));
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const errorMsg = document.getElementById('form-error');
    errorMsg.style.display = 'none';

    if (state.authStep === 'credentials') {
        if(state.isLoginMode) {
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            if(!email || !password) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Please fill out all fields.';
                return;
            }
            
            const users = getUsers();
            const existingUser = users.find(u => u.email === email && u.password === password);
            if (!existingUser) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Invalid email or password. Do you have an account?';
                return;
            }
            
            state.user = existingUser;
            switchView('shop');
        } else {
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const phone = document.getElementById('phone')?.value;
            const name = document.getElementById('name')?.value;
            
            if(!email || !password || !phone || !name) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Please fill out all fields.';
                return;
            }
            
            const users = getUsers();
            if (users.find(u => u.email === email)) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Account with this email already exists. Please log in.';
                return;
            }
            
            state.tempUser = { email, name, phone, password };
            state.authStep = 'otp';
            renderApp();
        }
    } else if (state.authStep === 'otp') {
        const otp = document.getElementById('otp')?.value;
        if (otp !== '1234') {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Invalid OTP. Hint: Use 1234.';
            return;
        }
        
        saveUser(state.tempUser);
        state.user = state.tempUser;
        state.authStep = 'credentials';
        switchView('shop');
    }
}

function toggleAuthMode() {
    state.isLoginMode = !state.isLoginMode;
    state.authStep = 'credentials';
    renderApp();
}

// Components

function addToCart(product) {
    state.cart.push(product);
    updateNavUI();
    toggleCartModal();
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateNavUI();
    toggleCartModal(); // close
    toggleCartModal(); // reopen
}

function updateNavUI() {
    const ccList = document.querySelectorAll('.cart-count');
    ccList.forEach(cc => cc.textContent = state.cart.length);
}

function toggleCartModal() {
    let modal = document.getElementById('cart-modal');
    if(modal) {
        modal.remove();
    } else {
        modal = document.createElement('div');
        modal.id = 'cart-modal';
        modal.className = 'cart-overlay';
        
        let itemsHTML = state.cart.length ? state.cart.map((p, i) => `
            <div class="cart-item">
                <img src="${p.image}" style="width: 50px; height: 50px; border-radius: 8px;">
                <div style="flex:1;">
                    <div style="font-weight:500;">${p.title}</div>
                    <div style="color:var(--accent);">₹${p.price.toFixed(2)}</div>
                </div>
                <button onclick="removeFromCart(${i})" style="color:var(--error); font-size: 1.2rem; cursor: pointer;">✕</button>
            </div>
        `).join('') : '<p style="color:var(--theme-text-muted);">Your cart is empty.</p>';
        
        let total = state.cart.reduce((s, p) => s + p.price, 0).toFixed(2);
        
        modal.innerHTML = `
            <div class="cart-panel">
                <div class="cart-header">
                    <h2>Your Cart</h2>
                    <button onclick="toggleCartModal()" style="font-size: 1.5rem; cursor:pointer; color:var(--theme-text);">✕</button>
                </div>
                <div class="cart-items">
                    ${itemsHTML}
                </div>
                <div class="cart-footer">
                    <h3 style="margin-bottom:1rem;">Total: ₹${total}</h3>
                    <button class="btn-primary" style="width:100%;" onclick="checkoutCart()">Proceed to Checkout</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

function checkoutCart() {
    if(!state.cart.length) return;
    if(!state.user) {
        alert("Please login to proceed to checkout.");
        switchView('auth');
        return;
    }
    state.checkoutItems = [...state.cart];
    state.isCartCheckout = true;
    switchView('checkout');
    toggleCartModal();
}

function buyNow(product) {
    if(!state.user) {
        alert("Please login to purchase");
        switchView('auth');
        return;
    }
    state.checkoutItems = [product];
    state.isCartCheckout = false;
    switchView('checkout');
}

function submitOrder(e) {
    e.preventDefault();
    const address = document.getElementById('address').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total = state.checkoutItems.reduce((s, p) => s + p.price, 0);
    
    state.orders.push({
        id: 'ORD' + Math.floor(Math.random()*1000000),
        date: new Date().toLocaleDateString(),
        items: [...state.checkoutItems],
        total: total,
        address: address,
        method: paymentMethod
    });
    
    if(state.isCartCheckout) {
        state.cart = [];
        updateNavUI();
    }
    state.checkoutItems = [];
    switchView('orders');
    alert("Order Placed Successfully!");
}

function createCheckoutView() {
    const container = document.createElement('div');
    const nav = document.createElement('nav'); nav.className = 'navbar'; nav.innerHTML = getNavbarHTML();
    
    const content = document.createElement('div');
    content.className = 'product-detail-container';
    content.style.maxWidth = '800px';
    
    if(!state.checkoutItems.length) {
        content.innerHTML = `<button class="back-btn" onclick="switchView('shop')">← Back to Shop</button><p>No items to checkout.</p>`;
        container.appendChild(nav); container.appendChild(content); return container;
    }
    
    const total = state.checkoutItems.reduce((s, p) => s + p.price, 0).toFixed(2);
    
    content.innerHTML = `
        <button class="back-btn" onclick="switchView('shop')">← Continue Shopping</button>
        <h1 style="margin-bottom: 2rem;">Secure Checkout</h1>
        <div style="display:flex; gap: 2rem; flex-wrap:wrap;">
            <div style="flex: 1; min-width:300px;">
                <form id="checkout-form" class="auth-form" onsubmit="submitOrder(event)" style="background:var(--theme-surface); padding:2rem; border-radius:16px;">
                    <h3>Delivery Address</h3>
                    <div class="form-group" style="margin-top:1rem;">
                        <textarea id="address" placeholder="123 Main St, City, Pincode" required style="width:100%; padding:1rem; border-radius:8px; border:1px solid var(--glass-border); min-height:80px; font-family:inherit; background:var(--theme-bg); color:var(--theme-text);"></textarea>
                    </div>
                    <h3 style="margin-top:2rem;">Payment Method</h3>
                    <div class="form-group" style="margin-top:1rem; display:flex; flex-direction:column; gap:0.5rem;">
                        <label><input type="radio" name="payment" value="Cash on Delivery" required> Cash on Delivery</label>
                        <label><input type="radio" name="payment" value="Credit/Debit Card"> Credit/Debit Card</label>
                        <label><input type="radio" name="payment" value="UPI"> UPI Payout</label>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:2rem; padding: 1.2rem;">Confirm Order - ₹${total}</button>
                </form>
            </div>
            <div style="width: 300px;">
                <div style="background:var(--theme-surface); padding:2rem; border-radius:16px; border:1px solid var(--glass-border);">
                    <h3>Order Summary</h3>
                    <div style="margin-top:1rem;">
                        ${state.checkoutItems.map(p => `
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.9rem;">
                                <span>${p.title}</span> <strong>₹${p.price.toFixed(2)}</strong>
                            </div>
                        `).join('')}
                        <hr style="margin: 1rem 0; border:none; border-top:1px solid var(--glass-border);">
                        <div style="display:flex; justify-content:space-between; font-size:1.2rem;">
                            <strong>Total</strong> <strong>₹${total}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(nav); container.appendChild(content); return container;
}

function createOrdersView() {
    const container = document.createElement('div');
    const nav = document.createElement('nav'); nav.className = 'navbar'; nav.innerHTML = getNavbarHTML();
    
    const content = document.createElement('div');
    content.className = 'product-detail-container';
    content.style.maxWidth = '1000px';
    
    let html = `<button class="back-btn" onclick="switchView('shop')">← Back to Shop</button><h1 style="margin-bottom: 2rem;">My Orders</h1>`;
    
    if(!state.orders.length) {
        html += `<p>You haven't placed any orders yet. Start shopping!</p>`;
    } else {
        html += `<div style="display:flex; flex-direction:column; gap:1.5rem;">`;
        [...state.orders].reverse().forEach(ord => {
            html += `
                <div style="background:var(--theme-surface); border:1px solid var(--glass-border); border-radius:16px; padding:1.5rem; display:flex; gap: 2rem; align-items: flex-start; flex-wrap:wrap;">
                    <div style="flex:1; min-width:300px;">
                        <h3 style="margin-bottom:0.5rem; color:var(--accent);">Order #${ord.id}</h3>
                        <p style="color:var(--theme-text-muted); margin-bottom:1rem;">Placed on: ${ord.date}</p>
                        ${ord.items.map(p => `
                            <div style="display:flex; gap:1rem; margin-bottom:1rem; align-items:center;">
                                <img src="${p.image}" style="width:60px; height:60px; border-radius:8px;">
                                <div>
                                    <div style="font-weight:500;">${p.title}</div>
                                    <div style="color:var(--accent);">₹${p.price.toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="width:250px; background:var(--theme-bg); padding:1.5rem; border-radius:12px;">
                        <div style="margin-bottom:0.8rem; font-size:1.1rem;"><strong>Total Paid:</strong> ₹${ord.total.toFixed(2)}</div>
                        <div style="margin-bottom:0.8rem; color:var(--theme-text-muted);"><strong>Method:</strong> ${ord.method}</div>
                        <div><strong>Delivered to:</strong><p style="font-size:0.9rem; margin-top:0.3rem; line-height:1.4;">${ord.address}</p></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    content.innerHTML = html;
    container.appendChild(nav); container.appendChild(content); return container;
}

function handleLogout() {
    state.user = null;
    state.cart = [];
    switchView('auth');
}

function getNavbarHTML() {
    let nameToDisplay = state.user ? (state.user.name || (state.user.email ? state.user.email.split('@')[0] : 'User')) : '';
    const userMenu = state.user ? `
        <div class="user-menu" tabindex="0">
            <span class="user-greeting">Hi, ${nameToDisplay} ▼</span>
            <div class="user-dropdown">
                <a onclick="switchView('orders')">My Orders</a>
                <a onclick="switchView('profile')">My Profile</a>
                <a onclick="handleLogout()">Logout</a>
            </div>
        </div>
    ` : `<a onclick="switchView('auth')" style="font-weight: 600; cursor: pointer;">Login</a>`;
    
    return `
        <div class="nav-brand" style="cursor:pointer;" onclick="state.activeCategory='All'; state.searchQuery=''; switchView('shop')">KANNAN</div>
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Search for dresses..." oninput="handleSearch(this.value)" value="${state.searchQuery}">
        </div>
        <div class="nav-links">
            ${CATEGORIES.slice(1).map(c => `<a onclick="setCategoryFilter('${c}')">${c}</a>`).join('')}
            <div class="nav-actions">
                ${userMenu}
                <div class="cart-icon" onclick="toggleCartModal()">
                    🛒 <span class="cart-count">${state.cart.length}</span>
                </div>
            </div>
        </div>
    `;
}

function createAuthView() {
    const container = document.createElement('div');
    container.className = 'auth-container';
    
    const toggleText = state.isLoginMode ? "Don't have an account? <span>Sign up</span>" : "Already have an account? <span>Log in</span>";
    
    const isOTP = state.authStep === 'otp';
    let formHTML = '';

    if (isOTP) {
        formHTML = `
            <div class="form-group">
                <label>Enter OTP Code</label>
                <input type="text" id="otp" placeholder="We sent a code to your phone (Hint: 1234)" maxlength="4" autocomplete="one-time-code">
            </div>
            <div class="error-msg" id="form-error"></div>
            <button type="submit" class="btn-primary">Verify & Register</button>
        `;
    } else {
        if (state.isLoginMode) {
            formHTML = `
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="email" placeholder="hello@example.com" autocomplete="email">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="••••••••" autocomplete="current-password">
                </div>
                <div class="error-msg" id="form-error"></div>
                <button type="submit" class="btn-primary">Login</button>
            `;
        } else {
            formHTML = `
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="name" placeholder="John Doe" autocomplete="name">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="email" placeholder="hello@example.com" autocomplete="email">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="••••••••" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label>Phone Number (for Verification)</label>
                    <input type="tel" id="phone" placeholder="+1 234 567 8900" autocomplete="tel">
                </div>
                <div class="error-msg" id="form-error"></div>
                <button type="submit" class="btn-primary">Verify Phone & Register</button>
            `;
        }
    }
    
    container.innerHTML = `
        <div class="auth-card">
            <div class="auth-header">
                <h1>KANNAN</h1>
                <p>Premium Apparel</p>
            </div>
            
            <form class="auth-form" id="authForm">
                ${formHTML}
            </form>
            
            <div class="auth-actions">
                ${!isOTP ? `<div class="toggle-auth">${toggleText}</div>` : `<div class="toggle-auth"><span onclick="state.authStep='credentials'; renderApp();">← Change Details</span></div>`}
                <button class="skip-btn" onclick="switchView('shop')">Skip to Shop</button>
            </div>
        </div>
    `;

    // Event listeners
    container.querySelector('#authForm').addEventListener('submit', handleAuthSubmit);
    const toggleAuthBtn = container.querySelector('.toggle-auth span:not([onclick])');
    if(toggleAuthBtn) toggleAuthBtn.addEventListener('click', toggleAuthMode);

    return container;
}

function setCategoryFilter(cat) {
    state.activeCategory = cat;
    handleFilter();
}

function handleSearch(query) {
    state.searchQuery = query.toLowerCase();
    if(state.view !== 'shop') {
        switchView('shop');
        const input = document.getElementById('search-input');
        if(input) input.focus();
    } else {
        handleFilter();
    }
}

function handleFilter() {
    let filtered = PRODUCTS;
    if(state.activeCategory !== 'All') {
        filtered = filtered.filter(p => p.category === state.activeCategory);
    }
    if(state.searchQuery) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(state.searchQuery) || p.description.toLowerCase().includes(state.searchQuery) || p.material.toLowerCase().includes(state.searchQuery));
    }
    
    const titleHeader = document.getElementById('collection-title');
    if (titleHeader) {
        titleHeader.textContent = state.searchQuery ? `Search results for "${state.searchQuery}"` : (state.activeCategory === 'All' ? 'Our Collection' : state.activeCategory + ' Collection');
    }
    
    renderProducts(filtered);
}

function renderProducts(productsToRender) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => {
            state.activeProduct = product;
            switchView('product');
        };
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category} • ${product.material}</div>
                <div class="product-title">${product.title}</div>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
                <div class="product-rating">
                    <span class="star">★</span> ${product.rating} (${product.reviewsCount})
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

let carouselInterval = null;
function startCarousel() {
    let current = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if(!slides.length) return;
    
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }, 4000);
}

function createShopView() {
    const container = document.createElement('div');
    
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = getNavbarHTML();
    
    const hero = document.createElement('div');
    hero.className = 'carousel-container';
    hero.innerHTML = `
        <div class="carousel-slide active">
            <img src="assets/mens.png" alt="Trendy">
            <div class="carousel-content">
                <h2>Trendy Collection</h2>
                <p>Elevate your style with new arrivals across all categories</p>
            </div>
        </div>
        <div class="carousel-slide">
            <img src="assets/womens.png" alt="Sale">
            <div class="carousel-content">
                <h2>Mega Summer Sale</h2>
                <p>Up to 50% off on all Silk Dresses and Premium Wear</p>
            </div>
        </div>
        <div class="carousel-slide">
            <img src="assets/kids.png" alt="Kids">
            <div class="carousel-content">
                <h2>Everything Kids</h2>
                <p>Comfortable, trendy, and playful kids clothing</p>
            </div>
        </div>
        <div class="carousel-dots">
            <div class="dot active"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    
    const shopContainer = document.createElement('div');
    shopContainer.className = 'shop-container';
    shopContainer.innerHTML = `
        <h2 id="collection-title" style="margin-bottom:2rem;">Our Collection</h2>
        <div class="product-grid" id="product-grid"></div>
    `;
    
    container.appendChild(nav);
    container.appendChild(hero);
    container.appendChild(shopContainer);
    
    setTimeout(() => {
        handleFilter();
        startCarousel();
    }, 0);
    
    return container;
}

function checkDelivery() {
    const pin = document.getElementById('pincode').value;
    const res = document.getElementById('delivery-res');
    if(pin.length === 6 && !isNaN(pin)) {
        res.style.display = 'block';
        res.style.color = 'var(--success)';
        res.textContent = `Estimated Delivery: ${new Date(Date.now() + 86400000 * 3).toDateString()}`;
    } else {
        res.style.display = 'block';
        res.style.color = 'var(--error)';
        res.textContent = 'Please enter a valid 6-digit pincode';
    }
}

function createProductView() {
    const container = document.createElement('div');
    const p = state.activeProduct;
    if(!p) {
        setTimeout(() => switchView('shop'), 0);
        return container;
    }
    
    // Navbar
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = getNavbarHTML();
    
    const content = document.createElement('div');
    content.className = 'product-detail-container';
    
    // Review HTML
    const reviews = REVIEWS[p.id] || [];
    const reviewHTML = reviews.map(r => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-user">${r.user}</div>
                <div class="review-date"><span class="star">${'★'.repeat(r.rating)}</span> • ${r.date}</div>
            </div>
            <div class="review-text">${r.text}</div>
        </div>
    `).join('');
    
    // Suggestions
    let suggestions = PRODUCTS.filter(prod => prod.id !== p.id && (prod.category === p.category || prod.material === p.material)).slice(0, 3);
    if(suggestions.length === 0) suggestions = PRODUCTS.filter(prod => prod.id !== p.id).slice(0,3);

    let suggestionsHTML = `<div class="product-grid">`;
    suggestionsHTML += suggestions.map(prod => `
        <div class="product-card" onclick="state.activeProduct = PRODUCTS.find(x => x.id === ${prod.id}); switchView('product');">
            <div class="product-image"><img src="${prod.image}" alt=""></div>
            <div class="product-info">
                <div class="product-title">${prod.title}</div>
                <div class="product-price">₹${prod.price.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
    suggestionsHTML += `</div>`;
    
    content.innerHTML = `
        <button class="back-btn" onclick="switchView('shop')">← Back to Shop</button>
        <div class="product-main">
            <div class="detail-image">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="detail-info">
                <div class="product-category">${p.category}</div>
                <h1>${p.title}</h1>
                <div class="product-rating" style="margin-bottom: 1.5rem">
                    <span class="star">★</span> ${p.rating} (${p.reviewsCount} reviews)
                </div>
                <div class="price">₹${p.price.toFixed(2)}</div>
                <p class="desc">${p.description}</p>
                
                <div class="delivery-checker">
                    <h3>Check Delivery Availability</h3>
                    <div class="pincode-input">
                        <input type="text" id="pincode" placeholder="Enter 6-digit pincode" maxlength="6">
                        <button class="btn-primary" style="margin:0; padding: 0.8rem 1.5rem;" onclick="checkDelivery()">Check</button>
                    </div>
                    <div id="delivery-res" class="delivery-result"></div>
                </div>
                
                <div class="action-buttons" style="display:flex; gap:1rem; margin-top:1rem;">
                    <button class="btn-primary" style="flex:1; padding: 1.2rem;" onclick="addToCart(state.activeProduct)">Add to Cart</button>
                    <button class="btn-primary" style="flex:1; padding: 1.2rem; background: var(--theme-text); color: var(--theme-surface);" onclick="buyNow(state.activeProduct)">Buy Now</button>
                </div>
            </div>
        </div>
        
        <div class="reviews-section">
            <h2 class="section-title">Customer Reviews</h2>
            ${reviewHTML || '<p>No reviews yet.</p>'}
        </div>
        
        <div class="suggestions-section">
            <h2 class="section-title">You Might Also Like</h2>
            ${suggestionsHTML}
        </div>
    `;
    
    container.appendChild(nav);
    container.appendChild(content);
    return container;
}

function createProfileView() {
    const container = document.createElement('div');
    const nav = document.createElement('nav'); nav.className = 'navbar'; nav.innerHTML = getNavbarHTML();
    
    const content = document.createElement('div');
    content.className = 'product-detail-container';
    content.style.maxWidth = '600px';
    content.style.margin = '4rem auto';
    
    if(!state.user) {
        content.innerHTML = `<button class="back-btn" onclick="switchView('shop')">← Back to Shop</button><p>Please log in to view your profile.</p>`;
        container.appendChild(nav); container.appendChild(content); return container;
    }
    
    content.innerHTML = `
        <button class="back-btn" onclick="switchView('shop')">← Back to Shop</button>
        <div style="background:var(--theme-surface); border:1px solid var(--glass-border); border-radius:16px; padding:3rem 2rem; text-align:center; position:relative; overflow:hidden;">
            <div style="width:100px; height:100px; border-radius:50%; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center; font-size:3rem; margin:0 auto 1.5rem auto; font-weight:bold;">
                ${(state.user.name || state.user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <h1 style="margin-bottom:0.5rem; font-size:2rem;">${state.user.name || 'Valued Customer'}</h1>
            <p style="color:var(--theme-text-muted); margin-bottom:2rem; font-size:1.1rem;">Customer Profile</p>
            
            <div style="display:flex; flex-direction:column; gap:1.5rem; text-align:left; background:var(--theme-bg); padding:2rem; border-radius:12px;">
                <div style="padding-bottom:1rem; border-bottom:1px solid var(--glass-border);">
                    <div style="font-size:0.85rem; color:var(--theme-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.4rem;">Email Address</div>
                    <div style="font-size:1.1rem; font-weight:500;">${state.user.email}</div>
                </div>
                ${state.user.phone ? `
                <div style="padding-bottom:1rem; border-bottom:1px solid var(--glass-border);">
                    <div style="font-size:0.85rem; color:var(--theme-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.4rem;">Phone Number</div>
                    <div style="font-size:1.1rem; font-weight:500;">${state.user.phone}</div>
                </div>
                ` : ''}
                <div>
                    <div style="font-size:0.85rem; color:var(--theme-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.4rem;">Orders Placed</div>
                    <div style="font-size:1.1rem; font-weight:500;">${state.orders.length} orders total</div>
                </div>
            </div>
            
            <button class="btn-primary" style="margin-top:2.5rem; width:100%; border-radius:12px; padding:1.2rem; background:var(--error);" onclick="handleLogout()">Log Out</button>
        </div>
    `;
    
    container.appendChild(nav); container.appendChild(content); return container;
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderApp();
});
