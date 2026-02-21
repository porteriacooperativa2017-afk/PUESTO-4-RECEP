let html5QrCode = null;

// Función para mostrar Nave 1 o Nave 2
function mostrarNave(n) {
    document.getElementById('vista-nave1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('vista-nave2').style.display = n === 2 ? 'block' : 'none';
    document.getElementById('tab1').classList.toggle('active', n === 1);
    document.getElementById('tab2').classList.toggle('active', n === 2);
    document.getElementById('indicador-nave').innerText = n === 1 ? "NAVE 1: COFARMEN" : "NAVE 2: MEDICAMENTOS";
    if(html5QrCode) html5QrCode.stop(); // Detiene la cámara si cambias de pestaña
}

// Función principal del Escáner
function encenderEscaner(idContenedor) {
    const naveNum = idContenedor.includes('1') ? 1 : 2;
    
    if (html5QrCode) {
        html5QrCode.stop().then(() => iniciarCamara(idContenedor, naveNum));
    } else {
        iniciarCamara(idContenedor, naveNum);
    }
}

function iniciarCamara(idContenedor, n) {
    html5QrCode = new Html5Qrcode(idContenedor);
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            // LÓGICA PARA DNI ARGENTINO (Limpia las @)
            if (decodedText.includes('@')) {
                const datos = decodedText.split('@');
                // Formato DNI: Apellido @ Nombre @ DNI
                if (datos.length > 4) {
                    document.getElementById('chofer' + n).value = (datos[1] + " " + datos[2]).toUpperCase().trim();
                    document.getElementById('dni' + n).value = datos[4].trim();
                }
            } else {
                // Formato QR común
                document.getElementById('chofer' + n).value = decodedText.toUpperCase().trim();
            }
            
            html5QrCode.stop(); // Apaga la cámara al terminar
            alert("✅ CHOFER IDENTIFICADO");
        }
    ).catch(err => alert("Error de cámara: " + err));
}

// Lógica para mostrar campo "OTRO"
function verificarOtro(n, tipo) {
    const select = document.getElementById(tipo + n);
    const inputOtro = document.getElementById('otro_' + tipo + n);
    if (select.value === "OTRO") {
        inputOtro.style.display = "block";
    } else {
        inputOtro.style.display = "none";
    }
}

// Vista previa de Foto
function previewFoto(n) {
    const file = document.getElementById('foto' + n).files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        const img = document.getElementById('img-preview' + n);
        img.src = reader.result;
        img.style.display = "block";
    };
    if (file) reader.readAsDataURL(file);
}

// Lógica de Firmas
function setupFirma(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dibujando = false;

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 180;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    const obtenerPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); dibujando = true; const p = obtenerPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    canvas.addEventListener("touchmove", (e) => { if (!dibujando) return; e.preventDefault(); const p = obtenerPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    window.addEventListener("touchend", () => dibujando = false);
}

function limpiarFirma(n) {
    const c = document.getElementById('canvas-firma' + n);
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
}

function enviarDatos(n) {
    alert("✅ DATOS GUARDADOS EN NAVE " + n);
    location.reload();
}

// Inicializar firmas al cargar
window.onload = () => {
    setupFirma("canvas-firma1");
    setupFirma("canvas-firma2");
};