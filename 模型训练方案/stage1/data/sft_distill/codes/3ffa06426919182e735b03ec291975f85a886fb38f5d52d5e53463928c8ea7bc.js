const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  currentParticleType: 0,
  particleTypeHistory: [],
  totalSwitches: 0
};

// 10种粒子颜色配置
const PARTICLE_CONFIGS = [
  { name: 'Red', color: 0xff0000, tint: 0xff0000 },
  { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
  { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
  { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
  { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
  { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
  { name: 'Purple', color: 0x8800ff, tint: 0x8800ff },
  { name: 'Pink', color: 0xff00ff, tint: 0xff00ff },
  { name: 'White', color: 0xffffff, tint: 0xffffff },
  { name: 'Black', color: 0x333333, tint: 0x333333 }
];

let currentTypeIndex = 0;
let particleEmitter;
let infoText;

function preload() {
  // 预加载阶段（无需外部资源）
}

function create() {
  // 创建粒子纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();

  // 创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle');
  
  particleEmitter = particles.createEmitter({
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: 50,
    blendMode: 'ADD',
    tint: PARTICLE_CONFIGS[0].tint,
    quantity: 2,
    maxParticles: 500
  });

  // 创建信息文本
  infoText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateInfoText();

  // 监听鼠标移动，粒子跟随鼠标
  this.input.on('pointermove', (pointer) => {
    particleEmitter.setPosition(pointer.x, pointer.y);
  });

  // 监听鼠标右键点击，切换粒子类型
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      switchParticleType();
    }
  });

  // 添加键盘快捷键（空格键也可切换）
  this.input.keyboard.on('keydown-SPACE', () => {
    switchParticleType();
  });

  // 初始化信号
  window.__signals__.currentParticleType = currentTypeIndex;
  window.__signals__.particleTypeHistory.push({
    type: currentTypeIndex,
    name: PARTICLE_CONFIGS[currentTypeIndex].name,
    timestamp: Date.now()
  });

  console.log('Particle System Initialized:', JSON.stringify(window.__signals__));
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentTypeIndex = (currentTypeIndex + 1) % PARTICLE_CONFIGS.length;
  
  const config = PARTICLE_CONFIGS[currentTypeIndex];
  
  // 更新粒子发射器配置
  particleEmitter.setConfig({
    speed: { min: 100 + currentTypeIndex * 20, max: 200 + currentTypeIndex * 20 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.8 + currentTypeIndex * 0.05, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 1500 + currentTypeIndex * 100,
    frequency: 30 + currentTypeIndex * 5,
    blendMode: currentTypeIndex === 9 ? 'NORMAL' : 'ADD', // 黑色用NORMAL模式
    tint: config.tint,
    quantity: 2 + Math.floor(currentTypeIndex / 3),
    rotate: { min: 0, max: 360 }
  });

  // 更新信号
  window.__signals__.currentParticleType = currentTypeIndex;
  window.__signals__.totalSwitches++;
  window.__signals__.particleTypeHistory.push({
    type: currentTypeIndex,
    name: config.name,
    timestamp: Date.now()
  });

  // 更新显示文本
  updateInfoText();

  // 输出日志
  console.log('Particle Type Switched:', JSON.stringify({
    type: currentTypeIndex,
    name: config.name,
    totalSwitches: window.__signals__.totalSwitches
  }));
}

function updateInfoText() {
  const config = PARTICLE_CONFIGS[currentTypeIndex];
  infoText.setText([
    `Current Particle: ${config.name} (${currentTypeIndex + 1}/10)`,
    `Total Switches: ${window.__signals__.totalSwitches}`,
    `Right-Click or SPACE to switch`,
    `Move mouse to control particles`
  ]);
}

function update(time, delta) {
  // 每帧更新逻辑（如需要）
}

new Phaser.Game(config);