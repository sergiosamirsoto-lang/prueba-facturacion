/* ==========================================================================
   PVC Solutions HN — app.js
   Integración de Auth, Facturas (CRUD) y Cotizador
   ========================================================================== */

/* ── GLOBALES Y CONFIGURACIÓN ── */

const supabaseConfig = {
    url: 'https://riepcldqgjtbcronbrcu.supabase.co',
    publishableKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZXBjbGRxZ2p0YmNyb25icmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTI2MTAsImV4cCI6MjA5NDcyODYxMH0.gWblF1GWLcFHov3Gdv2nW9oF2A1oGxwy-C0bN21fOIE'
};

const productosCotizacion = [
    { codigo: 'N-001', producto: 'Tablilla PVC Groove Café Machimbre 25x5.95', precio: 190 },
    { codigo: 'N-002', producto: 'Tablilla PVC Groove Roja 25x5.95', precio: 205 },
    { codigo: 'N-003', producto: 'Tablilla PVC Madera Lisa Roja o Caoba 25x5.95', precio: 158 },
    { codigo: 'N-004', producto: 'Cornisa Blanco Mate', precio: 130 },
    { codigo: 'N-005', producto: 'Cornisa Madera Roja', precio: 130 },
    { codigo: 'N-006', producto: 'Cornisa Madera Groove Machimbre', precio: 130 },
    { codigo: 'N-007', producto: 'Ángulo interior Blanco PVC', precio: 130 },
    { codigo: 'N-008', producto: 'Furring 7/8 x 12 Calibre .30', precio: 39 },
    { codigo: 'N-009', producto: 'Ángulo para tabla yeso 1 1/2 x 12', precio: 19 },
    { codigo: 'N-010', producto: 'Canal de carga para tabla yeso 1 1/2 x 12', precio: 60 },
    { codigo: 'N-011', producto: 'Tornillo Tapicero punta fina', precio: 0.3 },
    { codigo: 'N-012', producto: 'Tornillo Frijolito punta broca #7', precio: 0.3 },
    { codigo: 'N-013', producto: 'Tornillo Frijolito punta fina #7', precio: 0.3 },
    { codigo: 'N-014', producto: 'Tablilla PVC Madera Café Claro Machimbre 20x5.95', precio: 140 },
    { codigo: 'N-015', producto: 'Tablilla PVC Blanco Madera 25x5.95', precio: 170 },
    { codigo: 'N-016', producto: 'Tablilla PVC Blanco Brillante 25x5.95', precio: 170 },
    { codigo: 'N-017', producto: 'Lámina Mármol 4x8 Blanco', precio: 800 },
    { codigo: 'N-018', producto: 'Perfil en J Café', precio: 130 },
    { codigo: 'N-019', producto: 'Clavos', precio: 0.5 },
    { codigo: 'N-020', producto: 'Libra de Alambre Galvanizado', precio: 35 },
    { codigo: 'N-021', producto: 'Sicaflex', precio: 220 },
    { codigo: 'N-022', producto: 'Esquinero exterior blanco', precio: 130 },
    { codigo: 'N-023', producto: 'Paral 1/2', precio: 45 },
    { codigo: 'N-024', producto: 'Unión H Blanco', precio: 130 },
    { codigo: 'N-025', producto: 'Perfil J Blanco', precio: 130 },
    { codigo: 'N-026', producto: 'WPC', precio: 190 },
    { codigo: 'N-027', producto: 'Tubos 2x1', precio: 450 },
    { codigo: 'N-028', producto: 'Solera 4P', precio: 75 },
    { codigo: 'N-029', producto: 'Pegamento', precio: 220 },
    { codigo: 'N-030', producto: 'Silicón Blanco', precio: 100 },
    { codigo: 'N-031', producto: 'Tornillo de Zinc', precio: 1 },
    { codigo: 'N-034', producto: 'Lámina de durok 4x8', precio: 950 },
    { codigo: 'N-035', producto: 'Canaleta de 4', precio: 490 }
];

const vendedoresCotizacion = [
    'Sergio Samir',
    'Iveth Madrid',
    'Jose Antonio',
    'Sergio Vladimir',
    'Lidia Amanda'
];

const vendedoresPorEmailCotizacion = {
    'sergiosamir@pvcsolutionshn.com': 'Sergio Samir',
    'ivethmadrid@pvcsolutionshn.com': 'Iveth Madrid',
    'joseantonio@pvcsolutionshn.com': 'Jose Antonio',
    'sergiovladimir@pvcsolutionshn.com': 'Sergio Vladimir',
    'lidiaamanda@pvcsolutionshn.com': 'Lidia Amanda'
};

let facturasList = [];
let promesaSupabase;
let isAdmin = false;

/* ── UTILIDADES GLOBALES ── */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatMoney(value) {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 2
    }).format(Number(value) || 0);
}

function escaparHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
}

/* ── OPTIMIZACIÓN DE IMÁGENES ── */
function optimizarImagen(file, maxMB = 2) {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) return resolve(file);
        
        const maxBytes = maxMB * 1024 * 1024;
        if (file.size <= maxBytes) return resolve(file);
        
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            const MAX_SIZE = 1920;
            if (width > height && width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (!blob) return resolve(file);
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                resolve(newFile);
            }, 'image/jpeg', 0.7);
        };
        img.onerror = () => resolve(file);
        img.src = url;
    });
}

/* ── NAVEGACIÓN Y TEMA ── */
function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    themeToggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });

    window.addEventListener('scroll', () => {
        const header = document.getElementById('app-header');
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ── AUTENTICACIÓN SUPABASE ── */
function cargarSupabase() {
    if (window.supabase) return Promise.resolve(true);
    if (promesaSupabase) return promesaSupabase;

    promesaSupabase = new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4';
        script.onload = () => resolve(Boolean(window.supabase));
        script.onerror = () => {
            showToast('Error cargando Supabase. Revisa tu conexión.', 'error');
            resolve(false);
        };
        document.head.appendChild(script);
    });

    return promesaSupabase;
}

function getSupabaseClient() {
    if (!window.supabase) {
        console.error('[PVC] Supabase library not loaded');
        return null;
    }
    if (!window.appSupabase) {
        // Validar que la key tiene formato correcto (debe empezar con eyJ)
        const key = supabaseConfig.publishableKey;
        if (!key || !key.startsWith('eyJ')) {
            console.error('[PVC] La anon key de Supabase parece incorrecta. Debe empezar con "eyJ..."');
        }
        window.appSupabase = window.supabase.createClient(supabaseConfig.url, key);
        console.log('[PVC] Supabase client creado');
    }
    return window.appSupabase;
}

function getSellerFromUser(user) {
    const email = String(user?.email || '').toLowerCase();
    return vendedoresPorEmailCotizacion[email] || '';
}

function setAppVisible(isVisible, user = null, sellerName = '') {
    const loginSection = document.getElementById('login-section');
    const appHeader = document.getElementById('app-header');
    const appMain = document.getElementById('app-main');
    
    if (isVisible) {
        isAdmin = (user && user.email && user.email.toLowerCase() === 'sergiosamir@pvcsolutionshn.com');
        const thAcciones = document.getElementById('th-acciones');
        if (thAcciones) thAcciones.style.display = isAdmin ? '' : 'none';

        loginSection.hidden = true;
        appHeader.hidden = false;
        appMain.hidden = false;
        document.body.classList.add('logged-in');
        
        document.getElementById('session-info').textContent = user.email;
        document.getElementById('quote-session-seller').textContent = sellerName;
        
        // Inicializar datos una vez logueado
        cargarFacturas();
        initCotizadorUI();
    } else {
        loginSection.hidden = false;
        appHeader.hidden = true;
        appMain.hidden = true;
        document.body.classList.remove('logged-in');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error');
    const btnSubmit = document.getElementById('login-submit');
    
    errorEl.textContent = '';
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Verificando...';

    await cargarSupabase();
    const client = getSupabaseClient();
    if (!client) {
        errorEl.textContent = '⚠️ Error de conexión con Supabase. Verifica tu internet.';
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Entrar al sistema';
        return;
    }

    const { data, error } = await client.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passInput.value
    });

    if (error) {
        // Traducir errores comunes de Supabase
        let msg = 'Error desconocido. Intenta de nuevo.';
        const code = error.message?.toLowerCase() || '';
        if (code.includes('invalid login') || code.includes('invalid credentials') || code.includes('email not confirmed') === false && code.includes('invalid')) {
            msg = '❌ Correo o contraseña incorrectos. Verifica tus datos.';
        } else if (code.includes('email not confirmed')) {
            msg = '⚠️ Tu cuenta no ha sido confirmada. Revisa tu correo.';
        } else if (code.includes('too many requests')) {
            msg = '⏳ Demasiados intentos. Espera unos minutos antes de intentar de nuevo.';
        } else if (code.includes('network') || code.includes('fetch')) {
            msg = '📶 Sin conexión a internet. Verifica tu red.';
        } else {
            msg = `Error: ${error.message}`;
        }
        errorEl.textContent = msg;
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Entrar al sistema';
        passInput.value = '';
        passInput.focus();
        return;
    }

    if (!data.user) {
        errorEl.textContent = '❌ No se pudo iniciar sesión. Intenta de nuevo.';
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Entrar al sistema';
        return;
    }

    // Si el email no está en la lista de vendedores, usar la parte antes del @ como nombre
    const seller = getSellerFromUser(data.user) || data.user.email.split('@')[0];

    document.getElementById('login-form').reset();
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Entrar al sistema';
    
    showToast(`¡Bienvenido/a, ${seller}!`, 'success');
    setAppVisible(true, data.user, seller);
}

async function handleLogout() {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    setAppVisible(false);
    showToast('Sesión cerrada correctamente', 'info');
}

async function checkSession() {
    await cargarSupabase();
    const client = getSupabaseClient();
    if (!client) return;

    const { data, error } = await client.auth.getSession();
    if (error || !data.session) {
        setAppVisible(false);
        return;
    }

    const seller = getSellerFromUser(data.session.user);
    if (seller) {
        setAppVisible(true, data.session.user, seller);
    } else {
        await client.auth.signOut();
        setAppVisible(false);
        document.getElementById('login-error').textContent = 'Tu cuenta actual no tiene acceso de vendedor.';
    }
}

/* ── MÓDULO FACTURAS ── */
async function cargarFacturas() {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        const { data, error } = await client.from('facturas').select('*').order('fecha', { ascending: false });
        if (error) throw error;
        
        facturasList = data || [];
        
        // Mantener filtro activo si lo hay
        const filtroActivo = document.querySelector('.filter-pill.active')?.dataset.filter || 'todos';
        filtrar(filtroActivo);
        
        actualizarDashboard(facturasList);
    } catch (err) {
        console.error("Error al cargar facturas:", err);
        showToast("Error cargando facturas de Supabase", "error");
    }
}

document.getElementById('formFactura')?.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const cliente = document.getElementById("cliente").value;
    const telefono = document.getElementById("telefono").value;
    const archivoInput = document.getElementById("archivo");
    const estado = "pendientes"; // Siempre pendiente al inicio
    
    if (!cliente || archivoInput.files.length === 0) {
        showToast("Completa todos los campos obligatorios", "error");
        return;
    }
    
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Subiendo...';
    
    try {
        const client = getSupabaseClient();
        let file = archivoInput.files[0];
        
        btnSubmit.textContent = 'Optimizando...';
        file = await optimizarImagen(file, 2);
        btnSubmit.textContent = 'Subiendo a la nube...';
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // 1. Subir archivo al bucket "facturas"
        const { data: uploadData, error: uploadError } = await client.storage
            .from('facturas')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Obtener URL publica
        const { data: { publicUrl } } = client.storage.from('facturas').getPublicUrl(fileName);

        // 3. Insertar en tabla facturas
        const { error: insertError } = await client.from('facturas').insert([
            { 
                cliente: cliente, 
                telefono: telefono, 
                estado: estado, 
                archivo: publicUrl 
            }
        ]);

        if (insertError) throw insertError;
        
        this.reset();
        showToast("Factura subida correctamente", "success");
        cargarFacturas();
        
        // Si hay un tab de facturas, forzar click al filtro "Todos" para verla
        document.querySelector('.filter-pill[data-filter="todos"]')?.click();
        
        // Notificar por WhatsApp a Sergio
        const currentSeller = document.getElementById('quote-session-seller').textContent;
        const msg = `*NUEVA FACTURA REGISTRADA*\nCliente: ${cliente}\nWhatsApp del Cliente: ${telefono}\nVendedor: ${currentSeller}\nEl archivo ha sido guardado en el sistema.`;
        window.open(`https://wa.me/50495033358?text=${encodeURIComponent(msg)}`, '_blank');
        
    } catch (err) {
        console.error("Error subiendo factura:", err);
        showToast("Error de conexión o permisos con Supabase", "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '📤 Subir Factura';
    }
});

function renderFacturasTable(lista) {
    const tabla = document.getElementById("tablaFacturas");
    const emptyState = document.getElementById("empty-state");
    
    tabla.innerHTML = "";
    
    if (lista.length === 0) {
        emptyState.hidden = false;
        return;
    }
    
    emptyState.hidden = true;
    
    lista.forEach(f => {
        const isUrl = f.archivo && f.archivo.startsWith('http');
        const archivoLink = f.archivo
            ? `<a href="${isUrl ? f.archivo : `/uploads/${escaparHtml(f.archivo)}`}" target="_blank" title="Ver archivo adjunto">📎 Ver archivo</a>`
            : "Sin archivo";
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Cliente"><strong>${escaparHtml(f.cliente)}</strong></td>
            <td data-label="WhatsApp"><a href="https://wa.me/${escaparHtml(f.telefono)}" target="_blank" title="Abrir WhatsApp">📱 ${escaparHtml(f.telefono)}</a></td>
            <td data-label="Archivo">${archivoLink}</td>
            <td data-label="Estado"><span class="status-badge status-badge--${escaparHtml(f.estado)}">${escaparHtml(f.estado)}</span></td>
            <td data-label="Fecha" style="color:var(--txt-muted); font-size: 0.85em;">${f.fecha ? new Date(f.fecha).toLocaleString('es-HN') : ""}</td>
            ${isAdmin ? `<td data-label="Acciones" class="table-actions">
                <button class="btn-action btn-action--change" onclick="window.cambiarEstado(${f.id})" title="Rotar estado">↻</button>
                <button class="btn-action btn-action--delete" onclick="window.eliminarFactura(${f.id})" title="Eliminar factura">✖</button>
            </td>` : ''}
        `;
        tabla.appendChild(row);
    });
}

window.cambiarEstado = async function(id) {
    if (!isAdmin) return showToast('No tienes permisos para cambiar estados.', 'error');
    
    const f = facturasList.find(f => f.id === id);
    if (!f) return;
    
    const estados = ["pendientes", "enviadas", "rechazadas"];
    const idx = estados.indexOf(f.estado);
    const nuevoEstado = estados[(idx + 1) % estados.length];
    
    try {
        const client = getSupabaseClient();
        const { error } = await client.from('facturas').update({ estado: nuevoEstado }).eq('id', id);
        
        if (!error) {
            showToast(`Estado cambiado a: ${nuevoEstado}`, 'info');
            cargarFacturas();
        } else {
            throw error;
        }
    } catch (err) {
        console.error("Error al cambiar estado:", err);
        showToast('Error actualizando estado en Supabase', 'error');
    }
};

window.eliminarFactura = async function(id) {
    if (!isAdmin) return showToast('No tienes permisos para eliminar facturas.', 'error');
    if (!confirm("¿Estás seguro de eliminar permanentemente esta factura?")) return;
    
    try {
        const client = getSupabaseClient();
        const { error } = await client.from('facturas').delete().eq('id', id);
        
        if (!error) {
            showToast('Factura eliminada', 'success');
            cargarFacturas();
        } else {
            throw error;
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
        showToast('Error eliminando factura en Supabase', 'error');
    }
};

function filtrar(estado) {
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === estado);
    });
    
    const searchInput = document.getElementById('search-cliente');
    const texto = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filtradas = estado === "todos"
        ? facturasList
        : facturasList.filter(f => f.estado === estado);
        
    if (texto) {
        filtradas = filtradas.filter(f => f.cliente.toLowerCase().includes(texto));
    }
        
    renderFacturasTable(filtradas);
}

function actualizarDashboard(lista) {
    document.getElementById("totalFacturas").textContent = lista.length;
    document.getElementById("totalPendientes").textContent = lista.filter(f => f.estado === "pendientes").length;
    document.getElementById("totalEnviadas").textContent = lista.filter(f => f.estado === "enviadas").length;
    document.getElementById("totalRechazadas").textContent = lista.filter(f => f.estado === "rechazadas").length;
}

// Eventos de filtros y búsqueda
document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => filtrar(btn.dataset.filter));
});

document.getElementById('search-cliente')?.addEventListener('input', () => {
    const estadoActivo = document.querySelector('.filter-pill.active').dataset.filter;
    filtrar(estadoActivo);
});


/* ── MÓDULO COTIZADOR ── */

function opcionesProductos() {
    return productosCotizacion
        .map(item => `<option value="${escaparHtml(item.codigo)}">${escaparHtml(item.codigo)} - ${escaparHtml(item.producto)}</option>`)
        .join('');
}

function initCotizadorUI() {
    const selectSeller = document.getElementById('quote-seller');
    if (selectSeller && selectSeller.options.length <= 1) {
        selectSeller.innerHTML = '<option value="">Seleccionar</option>' + 
            vendedoresCotizacion.map(nombre => `<option value="${escaparHtml(nombre)}">${escaparHtml(nombre)}</option>`).join('');
    }
    
    // Autoseleccionar el vendedor actual de la sesión
    const currentSeller = document.getElementById('quote-session-seller').textContent;
    if(selectSeller && currentSeller) {
        selectSeller.value = currentSeller;
        selectSeller.disabled = true; // Forzar a que use su propio nombre
    }

    const tableBody = document.getElementById('quote-lines');
    if(tableBody && tableBody.children.length === 0) {
        resetQuote();
    }
}

function findProduct(code) {
    return productosCotizacion.find(item => item.codigo === code) || productosCotizacion[0];
}

function createQuoteLine(code = 'N-001', qty = 1) {
    const tableBody = document.getElementById('quote-lines');
    const product = code ? findProduct(code) : null;
    const row = document.createElement('tr');
    row.className = 'quote-line';
    row.innerHTML = `
        <td>
            <input class="quote-qty" type="number" min="0" step="0.01" value="${qty}">
        </td>
        <td>
            <select class="quote-product">
                <option value="">Seleccionar producto</option>
                ${opcionesProductos()}
            </select>
        </td>
        <td>
            <input class="quote-price" type="number" min="0" step="0.01" value="${product ? product.precio : 0}">
        </td>
        <td>
            <output class="quote-line-total">L 0.00</output>
        </td>
        <td class="no-print">
            <button class="quote-remove-line" type="button" aria-label="Eliminar linea" title="Eliminar">X</button>
        </td>
    `;
    row.querySelector('.quote-product').value = product ? product.codigo : '';
    tableBody.appendChild(row);
    updateQuoteTotals();
}

function getLineData(row) {
    const code = row.querySelector('.quote-product').value;
    const product = code ? findProduct(code) : { codigo: '', producto: 'Producto sin seleccionar', precio: 0 };
    const qty = Number(row.querySelector('.quote-qty').value) || 0;
    const price = Number(row.querySelector('.quote-price').value) || 0;
    return { product, qty, price, total: qty * price };
}

function updateQuoteTotals() {
    const tableBody = document.getElementById('quote-lines');
    const inputLabor = document.getElementById('quote-labor');
    const outputSubtotal = document.getElementById('quote-subtotal');
    const outputTotal = document.getElementById('quote-total');
    
    let productsTotal = 0;
    
    tableBody.querySelectorAll('tr').forEach(row => {
        const line = getLineData(row);
        row.querySelector('.quote-line-total').textContent = formatMoney(line.total);
        productsTotal += line.total;
    });

    const laborTotal = Number(inputLabor.value) || 0;
    const total = productsTotal + laborTotal;

    outputSubtotal.textContent = formatMoney(productsTotal);
    outputTotal.textContent = formatMoney(total);
}

function resetQuote() {
    const tableBody = document.getElementById('quote-lines');
    tableBody.innerHTML = '';
    
    document.getElementById('quote-labor').value = 0;
    document.getElementById('quote-client').value = '';
    
    const now = new Date();
    document.getElementById('quote-date').value = now.toLocaleString('es-HN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const randNum = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('quote-number').value = randNum;
    document.getElementById('quote-client-id').value = randNum;
    
    createQuoteLine('', 1); // Agregar línea vacía por defecto
    updateQuoteTotals();
}

// Event delegation para el cotizador
document.getElementById('quote-lines')?.addEventListener('input', e => {
    if (e.target.matches('.quote-qty, .quote-price')) updateQuoteTotals();
});

document.getElementById('quote-lines')?.addEventListener('change', e => {
    if (e.target.matches('.quote-product')) {
        const code = e.target.value;
        const product = code ? findProduct(code) : null;
        e.target.closest('tr').querySelector('.quote-price').value = product ? product.precio : 0;
        updateQuoteTotals();
    }
});

document.getElementById('quote-lines')?.addEventListener('click', e => {
    if (e.target.matches('.quote-remove-line')) {
        e.target.closest('tr').remove();
        updateQuoteTotals();
    }
});

document.getElementById('quote-labor')?.addEventListener('input', updateQuoteTotals);
document.getElementById('quote-add-line')?.addEventListener('click', () => createQuoteLine('', 1));
document.getElementById('quote-clear')?.addEventListener('click', resetQuote);


/* -- Impresión del Cotizador -- */
function getPrintableValue(control) {
    if (control.tagName === 'SELECT') {
        const selected = control.options[control.selectedIndex];
        return selected && control.value ? selected.text.replace(/^N-\d+\s+-\s+/, '') : '';
    }
    return control.tagName === 'OUTPUT' ? control.textContent : control.value;
}

function convertControlsToText(source, copy) {
    const sourceControls = source.querySelectorAll('input, select, output');
    copy.querySelectorAll('input, select, output').forEach((control, index) => {
        const sourceControl = sourceControls[index] || control;
        const span = document.createElement('span');
        span.className = `quote-print-value ${sourceControl.className || ''}`.trim();
        span.textContent = getPrintableValue(sourceControl);
        control.replaceWith(span);
    });
}

function preparePrintSheet() {
    document.querySelector('.quote-print-sheet')?.remove();
    
    // Solo imprimir si estamos en el tab de cotizaciones
    if (!document.getElementById('tab-cotizaciones').classList.contains('active')) return;

    const sheet = document.createElement('div');
    sheet.className = 'quote-print-sheet';

    const source = document.getElementById('quote-document');
    if(!source) return;

    const copy1 = source.cloneNode(true);
    copy1.removeAttribute('id');
    copy1.classList.add('quote-print-copy');
    copy1.querySelectorAll('.no-print').forEach(el => el.remove());
    convertControlsToText(source, copy1);

    const copy2 = copy1.cloneNode(true);

    sheet.append(copy1, copy2);
    document.body.appendChild(sheet);
}

window.addEventListener('beforeprint', () => {
    updateQuoteTotals();
    preparePrintSheet();
});

window.addEventListener('afterprint', () => {
    document.querySelector('.quote-print-sheet')?.remove();
});

document.getElementById('quote-print')?.addEventListener('click', () => {
    updateQuoteTotals();
    window.print();
});


/* -- WhatsApp del Cotizador -- */
document.getElementById('quote-whatsapp')?.addEventListener('click', () => {
    const rows = Array.from(document.getElementById('quote-lines').querySelectorAll('tr'))
        .map(getLineData)
        .filter(line => line.qty > 0 && line.product.codigo);
        
    if(rows.length === 0) {
        showToast('Agrega productos para enviar la cotización.', 'error');
        return;
    }

    const rowsText = rows.map(line => `- ${line.qty} x ${line.product.producto} (${formatMoney(line.price)}): ${formatMoney(line.total)}`).join('\n');
    
    const clientName = document.getElementById('quote-client').value || 'Sin nombre';
    const sellerName = document.getElementById('quote-seller').value || 'Sin vendedor';
    const number = document.getElementById('quote-number').value;
    
    const productsTotal = rows.reduce((s,l) => s + l.total, 0);
    const laborTotal = Number(document.getElementById('quote-labor').value) || 0;
    const total = productsTotal + laborTotal;

    const msg = [
        `*COTIZACIÓN PVC SOLUTIONS*`,
        `Factura: ${number}`,
        `Cliente: ${clientName}`,
        `Vendedor: ${sellerName}`,
        ``,
        rowsText,
        ``,
        `Total productos: ${formatMoney(productsTotal)}`,
        `Mano de obra: ${formatMoney(laborTotal)}`,
        `*Total general: ${formatMoney(total)}*`,
        ``,
        `_Gracias por preferir PVC SOLUTIONS HN_`
    ].join('\n');

    window.open(`https://wa.me/50494078458?text=${encodeURIComponent(msg)}`, '_blank');
});

/* -- Utilidades para el Canvas de la Cotización -- */
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let line = '';
    let currentY = y;
    words.forEach(word => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, currentY);
            line = word;
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    });
    if (line) ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
}

function getWrappedCanvasLines(ctx, text, maxWidth) {
    const words = String(text).split(' ');
    const lines = [];
    let line = '';
    words.forEach(word => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    });
    if (line) lines.push(line);
    return lines.length || 1;
}

function drawFallbackLogo(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(95, 95, 58, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0d2b47';
    ctx.stroke();
    ctx.fillStyle = '#2e8bbd';
    ctx.font = '700 26px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PVC', 95, 91);
    ctx.fillStyle = '#0d2b47';
    ctx.font = '700 15px Segoe UI, Arial';
    ctx.fillText('SOLUTIONS', 95, 114);
    ctx.restore();
}

function loadQuoteLogo() {
    return new Promise(resolve => {
        if (window.location.protocol === 'file:') return resolve(null);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = 'img/logo.svg';
    });
}

function saveCanvasAsPng(canvas, filename) {
    const downloadBlob = blob => {
        if (!blob) {
            alert('No se pudo generar la imagen. Proba abrir la pagina desde un servidor local o GitHub Pages.');
            return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    try {
        canvas.toBlob(downloadBlob, 'image/png');
    } catch (error) {
        alert('No se pudo descargar la imagen en modo local. Proba abriendo la pagina con Live Server o desde GitHub Pages.');
    }
}

/* -- Descargar como IMAGEN (Canvas nativo) -- */
document.getElementById('quote-download-img')?.addEventListener('click', async () => {
    updateQuoteTotals();
    showToast('Generando imagen de alta resolución, un momento...', 'info');

    const rows = Array.from(document.getElementById('quote-lines').querySelectorAll('tr'))
        .map(getLineData)
        .filter(line => line.product && line.qty > 0);

    const width = 1200;
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = '16px Segoe UI, Arial';
    const rowHeights = rows.map(line => Math.max(34, getWrappedCanvasLines(measureCtx, line.product.producto, 520) * 18 + 16));
    const rowsHeight = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0);
    const height = Math.max(860, 760 + rowsHeight);
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const logo = await loadQuoteLogo();
    if (logo) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(95, 95, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, 35, 35, 120, 120);
        ctx.restore();
    } else {
        drawFallbackLogo(ctx);
    }

    ctx.fillStyle = '#00284c';
    ctx.font = '700 26px Segoe UI, Arial';
    ctx.fillText('PVC SOLUTIONS', 190, 78);
    ctx.font = '18px Segoe UI, Arial';
    ctx.fillText('Material de pura calidad al mejor precio', 190, 106);

    ctx.font = '700 18px Segoe UI, Arial';
    ctx.fillText('Fecha:', 820, 72);
    ctx.fillText(document.getElementById('quote-date').value, 930, 72);
    ctx.fillText('N. de factura:', 820, 106);
    ctx.fillText(document.getElementById('quote-number').value, 975, 106);
    ctx.fillText('Id. del cliente:', 820, 140);
    ctx.fillText(document.getElementById('quote-client-id').value || '', 975, 140);

    ctx.strokeStyle = '#0d2b47';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(34, 180);
    ctx.lineTo(width - 34, 180);
    ctx.stroke();

    ctx.fillStyle = '#001b35';
    ctx.font = '17px Segoe UI, Arial';
    ctx.fillText('PVC SOLUTIONS HN', 190, 222);
    ctx.fillText('RESIDENCIAL COSTAS DEL SOL ETAPA 4', 190, 252);
    ctx.fillText('San Pedro Sula, 21101', 190, 282);
    ctx.fillText('9407-8458', 190, 312);

    ctx.fillStyle = '#1b5f98';
    ctx.fillRect(34, 342, 560, 34);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 19px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Vendedor', 174, 365);
    ctx.fillText('Cliente', 454, 365);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#c6eafa';
    ctx.fillRect(34, 376, 560, 34);
    ctx.fillStyle = '#001b35';
    ctx.font = '18px Segoe UI, Arial';
    ctx.fillText(document.getElementById('quote-seller').value || '', 48, 399);
    ctx.fillText(document.getElementById('quote-client').value || '', 328, 399);

    const tableY = 460;
    ctx.fillStyle = '#0d6da9';
    ctx.fillRect(34, tableY, width - 68, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 17px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cant.', 92, tableY + 24);
    ctx.fillText('Descripcion', 430, tableY + 24);
    ctx.fillText('Precio por unidad', 830, tableY + 24);
    ctx.fillText('Total de linea', 1040, tableY + 24);
    ctx.textAlign = 'left';

    ctx.font = '16px Segoe UI, Arial';
    let y = tableY + 36;
    rows.forEach((line, index) => {
        const rowHeight = rowHeights[index];
        ctx.fillStyle = index % 2 === 0 ? '#c6eafa' : '#ffffff';
        ctx.fillRect(34, y, width - 68, rowHeight);
        ctx.fillStyle = '#001b35';
        ctx.fillText(String(line.qty), 48, y + 23);
        wrapCanvasText(ctx, line.product.producto, 190, y + 23, 520, 18);
        ctx.textAlign = 'right';
        ctx.fillText(formatMoney(line.price), 900, y + 23);
        ctx.font = '700 16px Segoe UI, Arial';
        ctx.fillText(formatMoney(line.total), width - 54, y + 23);
        ctx.font = '16px Segoe UI, Arial';
        ctx.textAlign = 'left';
        y += rowHeight;
    });

    const productsTotal = rows.reduce((s,l) => s + l.total, 0);
    const laborTotal = Number(document.getElementById('quote-labor').value) || 0;
    const total = productsTotal + laborTotal;

    y += 18;
    ctx.strokeStyle = '#0d2b47';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(width - 34, y);
    ctx.stroke();

    y += 34;
    ctx.font = '700 18px Segoe UI, Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#001b35';
    ctx.fillText('Total productos', 925, y);
    ctx.fillStyle = '#c6eafa';
    ctx.fillRect(950, y - 24, 196, 30);
    ctx.fillStyle = '#001b35';
    ctx.font = '17px Segoe UI, Arial';
    ctx.fillText(formatMoney(productsTotal), 1134, y);

    y += 38;
    ctx.font = '700 18px Segoe UI, Arial';
    ctx.fillText('Mano de obra', 925, y);
    ctx.fillStyle = '#c6eafa';
    ctx.fillRect(950, y - 24, 196, 30);
    ctx.fillStyle = '#001b35';
    ctx.font = '17px Segoe UI, Arial';
    ctx.fillText(formatMoney(laborTotal), 1134, y);

    y += 44;
    ctx.font = '700 20px Segoe UI, Arial';
    ctx.fillText('Total general', 925, y);
    ctx.fillStyle = '#c6eafa';
    ctx.fillRect(950, y - 27, 196, 34);
    ctx.fillStyle = '#001b35';
    ctx.fillText(formatMoney(total), 1134, y);

    ctx.textAlign = 'center';
    ctx.font = '17px Segoe UI, Arial';
    ctx.fillText('Todas las facturas de compras se extenderan a nombre de la empresa: PVC SOLUTIONS HN', width / 2, height - 74);
    ctx.font = '700 20px Segoe UI, Arial';
    ctx.fillText('Gracias por su confianza.', width / 2, height - 36);

    const clientName = document.getElementById('quote-client').value.trim() || 'cotizacion';
    const number = document.getElementById('quote-number').value || 'pvc';
    const fileName = `PVC_Cotizacion_${clientName}_${number}.png`.replace(/\s+/g, '_');

    saveCanvasAsPng(canvas, fileName);
    showToast('✅ Imagen descargada', 'success');
});

/* -- Descargar como PDF (2 copias via print) -- */
document.getElementById('quote-download-pdf')?.addEventListener('click', () => {
    updateQuoteTotals();
    window.print();
});




/* ── INICIALIZACIÓN ── */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    
    // Verificar sesión al cargar
    checkSession();
});

/* ── EXTRAS (Scroll Top) ── */
const scrollTopBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.hidden = false;
    } else {
        scrollTopBtn.hidden = true;
    }
});
scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const appNav = document.getElementById('app-nav');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    appNav.classList.toggle('nav-open');
});

// Cerrar menú al hacer clic en un tab
appNav?.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        hamburger.classList.remove('open');
        appNav.classList.remove('nav-open');
    });
});

// Botones móviles de logout y tema
document.getElementById('btn-logout-mobile')?.addEventListener('click', handleLogout);
document.getElementById('theme-toggle-mobile')?.addEventListener('click', () => {
    document.getElementById('theme-toggle').click();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById('theme-toggle-mobile').textContent = isDark ? '☀️' : '🌙';
});


// ── FAQ CHATBOT (100% Offline, sin API) ──
const FAQ = {
    facturas: {
        label: '📊 Facturas',
        questions: [
            {
                q: '¿Cómo subo una nueva factura?',
                a: 'Ve a la pestaña 📊 Facturas, llena el nombre del cliente, su número de WhatsApp, adjunta la foto o PDF de la factura y presiona "Subir Factura". El sistema la guardará automáticamente en la nube.'
            },
            {
                q: '¿Qué pasa al subir una factura?',
                a: 'Al guardarla con éxito, el sistema abrirá tu WhatsApp para enviarle una notificación automática a la administración con los detalles del cliente. Solo tienes que presionar "Enviar".'
            },
            {
                q: '¿Por qué no puedo cambiar el estado de la factura?',
                a: 'Los cambios de estado (Pendiente → Enviada → Rechazada) y la eliminación de facturas son funciones exclusivas del administrador (Sergio Samir). Como vendedor, solo puedes subir y ver el registro.'
            },
            {
                q: '¿Cómo busco una factura específica?',
                a: 'Usa la barra de búsqueda 🔍 "Buscar cliente..." que aparece arriba del listado. Escribe parte del nombre y el sistema filtrará las facturas en tiempo real.'
            },
            {
                q: '¿Puedo subir un PDF como factura?',
                a: 'Sí. El sistema acepta tanto imágenes (JPEG, PNG) como archivos PDF. Si la imagen pesa más de 2 MB, el sistema la comprimirá automáticamente antes de subirla.'
            }
        ]
    },
    cotizaciones: {
        label: '📝 Cotizaciones',
        questions: [
            {
                q: '¿Cómo creo una cotización?',
                a: 'Ve a la pestaña 📝 Cotizaciones. El sistema pondrá tu nombre automáticamente. Escribe el nombre del cliente, agrega los productos con el botón "+ Agregar producto", ajusta las cantidades y el total se calcula al instante.'
            },
            {
                q: '¿Cómo envío la cotización por WhatsApp?',
                a: 'Presiona el botón 📱 WhatsApp en la barra de herramientas. Esto abrirá un mensaje pre-armado con todos los productos y el total listo para enviar al cliente desde tu teléfono.'
            },
            {
                q: '¿Cómo imprimo o guardo como PDF?',
                a: 'Presiona el botón 🖨️ Imprimir. Se abrirá el diálogo de impresión de tu navegador. Para guardar como PDF, elige "Guardar como PDF" en el destino de impresión. La hoja saldrá en formato profesional sin botones ni barras.'
            },
            {
                q: '¿Puedo modificar el precio de un producto?',
                a: 'Sí. Cada línea de la cotización tiene un campo de "Precio unitario" editable. Puedes ajustar el precio para ese cliente en particular sin afectar los precios generales del catálogo.'
            },
            {
                q: '¿Qué incluye la mano de obra?',
                a: 'El campo "Mano de obra" en el resumen es un monto adicional al costo de los materiales. Ingrésalo en Lempiras y se sumará automáticamente al Total General de la cotización.'
            }
        ]
    },
    cuenta: {
        label: '🔐 Mi Cuenta',
        questions: [
            {
                q: '¿Cómo entro al sistema?',
                a: 'Usa tu correo electrónico de PVC Solutions (ej: tuNombre@pvcsolutionshn.com) y la contraseña que te asignaron. Si olvidaste tu contraseña, contacta al administrador.'
            },
            {
                q: '¿Cómo cierro sesión?',
                a: 'Haz clic en el botón "Cerrar sesión" que aparece en la esquina superior derecha del menú de navegación, justo a la derecha de tu correo.'
            },
            {
                q: '¿Qué diferencia hay entre vendedor y administrador?',
                a: 'Los vendedores pueden subir facturas y crear cotizaciones. El administrador (Sergio Samir) además puede cambiar los estados de las facturas (Pendiente, Enviada, Rechazada) y eliminarlas.'
            },
            {
                q: '¿Puedo entrar desde el celular?',
                a: 'Sí. El sistema está optimizado para celulares. Puedes acceder desde cualquier navegador (Chrome, Safari, Firefox) en tu teléfono. La tabla de facturas se adapta mostrando tarjetas en pantallas pequeñas.'
            }
        ]
    },
    productos: {
        label: '📦 Productos',
        questions: [
            {
                q: '¿Cuántos productos hay en el catálogo?',
                a: 'El catálogo actual tiene 35 productos incluyendo Tablillas PVC, Cornisas, Ángulos, Furring, Tornillos, Láminas, Perfiles, WPC y más materiales de construcción y acabados.'
            },
            {
                q: '¿Cómo encuentro un producto en la cotización?',
                a: 'En cada línea de la cotización hay un menú desplegable con todos los productos ordenados por código (N-001, N-002...). Al seleccionar uno, el precio se llena automáticamente.'
            },
            {
                q: '¿Qué hago si un producto no está en el catálogo?',
                a: 'Puedes agregar una línea de producto, dejar el selector vacío y editar manualmente el campo de precio con el valor que necesites. El monto se sumará al total normalmente.'
            },
            {
                q: '¿Los precios del catálogo son en Lempiras?',
                a: 'Sí. Todos los precios del catálogo están en Lempiras Hondureños (HNL). El sistema muestra los totales con el formato L 0.00 usando la moneda local.'
            }
        ]
    },
    soporte: {
        label: '🛠️ Soporte',
        questions: [
            {
                q: '¿Qué hago si la página no carga?',
                a: 'Verifica tu conexión a internet. Si el problema persiste, intenta abrir la página en modo incógnito o borra el caché del navegador (Ctrl + Shift + R). El sistema funciona en línea y requiere conexión.'
            },
            {
                q: '¿Qué hago si me da error al subir una factura?',
                a: 'Si el error dice "permisos con Supabase", es posible que las políticas de seguridad del storage necesiten configuración. Contacta al administrador para revisar los permisos del bucket en Supabase.'
            },
            {
                q: '¿Cómo contacto al administrador?',
                a: 'Puedes escribirle directamente por WhatsApp al número registrado de PVC Solutions HN: 504 9407-8458. El sistema también envía notificaciones automáticas al número 504 9503-3358.'
            },
            {
                q: '¿La información está segura?',
                a: 'Sí. Todo el sistema usa Supabase, una plataforma segura con encriptación. Las contraseñas nunca se guardan en texto plano y el acceso requiere autenticación obligatoria.'
            }
        ]
    }
};

const aiFab = document.getElementById('ai-fab');
const aiPanel = document.getElementById('ai-panel');
const aiClose = document.getElementById('ai-close');
const aiMessages = document.getElementById('ai-messages');
const aiCategories = document.getElementById('ai-categories');
const aiBack = document.getElementById('ai-back');

function chatAddMessage(text, type = 'bot') {
    const msg = document.createElement('div');
    msg.className = `ai-message ai-message--${type}`;
    msg.innerHTML = text;
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return msg;
}

function showFAQCategories() {
    aiBack.hidden = true;
    aiCategories.hidden = false;
}

function showFAQQuestions(catKey) {
    const cat = FAQ[catKey];
    if (!cat) return;
    aiCategories.hidden = true;
    aiBack.hidden = false;

    chatAddMessage(`<strong>${cat.label}</strong><br>Selecciona tu pregunta:`, 'bot');

    const qContainer = document.createElement('div');
    qContainer.className = 'ai-questions';
    cat.questions.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'ai-q-btn';
        btn.textContent = item.q;
        btn.addEventListener('click', () => {
            // Mostrar pregunta como mensaje de usuario
            chatAddMessage(item.q, 'user');
            // Respuesta del bot
            setTimeout(() => {
                chatAddMessage(item.a, 'bot');
                aiMessages.scrollTop = aiMessages.scrollHeight;
            }, 300);
        });
        qContainer.appendChild(btn);
    });
    aiMessages.appendChild(qContainer);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Eventos de categorías
aiCategories?.querySelectorAll('.ai-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => showFAQQuestions(btn.dataset.cat));
});

// Botón volver
aiBack?.addEventListener('click', () => {
    // Limpiar mensajes extras y mostrar solo el primero
    while (aiMessages.children.length > 1) {
        aiMessages.removeChild(aiMessages.lastChild);
    }
    aiMessages.appendChild(aiCategories);
    showFAQCategories();
});

aiFab?.addEventListener('click', () => {
    aiPanel.hidden = !aiPanel.hidden;
});
aiClose?.addEventListener('click', () => {
    aiPanel.hidden = true;
});

