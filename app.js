/**
 * VK Mini App E-commerce Frontend
 * Pure Vanilla JavaScript implementation
 */

// Product Data
const products = [
    {
        id: 1,
        title: "Беспроводные наушники",
        price: 7999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
    },
    {
        id: 2,
        title: "Смарт-часы Pro",
        price: 19999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6a5e53?w=400&q=80"
    },
    {
        id: 3,
        title: "Винтажная камера",
        price: 45999,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80"
    },
    {
        id: 4,
        title: "Дизайнерские солнцезащитные очки",
        price: 12999,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80"
    },
    {
        id: 5,
        title: "Механическая клавиатура",
        price: 14999,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b91a607?w=400&q=80"
    },
    {
        id: 6,
        title: "Премиальный рюкзак",
        price: 8999,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
    }
];

// State Management
let cart = [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartTrigger = document.getElementById('cart-trigger');
const cartBadge = document.getElementById('cart-badge');
const cartModal = document.getElementById('cart-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalPanel = document.getElementById('modal-panel');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotal = document.getElementById('cart-total');
const closeModalBtn = document.getElementById('close-modal-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const closeCartBtn = document.getElementById('close-cart');

/**
 * Форматирование цены в рубли
 */
function formatPrice(rubles) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(rubles);
}

/**
 * Renders the product catalog to the grid
 * Uses document.createElement() for clean DOM manipulation
 */
function renderProducts() {
    // Clear existing products
    productGrid.innerHTML = '';

    products.forEach(product => {
        // Create card container
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group';

        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'relative h-48 overflow-hidden';

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.title;
        img.className = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110';

        imageContainer.appendChild(img);

        // Card content
        const content = document.createElement('div');
        content.className = 'p-5';

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-white mb-2 truncate';
        title.textContent = product.title;

        const price = document.createElement('p');
        price.className = 'text-green-400 text-xl font-bold mb-4';
        price.textContent = formatPrice(product.price);

        // Quantity counter container (initially hidden)
        const counterContainer = document.createElement('div');
        counterContainer.className = 'hidden flex items-center justify-center gap-2 bg-gray-700 rounded-xl p-2';
        counterContainer.id = `counter-${product.id}`;

        const minusBtn = document.createElement('button');
        minusBtn.className = 'w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
        minusBtn.innerHTML = '&minus;';
        minusBtn.onclick = () => updateQuantity(product.id, product.quantity - 1);

        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'text-white font-semibold w-6 text-center text-lg';
        quantitySpan.textContent = '0';

        const plusBtn = document.createElement('button');
        plusBtn.className = 'w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors';
        plusBtn.innerHTML = '+';
        plusBtn.onclick = () => updateQuantity(product.id, product.quantity + 1);

        counterContainer.appendChild(minusBtn);
        counterContainer.appendChild(quantitySpan);
        counterContainer.appendChild(plusBtn);

        // Add to cart button (initially visible)
        const addButton = document.createElement('button');
        addButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2';
        addButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            В корзину
        `;
        addButton.id = `add-btn-${product.id}`;
        addButton.onclick = () => addToCart(product);

        content.appendChild(title);
        content.appendChild(price);
        content.appendChild(counterContainer);
        content.appendChild(addButton);

        card.appendChild(imageContainer);
        card.appendChild(content);
        productGrid.appendChild(card);
    });
}

/**
 * Adds a product to the cart
 * @param {Object} product - Product object to add
 */
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCounterUI(product.id, 1);
    updateCartUI();
    openCart();
}

/**
 * Updates the quantity UI for a product button
 */
function updateCounterUI(productId, newQuantity) {
    const counterContainer = document.getElementById(`counter-${productId}`);
    const addButton = document.getElementById(`add-btn-${productId}`);
    const quantitySpan = counterContainer.querySelector('span');
    const minusBtn = counterContainer.querySelector('button:first-of-type');

    if (newQuantity > 0) {
        // Show counter, hide button
        counterContainer.classList.remove('hidden');
        addButton.classList.add('hidden');
        quantitySpan.textContent = newQuantity;
        minusBtn.disabled = newQuantity <= 1;
    } else {
        // Hide counter, show button
        counterContainer.classList.add('hidden');
        addButton.classList.remove('hidden');
        quantitySpan.textContent = '0';
    }
}

/**
 * Updates the cart badge and total
 */
function updateCartUI() {
    // Calculate total items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update badge
    cartBadge.textContent = totalItems;
    cartBadge.classList.remove('opacity-0');
    if (totalItems === 0) {
        cartBadge.classList.add('opacity-0');
    }

    // Calculate total price
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(totalPrice);

    // Enable/disable checkout button
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Корзина пуста';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Оформить заказ';
    }
}

/**
 * Renders cart items in the modal
 */
function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center py-12 text-gray-400';
        emptyState.innerHTML = `
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <p>Корзина пуста</p>
        `;
        cartItemsContainer.appendChild(emptyState);
        return;
    }

    cart.forEach(product => {
        // Item container
        const itemContainer = document.createElement('div');
        itemContainer.className = 'flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl mb-3';

        // Product image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0';

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.title;
        img.className = 'w-full h-full object-cover';

        imgContainer.appendChild(img);

        // Product details
        const details = document.createElement('div');
        details.className = 'flex-1 min-w-0';

        const name = document.createElement('p');
        name.className = 'text-white font-medium truncate mb-1';
        name.textContent = product.title;

        const price = document.createElement('p');
        price.className = 'text-green-400 font-semibold';
        price.textContent = formatPrice(product.price);

        details.appendChild(name);
        details.appendChild(price);

        // Quantity controls
        const quantityContainer = document.createElement('div');
        quantityContainer.className = 'flex items-center gap-2 bg-gray-600 rounded-lg px-3 py-1';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'text-gray-300 hover:text-white transition-colors disabled:opacity-50';
        minusBtn.disabled = product.quantity <= 1;
        minusBtn.innerHTML = '&minus;';
        minusBtn.onclick = () => updateQuantity(product.id, product.quantity - 1);

        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'text-white font-semibold w-6 text-center';
        quantitySpan.textContent = product.quantity;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'text-gray-300 hover:text-white transition-colors';
        plusBtn.innerHTML = '+';
        plusBtn.onclick = () => updateQuantity(product.id, product.quantity + 1);

        quantityContainer.appendChild(minusBtn);
        quantityContainer.appendChild(quantitySpan);
        quantityContainer.appendChild(plusBtn);

        // Item total
        const itemTotal = document.createElement('div');
        itemTotal.className = 'text-right';

        const itemTotalLabel = document.createElement('p');
        itemTotalLabel.className = 'text-xs text-gray-400';
        itemTotalLabel.textContent = 'Итого';

        const itemTotalPrice = document.createElement('p');
        itemTotalPrice.className = 'text-white font-bold';
        itemTotalPrice.textContent = formatPrice(product.price * product.quantity);

        itemTotal.appendChild(itemTotalLabel);
        itemTotal.appendChild(itemTotalPrice);

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-red-400 hover:text-red-300 transition-colors p-2';
        removeBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        `;
        removeBtn.title = 'Удалить товар';
        removeBtn.onclick = () => removeFromCart(product.id);

        // Assemble item
        details.appendChild(quantityContainer);
        itemContainer.appendChild(imgContainer);
        itemContainer.appendChild(details);
        itemContainer.appendChild(itemTotal);
        itemContainer.appendChild(removeBtn);

        cartItemsContainer.appendChild(itemContainer);
    });
}

/**
 * Updates the quantity of a product in cart
 * @param {number} productId - ID of the product
 * @param {number} newQuantity - New quantity value
 */
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;

        // Update product counter UI on card
        updateCounterUI(productId, newQuantity);

        // Remove item if quantity is 0
        if (item.quantity === 0) {
            removeFromCart(productId);
            return;
        }
    }

    renderCartItems();
    updateCartUI();
}

/**
 * Removes a product from the cart
 * @param {number} productId - ID of the product to remove
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    // Reset counter UI for removed product
    updateCounterUI(productId, 0);

    renderCartItems();
    updateCartUI();
}

/**
 * Opens the shopping cart modal
 */
function openCart() {
    cartModal.classList.remove('hidden');
    setTimeout(() => {
        modalBackdrop.classList.add('opacity-100');
        modalPanel.classList.add('scale-100', 'opacity-100');
        modalPanel.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

/**
 * Closes the shopping cart modal
 */
function closeCart() {
    modalBackdrop.classList.remove('opacity-100');
    modalPanel.classList.remove('scale-100', 'opacity-100');
    modalPanel.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        cartModal.classList.add('hidden');
    }, 200);
}

/**
 * Initializes the application
 */
function init() {
    // Render products
    renderProducts();

    // Cart trigger
    cartTrigger.addEventListener('click', openCart);

    // Close modal buttons
    closeModalBtn.addEventListener('click', closeCart);
    closeCartBtn.addEventListener('click', closeCart);
    closeCartBtn.addEventListener('click', () => {
        closeModalBtn.click();
    });

    // Close on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeCart();
        }
    });

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Show success message
        alert(`Спасибо за покупку! Итого: ${formatPrice(totalPrice)}\n\nВаш заказ оформлен и будет обработан в ближайшее время.`);

        // Clear cart
        cart = [];
        renderCartItems();
        updateCartUI();

        // Reset all counter UIs
        products.forEach(p => updateCounterUI(p.id, 0));

        closeCart();
    });

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !cartModal.classList.contains('hidden')) {
            closeCart();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
