const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create, update }
};

// 全局状态变量（用于验证）
let currentParticleType = 0; // 0: 红色, 1: 绿色, 2: 蓝色
let particleEmitter = null;
let particleConfigs = [];
let statusText = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建3种颜色的粒子纹理
  const colors = [
    { name: 'red', color: 0xff0000, label: '红色粒子' },
    { name: 'green', color: 0x00ff00, label: '绿色粒子' },
    { name: 'blue', color: 0x0088ff, label: '蓝色粒子' }
  ];

  colors.forEach(colorData => {
    const graphics = this.add.graphics();
    graphics.fillStyle(colorData.color, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(colorData.name + 'Particle', 16, 16);
    graphics.destroy();
  });

  // 定义3种粒子配置
  particleConfigs = [
    {
      // 红色粒子 - 爆炸效果
      texture: 'redParticle',
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: 50,
      quantity: 3,
      angle: { min: 0, max: 360 }
    },
    {
      // 绿色粒子 - 喷泉效果
      texture: 'greenParticle',
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 1, end: 0.3 },
      lifespan: 2000,
      blendMode: 'NORMAL',
      frequency: 30,
      quantity: 2,
      angle: { min: -120, max: -60 },
      gravityY: 200
    },
    {
      // 蓝色粒子 - 螺旋效果
      texture: 'blueParticle',
      speed: { min: 80, max: 200 },
      scale: { start: 1.2, end: 0.1 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 1500,
      blendMode: 'ADD',
      frequency: 40,
      quantity: 2,
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 }
    }
  ];

  // 创建粒子发射器（初始位置在屏幕中央）
  particleEmitter = this.add.particles(400, 300, particleConfigs[currentParticleType].texture, particleConfigs[currentParticleType]);

  // 显示状态文本
  statusText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText(colors[currentParticleType].label);

  // 添加提示文本
  this.add.text(400, 550, '点击鼠标左键切换粒子类型', {
    fontSize: '20px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      // 切换到下一种粒子类型
      currentParticleType = (currentParticleType + 1) % 3;
      
      // 更新粒子发射器配置
      const newConfig = particleConfigs[currentParticleType];
      
      // 停止当前发射器
      particleEmitter.stop();
      
      // 移除旧的发射器
      particleEmitter.destroy();
      
      // 创建新的粒子发射器
      particleEmitter = this.add.particles(400, 300, newConfig.texture, newConfig);
      
      // 更新状态文本
      updateStatusText(colors[currentParticleType].label);
      
      // 在控制台输出状态（用于验证）
      console.log('切换到粒子类型:', currentParticleType, colors[currentParticleType].label);
    }
  });

  // 让粒子跟随鼠标位置
  this.input.on('pointermove', (pointer) => {
    if (particleEmitter) {
      particleEmitter.setPosition(pointer.x, pointer.y);
    }
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 例如：让粒子发射器做周期性运动
  if (particleEmitter && currentParticleType === 2) {
    // 蓝色粒子时添加轻微的圆周运动
    const offsetX = Math.cos(time * 0.001) * 50;
    const offsetY = Math.sin(time * 0.001) * 50;
    // 注意：这里只在蓝色粒子时添加额外效果
  }
}

function updateStatusText(label) {
  statusText.setText(`当前粒子: ${label} (类型: ${currentParticleType})`);
}

// 创建游戏实例
new Phaser.Game(config);