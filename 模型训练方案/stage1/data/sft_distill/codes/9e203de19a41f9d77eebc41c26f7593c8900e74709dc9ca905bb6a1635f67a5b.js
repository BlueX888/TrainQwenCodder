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

// 状态信号
let currentParticleIndex = 0;
let statusText;

// 12种不同的颜色配置
const particleColors = [
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
  { name: 'Teal', color: 0x00ff88, tint: 0x00ff88 },
  { name: 'White', color: 0xffffff, tint: 0xffffff }
];

let emitter;
let spaceKey;

function preload() {
  // 预加载阶段（本例无需加载外部资源）
}

function create() {
  // 创建12种颜色的粒子纹理
  particleColors.forEach((colorConfig, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(colorConfig.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle${index}`, 16, 16);
    graphics.destroy();
  });

  // 创建粒子发射器
  emitter = this.add.particles(400, 300, `particle${currentParticleIndex}`, {
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    blendMode: 'ADD',
    frequency: 50,
    maxParticles: 200,
    tint: particleColors[currentParticleIndex].tint
  });

  // 创建状态文本显示
  statusText = this.add.text(20, 20, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();

  // 添加说明文本
  this.add.text(20, 560, 'Press SPACE to switch particle color', {
    fontSize: '18px',
    color: '#aaaaaa'
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    switchParticleType.call(this);
  });
}

function update(time, delta) {
  // 每帧更新逻辑（本例主要通过事件驱动）
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentParticleIndex = (currentParticleIndex + 1) % particleColors.length;
  
  // 更新粒子发射器的纹理和颜色
  emitter.setTexture(`particle${currentParticleIndex}`);
  emitter.setTint(particleColors[currentParticleIndex].tint);
  
  // 更新状态文本
  updateStatusText();
  
  // 输出到控制台（便于验证）
  console.log(`Switched to particle type ${currentParticleIndex}: ${particleColors[currentParticleIndex].name}`);
}

function updateStatusText() {
  const currentColor = particleColors[currentParticleIndex];
  statusText.setText(
    `Particle Type: ${currentParticleIndex + 1}/12\n` +
    `Color: ${currentColor.name}\n` +
    `Index: ${currentParticleIndex}`
  );
  statusText.setColor('#' + currentColor.color.toString(16).padStart(6, '0'));
}

const game = new Phaser.Game(config);