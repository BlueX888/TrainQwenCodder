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
  this.add.text(400, 50, 'Move your mouse to create particle trail', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 粒子生命周期配置
    lifespan: 1000,           // 粒子存活时间 1 秒
    speed: { min: 50, max: 150 }, // 粒子速度范围
    angle: { min: 0, max: 360 },  // 发射角度全方向
    
    // 粒子缩放
    scale: { start: 1, end: 0 }, // 从正常大小缩小到消失
    
    // 粒子透明度
    alpha: { start: 1, end: 0 }, // 从完全不透明到完全透明
    
    // 粒子颜色变化（从白色到蓝色）
    tint: [ 0xffffff, 0x00ffff, 0x0088ff ],
    
    // 混合模式
    blendMode: 'ADD',
    
    // 发射频率
    frequency: 20,  // 每 20ms 发射一次
    
    // 每次发射的粒子数量
    quantity: 2
  });

  // 初始位置设置在屏幕中心
  particles.setPosition(400, 300);

  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置到指针位置
    particles.setPosition(pointer.x, pointer.y);
  });

  // 监听指针按下事件，增加粒子发射量
  this.input.on('pointerdown', () => {
    particles.setFrequency(10);  // 加快发射频率
    particles.setQuantity(5);     // 增加每次发射数量
  });

  // 监听指针抬起事件，恢复正常发射量
  this.input.on('pointerup', () => {
    particles.setFrequency(20);  // 恢复正常频率
    particles.setQuantity(2);     // 恢复正常数量
  });

  // 添加额外的视觉效果说明
  this.add.text(400, 550, 'Click and drag for more particles!', {
    fontSize: '16px',
    color: '#888888',
    align: 'center'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);