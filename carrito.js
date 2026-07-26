// ============================================================
// CARRITO — compartido entre todas las páginas del sitio.
// Se guarda en localStorage (no hace falta cuenta ni login).
// ============================================================

const CART_KEY = 'teju_carrito';

export function leerCarrito(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  }catch(err){
    console.error('Error al leer el carrito:', err);
    return [];
  }
}

export function guardarCarrito(items){
  try{
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }catch(err){
    console.error('Error al guardar el carrito:', err);
  }
  actualizarBadgeCarrito();
}

// item: { productoId, nombre, talla, precio, imagen, cantidad }
export function agregarAlCarrito(item){
  const items = leerCarrito();
  const existente = items.find(i => i.productoId === item.productoId && i.talla === item.talla);
  if(existente){
    existente.cantidad += item.cantidad;
  }else{
    items.push(item);
  }
  guardarCarrito(items);
  return items;
}

export function quitarDelCarrito(index){
  const items = leerCarrito();
  items.splice(index, 1);
  guardarCarrito(items);
  return items;
}

export function cambiarCantidad(index, delta){
  const items = leerCarrito();
  if(!items[index]) return items;
  items[index].cantidad += delta;
  if(items[index].cantidad <= 0){
    items.splice(index, 1);
  }
  guardarCarrito(items);
  return items;
}

export function vaciarCarrito(){
  guardarCarrito([]);
}

export function calcularTotalCarrito(items){
  return items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
}

export function contarUnidadesCarrito(items){
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

export function formatearPrecioARS(n){
  return '$' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

// Actualiza el numerito del carrito en el topbar, si existe en la página actual.
export function actualizarBadgeCarrito(){
  const el = document.getElementById('cart-count');
  if(!el) return;
  const cantidad = contarUnidadesCarrito(leerCarrito());
  el.textContent = String(cantidad);
  el.style.display = cantidad > 0 ? 'flex' : 'none';
}

// Dibuja el contenido del panel lateral del carrito (usado en index.html y producto.html).
// Requiere que la página tenga: #cart-items, #cart-total, #cart-drawer, #cart-overlay.
export function renderCartDrawer(){
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if(!itemsEl || !totalEl) return;

  const items = leerCarrito();

  if(!items.length){
    itemsEl.innerHTML = '<div class="empty-state">Todavía no agregaste ningún par.</div>';
  }else{
    itemsEl.innerHTML = items.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-photo" style="background-image:url('${item.imagen ? escapeHtmlAttr(item.imagen) : ''}')"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtmlText(item.nombre)}</div>
          <div class="cart-item-meta">Talle ${escapeHtmlText(item.talla)}</div>
          <div class="cart-item-row">
            <div class="qty-control">
              <button type="button" data-qty-menos="${index}">−</button>
              <span>${item.cantidad}</span>
              <button type="button" data-qty-mas="${index}">+</button>
            </div>
            <div class="cart-item-price">${formatearPrecioARS(item.precio * item.cantidad)}</div>
          </div>
        </div>
      </div>
    `).join('') + `<button type="button" class="cart-item-remove" id="cart-clear-all" style="margin-top:10px;">Vaciar carrito</button>`;

    itemsEl.querySelectorAll('[data-qty-mas]').forEach(btn => {
      btn.addEventListener('click', () => { cambiarCantidad(Number(btn.dataset.qtyMas), 1); renderCartDrawer(); });
    });
    itemsEl.querySelectorAll('[data-qty-menos]').forEach(btn => {
      btn.addEventListener('click', () => { cambiarCantidad(Number(btn.dataset.qtyMenos), -1); renderCartDrawer(); });
    });
    const clearBtn = document.getElementById('cart-clear-all');
    if(clearBtn) clearBtn.addEventListener('click', () => { vaciarCarrito(); renderCartDrawer(); });
  }

  totalEl.textContent = formatearPrecioARS(calcularTotalCarrito(items));
  actualizarBadgeCarrito();
}

export function initCartDrawerToggle(){
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const openBtn = document.getElementById('cart-open-btn');
  const closeBtn = document.getElementById('cart-close');
  if(!drawer || !overlay) return;

  function abrir(){ drawer.classList.add('open'); overlay.classList.add('open'); renderCartDrawer(); }
  function cerrar(){ drawer.classList.remove('open'); overlay.classList.remove('open'); }

  if(openBtn) openBtn.addEventListener('click', abrir);
  if(closeBtn) closeBtn.addEventListener('click', cerrar);
  overlay.addEventListener('click', cerrar);
}

function escapeHtmlText(str){
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeHtmlAttr(str){
  return String(str ?? '').replace(/'/g, "%27");
}
