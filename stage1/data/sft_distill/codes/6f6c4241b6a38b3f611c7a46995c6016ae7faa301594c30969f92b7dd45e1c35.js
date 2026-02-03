const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 全局状态变量
let currentParticleIndex = 0;
let particleEmitter = null;
let infoText = null;
let cursors = null;
let canSwitch = true;
let switchCooldown = 300; // 切换冷却时间（毫秒）
let lastSwitchTime = 0;

// 12种粒子颜色配置
const particleConfigs = [
  { name: 'Red Fire', color: 0xff0000, tint: [0xff0000, 0xff6600, 0xffaa00] },
  { name: 'Blue Ice', color: 0x0088ff, tint: [0x0088ff, 0x00ccff, 0xaaffff] },
  { name: 'Green Nature', color: 0x00ff00, tint: [0x00ff00, 0x88ff00, 0xccff88] },
  { name: 'Purple Magic', color: 0x8800ff, tint: [0x8800ff, 0xaa44ff, 0xcc88ff] },
  { name: 'Yellow Lightning', color: 0xffff00, tint: [0xffff00, 0xffff88, 0xffffcc] },
  { name: 'Cyan Water', color: 0x00ffff, tint: [0x00ffff, 0x88ffff, 0xccffff] },
  { name: 'Orange Flame', color: 0xff8800, tint: [0xff8800, 0xffaa44, 0xffcc88] },
  { name: 'Pink Blossom', color: 0xff00ff, tint: [0xff00ff, 0xff88ff, 0xffccff] },
  { name: 'White Snow', color: 0xffffff, tint: [0xffffff, 0xcccccc, 0xaaaaaa] },
  { name: 'Lime Energy', color: 0x88ff00, tint: [0x88ff00, 0xaaff44, 0xccff88] },
  { name: 'Teal Ocean', color: 0x008888, tint: [0x008888, 0x00aaaa, 0x44cccc] },
  { name: 'Gold Treasure', color: 0xffaa00, tint: [0xffaa00, 0xffcc44, 0xffdd88] }
];

function preload() {
  // 创建粒子纹理
  const graphics = this.add.graphics();
  
  // 创建圆形粒子纹理
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 添加标题
  this.add.text(400, 30, 'Particle Color Showcase', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 添加操作提示
  this.add.text(400, 70, 'Press LEFT/RIGHT arrows to switch particle types', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 添加当前粒子信息文本
  infoText = this.add.text(400, 550, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 初始化第一个粒子发射器
  createParticleEmitter(this, currentParticleIndex);
  updateInfoText();
}

function update(time, delta) {
  const currentTime = time;

  // 检测左右键切换
  if (canSwitch && (currentTime - lastSwitchTime) > switchCooldown) {
    if (cursors.left.isDown) {
      currentParticleIndex = (currentParticleIndex - 1 + particleConfigs.length) % particleConfigs.length;
      switchParticleType(this);
      lastSwitchTime = currentTime;
      canSwitch = false;
    } else if (cursors.right.isDown) {
      currentParticleIndex = (currentParticleIndex + 1) % particleConfigs.length;
      switchParticleType(this);
      lastSwitchTime = currentTime;
      canSwitch = false;
    }
  }

  // 重置切换标志
  if (!cursors.left.isDown && !cursors.right.isDown) {
    canSwitch = true;
  }
}

function createParticleEmitter(scene, index) {
  const config = particleConfigs[index];
  
  // 销毁旧的发射器
  if (particleEmitter) {
    particleEmitter.destroy();
  }

  // 创建新的粒子发射器
  particleEmitter = scene.add.particles(400, 300, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    blendMode: 'ADD',
    frequency: 50,
    maxParticles: 100,
    tint: config.tint,
    gravityY: -50,
    rotate: { min: 0, max: 360 },
    emitZone: {
      type: 'random',
      source: new Phaser.Geom.Circle(0, 0, 20)
    }
  });
}

function switchParticleType(scene) {
  createParticleEmitter(scene, currentParticleIndex);
  updateInfoText();
}

function updateInfoText() {
  const config = particleConfigs[currentParticleIndex];
  infoText.setText(`Particle Type: ${config.name} (${currentParticleIndex + 1}/12)`);
  
  // 设置文本颜色为当前粒子主色调
  const colorString = '#' + config.color.toString(16).padStart(6, '0');
  infoText.setColor(colorString);
}

new Phaser.Game(config);