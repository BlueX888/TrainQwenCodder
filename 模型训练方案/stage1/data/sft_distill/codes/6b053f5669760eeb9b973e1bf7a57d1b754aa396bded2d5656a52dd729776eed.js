const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  currentParticleIndex: 0,
  switchCount: 0,
  particleColors: ['red', 'green', 'blue', 'yellow', 'purple'],
  totalParticlesEmitted: 0,
  lastSwitchTime: 0
};

// 粒子配置
const PARTICLE_CONFIGS = [
  { name: 'red', color: 0xff0000, speed: 100, lifespan: 2000, scale: { start: 1, end: 0 } },
  { name: 'green', color: 0x00ff00, speed: 150, lifespan: 1500, scale: { start: 0.5, end: 1.5 } },
  { name: 'blue', color: 0x0000ff, speed: 200, lifespan: 2500, scale: { start: 1.5, end: 0.2 } },
  { name: 'yellow', color: 0xffff00, speed: 120, lifespan: 1800, scale: { start: 0.8, end: 0.3 } },
  { name: 'purple', color: 0xff00ff, speed: 180, lifespan: 2200, scale: { start: 1.2, end: 0.5 } }
];

let particleEmitter;
let currentIndex = 0;
let infoText;
let particleTextures = [];

function preload() {
  // 为每种颜色创建粒子纹理
  PARTICLE_CONFIGS.forEach((config, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle_${index}`, 16, 16);
    graphics.destroy();
    particleTextures.push(`particle_${index}`);
  });
}

function create() {
  // 创建说明文字
  infoText = this.add.text(20, 20, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000aa',
    padding: { x: 10, y: 10 }
  });
  
  // 创建粒子发射器
  particleEmitter = this.add.particles(400, 300, particleTextures[0], {
    speed: PARTICLE_CONFIGS[0].speed,
    lifespan: PARTICLE_CONFIGS[0].lifespan,
    scale: PARTICLE_CONFIGS[0].scale,
    blendMode: 'ADD',
    frequency: 50,
    maxParticles: 100,
    angle: { min: 0, max: 360 },
    gravityY: 50
  });
  
  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      switchParticleType.call(this);
    }
  });
  
  // 监听鼠标移动，粒子跟随鼠标
  this.input.on('pointermove', (pointer) => {
    particleEmitter.setPosition(pointer.x, pointer.y);
  });
  
  // 初始化信息显示
  updateInfoText();
  
  // 输出初始状态
  logState('Game initialized');
}

function update(time, delta) {
  // 更新粒子发射总数
  window.__signals__.totalParticlesEmitted = particleEmitter.getAliveParticleCount();
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentIndex = (currentIndex + 1) % PARTICLE_CONFIGS.length;
  const config = PARTICLE_CONFIGS[currentIndex];
  
  // 更新粒子发射器配置
  particleEmitter.setTexture(particleTextures[currentIndex]);
  particleEmitter.setSpeed(config.speed);
  particleEmitter.setLifespan(config.lifespan);
  particleEmitter.setScale(config.scale);
  
  // 更新全局状态
  window.__signals__.currentParticleIndex = currentIndex;
  window.__signals__.switchCount++;
  window.__signals__.lastSwitchTime = Date.now();
  
  // 更新显示
  updateInfoText();
  
  // 输出日志
  logState('Particle type switched');
}

function updateInfoText() {
  const config = PARTICLE_CONFIGS[currentIndex];
  const text = `Current Particle: ${config.name.toUpperCase()}\n` +
               `Click to switch (${currentIndex + 1}/${PARTICLE_CONFIGS.length})\n` +
               `Switch Count: ${window.__signals__.switchCount}\n` +
               `Speed: ${config.speed} | Lifespan: ${config.lifespan}ms\n` +
               `Move mouse to control position`;
  infoText.setText(text);
}

function logState(action) {
  const logData = {
    timestamp: Date.now(),
    action: action,
    currentParticleIndex: window.__signals__.currentParticleIndex,
    particleType: PARTICLE_CONFIGS[currentIndex].name,
    switchCount: window.__signals__.switchCount,
    totalParticlesEmitted: window.__signals__.totalParticlesEmitted
  };
  console.log('STATE:', JSON.stringify(logData));
}

new Phaser.Game(config);