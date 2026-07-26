<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tu pedido — Teju Shoes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=2">
</head>
<body>

  <div class="topbar">
    <div class="topbar-inner">
      <a class="wordmark" href="index.html">Teju <span>Shoes</span></a>
      <nav class="topbar-nav">
        <a href="index.html#catalogo">Catálogo</a>
        <a href="index.html#contacto-footer">Contacto</a>
      </nav>
      <a class="back-btn" href="index.html">← Seguir comprando</a>
    </div>
  </div>

  <div class="wrap">
    <div style="padding-top:32px;">
      <div class="eyebrow">Paso final</div>
      <h1 style="font-size:32px; margin-top:8px;">Tu pedido</h1>
    </div>

    <div id="carrito-vacio" class="empty-state" style="display:none;">
      Tu carrito está vacío. <a href="index.html" style="text-decoration:underline;">Volver al catálogo</a>.
    </div>

    <div class="checkout-grid" id="checkout-grid">
      <div>
        <div id="checkout-items"></div>
      </div>

      <div class="checkout-card" id="checkout-form-wrap">
        <h3 style="margin-bottom:18px;">Datos para coordinar</h3>

        <div class="field">
          <label for="ck-nombre">Nombre y apellido</label>
          <input id="ck-nombre" type="text" placeholder="Ej: Ana Gómez">
        </div>
        <div class="field">
          <label for="ck-whatsapp">WhatsApp</label>
          <input id="ck-whatsapp" type="text" placeholder="Ej: +54 9 11 1234 5678">
        </div>
        <div class="field">
          <label for="ck-entrega">Entrega</label>
          <select id="ck-entrega" class="field-select">
            <option value="retiro">Retiro en el local</option>
            <option value="envio">Envío a domicilio</option>
          </select>
        </div>
        <div class="field" id="ck-direccion-field" style="display:none;">
          <label for="ck-direccion">Dirección de envío</label>
          <input id="ck-direccion" type="text" placeholder="Calle, número, ciudad">
        </div>
        <div class="field">
          <label for="ck-nota">Nota (opcional)</label>
          <textarea id="ck-nota" placeholder="Algo que quieras avisarnos"></textarea>
        </div>

        <label class="field" style="font-size:12.5px; font-weight:600; color:var(--ink-soft); margin-bottom:6px; display:block;">Medio de pago</label>
        <div class="pago-opciones" id="pago-opciones"></div>
        <div class="pago-detalle" id="pago-detalle" style="display:none;"></div>

        <div class="resumen-line"><span>Subtotal</span><span id="resumen-subtotal">$0</span></div>
        <div class="resumen-line total"><span>Total</span><span id="resumen-total">$0</span></div>

        <div class="form-error" id="checkout-error"></div>
        <button class="btn btn-cork btn-block" id="checkout-submit-btn">Confirmar pedido</button>
      </div>

      <div class="checkout-card success-box" id="checkout-success" style="display:none;">
        <div class="icon">✓</div>
        <h3>¡Pedido recibido!</h3>
        <p>Guardá este número de referencia: <strong id="success-pedido-id"></strong>. Te contactamos por WhatsApp para coordinar el pago y la entrega.</p>
        <a class="btn btn-cork btn-block" id="success-wsp-btn" target="_blank" rel="noopener">Enviar detalle por WhatsApp</a>
        <a class="btn btn-ghost btn-block" href="index.html" style="margin-top:10px;">Volver al catálogo</a>
      </div>
    </div>
  </div>

  <footer class="site-footer">
    <div class="wrap">
      <div class="stitch" style="margin-bottom:26px;"></div>
      <div class="site-footer-inner">
        <span class="site-footer-title">Teju Shoes © <span id="footer-year"></span></span>
      </div>
    </div>
  </footer>

  <script type="module">
    import { firebaseConfig, WHATSAPP_PEDIDOS, DATOS_PAGO, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './firebase-config.js';
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
    import { initializeFirestore, collection, addDoc, serverTimestamp }
      from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
    import { leerCarrito, cambiarCantidad, quitarDelCarrito, calcularTotalCarrito, formatearPrecioARS, vaciarCarrito, actualizarBadgeCarrito }
      from './carrito.js';

    const app = initializeApp(firebaseConfig);
    const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

    document.getElementById('footer-year').textContent = new Date().getFullYear();

    function escapeHtml(str){
      return String(str ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    const PAGO_LABELS = {
      transferencia: 'Transferencia bancaria',
      efectivo: 'Efectivo contra entrega',
      otro: 'Otro medio'
    };
    let metodoPago = null;

    function renderPagoOpciones(){
      const cont = document.getElementById('pago-opciones');
      cont.innerHTML = Object.keys(DATOS_PAGO).map(key => `
        <label class="pago-opcion" data-pago-opcion="${key}">
          <input type="radio" name="pago" value="${key}">
          <div>
            <strong>${PAGO_LABELS[key] || key}</strong>
            <span>${key === 'transferencia' ? 'Te paso los datos para transferir.' : (DATOS_PAGO[key].nota || '')}</span>
          </div>
        </label>
      `).join('');

      cont.querySelectorAll('input[name="pago"]').forEach(input => {
        input.addEventListener('change', () => {
          metodoPago = input.value;
          cont.querySelectorAll('.pago-opcion').forEach(op => op.classList.remove('selected'));
          input.closest('.pago-opcion').classList.add('selected');
          mostrarDetallePago();
          document.getElementById('checkout-error').textContent = '';
        });
      });
    }

    function mostrarDetallePago(){
      const detalleEl = document.getElementById('pago-detalle');
      if(!metodoPago){ detalleEl.style.display = 'none'; return; }

      if(metodoPago === 'transferencia'){
        const d = DATOS_PAGO.transferencia;
        detalleEl.innerHTML = `
          <strong>Datos para transferir:</strong><br>
          Titular: ${escapeHtml(d.titular)}<br>
          CBU: ${escapeHtml(d.cbu)}<br>
          Alias: ${escapeHtml(d.alias)}
        `;
      }else{
        detalleEl.innerHTML = escapeHtml(DATOS_PAGO[metodoPago]?.nota || '');
      }
      detalleEl.style.display = 'block';
    }

    function renderCheckoutItems(){
      const items = leerCarrito();
      const itemsEl = document.getElementById('checkout-items');
      const vacioEl = document.getElementById('carrito-vacio');
      const gridEl = document.getElementById('checkout-grid');

      if(!items.length){
        vacioEl.style.display = 'block';
        gridEl.style.display = 'none';
        return;
      }
      vacioEl.style.display = 'none';
      gridEl.style.display = 'grid';

      itemsEl.innerHTML = items.map((item, index) => `
        <div class="cart-item" style="background:var(--paper); border:1px solid var(--line); border-radius:var(--radius-m); padding:14px 16px; margin-bottom:12px;">
          <div class="cart-item-photo" style="${item.imagen ? `background-image:url('${item.imagen}')` : ''}"></div>
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHtml(item.nombre)}</div>
            <div class="cart-item-meta">Talle ${escapeHtml(item.talla)}</div>
            <div class="cart-item-row">
              <div class="qty-control">
                <button type="button" data-qty-menos="${index}">−</button>
                <span>${item.cantidad}</span>
                <button type="button" data-qty-mas="${index}">+</button>
              </div>
              <div class="cart-item-price">${formatearPrecioARS(item.precio * item.cantidad)}</div>
            </div>
          </div>
          <button type="button" class="cart-item-remove" data-quitar="${index}" style="align-self:flex-start;">Quitar</button>
        </div>
      `).join('');

      itemsEl.querySelectorAll('[data-qty-mas]').forEach(btn => btn.addEventListener('click', () => { cambiarCantidad(Number(btn.dataset.qtyMas), 1); refrescarTodo(); }));
      itemsEl.querySelectorAll('[data-qty-menos]').forEach(btn => btn.addEventListener('click', () => { cambiarCantidad(Number(btn.dataset.qtyMenos), -1); refrescarTodo(); }));
      itemsEl.querySelectorAll('[data-quitar]').forEach(btn => btn.addEventListener('click', () => { quitarDelCarrito(Number(btn.dataset.quitar)); refrescarTodo(); }));

      const total = calcularTotalCarrito(items);
      document.getElementById('resumen-subtotal').textContent = formatearPrecioARS(total);
      document.getElementById('resumen-total').textContent = formatearPrecioARS(total);
    }

    function refrescarTodo(){
      renderCheckoutItems();
      actualizarBadgeCarrito();
    }

    document.getElementById('ck-entrega').addEventListener('change', (e) => {
      document.getElementById('ck-direccion-field').style.display = e.target.value === 'envio' ? 'block' : 'none';
    });

    document.getElementById('checkout-submit-btn').addEventListener('click', async () => {
      const errorEl = document.getElementById('checkout-error');
      errorEl.textContent = '';

      const items = leerCarrito();
      if(!items.length){
        errorEl.textContent = 'Tu carrito está vacío.';
        return;
      }

      const nombre = document.getElementById('ck-nombre').value.trim();
      const whatsapp = document.getElementById('ck-whatsapp').value.trim();
      const entrega = document.getElementById('ck-entrega').value;
      const direccion = document.getElementById('ck-direccion').value.trim();
      const nota = document.getElementById('ck-nota').value.trim();

      if(!nombre || !whatsapp){
        errorEl.textContent = 'Completá tu nombre y WhatsApp.';
        return;
      }
      if(entrega === 'envio' && !direccion){
        errorEl.textContent = 'Ingresá la dirección de envío.';
        return;
      }
      if(!metodoPago){
        errorEl.textContent = 'Elegí un medio de pago.';
        return;
      }

      const total = calcularTotalCarrito(items);
      const btn = document.getElementById('checkout-submit-btn');
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      try{
        const docRef = await addDoc(collection(db, "pedidos"), {
          items: items.map(i => ({ productoId: i.productoId, nombre: i.nombre, talla: i.talla, precio: i.precio, cantidad: i.cantidad })),
          total,
          cliente: { nombre, whatsapp, entrega, direccion: entrega === 'envio' ? direccion : null },
          metodoPago,
          nota: nota || null,
          estado: 'pendiente',
          fecha: serverTimestamp()
        });

        if(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID){
          const resumen = items.map(i => `${i.cantidad}x ${i.nombre} (talle ${i.talla})`).join(', ');
          const texto = `🆕 Pedido nuevo #${docRef.id.slice(0,6)}\n${nombre} — ${whatsapp}\n${resumen}\nTotal: ${formatearPrecioARS(total)}\nPago: ${PAGO_LABELS[metodoPago] || metodoPago}`;
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: texto })
          }).catch(err => console.error('No se pudo avisar por Telegram:', err));
        }

        vaciarCarrito();
        document.getElementById('checkout-form-wrap').style.display = 'none';
        document.getElementById('checkout-success').style.display = 'block';
        document.getElementById('success-pedido-id').textContent = docRef.id.slice(0, 8).toUpperCase();

        const resumenWsp = items.map(i => `• ${i.cantidad}x ${i.nombre} (talle ${i.talla})`).join('%0A');
        const textoWsp = encodeURIComponent(`Hola! Soy ${nombre}, acabo de hacer un pedido en Teju Shoes (ref. ${docRef.id.slice(0,8).toUpperCase()}):\n`) + resumenWsp + encodeURIComponent(`\nTotal: ${formatearPrecioARS(total)}\nPago: ${PAGO_LABELS[metodoPago] || metodoPago}`);
        document.getElementById('success-wsp-btn').href = `https://wa.me/${WHATSAPP_PEDIDOS}?text=${textoWsp}`;
      }catch(err){
        console.error('Error al enviar el pedido:', err);
        errorEl.textContent = 'Hubo un problema al enviar el pedido. Probá de nuevo.';
      }finally{
        btn.disabled = false;
        btn.textContent = 'Confirmar pedido';
      }
    });

    renderPagoOpciones();
    renderCheckoutItems();
  </script>
</body>
</html>
