JavaScript
// 1. Configuração do Cenário 3D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f2f6);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3.5, 2, 4.5); // Câmera ajustada para ver a diagonal externa

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de câmera (Rotação e Zoom)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Luzes
const light1 = new THREE.DirectionalLight(0xffffff, 1.5); // Luz mais forte para detalhes externos
light1.position.set(5, 15, 10);
scene.add(light1);
const light2 = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(light2);

// Grid de referência
const grid = new THREE.GridHelper(10, 20, 0x7f8c8d, 0xbdc3c7);
grid.position.y = -0.6;
scene.add(grid);

// Materiais (Aço Galvanizado e Platibanda)
const materialAco = new THREE.MeshStandardMaterial({ color: 0x8e8e8e, roughness: 0.3, metalness: 0.9 });
const materialConcreto = new THREE.MeshLambertMaterial({ color: 0xa8a8a8 });

// Grupos
const grupoSuporteL = new THREE.Group();
const grupoApertoV = new THREE.Group();
scene.add(grupoSuporteL);
scene.add(grupoApertoV);

let platibandaMesh;

function atualizarModelo() {
    // Limpa os desenhos anteriores
    while(grupoSuporteL.children.length > 0) grupoSuporteL.remove(grupoSuporteL.children[0]);
    while(grupoApertoV.children.length > 0) grupoApertoV.remove(grupoApertoV.children[0]);
    if (platibandaMesh) scene.remove(platibandaMesh);

    // Valores reais do projeto (em metros)
    const compL = 2.193; // 2193mm
    const altL = 0.535;  // 535mm
    const largPlatibanda = parseFloat(document.getElementById('larguraPlatibanda').value) / 100; 

    // --- 1. SUPORTE EM L (FIXO E EXTERNO) ---
    // Braço Horizontal de Projeção (2.193m)
    const geomHoriz = new THREE.BoxGeometry(compL, 0.06, 0.06);
    const meshHoriz = new THREE.Mesh(geomHoriz, materialAco);
    meshHoriz.position.set(compL / 2 - 0.2, altL, 0); 
    grupoSuporteL.add(meshHoriz);

    // Coluna Vertical Externa (535mm) - Fica FORA do prédio
    const geomVertExt = new THREE.BoxGeometry(0.06, altL, 0.06);
    const meshVertExt = new THREE.Mesh(geomVertExt, materialAco);
    meshVertExt.position.set(-0.2, altL / 2, 0);
    grupoSuporteL.add(meshVertExt);

    // Mão Francesa / Diagonal (902mm) - AGORA ESTÁ EXTERNA
    const geomDiag = new THREE.BoxGeometry(0.06, 0.902, 0.06);
    const meshDiag = new THREE.Mesh(geomDiag, materialAco);
    meshDiag.rotation.z = -Math.PI / 3.33; // Inclinação oposta (~ -54°) para apontar para fora
    // Posição ajustada para conectar o braço horizontal ao tubo de 45cm externo
    meshDiag.position.set(-0.6, altL / 2 + 0.1, 0); 
    grupoSuporteL.add(meshDiag);

    // --- 2. PLATIBANDA (MURETA) ---
    const geomPlat = new THREE.BoxGeometry(largPlatibanda, altL, 0.8);
    platibandaMesh = new THREE.Mesh(geomPlat, materialConcreto);
    // Platibanda posicionada entre a coluna externa fixa e o V móvel
    platibandaMesh.position.set(-0.2 + 0.03 + largPlatibanda / 2, altL / 2, 0);
    scene.add(platibandaMesh);

    // --- 3. CONJUNTO DE REGULAGEM EM V (MÓVEL E INTERNO) ---
    // Braço Vertical Interno (535mm) - Funciona como a garra interna
    const geomVertInt = new THREE.BoxGeometry(0.06, altL, 0.06);
    const meshVertInt = new THREE.Mesh(geomVertInt, materialAco);
    meshVertInt.position.set(0, -altL / 2, 0);
    grupoApertoV.add(meshVertInt);

    // Luva Superior que desliza no braço de 2.193m
    const geomLuvaSup = new THREE.BoxGeometry(0.12, 0.07, 0.07); // Luva ligeiramente maior
    const meshLuvaSup = new THREE.Mesh(geomLuvaSup, materialAco);
    meshLuvaSup.position.set(-0.06, 0, 0);
    grupoApertoV.add(meshLuvaSup);

    // POSICIONAMENTO DINÂMICO DO "V" (SARGENTO INTERNO):
    // Move o conjunto de garra interna para trás/frente de acordo com a platibanda
    grupoApertoV.position.set(-0.2 + 0.06 + largPlatibanda + 0.03, altL, 0);
}

// Evento do Slider
document.getElementById('larguraPlatibanda').addEventListener('input', (e) => {
    document.getElementById('lblPlatibanda').innerText = e.target.value + " cm";
    atualizarModelo();
});

// Inicialização
atualizarModelo();

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});