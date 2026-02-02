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
  // 使用 Graphics 生成粒子纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个白色圆形作为粒子纹理
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理并命名为 'particle'
  graphics.generateTexture('particle', 16, 16);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 粒子生命周期配置
    lifespan: 1000,           // 粒子存活时间 1000ms
    speed: { min: 50, max: 150 }, // 粒子速度范围
    angle: { min: 0, max: 360 },  // 粒子发射角度（全方向）
    scale: { start: 0.8, end: 0 }, // 粒子缩放（从0.8逐渐缩小到0）
    alpha: { start: 1, end: 0 },   // 粒子透明度（从1逐渐消失到0）
    blendMode: 'ADD',              // 混合模式，产生发光效果
    frequency: 20,                 // 发射频率（每20ms发射一次）
    quantity: 2,                   // 每次发射2个粒子
    
    // 粒子颜色渐变（从青色到紫色）
    tint: [0x00ffff, 0xff00ff, 0xffff00]
  });
  
  // 初始时停止发射
  particles.stop();
  
  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置到指针位置
    particles.setPosition(pointer.x, pointer.y);
    
    // 如果发射器未启动，则启动它
    if (!particles.emitting) {
      particles.start();
    }
  });
  
  // 监听指针离开画布事件，停止发射
  this.input.on('pointerout', () => {
    particles.stop();
  });
  
  // 监听指针进入画布事件
  this.input.on('pointerover', (pointer) => {
    particles.setPosition(pointer.x, pointer.y);
    particles.start();
  });
  
  // 添加提示文本
  const text = this.add.text(400, 300, '移动鼠标查看粒子拖尾效果', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 3秒后隐藏提示文本
  this.time.delayedCall(3000, () => {
    text.destroy();
  });
}

// 启动游戏
new Phaser.Game(config);