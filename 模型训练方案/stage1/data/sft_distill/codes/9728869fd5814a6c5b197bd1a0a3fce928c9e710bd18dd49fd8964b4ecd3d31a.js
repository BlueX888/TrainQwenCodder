const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  currentParticleType: 0,
  switchCount: 0,
  particleTypes: [],
  timestamp: Date.now()
};

// 15种不同颜色的粒子配置
const PARTICLE_CONFIGS = [
  { name: 'Red Fire', color: 0xff0000, speed: { min: 100, max: 200 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 1000 },
  { name: 'Blue Ice', color: 0x00ffff, speed: { min: 50, max: 100 }, scale: { start: 0.5, end: 1.5 }, alpha: { start: 0.8, end: 0 }, lifespan: 1500 },
  { name: 'Green Nature', color: 0x00ff00, speed: { min: 80, max: 150 }, scale: { start: 0.8, end: 0.2 }, alpha: { start: 1, end: 0.3 }, lifespan: 1200 },
  { name: 'Yellow Sun', color: 0xffff00, speed: { min: 120, max: 250 }, scale: { start: 1.2, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 800 },
  { name: 'Purple Magic', color: 0xff00ff, speed: { min: 60, max: 120 }, scale: { start: 0.6, end: 1.2 }, alpha: { start: 0.9, end: 0 }, lifespan: 1400 },
  { name: 'Orange Flame', color: 0xff8800, speed: { min: 100, max: 180 }, scale: { start: 1, end: 0.3 }, alpha: { start: 1, end: 0 }, lifespan: 1000 },
  { name: 'Pink Blossom', color: 0xff69b4, speed: { min: 40, max: 90 }, scale: { start: 0.7, end: 1.5 }, alpha: { start: 0.8, end: 0 }, lifespan: 1600 },
  { name: 'Teal Wave', color: 0x008080, speed: { min: 70, max: 140 }, scale: { start: 0.9, end: 0.4 }, alpha: { start: 1, end: 0.2 }, lifespan: 1300 },
  { name: 'White Snow', color: 0xffffff, speed: { min: 30, max: 80 }, scale: { start: 0.5, end: 1 }, alpha: { start: 0.9, end: 0 }, lifespan: 2000 },
  { name: 'Gold Spark', color: 0xffd700, speed: { min: 150, max: 300 }, scale: { start: 1.5, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 600 },
  { name: 'Lime Energy', color: 0x00ff7f, speed: { min: 90, max: 160 }, scale: { start: 0.8, end: 0.5 }, alpha: { start: 1, end: 0 }, lifespan: 1100 },
  { name: 'Indigo Mystery', color: 0x4b0082, speed: { min: 50, max: 110 }, scale: { start: 1, end: 0.6 }, alpha: { start: 0.9, end: 0 }, lifespan: 1500 },
  { name: 'Crimson Blood', color: 0xdc143c, speed: { min: 110, max: 200 }, scale: { start: 1.1, end: 0.2 }, alpha: { start: 1, end: 0 }, lifespan: 900 },
  { name: 'Aqua Ocean', color: 0x00bfff, speed: { min: 60, max: 130 }, scale: { start: 0.7, end: 1.3 }, alpha: { start: 0.85, end: 0 }, lifespan: 1400 },
  { name: 'Silver Moon', color: 0xc0c0c0, speed: { min: 80, max: 150 }, scale: { start: 0.9, end: 0.3 }, alpha: { start: 0.95, end: 0 }, lifespan: 1200 }
];

let currentTypeIndex = 0;
let particleEmitter;
let infoText;
let historyText;
let switchHistory = [];

function preload() {
  // 为每种颜色创建纹理
  PARTICLE_CONFIGS.forEach((config, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle_${index}`, 16, 16);
    graphics.destroy();
  });
}

function create() {
  // 初始化信号
  window.__signals__.particleTypes = PARTICLE_CONFIGS.map(c => c.name);
  
  // 创建粒子发射器
  const config = PARTICLE_CONFIGS[currentTypeIndex];
  particleEmitter = this.add.particles(400, 300, `particle_${currentTypeIndex}`, {
    speed: config.speed,
    scale: config.scale,
    alpha: config.alpha,
    lifespan: config.lifespan,
    blendMode: 'ADD',
    frequency: 50,
    maxParticles: 200,
    angle: { min: 0, max: 360 }
  });

  // 信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 历史记录文本
  historyText = this.add.text(10, 50, '', {
    fontSize: '14px',
    color: '#aaaaaa',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateInfoText();

  // 监听鼠标右键事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      switchParticleType.call(this);
    }
  });

  // 监听鼠标移动，让粒子跟随鼠标
  this.input.on('pointermove', (pointer) => {
    particleEmitter.setPosition(pointer.x, pointer.y);
  });

  // 提示文本
  this.add.text(400, 580, 'Right Click to Switch Particle Type | Move Mouse to Control Position', {
    fontSize: '16px',
    color: '#ffff00',
    align: 'center'
  }).setOrigin(0.5);

  console.log('Game initialized with signals:', window.__signals__);
}

function update(time, delta) {
  // 更新时间戳
  window.__signals__.timestamp = Date.now();
}

function switchParticleType() {
  // 切换到下一个类型
  currentTypeIndex = (currentTypeIndex + 1) % PARTICLE_CONFIGS.length;
  const config = PARTICLE_CONFIGS[currentTypeIndex];

  // 更新粒子发射器配置
  particleEmitter.setTexture(`particle_${currentTypeIndex}`);
  particleEmitter.setSpeed(config.speed);
  particleEmitter.setScale(config.scale);
  particleEmitter.setAlpha(config.alpha);
  particleEmitter.setLifespan(config.lifespan);

  // 更新信号
  window.__signals__.currentParticleType = currentTypeIndex;
  window.__signals__.switchCount++;

  // 记录切换历史
  switchHistory.push({
    index: currentTypeIndex,
    name: config.name,
    time: Date.now()
  });

  // 只保留最近5次记录
  if (switchHistory.length > 5) {
    switchHistory.shift();
  }

  updateInfoText();

  // 输出日志
  console.log(JSON.stringify({
    event: 'particle_type_switched',
    currentType: config.name,
    typeIndex: currentTypeIndex,
    switchCount: window.__signals__.switchCount,
    timestamp: Date.now()
  }));
}

function updateInfoText() {
  const config = PARTICLE_CONFIGS[currentTypeIndex];
  infoText.setText(
    `Current Type: ${config.name} (${currentTypeIndex + 1}/15)\n` +
    `Switch Count: ${window.__signals__.switchCount}\n` +
    `Color: #${config.color.toString(16).padStart(6, '0')}`
  );

  // 更新历史记录
  const historyLines = switchHistory.map((h, i) => 
    `${i + 1}. ${h.name}`
  );
  historyText.setText('Recent Switches:\n' + historyLines.join('\n'));
}

new Phaser.Game(config);