/**
  * fireworks.js by Computerpark
  * Original Script by dtrooper
  * see: https://jsfiddle.net/XWMpq/
  * Modified and redistributed under Apache 2.0 LICENSE.
  * https://github.com/computerpark/Adios2018
  */

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    mousePos = {
        x: 400,
        y: 300
    },

    // create canvas
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    particles = [],
    rockets = [],
    MAX_PARTICLES = 400;
    canvas.id = "fireworkcanvas";

function startfireworks() {

    // init
    $(document).ready(function() {
        var wrapperdiv = document.getElementById("wrapper");
        document.body.insertBefore(canvas, wrapperdiv);
        //document.body.appendChild(canvas);
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
        setInterval(launch, 800);
        setInterval(loop, 1000 / 50);
    });

    // update mouse position
    $(document).mousemove(function(e) {
        e.preventDefault();
        mousePos = {
            x: e.clientX,
            y: e.clientY
        };
    });

    // launch more rockets!!!
    $(document).mousedown(function(e) {
        for (let i = 0; i < 5; i++) {
            launchFrom(Math.random() * SCREEN_WIDTH * 2 / 3 + SCREEN_WIDTH / 6);
        }
    });
    setInterval(function() {
        for (let i = 0; i < 5; i++) {
            launchFrom(Math.random() * SCREEN_WIDTH * 2 / 3 + SCREEN_WIDTH / 6);
        }
    }, 333);
}

function stopfireworks(){
    var firework_canvas = document.getElementById("fireworkcanvas");
    var fwctx = firework_canvas.getContext('2d');
    //for(var bar=100; bar > 0; bar--) {
    //    setTimeout(function(){
    //        ctx.globalAlpha = bar * 0.01;
    //        console.log("delay" + bar);
    //    }, 200);
    //}
    var count = 0;
    for (var start = 1; start < 110; start++){
        setTimeout(function () {
            count++;
            fwctx.globalAlpha = (100-count) * 0.01;
            //console.log(count);
            if(count === 101) {
                firework_canvas.remove();
            }
        }, 33 * start);
    }

    
}

function launch() {
    launchFrom(mousePos.x);
}

function launchFrom(x) {
    if (rockets.length < 6) {
        var rocket = new Rocket(x);
        rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
        rocket.vel.y = Math.random() * -3 - 4;
        rocket.vel.x = Math.random() * 6 - 3;
        rocket.size = 8;
        rocket.shrink = 0.999;
        rocket.gravity = 0.01;
        rockets.push(rocket);
    }
}

function loop() {
    // update screen size
    if (SCREEN_WIDTH !== window.innerWidth) {
        canvas.width = SCREEN_WIDTH = window.innerWidth;
    }
    if (SCREEN_HEIGHT !== window.innerHeight) {
        canvas.height = SCREEN_HEIGHT = window.innerHeight;
    }

    // clear canvas
    context.fillStyle = "rgba(68, 138, 255)";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    updateRockets();

    updateFireworks();
}

function updateRockets() {
    var existingRockets = [];

    for (var i = 0; i < rockets.length; i++) {
        // update and render
        rockets[i].update();
        rockets[i].render(context);

        addSmoke(rockets[i].pos);

        // calculate distance with Pythagoras
        var distance = Math.sqrt(Math.pow(mousePos.x - rockets[i].pos.x, 2) + Math.pow(mousePos.y - rockets[i].pos.y, 2));

        // random chance of 1% if rockets is above the middle
        var randomChance = rockets[i].pos.y < (SCREEN_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;

        if (rockets[i].pos.y < SCREEN_HEIGHT / 3 || randomChance) {
            rockets[i].resistance = 0.98;
        }

        // Explosion rules: 1 - going down 2- close to the mouse
        if (rockets[i].pos.y < SCREEN_HEIGHT / 6 || Math.abs(rockets[i].vel.y) <= 1 || distance < 30) {
            rockets[i].explode();
        } else {
            existingRockets.push(rockets[i]);
        }
    }

    rockets = existingRockets;
}

function updateFireworks() {
    var existingParticles = [];

    for (var i = 0; i < particles.length; i++) {
        particles[i].update();

        // render and save particles that can be rendered
        if (particles[i].exists()) {
            particles[i].render(context);
            existingParticles.push(particles[i]);
        }
    }

    // update array with existing particles - old particles should be garbage collected
    particles = existingParticles;

    while (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
}

function addSmoke(pos) {
    if (Math.random() < 0.6) {
        var smoke = new Smoke(pos);
        smoke.vel.x = Math.random() - 0.5;
        particles.push(smoke);
    }
}

function Particle(pos) {
    this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0
    };
    this.vel = {
        x: 0,
        y: 0
    };
    this.shrink = .97;
    this.size = 2;

    this.resistance = 1;
    this.gravity = 0;

    this.flick = false;

    this.alpha = 1;
    this.fade = 0;
    this.color = 0;
}

Particle.prototype.update = function() {
    // apply resistance
    this.vel.x *= this.resistance;
    this.vel.y *= this.resistance;

    // gravity down
    this.vel.y += this.gravity;

    // update position based on speed
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // shrink
    this.size *= this.shrink;

    // fade out
    this.alpha -= this.fade;
};

Particle.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
    gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
    gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
};

Particle.prototype.exists = function() {
    return this.alpha >= 0.1 && this.size >= 1;
};

function Rocket(x) {
    Particle.apply(this, [{
        x: x,
        y: SCREEN_HEIGHT}]);

    this.explosionColor = 0;
}

Rocket.prototype = new Particle();
Rocket.prototype.explode = function() {

    // decide explosion shape for this rocket
    var explosionFunction;
    switch (Math.floor(Math.random() * 4)) {
    case 0:
        explosionFunction = heartShape;
        break;
    case 1:
        explosionFunction = starShape;
        break;
    default:
        explosionFunction = sphereShape;
    }

    // number of particles to be generated
    var count = Math.random() * 10 + 70;

    // create particles
    for (var i = 0; i < count; i++) {
        var particle = new Particle(this.pos);

        // delegate to a random chosen function
        particle.vel = explosionFunction();

        particle.size = 10;

        particle.gravity = 0.2;
        particle.resistance = 0.92;
        particle.shrink = Math.random() * 0.05 + 0.93;

        particle.flick = true;
        particle.color = this.explosionColor;

        particles.push(particle);
    }
};

Rocket.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    c.fillStyle = "rgb(255, 200, 0)"; // orange
    c.beginPath();

    // draw several particles for each rocket position
    for (var i = 0; i < 5; i++) {
        var angle = Math.random() * Math.PI * 2,
            pos = Math.random() * this.size / 2; // use size like radius
        // draw several 1px particles
        c.arc(this.pos.x + Math.cos(angle) * pos, this.pos.y + Math.sin(angle) * pos, 1.2, 0, Math.PI * 2, true);
    }
    c.closePath();
    c.fill();

    c.restore();
};

function Smoke(pos) {
    Particle.apply(this, [pos]);
    this.size = 1;
    this.vel.x = Math.random() * 0.01;
    this.vel.y = Math.random() * 0.01;
    this.gravity = -0.2;
    this.resistance = 0.01;
    this.shrink = 1.03;
    this.fade = Math.random() * 0.03 + 0.02;
    this.alpha = 1;
    this.start = 0;
}

Smoke.prototype = new Particle();
Smoke.prototype.constructor = Smoke;

Smoke.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositionOperation = "lighter";

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(119, 170, 255," + this.alpha + ")");
    gradient.addColorStop(1, "rgba(222, 222, 222 ," + this.alpha + ")");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2, true);
    c.lineTo(this.pos.x, this.pos.y);
    c.closePath();
    c.fill();

    c.restore();
};

Particle.prototype.exists = function() {
    return this.alpha >= 0.01;
};

function sphereShape() {
    var angle = Math.random() * Math.PI * 2;

    // emulate 3D effect by using cosine and put more particles in the middle
    var speed = Math.cos(Math.random() * Math.PI / 2) * 11;

    return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

function starShape() {
    var angle = Math.random() * Math.PI * 2;
    // sin(5*r) creates a star, need to add PI to rotate 180 degrees
    var speed = Math.sin(5 * angle + Math.PI) * 9 + Math.random() * 3;

    return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

function heartShape() {
    var angle = Math.random() * Math.PI * 2;

    var speed = Math.random() * 0.2 + 0.5;

    // invert y speed to display heart in the right orientation
    return {
        x: (16 * Math.pow(Math.sin(angle), 3)) * speed,
        y: (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * -speed
    };
}