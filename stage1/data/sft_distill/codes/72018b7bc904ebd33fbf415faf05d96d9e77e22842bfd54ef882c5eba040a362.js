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
  // 使用 Graphics 程序化生成粒子纹理
  const graphics = this.add.graphics();
  
  // 绘制一个白色圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  
  // 清除 graphics 对象
  graphics.destroy();
}

function create() {
  // 添加提示文字
  const text = this.add.text(400, 50, 'Move your mouse to create particle trails', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 发射速度配置
    speed: { min: 50, max: 150 },
    
    // 发射角度：全方向
    angle: { min: 0, max: 360 },
    
    // 粒子缩放：从 1 逐渐缩小到 0
    scale: { start: 1, end: 0 },
    
    // 粒子透明度：从 1 逐渐淡出到 0
    alpha: { start: 1, end: 0 },
    
    // 粒子生命周期：1000ms
    lifespan: 1000,
    
    // 混合模式：ADD 模式产生发光效果
    blendMode: 'ADD',
    
    // 粒子颜色：彩虹色渐变
    tint: [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3],
    
    // 发射频率：每 20ms 发射 1 个粒子
    frequency: 20,
    
    // 每次发射数量
    quantity: 1,
    
    // 初始位置在屏幕中心
    x: 400,
    y: 300
  });
  
  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置到指针位置
    particles.setPosition(pointer.x, pointer.y);
  });
  
  // 添加点击切换发射模式的功能
  let isEmitting = true;
  this.input.on('pointerdown', () => {
    isEmitting = !isEmitting;
    if (isEmitting) {
      particles.start();
      text.setText('Move your mouse to create particle trails\n(Click to pause)');
    } else {
      particles.stop();
      text.setText('Particle emission paused\n(Click to resume)');
    }
  });
  
  // 添加额外的视觉提示
  const instructionText = this.add.text(400, 550, 'Click to pause/resume emission', {
    fontSize: '16px',
    color: '#888888',
    align: 'center'
  });
  instructionText.setOrigin(0.5);
}

new Phaser.Game(config);