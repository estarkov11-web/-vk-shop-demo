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

// DOM Elements
let productGrid = null;
let cartButton = null;
let cartFloatingButton = null;
let cartCount = null;
let cartCountFloating = null;
let cartModalOverlay = null;
let cartModal = null;
let cartItemsList = null;
let cartSummary = null;
let modalTotalQty = null;
let modalTotalPrice = null;
let checkoutButton = null;
let checkoutAmount = null;
let emptyCartButton = null;
let continueShoppingButton = null;
let closeCartModal = null;
let toastContainer = null;

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

    // Обработчик клика на кнопку "В корзину"
    const btn = card.querySelector('.btn-add');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(btn.getAttribute('data-id'));
            addToCart(productId);
        });
    }

    return card;
}

function renderProducts() {
    if (!productGrid) return;

    productGrid.innerHTML = '';

    if (products.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    products.forEach(function(product) {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });
}

// Создание HTML для товара в корзине
function createCartItemHTML(item) {
    return '<div class="flex gap-3 items-center" data-item-id="' + item.id + '">' +
        '<img src="' + item.image + '" alt="' + item.name + '" class="w-16 h-16 rounded-lg object-cover shadow-md">' +
        '<div class="flex-1 min-w-0">' +
            '<div class="flex justify-between items-start">' +
                '<h4 class="font-medium truncate pr-2">' + item.name + '</h4>' +
                '<button class="text-red-500 hover:text-red-400 p-1" onclick="removeFromCart(' + item.id + ')">' +
                    '<i class="fa-solid fa-trash"></i>' +
                '</button>' +
            '</div>' +
            '<p class="text-blue-400 font-bold text-sm mt-1">' + item.price.toLocaleString('ru-RU') + ' ₽</p>' +
            '<div class="flex items-center gap-3 mt-2">' +
                '<button class="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors" onclick="changeQuantity(' + item.id + ', -1)">' +
                    '<i class="fa-solid fa-minus text-sm"></i>' +
                '</button>' +
                '<span class="w-8 text-center font-medium">' + item.quantity + '</span>' +
                '<button class="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors" onclick="changeQuantity(' + item.id + ', 1)">' +
                    '<i class="fa-solid fa-plus text-sm"></i>' +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="text-right">' +
            '<p class="font-bold text-lg">' + (item.price * item.quantity).toLocaleString('ru-RU') + ' ₽</p>' +
        '</div>' +
    '</div>';
}

function renderCartItems() {
    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<div class="text-center text-gray-500 py-8">' +
            '<i class="fa-solid fa-cart-shopping text-4xl mb-4 opacity-30"></i>' +
            '<p>Корзина пуста</p>' +
        '</div>';
        cartSummary.classList.add('hidden');
        checkoutButton.classList.add('hidden');
        emptyCartButton.classList.add('hidden');
        if (cartCountFloating) cartCountFloating.classList.add('opacity-0');
        return;
    }

    cartItemsList.innerHTML = '';
    cart.forEach(function(item) {
        cartItemsList.innerHTML += createCartItemHTML(item);
    });

    cartSummary.classList.remove('hidden');
    checkoutButton.classList.remove('hidden');
    emptyCartButton.classList.remove('hidden');
    if (cartCountFloating) cartCountFloating.classList.remove('opacity-0');
}

function updateCartUI() {
    const totalQty = cart.reduce(function(s, i) { return s + i.quantity; }, 0);
    const totalPriceVal = cart.reduce(function(s, i) { return s + i.price * i.quantity; }, 0);

    // Обновление счетчиков
    if (cartCount) cartCount.textContent = totalQty;
    if (cartCountFloating) cartCountFloating.textContent = totalQty;

    // Обновление модального окна
    if (modalTotalQty) modalTotalQty.textContent = totalQty + ' шт.';
    if (modalTotalPrice) modalTotalPrice.textContent = totalPriceVal.toLocaleString('ru-RU') + ' ₽';
    if (checkoutAmount) checkoutAmount.textContent = totalPriceVal.toLocaleString('ru-RU');

    // Обновляем вид кнопок в каталоге
    document.querySelectorAll('.btn-add').forEach(function(btn) {
        const pid = parseInt(btn.getAttribute('data-id'));
        const inCart = cart.find(function(i) { return i.id === pid; });
        if (inCart) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> В корзине';
            btn.style.background = '#10B981';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> В корзину';
            btn.style.background = '#2680EB';
        }
    });
}

function openCartModal() {
    if (!cartModalOverlay || !cartModal) return;
    renderCartItems();
    updateCartUI();
    cartModalOverlay.classList.remove('opacity-0', 'pointer-events-none');
    cartModal.classList.remove('translate-y-full');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    if (!cartModalOverlay || !cartModal) return;
    cartModalOverlay.classList.add('opacity-0', 'pointer-events-none');
    cartModal.classList.add('translate-y-full');
    document.body.style.overflow = '';
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
    renderCartItems();
    saveCart();
}

function changeQuantity(productId, delta) {
    const item = cart.find(function(i) { return i.id === productId; });
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
        renderCartItems();
    }
    saveCart();
}

function checkout() {
    if (cart.length === 0) { showToast('Корзина пуста', 'error'); return; }
    const orderTotal = cart.reduce(function(s, i) { return s + i.price * i.quantity; }, 0);
    const items = cart.map(function(i) { return '• ' + i.name + ' x' + i.quantity + ' - ' + i.price.toLocaleString('ru-RU') + ' ₽'; }).join('\n');
    const msg = '🚀 Новый заказ!\n\nТоваров: ' + cart.reduce(function(s, i) { return s + i.quantity; }, 0) + '\nСумма: ' + orderTotal.toLocaleString('ru-RU') + ' ₽\n\nЗаказ:\n' + items + '\n\n⭐ Спасибо!';

    if (window.vkBridge) {
        vkBridge.send('VKWebAppShowWallPostBox', { message: msg, attachments: 'photo208472431_456239032' }, function(data) {
            if (data.result) { showToast('Заказ отправлен!', 'success'); cart = []; updateCartUI(); closeCartModal(); saveCart(); }
            else handleFallbackOrder(msg);
        });
    } else { handleFallbackOrder(msg); }
}

function handleFallbackOrder(msg) {
    const params = getVKParams();
    if (params && params.viewer_id) {
        setTimeout(function() { showToast('Заказ оформлен!', 'success'); cart = []; updateCartUI(); closeCartModal(); }, 1500);
    } else { console.log('ORDER:\n' + msg); showToast('Проверьте консоль', 'info'); }
}

function getVKParams() {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const result = {};
    for (const [k, v] of params) result[k] = v;
    return result;
}

function saveCart() {
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) { console.error('Save error:', e); }
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Очистить корзину?')) {
        cart = [];
        updateCartUI();
        renderCartItems();
        saveCart();
        showToast('Корзина очищена', 'info');
    }
}

function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        if (saved) { cart = JSON.parse(saved); updateCartUI(); }
    } catch (e) { console.error('Load error:', e); }
}

function testRender() {
    console.log('testRender called');
    if (!productGrid) {
        console.error('productGrid not found');
        return;
    }
    renderProducts();
    showToast('Товары перерисованы', 'success');
}

function init() {
    console.log('INIT start');

    // Get DOM elements
    productGrid = document.getElementById('productGrid');
    cartButton = document.getElementById('cartButton');
    cartFloatingButton = document.getElementById('cartFloatingButton');
    cartCount = document.getElementById('cartCount');
    cartCountFloating = document.getElementById('cartCountFloating');
    cartModalOverlay = document.getElementById('cartModalOverlay');
    cartModal = document.getElementById('cartModal');
    cartItemsList = document.getElementById('cartItemsList');
    cartSummary = document.getElementById('cartSummary');
    modalTotalQty = document.getElementById('modalTotalQty');
    modalTotalPrice = document.getElementById('modalTotalPrice');
    checkoutButton = document.getElementById('checkoutButton');
    checkoutAmount = document.getElementById('checkoutAmount');
    emptyCartButton = document.getElementById('emptyCartButton');
    continueShoppingButton = document.getElementById('continueShoppingButton');
    closeCartModal = document.getElementById('closeCartModal');
    toastContainer = document.getElementById('toastContainer');

    console.log('DOM loaded:', {
        productGrid: !!productGrid,
        cartButton: !!cartButton,
        cartFloatingButton: !!cartFloatingButton,
        cartModalOverlay: !!cartModalOverlay
    });

    if (!productGrid) { console.error('productGrid NOT FOUND'); return; }

    loadCart();
    renderProducts();
    renderCartItems();
    updateCartUI();

    if (window.vkBridge) {
        vkBridge.send('VKWebAppInit');
        console.log('VK Bridge init');
    }

    // Обработчики кнопок
    if (cartButton) {
        cartButton.addEventListener('click', function() { openCartModal(); });
    }
    if (cartFloatingButton) {
        cartFloatingButton.addEventListener('click', function() { openCartModal(); });
    }
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() { checkout(); });
    }
    if (emptyCartButton) {
        emptyCartButton.addEventListener('click', function() { clearCart(); });
    }
    if (continueShoppingButton) {
        continueShoppingButton.addEventListener('click', function() { closeCartModal(); });
    }
    if (closeCartModal) {
        closeCartModal.addEventListener('click', function() { closeCartModal(); });
    }
    if (cartModalOverlay) {
        cartModalOverlay.addEventListener('click', function(e) {
            if (e.target === cartModalOverlay) closeCartModal();
        });
    }

    // Обработчик кнопки теста
    const testRenderBtn = document.getElementById('testRender');
    if (testRenderBtn) {
        testRenderBtn.addEventListener('click', function() { testRender(); });
    }

    // Закрытие модального окна по нажатию ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !cartModalOverlay.classList.contains('opacity-0')) {
            closeCartModal();
        }
    });

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
