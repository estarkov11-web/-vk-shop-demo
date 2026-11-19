// VK Mini App Shop - Application Logic

const products = [
    { id: 1, name: "Наушники VK Edition", description: "Беспроводные наушники", price: 5990, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80", badge: "Хит" },
    { id: 2, name: "Кофемашина Mini", description: "Кофемашина для дома", price: 12990, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80", badge: "New" },
    { id: 3, name: "Смарт-часы Pro", description: "Мониторинг здоровья", price: 18990, image: "https://images.unsplash.com/photo-1523275335684-37898b6a4f23?w=400&auto=format&fit=crop&q=80", badge: "Скидка 10%" },
    { id: 4, name: "Фотоаппарат Instant", description: "Мгновенные фото", price: 15990, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80", badge: "Best" },
    { id: 5, name: "Рюкзак Urban", description: "Водонепроницаемый", price: 3490, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80", badge: "" },
    { id: 6, name: "Фитнес-браслет", description: "14-дней работы", price: 2490, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&auto=format&fit=crop&q=80", badge: "" }
];

let cart = [];
let productGrid, cartButton, cartFloatingButton, cartCount, cartCountFloating, cartModalOverlay, cartModal, cartItemsList, checkoutButton, emptyCartButton, continueShoppingButton, closeCartModal, toastContainer;

function showToast(message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-check-circle';
    toast.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + message + '</span>';
    toastContainer.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

function getBadgeColor(badge) {
    const colors = { 'Хит': '#F59E0B', 'New': '#3B82F6', 'Скидка 10%': '#10B981', 'Best': '#EF4444' };
    return colors[badge] || '#3B82F6';
}

function createProductCard(product) {
    const badge = product.badge ? '<div class="product-badge" style="background:' + getBadgeColor(product.badge) + '">' + product.badge + '</div>' : '';
    return '<div class="product-card" data-id="' + product.id + '">' +
        '<div class="product-image-container"><img src="' + product.image + '" alt="' + product.name + '" class="product-image"></div>' +
        '<div class="product-info">' +
            '<h3 class="product-title">' + product.name + '</h3>' +
            '<p class="product-description">' + product.description + '</p>' +
            '<div class="product-footer">' +
                '<div class="product-price">' + product.price.toLocaleString('ru-RU') + ' ₽</div>' +
                '<button class="btn-add" data-id="' + product.id + '">В корзину</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function renderProducts() {
    console.log('renderProducts called');
    productGrid.innerHTML = '';
    productGrid.innerHTML = products.map(function(p) { return createProductCard(p); }).join('');

    // Привязываем обработчики к кнопкам после рендера
    document.querySelectorAll('.btn-add').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });

    console.log('renderProducts done');
}

function updateCartUI() {
    const totalQty = cart.reduce(function(s, i) { return s + i.quantity; }, 0);

    if (cartCount) {
        cartCount.textContent = totalQty;
        if (totalQty > 0) cartCount.classList.remove('opacity-0');
        else cartCount.classList.add('opacity-0');
    }

    if (cartCountFloating) {
        cartCountFloating.textContent = totalQty;
        if (totalQty > 0) cartCountFloating.parentElement.classList.remove('opacity-0');
        else cartCountFloating.parentElement.classList.add('opacity-0');
    }
}

function openCartModal() {
    console.log('openCartModal');
    if (!cartModalOverlay || !cartModal) return;
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<div class="text-center text-gray-500 py-8"><p>Корзина пуста</p></div>';
    } else {
        cartItemsList.innerHTML = cart.map(function(item) {
            return '<div class="flex gap-3 items-center"><h4>' + item.name + '</h4><span>' + item.quantity + 'x</span><span>' + (item.price * item.quantity) + '₽</span></div>';
        }).join('');
    }
    cartModalOverlay.classList.remove('opacity-0', 'pointer-events-none');
    cartModal.classList.remove('translate-y-full');
}

function closeCartModal() {
    console.log('closeCartModal');
    if (!cartModalOverlay || !cartModal) return;
    cartModalOverlay.classList.add('opacity-0', 'pointer-events-none');
    cartModal.classList.add('translate-y-full');
}

function addToCart(productId) {
    console.log('addToCart', productId);
    const product = products.find(function(p) { return p.id === productId; });
    if (!product) return;
    const existing = cart.find(function(i) { return i.id === productId; });
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    showToast('Товар добавлен');
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(function(i) { return i.id !== productId; });
    updateCartUI();
}

function changeQuantity(productId, delta) {
    const item = cart.find(function(i) { return i.id === productId; });
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(productId);
    else updateCartUI();
}

function checkout() {
    if (cart.length === 0) { showToast('Корзина пуста', 'error'); return; }
    alert('Заказ: ' + cart.reduce(function(s, i) { return s + i.quantity; }, 0) + ' товаров');
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Очистить?')) { cart = []; updateCartUI(); }
}

function init() {
    console.log('INIT start');
    productGrid = document.getElementById('productGrid');
    cartButton = document.getElementById('cartButton');
    cartFloatingButton = document.getElementById('cartFloatingButton');
    cartCount = document.getElementById('cartCount');
    cartCountFloating = document.getElementById('cartCountFloating');
    cartModalOverlay = document.getElementById('cartModalOverlay');
    cartModal = document.getElementById('cartModal');
    cartItemsList = document.getElementById('cartItemsList');
    checkoutButton = document.getElementById('checkoutButton');
    emptyCartButton = document.getElementById('emptyCartButton');
    continueShoppingButton = document.getElementById('continueShoppingButton');
    closeCartModal = document.getElementById('closeCartModal');
    toastContainer = document.getElementById('toastContainer');

    console.log('DOM ready');
    console.log('productGrid:', productGrid);
    console.log('cartButton:', cartButton);

    renderProducts();

    if (cartButton) {
        cartButton.addEventListener('click', function(e) {
            e.stopPropagation();
            openCartModal();
        });
    }

    if (cartFloatingButton) {
        cartFloatingButton.addEventListener('click', function(e) {
            e.stopPropagation();
            openCartModal();
        });
    }

    if (closeCartModal) closeCartModal.addEventListener('click', closeCartModal);
    if (cartModalOverlay) cartModalOverlay.addEventListener('click', function(e) { if (e.target === cartModalOverlay) closeCartModal(); });
    if (continueShoppingButton) continueShoppingButton.addEventListener('click', closeCartModal);

    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeCartModal(); });

    console.log('INIT done');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
