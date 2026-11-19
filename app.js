// VK Mini App Shop - Application Logic

const products = [
    { id: 1, name: "Наушники VK Edition", description: "Беспроводные наушники с шумоподавлением", price: 5990, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80", badge: "Хит" },
    { id: 2, name: "Кофемашина Mini", description: "Компактная кофемашина для дома и офиса", price: 12990, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80", badge: "New" },
    { id: 3, name: "Смарт-часы Pro", description: "Мониторинг здоровья, пульс, СО2", price: 18990, image: "https://images.unsplash.com/photo-1523275335684-37898b6a4f23?w=400&auto=format&fit=crop&q=80", badge: "Скидка 10%" },
    { id: 4, name: "Фотоаппарат Instant", description: "Мгновенные фотографии в стиле ретро", price: 15990, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80", badge: "Best" },
    { id: 5, name: "Рюкзак Urban", description: "Водонепроницаемый рюкзак с USB", price: 3490, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80", badge: "" },
    { id: 6, name: "Фитнес-браслет", description: "14-дневный срок работы, 5 ATM", price: 2490, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&auto=format&fit=crop&q=80", badge: "" }
];

let cart = [];

let productGrid = document.getElementById('productGrid');
let cartButton = document.getElementById('cartButton');
let cartPanel = document.getElementById('cartPanel');
let cartCount = document.getElementById('cartCount');
let cartCountPanel = document.getElementById('cartCountPanel');
let totalPrice = document.getElementById('totalPrice');
let checkoutButton = document.getElementById('checkoutButton');
let checkoutAmount = document.getElementById('checkoutAmount');
let emptyCartButton = document.getElementById('emptyCartButton');
let toastContainer = document.getElementById('toastContainer');

function showToast(message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icon = type === 'error' ? 'fa-circle-xmark' : (type === 'info' ? 'fa-info-circle' : 'fa-check-circle');
    toast.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + message + '</span>';
    toastContainer.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

function getBadgeColor(badge) {
    const colors = { 'Хит': '#F59E0B', 'New': '#3B82F6', 'Скидка 10%': '#10B981', 'Best': '#EF4444' };
    return colors[badge] || '#3B82F6';
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);

    const badge = product.badge ? '<div class="product-badge" style="background:' + getBadgeColor(product.badge) + '">' + product.badge + '</div>' : '';

    card.innerHTML =
        '<div class="product-image-container">' +
            '<img src="' + product.image + '" alt="' + product.name + '" class="product-image" loading="lazy">' +
            badge +
        '</div>' +
        '<div class="product-info">' +
            '<h3 class="product-title">' + product.name + '</h3>' +
            '<p class="product-description">' + product.description + '</p>' +
            '<div class="product-footer">' +
                '<div class="product-price">' + product.price.toLocaleString('ru-RU') + ' ₽</div>' +
                '<div class="product-actions">' +
                    '<button class="btn-add" data-id="' + product.id + '"><i class="fa-solid fa-plus"></i> В корзину</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    return card;
}

function renderProducts() {
    console.log('renderProducts: ' + products.length + ' товаров');

    if (!productGrid) {
        console.error('productGrid не найден');
        return;
    }

    productGrid.innerHTML = '';

    if (products.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    products.forEach(function(product) {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });

    console.log('renderProducts: DONE');
}

function addToCart(productId) {
    const product = products.find(function(p) { return p.id === productId; });
    if (!product) return;

    const existing = cart.find(function(i) { return i.id === productId; });
    if (existing) {
        existing.quantity++;
        showToast('Количество обновлено', 'info');
    } else {
        cart.push({ ...product, quantity: 1 });
        showToast('Товар добавлен в корзину');
    }

    updateCartUI();
    saveCart();
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

function updateCartUI() {
    const totalQty = cart.reduce(function(s, i) { return s + i.quantity; }, 0);
    const totalPriceVal = cart.reduce(function(s, i) { return s + i.price * i.quantity; }, 0);

    if (cartCount) cartCount.textContent = totalQty;
    if (cartCountPanel) cartCountPanel.textContent = totalQty;

    if (totalQty > 0) {
        if (cartCount) cartCount.classList.remove('opacity-0');
        if (cartPanel) { cartPanel.classList.remove('translate-y-full'); cartPanel.classList.add('translate-y-0'); }
        if (checkoutButton) { checkoutButton.classList.remove('hidden'); if (checkoutAmount) checkoutAmount.textContent = totalPriceVal.toLocaleString('ru-RU'); }
        if (emptyCartButton) emptyCartButton.classList.remove('hidden');
    } else {
        if (cartCount) cartCount.classList.add('opacity-0');
        if (cartPanel) { cartPanel.classList.remove('translate-y-0'); cartPanel.classList.add('translate-y-full'); }
        if (checkoutButton) checkoutButton.classList.add('hidden');
        if (emptyCartButton) emptyCartButton.classList.add('hidden');
    }

    if (totalPrice) totalPrice.textContent = totalPriceVal.toLocaleString('ru-RU');

    document.querySelectorAll('.btn-add').forEach(function(btn) {
        const pid = parseInt(btn.getAttribute('data-id'));
        const inCart = cart.find(function(i) { return i.id === pid; });
        if (inCart) { btn.innerHTML = '<i class="fa-solid fa-check"></i> В корзине'; btn.style.background = '#10B981'; }
        else { btn.innerHTML = '<i class="fa-solid fa-plus"></i> В корзину'; btn.style.background = '#2680EB'; }
    });
}

function checkout() {
    if (cart.length === 0) { showToast('Корзина пуста', 'error'); return; }
    const orderTotal = cart.reduce(function(s, i) { return s + i.price * i.quantity; }, 0);
    const items = cart.map(function(i) { return '• ' + i.name + ' x' + i.quantity + ' - ' + i.price.toLocaleString('ru-RU') + ' ₽'; }).join('\n');
    const msg = '🚀 Новый заказ!\n\nТоваров: ' + cart.reduce(function(s, i) { return s + i.quantity; }, 0) + '\nСумма: ' + orderTotal.toLocaleString('ru-RU') + ' ₽\n\nЗаказ:\n' + items + '\n\n⭐ Спасибо!';

    if (window.vkBridge) {
        vkBridge.send('VKWebAppShowWallPostBox', { message: msg, attachments: 'photo208472431_456239032' }, function(data) {
            if (data.result) { showToast('Заказ отправлен!', 'success'); cart = []; updateCartUI(); }
            else handleFallbackOrder(msg);
        });
    } else { handleFallbackOrder(msg); }
}

function handleFallbackOrder(msg) {
    const params = getVKParams();
    if (params && params.viewer_id) {
        setTimeout(function() { showToast('Заказ оформлен!', 'success'); cart = []; updateCartUI(); }, 1500);
    } else { console.log('ORDER:\n' + msg); showToast('Проверьте консоль', 'info'); }
}

function getVKParams() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const result = {};
    for (const [k, v] of params) result[k] = v;
    return result;
}

function saveCart() {
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) { console.error('Save error:', e); }
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Очистить корзину?')) { cart = []; updateCartUI(); saveCart(); showToast('Корзина очищена', 'info'); }
}

function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        if (saved) { cart = JSON.parse(saved); updateCartUI(); }
    } catch (e) { console.error('Load error:', e); }
}

function init() {
    console.log('INIT start');

    productGrid = document.getElementById('productGrid');
    cartButton = document.getElementById('cartButton');
    cartPanel = document.getElementById('cartPanel');
    cartCount = document.getElementById('cartCount');
    cartCountPanel = document.getElementById('cartCountPanel');
    totalPrice = document.getElementById('totalPrice');
    checkoutButton = document.getElementById('checkoutButton');
    checkoutAmount = document.getElementById('checkoutAmount');
    emptyCartButton = document.getElementById('emptyCartButton');
    toastContainer = document.getElementById('toastContainer');

    console.log('DOM loaded:', { productGrid: !!productGrid, cartButton: !!cartButton, cartPanel: !!cartPanel });

    if (!productGrid) { console.error('productGrid NOT FOUND'); return; }

    loadCart();
    renderProducts();

    if (window.vkBridge) {
        vkBridge.send('VKWebAppInit');
        console.log('VK Bridge init');
    }

    if (cartButton) {
        cartButton.addEventListener('click', function() {
            if (cart.length > 0) { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }
        });
    }
    if (checkoutButton) checkoutButton.addEventListener('click', checkout);
    if (emptyCartButton) emptyCartButton.addEventListener('click', clearCart);

    if (window.vkBridge) {
        vkBridge.subscribe(function(e) {
            if (e.detail && e.detail.type === 'VKWebAppUpdateConfig' && e.detail.data.palette.text_primary) {
                document.documentElement.style.setProperty('--vk-blue', e.detail.data.palette.text_primary);
            }
        });
    }

    console.log('INIT complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
