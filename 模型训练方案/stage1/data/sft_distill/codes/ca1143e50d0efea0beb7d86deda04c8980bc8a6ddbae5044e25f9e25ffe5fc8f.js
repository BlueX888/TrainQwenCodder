const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 8种颜色配置
const PARTICLE_COLORS = [
  { name: 'Red', color: 0xff0000, tint: 0xff0000 },
  { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
  { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
  { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
  { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
  { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
  { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
  { name: 'Purple', color: 0x8800ff, tint: 0x8800ff }
];

let currentParticleIndex = 0;
let particleEmitter;
let infoText;
let keys;

function preload() {
  // 为每种颜色创建粒子纹理
  PARTICLE_COLORS.forEach((colorConfig, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(colorConfig.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle${index}`, 16, 16);
    graphics.destroy();
  });
}

function create() {
  // 创建信息文本
  infoText = this.add.text(20, 20, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建粒子发射器
  particleEmitter = this.add.particles(400, 300, `particle${currentParticleIndex}`, {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: 50,
    maxParticles: 100,
    blendMode: 'ADD'
  });

  // 设置键盘输入
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 监听按键事件
  keys.W.on('down', () => switchParticle.call(this, 0));
  keys.A.on('down', () => switchParticle.call(this, 2));
  keys.S.on('down', () => switchParticle.call(this, 4));
  keys.D.on('down', () => switchParticle.call(this, 6));

  // 更新信息显示
  updateInfo();

  // 添加使用说明
  this.add.text(20, 550, 'Press W/A/S/D to switch particle types', {
    fontSize: '18px',
    color: '#888888'
  });
}

function update(time, delta) {
  // 循环切换粒子类型（每个按键对应2种颜色的循环）
  if (Phaser.Input.Keyboard.JustDown(keys.W)) {
    currentParticleIndex = (currentParticleIndex === 0) ? 1 : 0;
    updateParticleEmitter.call(this);
  }
  if (Phaser.Input.Keyboard.JustDown(keys.A)) {
    currentParticleIndex = (currentParticleIndex === 2) ? 3 : 2;
    updateParticleEmitter.call(this);
  }
  if (Phaser.Input.Keyboard.JustDown(keys.S)) {
    currentParticleIndex = (currentParticleIndex === 4) ? 5 : 4;
    updateParticleEmitter.call(this);
  }
  if (Phaser.Input.Keyboard.JustDown(keys.D)) {
    currentParticleIndex = (currentParticleIndex === 6) ? 7 : 6;
    updateParticleEmitter.call(this);
  }
}

function switchParticle(baseIndex) {
  // 在基础索引和基础索引+1之间切换
  if (currentParticleIndex === baseIndex) {
    currentParticleIndex = baseIndex + 1;
  } else {
    currentParticleIndex = baseIndex;
  }
  updateParticleEmitter.call(this);
}

function updateParticleEmitter() {
  // 更新粒子发射器的纹理
  particleEmitter.setTexture(`particle${currentParticleIndex}`);
  
  // 更新粒子颜色（使用tint）
  particleEmitter.setTint(PARTICLE_COLORS[currentParticleIndex].tint);
  
  // 更新信息显示
  updateInfo();
}

function updateInfo() {
  const colorConfig = PARTICLE_COLORS[currentParticleIndex];
  infoText.setText([
    `Current Particle: ${colorConfig.name}`,
    `Index: ${currentParticleIndex + 1}/8`,
    `Color: #${colorConfig.color.toString(16).padStart(6, '0').toUpperCase()}`
  ]);
  infoText.setColor(`#${colorConfig.color.toString(16).padStart(6, '0')}`);
}

new Phaser.Game(config);