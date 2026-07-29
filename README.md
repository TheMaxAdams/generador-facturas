# 🧾 Generador de Facturas

Aplicación web para crear facturas profesionales de forma rápida, con vista previa en tiempo real y exportación directa a PDF. Pensada para freelancers y pequeños negocios que necesitan facturar sin depender de software costoso.

## ✨ Funcionalidades

- **Formulario dinámico**: agrega o elimina líneas de productos/servicios con un clic.
- **Vista previa en vivo**: la factura se actualiza en tiempo real mientras escribes.
- **Cálculo automático** de subtotal, impuestos y total (formato en euros).
- **Logo del negocio**: sube tu logo una vez y aparece automáticamente en todas tus facturas.
- **Clientes guardados**: guarda los datos de tus clientes y búscalos por nombre para autocompletar el formulario en la siguiente factura.
- **Exportación a PDF** con un solo clic, usando [html2pdf.js](https://github.com/eKoopmans/html2pdf.js).
- **Flujo continuo**: al descargar el PDF, el formulario se limpia automáticamente (excepto los datos del negocio) y el número de factura sube solo, listo para la siguiente.
- **100% del lado del cliente**: no requiere servidor ni base de datos. Los datos se guardan localmente en el navegador (`localStorage`).

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3 (diseño propio, sin frameworks)
- JavaScript (vanilla, sin librerías de UI)
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) para la exportación a PDF

## 🚀 Cómo usarlo

1. Clona este repositorio o descarga los archivos.
2. Abre `index.html` en tu navegador (recomendado: usando la extensión **Live Server** de VS Code).
3. Completa los datos de tu negocio y sube tu logo (se guardan automáticamente para la próxima vez).
4. Agrega los datos del cliente (o búscalo si ya lo guardaste antes).
5. Agrega las líneas de productos o servicios.
6. Haz clic en **Descargar PDF** — listo.

No requiere instalación de dependencias ni backend.

## 📂 Estructura del proyecto

```
├── index.html    # Estructura del formulario y la vista previa
├── style.css     # Estilos de la interfaz y del documento de factura
├── script.js     # Lógica: cálculo de totales, clientes guardados, logo y exportación a PDF
└── README.md
```

## 💡 Posibles mejoras a futuro

- Guardar un historial de facturas emitidas.
- Soporte multi-moneda.
- Backend opcional para sincronizar clientes entre dispositivos.
- Plantillas de diseño de factura seleccionables.

## 📄 Licencia

Proyecto de uso libre con fines de aprendizaje y portfolio.
