// =====================================================
// GENERADOR DE FACTURAS - script.js
// =====================================================

// Referencias a elementos del DOM que vamos a usar mucho
const tbodyLineas = document.getElementById('tbody-lineas');
const btnAgregarLinea = document.getElementById('btn-agregar-linea');
const btnExportarPDF = document.getElementById('btn-exportar-pdf');

let contadorLineas = 0; // para dar un id único a cada fila

// =====================================================
// 1. CREAR UNA NUEVA LÍNEA DE PRODUCTO/SERVICIO
// =====================================================
function crearLinea() {
  contadorLineas++;
  const idLinea = contadorLineas;

  const fila = document.createElement('tr');
  fila.dataset.id = idLinea;

  fila.innerHTML = `
    <td>
      <input type="text" class="input-descripcion" placeholder="Ej: Diseño de logo">
    </td>
    <td>
      <input type="number" class="input-cantidad" value="1" min="0" step="1">
    </td>
    <td>
      <input type="number" class="input-precio" value="0" min="0" step="0.01">
    </td>
    <td>
      <button type="button" class="btn-eliminar-linea" title="Eliminar línea">✕</button>
    </td>
  `;

  tbodyLineas.appendChild(fila);

  // Escuchar cambios en los inputs de ESTA fila para refrescar la vista previa
  fila.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', actualizarPreview);
  });

  // Botón de eliminar línea
  fila.querySelector('.btn-eliminar-linea').addEventListener('click', () => {
    fila.remove();
    actualizarPreview();
  });
}

// Botón "+ Agregar línea"
btnAgregarLinea.addEventListener('click', () => {
  crearLinea();
  actualizarPreview();
});

// =====================================================
// 2. LEER TODOS LOS DATOS DEL FORMULARIO
// =====================================================
function leerDatosFormulario() {
  const lineas = [];

  tbodyLineas.querySelectorAll('tr').forEach(fila => {
    const descripcion = fila.querySelector('.input-descripcion').value || 'Sin descripción';
    const cantidad = parseFloat(fila.querySelector('.input-cantidad').value) || 0;
    const precio = parseFloat(fila.querySelector('.input-precio').value) || 0;

    lineas.push({
      descripcion,
      cantidad,
      precio,
      total: cantidad * precio
    });
  });

  return {
    numeroFactura: document.getElementById('numero-factura').value,
    fecha: document.getElementById('fecha-factura').value,

    emisorNombre: document.getElementById('emisor-nombre').value || 'Nombre del negocio',
    emisorDireccion: document.getElementById('emisor-direccion').value,
    emisorEmail: document.getElementById('emisor-email').value,

    clienteNombre: document.getElementById('cliente-nombre').value || 'Nombre del cliente',
    clienteDireccion: document.getElementById('cliente-direccion').value,
    clienteEmail: document.getElementById('cliente-email').value,

    impuestoPorcentaje: parseFloat(document.getElementById('impuesto').value) || 0,
    notas: document.getElementById('notas').value,

    lineas
  };
}

// =====================================================
// 3. CALCULAR SUBTOTAL, IMPUESTO Y TOTAL
// =====================================================
function calcularTotales(datos) {
  const subtotal = datos.lineas.reduce((suma, linea) => suma + linea.total, 0);
  const impuesto = subtotal * (datos.impuestoPorcentaje / 100);
  const total = subtotal + impuesto;

  return { subtotal, impuesto, total };
}

// =====================================================
// 4. FORMATEAR NÚMEROS COMO MONEDA
// =====================================================
function formatoMoneda(numero) {
  return numero.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });
}

// =====================================================
// 5. ACTUALIZAR LA VISTA PREVIA CON LOS DATOS ACTUALES
// =====================================================
function actualizarPreview() {
  const datos = leerDatosFormulario();
  const { subtotal, impuesto, total } = calcularTotales(datos);

  // --- Logo ---
  const logoGuardado = cargarLogoGuardado();
  if (logoGuardado) {
    previewLogo.src = logoGuardado;
    previewLogo.style.display = 'block';
  } else {
    previewLogo.style.display = 'none';
  }

  // --- Datos del emisor ---
  document.getElementById('preview-emisor-nombre').textContent = datos.emisorNombre;
  document.getElementById('preview-emisor-direccion').textContent = datos.emisorDireccion;
  document.getElementById('preview-emisor-email').textContent = datos.emisorEmail;

  // --- Metadatos de la factura ---
  document.getElementById('preview-numero').textContent = datos.numeroFactura;
  document.getElementById('preview-fecha').textContent = formatearFecha(datos.fecha);

  // --- Datos del cliente ---
  document.getElementById('preview-cliente-nombre').textContent = datos.clienteNombre;
  document.getElementById('preview-cliente-direccion').textContent = datos.clienteDireccion;
  document.getElementById('preview-cliente-email').textContent = datos.clienteEmail;

  // --- Tabla de líneas en la vista previa ---
  const previewTbody = document.getElementById('preview-tbody');
  previewTbody.innerHTML = '';

  if (datos.lineas.length === 0) {
    previewTbody.innerHTML = `
      <tr><td colspan="4" style="color:#9ca3af; text-align:center; padding:1rem;">
        Agrega una línea para verla aquí
      </td></tr>`;
  } else {
    datos.lineas.forEach(linea => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${escapeHTML(linea.descripcion)}</td>
        <td>${linea.cantidad}</td>
        <td>${formatoMoneda(linea.precio)}</td>
        <td>${formatoMoneda(linea.total)}</td>
      `;
      previewTbody.appendChild(fila);
    });
  }

  // --- Totales ---
  document.getElementById('preview-subtotal').textContent = formatoMoneda(subtotal);
  document.getElementById('preview-porcentaje-impuesto').textContent = datos.impuestoPorcentaje;
  document.getElementById('preview-impuesto').textContent = formatoMoneda(impuesto);
  document.getElementById('preview-total').textContent = formatoMoneda(total);

  // --- Notas ---
  document.getElementById('preview-notas').textContent = datos.notas;
}

// =====================================================
// 6. HELPERS
// =====================================================
function formatearFecha(fechaISO) {
  if (!fechaISO) return '--';
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}

// Evita que texto del usuario rompa el HTML de la vista previa
function escapeHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// =====================================================
// 7. LOGO DEL NEGOCIO
// =====================================================
const CLAVE_LOGO = 'facturas_logo_negocio';

const inputLogo = document.getElementById('emisor-logo');
const logoPreviewMiniWrapper = document.getElementById('logo-preview-mini-wrapper');
const logoPreviewMini = document.getElementById('logo-preview-mini');
const btnQuitarLogo = document.getElementById('btn-quitar-logo');
const previewLogo = document.getElementById('preview-logo');

// --- Cuando el usuario elige un archivo de imagen ---
inputLogo.addEventListener('change', () => {
  const archivo = inputLogo.files[0];
  if (!archivo) return;

  // Aviso simple si el archivo es muy pesado (afecta el tamaño del PDF)
  if (archivo.size > 1024 * 1024) {
    alert('La imagen es bastante pesada (más de 1MB). Puede hacer el PDF más lento. Considera usar una más liviana.');
  }

  const lector = new FileReader();
  lector.onload = () => {
    const base64 = lector.result; // ej: "data:image/png;base64,...."
    guardarLogo(base64);
    mostrarLogoEnFormulario(base64);
    actualizarPreview();
  };
  lector.readAsDataURL(archivo);
});

// --- Quitar el logo ---
btnQuitarLogo.addEventListener('click', () => {
  localStorage.removeItem(CLAVE_LOGO);
  inputLogo.value = '';
  logoPreviewMiniWrapper.style.display = 'none';
  actualizarPreview();
});

function guardarLogo(base64) {
  localStorage.setItem(CLAVE_LOGO, base64);
}

function cargarLogoGuardado() {
  return localStorage.getItem(CLAVE_LOGO);
}

function mostrarLogoEnFormulario(base64) {
  logoPreviewMini.src = base64;
  logoPreviewMiniWrapper.style.display = 'flex';
}

// =====================================================
// 8. CLIENTES GUARDADOS (localStorage)
// =====================================================
const CLAVE_CLIENTES = 'facturas_clientes_guardados';

const inputBuscarCliente = document.getElementById('buscar-cliente');
const cajaSugerencias = document.getElementById('sugerencias-clientes');
const btnGuardarCliente = document.getElementById('btn-guardar-cliente');

// --- Leer / escribir en localStorage ---
function cargarClientesGuardados() {
  try {
    const datos = localStorage.getItem(CLAVE_CLIENTES);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error('Error leyendo clientes guardados:', error);
    return [];
  }
}

function guardarListaClientes(lista) {
  localStorage.setItem(CLAVE_CLIENTES, JSON.stringify(lista));
}

// --- Guardar (o actualizar) el cliente que está actualmente en el formulario ---
function guardarClienteActual() {
  const nombre = document.getElementById('cliente-nombre').value.trim();
  const direccion = document.getElementById('cliente-direccion').value.trim();
  const email = document.getElementById('cliente-email').value.trim();

  if (!nombre) {
    alert('Escribe al menos el nombre del cliente antes de guardarlo.');
    return;
  }

  const clientes = cargarClientesGuardados();

  // Si ya existe un cliente con el mismo nombre, lo actualizamos en vez de duplicarlo
  const indiceExistente = clientes.findIndex(
    c => c.nombre.toLowerCase() === nombre.toLowerCase()
  );

  const clienteActualizado = { nombre, direccion, email };

  if (indiceExistente >= 0) {
    clientes[indiceExistente] = clienteActualizado;
  } else {
    clientes.push(clienteActualizado);
  }

  guardarListaClientes(clientes);
  alert(`Cliente "${nombre}" guardado correctamente.`);
}

btnGuardarCliente.addEventListener('click', guardarClienteActual);

// --- Buscar clientes mientras el usuario escribe ---
function buscarClientes(texto) {
  const clientes = cargarClientesGuardados();
  const textoBusqueda = texto.trim().toLowerCase();

  if (!textoBusqueda) return [];

  return clientes.filter(c =>
    c.nombre.toLowerCase().includes(textoBusqueda)
  );
}

function mostrarSugerencias(resultados) {
  cajaSugerencias.innerHTML = '';

  if (resultados.length === 0) {
    cajaSugerencias.innerHTML = `<div class="sugerencia-vacia">Sin coincidencias</div>`;
  } else {
    resultados.forEach(cliente => {
      const item = document.createElement('div');
      item.className = 'sugerencia-item';
      item.innerHTML = `
        <div class="sugerencia-nombre">${escapeHTML(cliente.nombre)}</div>
        <div class="sugerencia-detalle">${escapeHTML(cliente.email || cliente.direccion || '')}</div>
      `;
      item.addEventListener('click', () => seleccionarCliente(cliente));
      cajaSugerencias.appendChild(item);
    });
  }

  cajaSugerencias.classList.add('visible');
}

function ocultarSugerencias() {
  cajaSugerencias.classList.remove('visible');
}

// --- Rellenar el formulario al elegir un cliente de la lista ---
function seleccionarCliente(cliente) {
  document.getElementById('cliente-nombre').value = cliente.nombre;
  document.getElementById('cliente-direccion').value = cliente.direccion;
  document.getElementById('cliente-email').value = cliente.email;

  inputBuscarCliente.value = cliente.nombre;
  ocultarSugerencias();
  actualizarPreview();
}

// --- Eventos del buscador ---
inputBuscarCliente.addEventListener('input', () => {
  const resultados = buscarClientes(inputBuscarCliente.value);
  if (inputBuscarCliente.value.trim()) {
    mostrarSugerencias(resultados);
  } else {
    ocultarSugerencias();
  }
});

// Cerrar el desplegable si el usuario hace clic fuera de él
document.addEventListener('click', (evento) => {
  const clicDentro = evento.target.closest('.buscador-wrapper');
  if (!clicDentro) ocultarSugerencias();
});

// =====================================================
// 9. EXPORTAR A PDF
// =====================================================
btnExportarPDF.addEventListener('click', () => {
  const elementoFactura = document.getElementById('factura-preview');
  const datos = leerDatosFormulario();

  const opciones = {
    margin: 10,
    filename: `factura-${datos.numeroFactura || 'sin-numero'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf()
    .set(opciones)
    .from(elementoFactura)
    .save()
    .then(() => {
      resetearFormularioParaNuevaFactura(datos.numeroFactura);
    });
});

// --- Sube en 1 el número de factura (ej: "0004" -> "0005") ---
function incrementarNumeroFactura(numeroActual) {
  const soloDigitos = numeroActual.match(/\d+/);
  if (!soloDigitos) return numeroActual; // si no hay números, lo dejamos igual

  const digitos = soloDigitos[0];
  const siguiente = (parseInt(digitos, 10) + 1).toString().padStart(digitos.length, '0');

  return numeroActual.replace(digitos, siguiente);
}

// --- Limpia el formulario dejando el negocio (emisor) intacto ---
function resetearFormularioParaNuevaFactura(numeroAnterior) {
  // Cliente
  document.getElementById('cliente-nombre').value = '';
  document.getElementById('cliente-direccion').value = '';
  document.getElementById('cliente-email').value = '';
  inputBuscarCliente.value = '';
  ocultarSugerencias();

  // Notas
  document.getElementById('notas').value = '';

  // Número de factura: lo sube automáticamente para la siguiente
  document.getElementById('numero-factura').value = incrementarNumeroFactura(numeroAnterior);

  // Fecha: la deja en hoy
  document.getElementById('fecha-factura').value = new Date().toISOString().split('T')[0];

  // Líneas: borra todas y deja una vacía para empezar de nuevo
  tbodyLineas.innerHTML = '';
  crearLinea();

  actualizarPreview();
}

// =====================================================
// 10. ESCUCHAR CAMBIOS EN LOS CAMPOS GENERALES DEL FORM
// =====================================================
document.querySelectorAll('.formulario input, .formulario textarea')
  .forEach(campo => campo.addEventListener('input', actualizarPreview));

// =====================================================
// 11. INICIALIZACIÓN AL CARGAR LA PÁGINA
// =====================================================
function inicializar() {
  // Fecha de hoy por defecto
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha-factura').value = hoy;

  // Si ya había un logo guardado de una sesión anterior, mostrarlo en el formulario
  const logoGuardado = cargarLogoGuardado();
  if (logoGuardado) {
    mostrarLogoEnFormulario(logoGuardado);
  }

  // Crear una primera línea vacía para que no se vea vacío el form
  crearLinea();

  // Pintar la vista previa por primera vez
  actualizarPreview();
}

inicializar();
