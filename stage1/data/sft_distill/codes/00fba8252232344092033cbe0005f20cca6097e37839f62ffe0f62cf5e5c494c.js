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
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个渐变的圆形粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '移动鼠标查看粒子拖尾效果', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 粒子生命周期配置
    lifespan: 1000,          // 粒子存活时间 1 秒
    speed: { min: 50, max: 150 },  // 粒子速度范围
    angle: { min: 0, max: 360 },   // 全方向发射
    
    // 视觉效果配置
    scale: { start: 0.8, end: 0 },  // 粒子从 0.8 缩放到 0
    alpha: { start: 1, end: 0 },    // 透明度从 1 渐变到 0
    
    // 颜色渐变（白色 -> 蓝色 -> 紫色）
    tint: [ 0xffffff, 0x00ffff, 0xff00ff ],
    
    // 发射频率配置
    frequency: 20,           // 每 20ms 发射一次
    maxParticles: 500,       // 最大粒子数量
    
    // 初始不发射
    emitting: false
  });

  // 获取发射器实例
  const emitter = particles.emitters.getByName('default') || particles.emitters.list[0];

  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新发射器位置到指针位置
    emitter.setPosition(pointer.x, pointer.y);
    
    // 开启发射
    if (!emitter.on) {
      emitter.start();
    }
  });

  // 监听指针进入游戏区域
  this.input.on('pointerover', () => {
    emitter.start();
  });

  // 监听指针离开游戏区域
  this.input.on('pointerout', () => {
    emitter.stop();
  });

  // 添加额外的视觉效果：显示当前指针位置的圆圈
  const pointerCircle = this.add.circle(0, 0, 10, 0xffffff, 0.3);
  pointerCircle.setVisible(false);

  this.input.on('pointermove', (pointer) => {
    pointerCircle.setPosition(pointer.x, pointer.y);
    pointerCircle.setVisible(true);
  });

  this.input.on('pointerout', () => {
    pointerCircle.setVisible(false);
  });
}

// 创建游戏实例
new Phaser.Game(config);