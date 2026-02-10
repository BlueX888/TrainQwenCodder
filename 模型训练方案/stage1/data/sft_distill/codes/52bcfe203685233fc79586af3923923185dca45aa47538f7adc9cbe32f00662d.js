const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 定义15种颜色
const PARTICLE_COLORS = [
  { name: 'Red', color: 0xff0000 },
  { name: 'Green', color: 0x00ff00 },
  { name: 'Blue', color: 0x0000ff },
  { name: 'Yellow', color: 0xffff00 },
  { name: 'Cyan', color: 0x00ffff },
  { name: 'Magenta', color: 0xff00ff },
  { name: 'Orange', color: 0xff8800 },
  { name: 'Purple', color: 0x8800ff },
  { name: 'Pink', color: 0xff88ff },
  { name: 'Lime', color: 0x88ff00 },
  { name: 'Teal', color: 0x008888 },
  { name: 'Navy', color: 0x000088 },
  { name: 'Gold', color: 0xffd700 },
  { name: 'Silver', color: 0xc0c0c0 },
  { name: 'White', color: 0xffffff }
];

// 全局状态信号
window.__signals__ = {
  currentParticleIndex: 0,
  particleTypeName: 'Red',
  totalSwitches: 0,
  timestamp: Date.now()
};

let currentParticleIndex = 0;
let emitter;
let infoText;

function preload() {
  // 为每种颜色创建粒子纹理
  PARTICLE_COLORS.forEach((colorData, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(colorData.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle_${index}`, 16, 16);
    graphics.destroy();
  });
}

function create() {
  // 创建信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateInfoText();

  // 创建粒子发射器
  emitter = this.add.particles(400, 300, `particle_${currentParticleIndex}`, {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    blendMode: 'ADD',
    frequency: 50,
    maxParticles: 500,
    gravityY: 0
  });

  // 监听鼠标右键事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      switchParticleType.call(this);
    }
  });

  // 监听鼠标移动，让粒子跟随鼠标
  this.input.on('pointermove', (pointer) => {
    emitter.setPosition(pointer.x, pointer.y);
  });

  // 添加键盘快捷键（空格键）作为备选切换方式
  this.input.keyboard.on('keydown-SPACE', () => {
    switchParticleType.call(this);
  });

  // 输出初始状态
  logSignal();
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentParticleIndex = (currentParticleIndex + 1) % PARTICLE_COLORS.length;
  
  // 更新粒子发射器纹理
  emitter.setTexture(`particle_${currentParticleIndex}`);
  
  // 更新全局信号
  window.__signals__.currentParticleIndex = currentParticleIndex;
  window.__signals__.particleTypeName = PARTICLE_COLORS[currentParticleIndex].name;
  window.__signals__.totalSwitches++;
  window.__signals__.timestamp = Date.now();
  
  // 更新信息文本
  updateInfoText();
  
  // 输出日志
  logSignal();
}

function updateInfoText() {
  const colorData = PARTICLE_COLORS[currentParticleIndex];
  infoText.setText([
    `Current Particle: ${colorData.name} (${currentParticleIndex + 1}/15)`,
    `Total Switches: ${window.__signals__.totalSwitches}`,
    `Right-Click or SPACE to switch`
  ]);
}

function logSignal() {
  console.log(JSON.stringify({
    event: 'particle_switch',
    currentIndex: window.__signals__.currentParticleIndex,
    particleType: window.__signals__.particleTypeName,
    totalSwitches: window.__signals__.totalSwitches,
    timestamp: window.__signals__.timestamp
  }));
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);