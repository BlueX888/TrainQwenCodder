const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 创建粒子纹理
  const graphics = this.add.graphics();
  
  // 绘制一个白色圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 30, '移动鼠标查看粒子拖尾效果', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 粒子生命周期（毫秒）
    lifespan: 800,
    
    // 初始速度范围（随机方向）
    speed: { min: 20, max: 80 },
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 0.8, end: 0 },
    
    // 透明度渐变
    alpha: { start: 1, end: 0 },
    
    // 颜色渐变（从青色到紫色）
    tint: [ 0x00ffff, 0xff00ff, 0xffff00 ],
    
    // 混合模式（加法混合，产生发光效果）
    blendMode: 'ADD',
    
    // 发射频率（每帧发射的粒子数）
    frequency: 20,
    quantity: 2,
    
    // 初始位置不发射
    emitting: false
  });

  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置到指针位置
    particles.setPosition(pointer.x, pointer.y);
    
    // 开启发射
    if (!particles.emitting) {
      particles.start();
    }
  });

  // 监听指针离开画布事件
  this.input.on('pointerout', () => {
    // 停止发射粒子
    particles.stop();
  });

  // 监听指针进入画布事件
  this.input.on('pointerover', (pointer) => {
    // 更新位置并重新开始发射
    particles.setPosition(pointer.x, pointer.y);
    particles.start();
  });

  // 添加额外的视觉效果说明
  this.add.text(400, 570, '粒子会跟随鼠标移动产生拖尾效果', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
}

new Phaser.Game(config);