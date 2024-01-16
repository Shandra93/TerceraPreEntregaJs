const resultados = {
    montoTotal: 0,
    numeroCuotas: 0,
    tasaInteres: 0,
    cuotaMensual: 0,
    producto: '',
};

const configuracionPredeterminada = {
    monedaDefault: 'USD',
};

const UI = {
    mostrarMensaje: mensaje => console.log('Mensaje en la interfaz:', mensaje),
};

const calculadora = {
    inputs: [],
    resultadoDiv: null,
    calcularButton: null,
    monedaSelector: null,
    productoSelector: null,
    registros: [],

    obtenerNombreProducto(productoId) {
        switch (productoId) {
            case 'producto1':
                return 'Television 55" - LG';
            case 'producto2':
                return 'Laptop 13" - HP';
            case 'producto3':
                return 'Iphone 15 Pro - Apple';
            case 'producto4':
                return 'MacBook Pro - Apple';
            default:
                return 'Producto Desconocido';
        }
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.cargarConfiguracion();
        this.cargarRegistros();
    },

    cacheDOM() {
        this.inputs = ['montoTotal', 'numeroCuotas', 'tasaInteres'].map(id => document.getElementById(id));
        this.resultadoDiv = document.getElementById('resultado');
        this.calcularButton = document.getElementById('calcularButton');
        this.monedaSelector = document.getElementById('moneda');
        this.productoSelector = document.getElementById('catalogoProductos');

        if (!this.productoSelector) {
            console.error('Elemento con ID "catalogoProductos" no encontrado.'); 
        }
    },

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.actualizarMontoTotal();
            this.cacheDOM(); 
        });

        const limpiarCacheButton = document.getElementById('limpiarCacheButton');
        if (limpiarCacheButton) {
            limpiarCacheButton.addEventListener('click', this.limpiarCacheLocal.bind(this));
        }

        const catalogoProductos = document.getElementById('catalogoProductos');
        if (catalogoProductos) {
            catalogoProductos.addEventListener('click', this.seleccionarProducto.bind(this));
        }

        this.calcularButton.addEventListener('click', this.calcularPagoCuotas.bind(this));
    },

    cargarConfiguracion() {
        const configuracionInicial = { ...configuracionPredeterminada, ...JSON.parse(localStorage.getItem('configuracion')) };
        this.monedaSelector.value = configuracionInicial.monedaDefault;
        this.productoSelector.value = ''; 
        this.actualizarMontoTotal(); 
    },

    cargarRegistros() {
        const registrosGuardados = JSON.parse(localStorage.getItem('registros')) || [];
        this.registros = registrosGuardados;
        console.log('Registros cargados:', this.registros);
    },

    guardarRegistro() {
        this.registros.push({ ...resultados, fecha: new Date() });
        localStorage.setItem('registros', JSON.stringify(this.registros));
        console.log('Registro guardado con éxito:', resultados);
    },

    calcularPagoCuotas() {
        const inputsConValor = this.inputs.every(input => input.value.trim() !== '');

        if (!inputsConValor) {
            alert('Por favor, complete todos los campos antes de calcular.');
            return;
        }

        const sonTodosNumericos = this.inputs.every(input => !isNaN(parseFloat(input.value)));

        if (!sonTodosNumericos) {
            alert('Por favor, ingrese valores numéricos en todos los campos.');
            return;
        }

        resultados.producto = this.productoSelector.value;

        this.inputs.forEach((input, index) => {
            resultados[Object.keys(resultados)[index]] = parseFloat(input.value);
        });

        this.mostrarResultados();
        this.guardarRegistro(); 
    },

    mostrarResultados() {
        const { montoTotal, numeroCuotas, tasaInteres, producto } = resultados; 
        const monedaSeleccionada = this.monedaSelector.value;
        const cuotaMensual = this.calcularPagoMensual(montoTotal, numeroCuotas, tasaInteres, monedaSeleccionada);

        const productoSeleccionado = this.obtenerNombreProducto(producto);

        this.resultadoDiv.innerHTML = `
            <p>Producto seleccionado: ${productoSeleccionado}</p>
            <p>Precio total: ${montoTotal.toFixed(2)} ${monedaSeleccionada}</p>
            <p>El pago mensual sería de ${monedaSeleccionada}: ${cuotaMensual.toFixed(2)}</p>
            <p>Por ${numeroCuotas} meses con un interés anual del ${tasaInteres}%</p>`;
            
            

        UI.mostrarMensaje('Resultados calculados con éxito.');

        const configuracionActualizada = { monedaDefault: monedaSeleccionada };
        localStorage.setItem('configuracion', JSON.stringify(configuracionActualizada));
        console.log(`${configuracionActualizada}, Datos guardados`);
    },
    
    obtenerNombreProducto(productoId) {
        switch (productoId) {
            case 'producto1':
                return 'Television 55" - LG';
            case 'producto2':
                return 'Laptop 13" - HP';
            case 'producto3':
                return 'Iphone 15 Pro - Apple';
            case 'producto4':
                return 'MacBook Pro - Apple';
            default:
                return 'Producto Desconocido';
        }
    },
    

    calcularPagoMensual(montoTotal, numeroCuotas, tasaInteres, moneda) {
        const interesMensual = tasaInteres / 100 / 12;
        const cuotaMensual = (montoTotal * interesMensual) / (1 - Math.pow(1 + interesMensual, -numeroCuotas));

        return moneda === 'USD' ? cuotaMensual : fx(cuotaMensual).from('USD').to(moneda);
    },

    seleccionarProducto(event) {
        if (event.target.closest('.producto')) {
            const productoSeleccionado = event.target.closest('.producto').dataset.producto;
            this.productoSelector.value = productoSeleccionado;
            this.actualizarMontoTotal();
        }
    },

    actualizarMontoTotal() {
        const productoSeleccionado = this.productoSelector.value;
        const montoTotalInput = this.inputs[0];

        switch (productoSeleccionado) {
            case 'producto1':
                montoTotalInput.value = '1000';
                break;
            case 'producto2':
                montoTotalInput.value = '1500';
                break;
            case 'producto3':
                montoTotalInput.value = '2000';
                break;
            case 'producto4':
                montoTotalInput.value = '2500';
                break;
            default:
                montoTotalInput.value = '0';
                break;
        }

        montoTotalInput.disabled = productoSeleccionado === '';
    },

    limpiarCacheLocal() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esto eliminará todos los registros y la configuración almacenada. ¿Quieres continuar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, limpiar caché',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                this.registros = [];
                UI.mostrarMensaje('Caché local limpiado con éxito.');
    
                // Agregar la siguiente línea para resetear el texto de totalCarrito
                document.getElementById('resultado').innerHTML = '';
    
                // También puedes llamar a la función cargarConfiguracion() aquí si es necesario
            }
        });
    },
};

document.addEventListener('DOMContentLoaded', () => {
    fx.settings = { from: 'USD', to: 'EUR' };
    fx.base = 'USD';
    fx.rates = { EUR: 0.85, GBP: 0.73 };

    calculadora.init();
});
