define(['three','tween'],function(THREE,TWEEN){

	return{

		init:function(){

			var width = window.innerWidth;
			var height = window.innerHeight;

			var scene = new THREE.Scene();
			// var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
			var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			scene.add( camera );
			// scene.add( camera );

			// var renderer = new THREE.WebGLRenderer();
			var renderer = new THREE.CanvasRenderer();
			renderer.setSize(width,height);
			document.body.appendChild(renderer.domElement);

			var geometry = new THREE.CubeGeometry(1,1,1);
			var material = new THREE.MeshBasicMaterial({color: 0xff00ff});
			var cube = new THREE.Mesh(geometry, material);
			scene.add(cube);

			var particles = new THREE.Geometry;
			for(var p = 0; p < 2000; p++){
				var particle = new THREE.Vector3(Math.random() * width,Math.random() * height,Math.random() * width);
				particles.vertices.push(particle);

			}
			scene.add(particles);

			// var particleMaterial = new THREE.ParticleBasicMaterial({color:0x00ff00,size:2});

			// var particleTexture = THREE.ImageUtils.loadTexture("static/app/images/ui/particle.png");

			// var particleMaterial = new THREE.ParticleBasicMaterial({
			// 	map:particleTexture,
			// 	transparent:true,
			// 	size:5
			// });

			// var particleSystem = new THREE.ParticleSystem(particles,particleMaterial);

			// scene.add(particleSystem);

			// camera.lookAt(particleSystem.position);

			var clock = new THREE.Clock;

			var render = function () {
				window.requestAnimationFrame(render);

				var delta = clock.getDelta();
				renderer.render(scene, camera);
			};

			render();
		}
	}
});