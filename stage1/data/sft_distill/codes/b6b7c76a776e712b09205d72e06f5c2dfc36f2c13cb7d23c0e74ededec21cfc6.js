const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let currentParticleIndex = 0;
let totalParticleTypes = 10;

// 粒子配置数组
const particleConfigs = [
  { name: 'Red Fire', color: 0xff0000, speed: 200, scale: { start: 1, end: 0 }, lifespan: 1000 },
  { name: 'Blue Ice', color: 0x00ffff, speed: 150, scale: { start: 0.5, end: 1.5 }, lifespan: 1500 },
  { name: 'Green Nature', color: 0x00ff00, speed: 100, scale: { start: 0.8, end: 0.2 }, lifespan: 2000 },
  { name: 'Yellow Lightning', color: 0xffff00, speed: 300, scale: { start: 1.2, end: 0 }, lifespan: 800 },
  { name: 'Purple Magic', color: 0xff00ff, speed: 180, scale: { start: 0.6, end: 1.2 }, lifespan: 1200 },
  { name: 'Orange Flame', color: 0xff8800, speed: 220, scale: { start: 1, end: 0.3 }, lifespan: 1100 },
  { name: 'Pink Blossom', color: 0xff69b4, speed: 120, scale: { start: 0.7, end: 1.5 }, lifespan: 1800 },
  { name: 'White Snow', color: 0xffffff, speed: 80, scale: { start: 0.5, end: 0.8 }, lifespan: 2500 },
  { name: 'Cyan Water', color: 0x00ffaa, speed: 160, scale: { start: 0.9, end: 0.4 }, lifespan: 1400 },
  { name: 'Gold Star', color: 0xffd700, speed: 250, scale: { start: 1.5, end: 0 }, lifespan: 900 }
];

let particleEmitter;
let cursors;
let infoText;
let particleTextures = [];

function preload() {
  // 程序化生成粒子纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  particleConfigs.forEach((config, index) => {
    graphics.clear();
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(`particle_${index}`, 16, 16);
  });
  
  graphics.destroy();
}

function create() {
  // 创建信息文本
  infoText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  
  // 创建说明文本
  const instructionText = this.add.text(20, 80, 'Press ← → to switch particle types', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  
  // 创建状态显示文本
  const statusText = this.add.text(20, 550, '', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#888888'
  });
  statusText.setText(`Total Types: ${totalParticleTypes} | Current Index: ${currentParticleIndex}`);
  
  // 创建粒子发射器
  particleEmitter = this.add.particles(400, 300, `particle_0`, {
    speed: particleConfigs[0].speed,
    scale: particleConfigs[0].scale,
    lifespan: particleConfigs[0].lifespan,
    blendMode: 'ADD',
    frequency: 20,
    maxParticles: 200,
    angle: { min: 0, max: 360 },
    gravityY: 50
  });
  
  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 防止按键重复触发
  let leftPressed = false;
  let rightPressed = false;
  
  this.input.keyboard.on('keydown-LEFT', () => {
    if (!leftPressed) {
      leftPressed = true;
      switchParticle(-1);
      statusText.setText(`Total Types: ${totalParticleTypes} | Current Index: ${currentParticleIndex}`);
    }
  });
  
  this.input.keyboard.on('keyup-LEFT', () => {
    leftPressed = false;
  });
  
  this.input.keyboard.on('keydown-RIGHT', () => {
    if (!rightPressed) {
      rightPressed = true;
      switchParticle(1);
      statusText.setText(`Total Types: ${totalParticleTypes} | Current Index: ${currentParticleIndex}`);
    }
  });
  
  this.input.keyboard.on('keyup-RIGHT', () => {
    rightPressed = false;
  });
  
  // 切换粒子类型函数
  function switchParticle(direction) {
    currentParticleIndex += direction;
    
    // 循环索引
    if (currentParticleIndex < 0) {
      currentParticleIndex = totalParticleTypes - 1;
    } else if (currentParticleIndex >= totalParticleTypes) {
      currentParticleIndex = 0;
    }
    
    const config = particleConfigs[currentParticleIndex];
    
    // 更新粒子发射器
    particleEmitter.setTexture(`particle_${currentParticleIndex}`);
    particleEmitter.setSpeed(config.speed);
    particleEmitter.setScale(config.scale);
    particleEmitter.setLifespan(config.lifespan);
    
    // 更新信息文本
    updateInfoText();
  }
  
  // 更新信息文本函数
  function updateInfoText() {
    const config = particleConfigs[currentParticleIndex];
    infoText.setText(
      `Type ${currentParticleIndex + 1}/${totalParticleTypes}: ${config.name}\n` +
      `Speed: ${config.speed} | Lifespan: ${config.lifespan}ms`
    );
  }
  
  // 初始化显示
  updateInfoText();
  
  // 鼠标跟随效果
  this.input.on('pointermove', (pointer) => {
    particleEmitter.setPosition(pointer.x, pointer.y);
  });
}

function update(time, delta) {
  // 游戏循环更新（本例中主要逻辑在事件处理中）
}

new Phaser.Game(config);