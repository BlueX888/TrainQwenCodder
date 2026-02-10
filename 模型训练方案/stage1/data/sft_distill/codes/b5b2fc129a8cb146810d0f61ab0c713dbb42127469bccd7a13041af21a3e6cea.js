const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 可验证信号
window.__signals__ = {
  currentParticleType: 0,
  switchCount: 0,
  particleTypes: ['RED', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE'],
  logs: []
};

let emitter;
let particleConfigs;
let currentTypeIndex = 0;
let infoText;

function preload() {
  // 创建5种颜色的粒子纹理
  const colors = [
    { name: 'red', color: 0xff0000 },
    { name: 'green', color: 0x00ff00 },
    { name: 'blue', color: 0x0000ff },
    { name: 'yellow', color: 0xffff00 },
    { name: 'purple', color: 0xff00ff }
  ];

  colors.forEach(item => {
    const graphics = this.add.graphics();
    graphics.fillStyle(item.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(item.name, 16, 16);
    graphics.destroy();
  });
}

function create() {
  // 定义5种粒子配置
  particleConfigs = [
    {
      name: 'RED',
      texture: 'red',
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      angle: { min: 0, max: 360 },
      gravityY: 100,
      blendMode: 'ADD'
    },
    {
      name: 'GREEN',
      texture: 'green',
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 3000,
      angle: { min: -90, max: -90 },
      gravityY: -50,
      blendMode: 'NORMAL'
    },
    {
      name: 'BLUE',
      texture: 'blue',
      speed: { min: 150, max: 300 },
      scale: { start: 1.2, end: 0.2 },
      alpha: { start: 1, end: 0.3 },
      lifespan: 1500,
      angle: { min: 0, max: 360 },
      gravityY: 200,
      blendMode: 'ADD',
      frequency: 20
    },
    {
      name: 'YELLOW',
      texture: 'yellow',
      speed: { min: 80, max: 120 },
      scale: { start: 0.8, end: 0.8 },
      alpha: { start: 1, end: 0 },
      lifespan: 2500,
      angle: { min: 0, max: 360 },
      gravityY: 0,
      blendMode: 'SCREEN',
      radial: true
    },
    {
      name: 'PURPLE',
      texture: 'purple',
      speed: { min: 200, max: 400 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 1000,
      angle: { min: 180, max: 360 },
      gravityY: 300,
      blendMode: 'ADD',
      bounce: 0.5
    }
  ];

  // 创建初始粒子发射器
  const particles = this.add.particles(400, 300);
  emitter = particles.createEmitter(particleConfigs[0]);

  // 添加信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateInfoText();

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      switchParticleType();
      
      // 更新发射器位置到点击位置
      emitter.setPosition(pointer.x, pointer.y);
      
      // 记录日志
      const log = {
        timestamp: Date.now(),
        type: particleConfigs[currentTypeIndex].name,
        position: { x: pointer.x, y: pointer.y },
        switchCount: window.__signals__.switchCount
      };
      window.__signals__.logs.push(log);
      console.log('Particle Switch:', JSON.stringify(log));
    }
  });

  // 添加说明文本
  this.add.text(10, 560, 'Click Left Mouse Button to Switch Particle Type', {
    fontSize: '16px',
    color: '#ffff00'
  });
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentTypeIndex = (currentTypeIndex + 1) % particleConfigs.length;
  
  // 更新粒子发射器配置
  const newConfig = particleConfigs[currentTypeIndex];
  emitter.setConfig(newConfig);
  
  // 更新信号
  window.__signals__.currentParticleType = currentTypeIndex;
  window.__signals__.switchCount++;
  
  // 更新信息文本
  updateInfoText();
}

function updateInfoText() {
  const config = particleConfigs[currentTypeIndex];
  infoText.setText([
    `Current Type: ${config.name} (${currentTypeIndex + 1}/5)`,
    `Switch Count: ${window.__signals__.switchCount}`,
    `Lifespan: ${config.lifespan}ms`,
    `Speed: ${config.speed.min}-${config.speed.max}`
  ]);
}

function update(time, delta) {
  // 可选：添加自动发射效果
  // 这里保持简单，仅在点击时发射
}

new Phaser.Game(config);