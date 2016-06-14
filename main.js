/* testing cloth simulation */
            
var pinsFormation = [];
var pins = [6];

pinsFormation.push( pins );

pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
pinsFormation.push( pins );

pins = [0];
pinsFormation.push(pins);

pins = []; // cut the rope
pinsFormation.push(pins);

pins = [0, cloth.w]; //2 pins, width of cloth
pinsFormation.push(pins);

pins = pinsFormation [1];

function togglePins() {
    
    pins = pinsFormation[ ~~ ( Math.random() * pinsFormation.length)];
    
}

if( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer;

var clothGeometry;
var sphere;
var object;

init();
animate();

function init() {
    
    container = document.createElement( "div" );
    document.body.appendChild( container );
    
    // scene
    
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);
    
    // camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 1000;
    camera.position.y = 50;
    camera.position.z = 1500;
    scene.add(camera);
    
    //lights
    
    var light, materials;
    
    scene.add(new THREE.AmbientLight(0x666666));
    
    light = new THREE.DirectionalLight(0xdfebff, 1.75);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    
    light.castShadow = true;
    
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    
    var d = 300;
    
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    
    light.shadow.camera.far = 1000;
    
    scene.add(light);
    
    //cloth material
    
    var loader = new THREE.TextureLoader();
    var clothTexture = loader.load("pattern/ignasi_pattern_s.png");
    clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.anisotropy = 16;
    
    var clothMaterial = new THREE.MeshPhongMaterial( {
        specular: 0x030303,
        map: clothTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    } );
    
    // cloth geometry
    clothGeometry = new THREE.ParametricGeometry(clothFunction, cloth.w, cloth.h);
    clothGeometry.dynamic = true;
    
    var uniforms = { texture: { type: "t", value: clothTexture } };
    var vertexShader = document.getElementById("vertexShaderDepth").textContent;
    var fragmentShader = document.getElementById("fragmentShaderDepth").textContent;
    
    //cloth mesh(the cloth object, combining everything)
    
    object = new THREE.Mesh(clothGeometry, clothMaterial);
    object.position.set(0, 0, 0);
    object.castShadow = true;
    scene.add(object);
    
    object.customDepthMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide
    } );
    
    // sphere
    
    var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20);
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaaa} );
    
    sphere = new THREE.Mesh( ballGeo, ballMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    
    //ground
    
    var groundTexture = loader.load();
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    groundTexture.anisotropy = 16;
    
    var groundMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, specular: 0x111111, map: groundTexture} );
    
    var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial );
    mesh.position.y = -250;
    mesh.rotation.x = -Math.PI/2;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    // poles
    
    var poleGeo = new THREE.BoxGeometry(5, 375, 5);
    var poleMat = new THREE.MeshPhongMaterial( {color: 0xffffff, specular: 0x111111, shininess: 100});
    
    
    // first pole
    var mesh = new THREE.Mesh( poleGeo, poleMat);
    mesh.position.x = -125;
    mesh.position.y = -62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    
    // second pole
    var mesh = new THREE.Mesh(poleGeo, poleMat);
    mesh.position.x = -125;
    mesh.position.y = -62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(255, 5, 5), poleMat);
    mesh.position.y = -250 + (750/2);
    mesh.position.x = 0;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    
    var gg = new THREE.BoxGeometry( 10, 10, 10 );
	var mesh = new THREE.Mesh( gg, poleMat );
	mesh.position.y = - 250;
	mesh.position.x = 125;
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add( mesh );
	
	var mesh = new THREE.Mesh( gg, poleMat );
	mesh.position.y = - 250;
	mesh.position.x = - 125;
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add( mesh );
    
    // renderer
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color);
    
    container.appendChild(renderer.domElement);
    
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    
    renderer.shadowMap.enabled = true;
    
    // controls
    var controls = new THREE.OrbitControls( camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1000;
    controls.maxDistance = 7500;
    
    // performance monitor
    
    stats = new Stats();
    container.appendChild(stats.dom);
    
    window.addEventListener("resize", onWindowResize, false);
    
    sphere.visible = ! true
    
}

function onWindowResize() {
    
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight);
    
}

function animate() {
    
    requestAnimationFrame(animate);
    
    var time = Date.now();
    
    windStrength = Math.cos(time / 7000) * 20 + 40;
    windForce.set( Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time/1000)).normalize().multiplyScalar(windStrength);
    
    simulate(time);
    render();
    stats.update();
    
}

function render() {
    
    var p = cloth.particles;
    
    for (var i = 0, il = p.length; i <il; i ++) {
        
        clothGeometry.vertices[ i ].copy(p[i].position);
    }
    
    clothGeometry.computeFaceNormals();
    clothGeometry.computeVertexNormals();
    
    clothGeometry.normalsNeedUpdate = true;
    clothGeometry.verticesNeedUpdate = true;
    
    sphere.position.copy(ballPosition);
    
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}