const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let currentParticleIndex = 0;
let particleEmitter = null;
let statusText = null;
let cursors = null;
let lastKeyPressTime = 0;

// 8种粒子配置
const particleConfigs = [
  {
    name: 'Red Fire',
    color: 0xff0000,
    speed: { min: 100, max: 200 },
    scale: { start: 1, end: 0 },
    lifespan: 1000,
    gravityY: -50
  },
  {
    name: 'Blue Ice',
    color: 0x00ffff,
    speed: { min: 50, max: 150 },
    scale: { start: 0.8, end: 0.2 },
    lifespan: 1500,
    gravityY: 100
  },
  {
    name: 'Green Nature',
    color: 0x00ff00,
    speed: { min: 80, max: 180 },
    scale: { start: 0.6, end: 0.1 },
    lifespan: 1200,
    gravityY: 20
  },
  {
    name: 'Yellow Lightning',
    color: 0xffff00,
    speed: { min: 200, max: 400 },
    scale: { start: 1.2, end: 0 },
    lifespan: 500,
    gravityY: 0
  },
  {
    name: 'Purple Magic',
    color: 0xff00ff,
    speed: { min: 60, max: 120 },
    scale: { start: 1, end: 0.3 },
    lifespan: 2000,
    gravityY: -30
  },
  {
    name: 'Orange Flame',
    color: 0xff8800,
    speed: { min: 120, max: 220 },
    scale: { start: 0.9, end: 0 },
    lifespan: 800,
    gravityY: -80
  },
  {
    name: 'White Snow',
    color: 0xffffff,
    speed: { min: 30, max: 80 },
    scale: { start: 0.5, end: 0.1 },
    lifespan: 3000,
    gravityY: 50
  },
  {
    name: 'Pink Blossom',
    color: 0xff69b4,
    speed: { min: 90, max: 160 },
    scale: { start: 0.7, end: 0.2 },
    lifespan: 1800,
    gravityY: 10
  }
];

function preload() {
  // 创建8种颜色的粒子纹理
  particleConfigs.forEach((config, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle${index}`, 16, 16);
    graphics.destroy();
  });
}

function create() {
  // 创建粒子发射器
  const config = particleConfigs[currentParticleIndex];
  particleEmitter = this.add.particles(400, 300, `particle${currentParticleIndex}`, {
    speed: config.speed,
    scale: config.scale,
    lifespan: config.lifespan,
    gravityY: config.gravityY,
    frequency: 50,
    blendMode: 'ADD',
    emitting: true
  });

  // 创建状态文本
  statusText = this.add.text(20, 20, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();

  // 创建说明文本
  this.add.text(20, 560, 'Press LEFT/RIGHT arrows to switch particle types', {
    fontSize: '18px',
    color: '#aaaaaa'
  });

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 防抖处理，避免按键过快切换
  if (time - lastKeyPressTime < 200) {
    return;
  }

  // 检测左右键切换
  if (cursors.left.isDown) {
    currentParticleIndex = (currentParticleIndex - 1 + particleConfigs.length) % particleConfigs.length;
    switchParticleType(this);
    lastKeyPressTime = time;
  } else if (cursors.right.isDown) {
    currentParticleIndex = (currentParticleIndex + 1) % particleConfigs.length;
    switchParticleType(this);
    lastKeyPressTime = time;
  }
}

function switchParticleType(scene) {
  // 销毁旧的粒子发射器
  if (particleEmitter) {
    particleEmitter.destroy();
  }

  // 创建新的粒子发射器
  const config = particleConfigs[currentParticleIndex];
  particleEmitter = scene.add.particles(400, 300, `particle${currentParticleIndex}`, {
    speed: config.speed,
    scale: config.scale,
    lifespan: config.lifespan,
    gravityY: config.gravityY,
    frequency: 50,
    blendMode: 'ADD',
    emitting: true
  });

  // 更新状态文本
  updateStatusText();
}

function updateStatusText() {
  const config = particleConfigs[currentParticleIndex];
  statusText.setText([
    `Particle Type: ${currentParticleIndex + 1}/8`,
    `Name: ${config.name}`,
    `Color: #${config.color.toString(16).padStart(6, '0').toUpperCase()}`
  ]);
}

// 启动游戏
new Phaser.Game(config);