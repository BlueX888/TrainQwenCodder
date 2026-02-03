const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: { preload, create, update }
};

// 状态信号变量
let currentParticleIndex = 0;
let particleEmitter = null;

// 10种粒子配置
const particleConfigs = [
  { name: 'Red Fire', color: 0xff0000, tint: [0xff0000, 0xff6600, 0xffaa00] },
  { name: 'Blue Ice', color: 0x0088ff, tint: [0x0088ff, 0x00ddff, 0xaaffff] },
  { name: 'Green Nature', color: 0x00ff00, tint: [0x00ff00, 0x88ff00, 0xffff00] },
  { name: 'Purple Magic', color: 0x8800ff, tint: [0x8800ff, 0xdd00ff, 0xff00ff] },
  { name: 'Yellow Sun', color: 0xffff00, tint: [0xffff00, 0xffdd00, 0xff8800] },
  { name: 'Cyan Water', color: 0x00ffff, tint: [0x00ffff, 0x00dddd, 0x0088dd] },
  { name: 'Orange Flame', color: 0xff8800, tint: [0xff8800, 0xff6600, 0xff4400] },
  { name: 'Pink Dream', color: 0xff0088, tint: [0xff0088, 0xff44aa, 0xff88cc] },
  { name: 'White Snow', color: 0xffffff, tint: [0xffffff, 0xdddddd, 0xaaaaaa] },
  { name: 'Lime Energy', color: 0x88ff00, tint: [0x88ff00, 0xaaff44, 0xccff88] }
];

function preload() {
  // 程序化生成粒子纹理
  const graphics = this.add.graphics();
  
  // 创建圆形粒子纹理
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.clear();
  
  // 创建方形粒子纹理（备用）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(2, 2, 12, 12);
  graphics.generateTexture('particle-square', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建标题文本
  const titleText = this.add.text(400, 30, 'Particle Color Switcher', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建当前粒子类型显示文本
  const infoText = this.add.text(400, 70, '', {
    fontSize: '24px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建提示文本
  this.add.text(400, 550, 'Press SPACE to switch particle type', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建状态显示文本
  const statusText = this.add.text(400, 520, '', {
    fontSize: '16px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 创建粒子发射器
  particleEmitter = this.add.particles(400, 300, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: 50,
    maxParticles: 100,
    tint: particleConfigs[0].tint
  });
  
  // 更新显示函数
  const updateDisplay = () => {
    const config = particleConfigs[currentParticleIndex];
    infoText.setText(`Current: ${config.name} (${currentParticleIndex + 1}/10)`);
    infoText.setColor('#' + config.color.toString(16).padStart(6, '0'));
    statusText.setText(`Particle Index: ${currentParticleIndex} | Active Particles: ${particleEmitter.getAliveParticleCount()}`);
  };
  
  // 初始显示
  updateDisplay();
  
  // 切换粒子效果函数
  const switchParticle = () => {
    currentParticleIndex = (currentParticleIndex + 1) % particleConfigs.length;
    const config = particleConfigs[currentParticleIndex];
    
    // 更新粒子发射器配置
    particleEmitter.setConfig({
      tint: config.tint,
      speed: { min: 100 + currentParticleIndex * 20, max: 200 + currentParticleIndex * 20 },
      scale: { start: 0.8 + currentParticleIndex * 0.05, end: 0 },
      lifespan: 1500 + currentParticleIndex * 100,
      frequency: 30 + currentParticleIndex * 5
    });
    
    updateDisplay();
    
    // 添加视觉反馈：闪烁效果
    this.tweens.add({
      targets: infoText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  };
  
  // 监听空格键
  this.input.keyboard.on('keydown-SPACE', switchParticle);
  
  // 保存到场景数据供update使用
  this.registry.set('statusText', statusText);
  this.registry.set('updateDisplay', updateDisplay);
  
  // 添加鼠标跟随效果
  this.input.on('pointermove', (pointer) => {
    particleEmitter.setPosition(pointer.x, pointer.y);
  });
  
  // 添加背景装饰
  const decorGraphics = this.add.graphics();
  decorGraphics.lineStyle(2, 0x444444, 0.5);
  for (let i = 0; i < 10; i++) {
    decorGraphics.strokeCircle(400, 300, 50 + i * 30);
  }
}

function update(time, delta) {
  // 更新状态显示
  const statusText = this.registry.get('statusText');
  const updateDisplay = this.registry.get('updateDisplay');
  
  if (statusText && particleEmitter) {
    const config = particleConfigs[currentParticleIndex];
    statusText.setText(
      `Particle Index: ${currentParticleIndex} | ` +
      `Active: ${particleEmitter.getAliveParticleCount()} | ` +
      `Type: ${config.name}`
    );
  }
}

new Phaser.Game(config);