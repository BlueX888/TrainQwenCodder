const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 状态变量
let currentParticleIndex = 0;
let particleEmitter = null;
let infoText = null;

// 10种不同颜色的粒子配置
const particleConfigs = [
  { 
    name: 'Red Fire', 
    color: 0xff0000,
    config: {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      frequency: 50,
      angle: { min: -120, max: -60 }
    }
  },
  { 
    name: 'Blue Ice', 
    color: 0x00ffff,
    config: {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0.2 },
      blendMode: 'NORMAL',
      lifespan: 1500,
      frequency: 30,
      angle: { min: 0, max: 360 }
    }
  },
  { 
    name: 'Green Nature', 
    color: 0x00ff00,
    config: {
      speed: { min: 80, max: 180 },
      scale: { start: 1.2, end: 0.3 },
      blendMode: 'ADD',
      lifespan: 1200,
      frequency: 40,
      angle: { min: -90, max: -90 },
      gravityY: 100
    }
  },
  { 
    name: 'Yellow Lightning', 
    color: 0xffff00,
    config: {
      speed: { min: 200, max: 400 },
      scale: { start: 0.5, end: 0.1 },
      blendMode: 'ADD',
      lifespan: 500,
      frequency: 20,
      angle: { min: -180, max: 0 }
    }
  },
  { 
    name: 'Purple Magic', 
    color: 0xff00ff,
    config: {
      speed: { min: 60, max: 120 },
      scale: { start: 1, end: 0.5 },
      blendMode: 'SCREEN',
      lifespan: 2000,
      frequency: 60,
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 }
    }
  },
  { 
    name: 'Orange Ember', 
    color: 0xff8800,
    config: {
      speed: { min: 40, max: 100 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 1800,
      frequency: 45,
      angle: { min: -100, max: -80 },
      gravityY: -50
    }
  },
  { 
    name: 'Pink Blossom', 
    color: 0xff69b4,
    config: {
      speed: { min: 30, max: 80 },
      scale: { start: 1.5, end: 0.2 },
      blendMode: 'NORMAL',
      lifespan: 2500,
      frequency: 70,
      angle: { min: -110, max: -70 },
      gravityY: 30
    }
  },
  { 
    name: 'Cyan Wave', 
    color: 0x00ffaa,
    config: {
      speed: { min: 150, max: 250 },
      scale: { start: 0.6, end: 0.1 },
      blendMode: 'ADD',
      lifespan: 800,
      frequency: 25,
      angle: { min: 180, max: 180 },
      accelerationY: 200
    }
  },
  { 
    name: 'White Snow', 
    color: 0xffffff,
    config: {
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0.8 },
      blendMode: 'NORMAL',
      lifespan: 3000,
      frequency: 80,
      angle: { min: 85, max: 95 },
      gravityY: 20
    }
  },
  { 
    name: 'Gold Sparkle', 
    color: 0xffd700,
    config: {
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 600,
      frequency: 15,
      angle: { min: 0, max: 360 },
      bounce: 0.5
    }
  }
];

function preload() {
  // 程序化生成粒子纹理
  const graphics = this.add.graphics();
  
  // 为每种颜色生成纹理
  particleConfigs.forEach((config, index) => {
    graphics.clear();
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle${index}`, 16, 16);
  });
  
  graphics.destroy();
}

function create() {
  // 创建信息文本
  infoText = this.add.text(20, 20, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 创建控制提示
  this.add.text(20, 560, 'Press LEFT/RIGHT arrows to switch particle types', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
  
  // 创建粒子发射器
  particleEmitter = this.add.particles(400, 300, `particle0`);
  
  // 应用初始配置
  applyParticleConfig.call(this);
  
  // 监听键盘输入
  const cursors = this.input.keyboard.createCursorKeys();
  
  cursors.left.on('down', () => {
    currentParticleIndex = (currentParticleIndex - 1 + particleConfigs.length) % particleConfigs.length;
    applyParticleConfig.call(this);
  });
  
  cursors.right.on('down', () => {
    currentParticleIndex = (currentParticleIndex + 1) % particleConfigs.length;
    applyParticleConfig.call(this);
  });
  
  // 更新信息显示
  updateInfoText();
}

function applyParticleConfig() {
  const config = particleConfigs[currentParticleIndex];
  
  // 移除旧的发射器
  if (particleEmitter) {
    particleEmitter.destroy();
  }
  
  // 创建新的粒子发射器
  particleEmitter = this.add.particles(400, 300, `particle${currentParticleIndex}`);
  
  // 创建发射器实例
  const emitter = particleEmitter.createEmitter({
    speed: config.config.speed,
    scale: config.config.scale,
    blendMode: config.config.blendMode,
    lifespan: config.config.lifespan,
    frequency: config.config.frequency,
    angle: config.config.angle,
    gravityY: config.config.gravityY || 0,
    gravityX: config.config.gravityX || 0,
    accelerationY: config.config.accelerationY || 0,
    rotate: config.config.rotate || 0,
    bounce: config.config.bounce || 0,
    maxParticles: 200
  });
  
  updateInfoText();
}

function updateInfoText() {
  const config = particleConfigs[currentParticleIndex];
  const colorHex = '#' + config.color.toString(16).padStart(6, '0');
  
  infoText.setText([
    `Particle Type: ${currentParticleIndex + 1}/10`,
    `Name: ${config.name}`,
    `Color: ${colorHex}`,
    `Current Index: ${currentParticleIndex}`
  ]);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);