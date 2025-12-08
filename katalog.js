// Proizvodi podaci
const products = [
    // Pivo
    { id: 1, name: 'Jelen Pivo', price: 120, category: 'pivo', image: 'img/absolut-vodka.png' },
    { id: 2, name: 'Lav Pivo', price: 130, category: 'pivo', image: 'img/absolut-vodka.png' },
    { id: 3, name: 'Zajecarsko Pivo', price: 110, category: 'pivo', image: 'img/absolut-vodka.png' },
    
    // Viski
    { id: 4, name: 'Jack Daniels', price: 3500, category: 'viski', image: 'img/absolut-vodka.png' },
    { id: 5, name: 'Johnnie Walker', price: 4200, category: 'viski', image: 'img/absolut-vodka.png' },
    { id: 6, name: 'Jameson', price: 3800, category: 'viski', image: 'img/absolut-vodka.png' },
    
    // Vodka
    { id: 7, name: 'Absolut Vodka', price: 1799, category: 'vodka', image: 'img/absolut-vodka.png' },
    { id: 8, name: 'Smirnoff', price: 1600, category: 'vodka', image: 'img/absolut-vodka.png' },
    { id: 9, name: 'Belvedere', price: 4500, category: 'vodka', image: 'img/absolut-vodka.png' },
    
    // Vino
    { id: 10, name: 'Crno Vino', price: 800, category: 'vino', image: 'img/absolut-vodka.png' },
    { id: 11, name: 'Belo Vino', price: 750, category: 'vino', image: 'img/absolut-vodka.png' },
    { id: 12, name: 'Rose Vino', price: 850, category: 'vino', image: 'img/absolut-vodka.png' },
    
    // Sokovi
    { id: 13, name: 'Coca Cola', price: 150, category: 'sokovi', image: 'img/absolut-vodka.png' },
    { id: 14, name: 'Fanta', price: 150, category: 'sokovi', image: 'img/absolut-vodka.png' },
    { id: 15, name: 'Sprite', price: 150, category: 'sokovi', image: 'img/absolut-vodka.png' },
];

// Korpa
let cart = [];
let selectedCategory = null; // Single select - samo jedna kategorija
let currentPriceMax = 10000;
let currentSort = 'name-asc';

function openCartOverlay() {
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Inicijalizacija
document.addEventListener('DOMContentLoaded', function() {
    // Osiguraj da samo "Sve" bude aktivno na početku
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Proveri da li postoji query parametar za dodavanje u korpu
    const urlParams = new URLSearchParams(window.location.search);
    let shouldUpdateUrl = false;
    const addToCartId = urlParams.get('addToCart');
    if (addToCartId) {
        // Dodaj proizvod u korpu
        const productId = parseInt(addToCartId);
        if (!isNaN(productId)) {
            addToCart(productId);
            // Otvori korpu modal
            setTimeout(() => {
                openCartOverlay();
            }, 100);
        }
        urlParams.delete('addToCart');
        shouldUpdateUrl = true;
    }

    const openCartParam = urlParams.get('openCart');
    if (openCartParam === 'true') {
        setTimeout(() => {
            openCartOverlay();
        }, 0);
        urlParams.delete('openCart');
        shouldUpdateUrl = true;
    }

    if (shouldUpdateUrl) {
        const newQuery = urlParams.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    renderProducts();
    setupFilters();
    setupCart();
});

// Renderovanje proizvoda
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filtered = filterProducts();
    filtered = sortProducts(filtered);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: var(--spacing-xxl);">Nema proizvoda koji odgovaraju filterima.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(product => `
        <div class="katalog-product" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="katalog-product__image">
            <div class="katalog-product__info">
                <span class="katalog-product__category">${product.category}</span>
                <h3 class="katalog-product__name">${product.name}</h3>
                <p class="katalog-product__price">RSD${product.price}</p>
                <button class="katalog-product__add-btn" onclick="addToCart(${product.id})">
                    Dodajte u korpu
                </button>
            </div>
        </div>
    `).join('');
}

// Filter proizvoda
function filterProducts() {
    return products.filter(product => {
        const matchCategory = selectedCategory === null || product.category === selectedCategory;
        const matchPrice = product.price <= currentPriceMax;
        return matchCategory && matchPrice;
    });
}

// Sortiranje proizvoda
function sortProducts(products) {
    const sorted = [...products];
    switch(currentSort) {
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        default:
            return sorted;
    }
}

// Setup filteri
function setupFilters() {
    // Kategorije - single select
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Ako je kliknuto "Sve"
            if (category === 'all') {
                selectedCategory = null;
                // Resetuj sve kategorije
                filterButtons.forEach(b => {
                    if (b.dataset.category === 'all') {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
            } else {
                // Single select - samo jedna kategorija
                selectedCategory = category;
                
                // Ukloni "Sve" i postavi aktivnu kategoriju
                filterButtons.forEach(b => {
                    if (b.dataset.category === 'all') {
                        b.classList.remove('active');
                    } else if (b.dataset.category === category) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
            }
            
            renderProducts();
        });
    });
    
    // Cena
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            currentPriceMax = parseInt(this.value);
            priceValue.textContent = currentPriceMax;
            renderProducts();
        });
    }
    
    // Sortiranje
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            renderProducts();
        });
    }
}

// Dodavanje u korpu
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showCartNotification();
}

// Uklanjanje iz korpe
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Ažuriranje količine
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
    }
}

// Update korpe
function updateCart() {
    updateCartIcon();
    renderCart();
    saveCart();
}

// Update korpa ikonica
function updateCartIcon() {
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartIcon || !cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
}

// Render korpa
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFormWrapper = document.getElementById('cartFormWrapper');
    
    if (!cartItems || !cartEmpty || !cartFormWrapper) return;
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.innerHTML = '';
        cartFormWrapper.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartFormWrapper.style.display = 'block';
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item__image">
            <div class="cart-item__info">
                <h3 class="cart-item__name">${item.name}</h3>
                <p class="cart-item__price">RSD${item.price}</p>
                <div class="cart-item__quantity">
                    <button class="cart-item__quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-item__quantity-value">${item.quantity}</span>
                    <button class="cart-item__quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item__remove" onclick="removeFromCart(${item.id})" title="Ukloni">×</button>
        </div>
    `).join('');
    
    // Update totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 150;
    const total = subtotal + deliveryFee;
    
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDelivery = document.getElementById('cartDelivery');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartSubtotal) {
        cartSubtotal.textContent = subtotal + ' RSD';
    }
    if (cartDelivery) {
        cartDelivery.textContent = deliveryFee + ' RSD';
    }
    if (cartTotal) {
        cartTotal.textContent = total + ' RSD';
    }
}

// Setup korpa
function setupCart() {
    loadCart();
    updateCart();
    
    const cartIcon = document.getElementById('cartIcon');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    const orderBtn = document.getElementById('orderBtn');
    
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            if (cartOverlay) {
                cartOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            if (cartOverlay) {
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function(e) {
            if (e.target === cartOverlay) {
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            handleOrder();
        });
    }
    
    // Uklanjanje grešaka kada korisnik počne da unosi podatke
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const addressInput = document.getElementById('customerAddress');
    const agreementInput = document.getElementById('cartAgreement');
    
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            this.classList.remove('error');
            document.getElementById('errorName').textContent = '';
        });
    }
    
    if (phoneInput) {
        // Blokiranje unosa slova - samo brojevi
        phoneInput.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
        
        // Uklanjanje greške kada korisnik unosi
        phoneInput.addEventListener('input', function() {
            // Ukloni sve karaktere koji nisu brojevi
            this.value = this.value.replace(/[^0-9]/g, '');
            this.classList.remove('error');
            document.getElementById('errorPhone').textContent = '';
        });
    }
    
    if (addressInput) {
        addressInput.addEventListener('input', function() {
            this.classList.remove('error');
            document.getElementById('errorAddress').textContent = '';
        });
    }
    
    if (agreementInput) {
        agreementInput.addEventListener('change', function() {
            this.classList.remove('error');
            this.closest('.cart-form__checkbox-label').classList.remove('error');
        });
    }
}

// Floating korpa setup (bez drag & drop)
function setupFloatingCart() {
    // Funkcionalnost je uklonjena - korpa je fiksna
}

// Notifikacija
function showCartNotification() {
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = '';
        }, 300);
    }
}

// Poručivanje
function handleOrder() {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const addressInput = document.getElementById('customerAddress');
    const agreementInput = document.getElementById('cartAgreement');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const agreement = agreementInput.checked;
    
    // Reset error stanja
    clearErrors();
    
    let hasErrors = false;
    
    // Validacija imena
    if (!name) {
        showError('errorName', 'Niste popunili polje');
        nameInput.classList.add('error');
        hasErrors = true;
    }
    
    // Validacija telefona
    if (!phone) {
        showError('errorPhone', 'Niste popunili polje');
        phoneInput.classList.add('error');
        hasErrors = true;
    }
    
    // Validacija adrese
    if (!address) {
        showError('errorAddress', 'Niste popunili polje');
        addressInput.classList.add('error');
        hasErrors = true;
    }
    
    // Validacija checkbox-a
    if (!agreement) {
        agreementInput.classList.add('error');
        agreementInput.closest('.cart-form__checkbox-label').classList.add('error');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    if (cart.length === 0) {
        alert('Korpa je prazna.');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 150;
    const total = subtotal + deliveryFee;
    
    // Sačuvaj podatke porudžbine za stranicu zahvalnosti
    const orderData = {
        name,
        phone,
        address,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            lineTotal: item.price * item.quantity
        })),
        subtotal,
        deliveryFee,
        total,
        createdAt: new Date().toISOString()
    };
    
    try {
        sessionStorage.setItem('alcogo_last_order', JSON.stringify(orderData));
    } catch (e) {
        console.warn('Ne mogu da sačuvam order u sessionStorage', e);
    }
    
    // Reset korpe
    cart = [];
    updateCart();
    saveCart();
    
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
    clearErrors();
    
    // Prelazak na stranicu zahvalnosti
    window.location.href = 'hvala.html';
}

// Prikaz greške
function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Uklanjanje grešaka
function clearErrors() {
    const errorElements = document.querySelectorAll('.cart-form__error');
    errorElements.forEach(el => {
        el.textContent = '';
    });
    
    const inputElements = document.querySelectorAll('.cart-form__input');
    inputElements.forEach(el => {
        el.classList.remove('error');
    });
    
    const checkbox = document.getElementById('cartAgreement');
    if (checkbox) {
        checkbox.classList.remove('error');
        const checkboxLabel = checkbox.closest('.cart-form__checkbox-label');
        if (checkboxLabel) {
            checkboxLabel.classList.remove('error');
        }
    }
}

// LocalStorage
function saveCart() {
    localStorage.setItem('alcogo_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('alcogo_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

