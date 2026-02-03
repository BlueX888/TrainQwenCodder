// 完整的 Phaser3 代码
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

// 全局信号对象
window.__signals__ = {
  currentParticleType: 0,
  switchCount: 0,
  particleTypes: [],
  events: []
};

// 12种粒子颜色配置
const particleConfigs = [
  { name: 'Red', color: 0xff0000, tint: 0xff0000 },
  { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
  { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
  { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
  { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
  { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
  { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
  { name: 'Purple', color: 0x8800ff, tint: 0x8800ff },
  { name: 'Pink', color: 0xff88ff, tint: 0xff88ff },
  { name: 'Lime', color: 0x88ff00, tint: 0x88ff00 },
  { name: 'Turquoise', color: 0x00ff88, tint: 0x00ff88 },
  { name: 'Gold', color: 0xffd700, tint: 0xffd700 }
];

let currentTypeIndex = 0;
let emitter;
let infoText;

function preload() {
  // 为每种颜色创建纹理
  particleConfigs.forEach((config, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle_${index}`, 16, 16);
    graphics.destroy();
  });

  // 初始化信号
  window.__signals__.particleTypes = particleConfigs.map(c => c.name);
}

function create() {
  // 创建说明文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000aa',
    padding: { x: 10, y: 5 }
  });
  updateInfoText();

  // 创建粒子发射器
  emitter = this.add.particles(400, 300, `particle_${currentTypeIndex}`, {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: 50,
    maxParticles: 100,
    blendMode: 'ADD'
  });

  // 监听鼠标右键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      switchParticleType.call(this);
    }
  });

  // 监听鼠标移动，让粒子跟随鼠标
  this.input.on('pointermove', (pointer) => {
    emitter.setPosition(pointer.x, pointer.y);
  });

  // 记录初始状态
  logEvent('Game Started', currentTypeIndex);
}

function update(time, delta) {
  // 更新逻辑（如果需要）
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentTypeIndex = (currentTypeIndex + 1) % particleConfigs.length;
  
  // 更新粒子发射器纹理
  emitter.setTexture(`particle_${currentTypeIndex}`);
  
  // 更新信号
  window.__signals__.currentParticleType = currentTypeIndex;
  window.__signals__.switchCount++;
  
  // 更新文本
  updateInfoText();
  
  // 记录事件
  logEvent('Particle Type Switched', currentTypeIndex);
  
  // 控制台输出
  console.log(`Switched to: ${particleConfigs[currentTypeIndex].name} (${currentTypeIndex})`);
}

function updateInfoText() {
  const config = particleConfigs[currentTypeIndex];
  infoText.setText([
    `Current Particle: ${config.name} (${currentTypeIndex + 1}/12)`,
    `Switch Count: ${window.__signals__.switchCount}`,
    `Right Click to Switch`,
    `Move Mouse to Control Particles`
  ]);
}

function logEvent(eventType, particleIndex) {
  const event = {
    timestamp: Date.now(),
    type: eventType,
    particleType: particleConfigs[particleIndex].name,
    particleIndex: particleIndex,
    switchCount: window.__signals__.switchCount
  };
  
  window.__signals__.events.push(event);
  
  // 只保留最近20个事件
  if (window.__signals__.events.length > 20) {
    window.__signals__.events.shift();
  }
  
  // 输出JSON格式的日志
  console.log(JSON.stringify(event));
}

// 启动游戏
new Phaser.Game(config);