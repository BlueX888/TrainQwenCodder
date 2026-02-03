const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 创建粒子纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, '移动鼠标查看粒子拖尾效果', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    speed: { min: 20, max: 50 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 800,
    frequency: 20,
    blendMode: 'ADD',
    tint: [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0099ff, 0xff00ff]
  });

  // 初始位置设置在屏幕中央
  particles.setPosition(400, 300);

  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置跟随指针
    particles.setPosition(pointer.x, pointer.y);
  });

  // 可选：添加点击效果，点击时爆发更多粒子
  this.input.on('pointerdown', (pointer) => {
    particles.emitParticleAt(pointer.x, pointer.y, 30);
  });
}

new Phaser.Game(config);