const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create }
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
  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    speed: { min: 50, max: 150 },           // 粒子发射速度
    angle: { min: 0, max: 360 },            // 全方向发射
    scale: { start: 1, end: 0 },            // 粒子从正常大小缩小到消失
    alpha: { start: 1, end: 0 },            // 粒子从不透明到完全透明
    lifespan: 800,                          // 粒子存活时间（毫秒）
    blendMode: 'ADD',                       // 叠加混合模式，产生发光效果
    frequency: 20,                          // 发射频率（毫秒）
    tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff], // 彩色粒子
    emitting: false                         // 初始不发射
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

  // 监听指针离开画布事件，停止发射
  this.input.on('pointerout', () => {
    particles.stop();
  });

  // 添加提示文本
  const text = this.add.text(400, 30, '移动鼠标查看粒子拖尾效果', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);