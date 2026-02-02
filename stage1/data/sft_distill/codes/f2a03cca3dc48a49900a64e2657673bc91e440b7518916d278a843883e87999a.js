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
  // 程序化生成粒子纹理
  const graphics = this.add.graphics();
  
  // 创建一个圆形粒子纹理
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, '移动鼠标查看粒子拖尾效果', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 粒子生命周期配置
    lifespan: 1000,           // 粒子存活时间（毫秒）
    
    // 速度配置 - 粒子向各方向缓慢扩散
    speed: { min: 20, max: 50 },
    angle: { min: 0, max: 360 },
    
    // 缩放配置 - 粒子逐渐缩小
    scale: { start: 1, end: 0 },
    
    // 透明度配置 - 粒子逐渐消失
    alpha: { start: 0.8, end: 0 },
    
    // 颜色配置 - 从青色渐变到紫色
    tint: [0x00ffff, 0xff00ff, 0xffff00],
    
    // 混合模式 - 使粒子发光
    blendMode: 'ADD',
    
    // 发射频率 - 持续发射
    frequency: 20,            // 每20ms发射一次
    maxParticles: 500,        // 最大粒子数
    
    // 初始状态 - 不自动发射
    emitting: false
  });

  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置到指针位置
    particles.setPosition(pointer.x, pointer.y);
    
    // 开始发射粒子
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
  this.add.text(400, 550, '粒子会跟随鼠标移动并产生拖尾效果', {
    fontSize: '16px',
    color: '#888888',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);