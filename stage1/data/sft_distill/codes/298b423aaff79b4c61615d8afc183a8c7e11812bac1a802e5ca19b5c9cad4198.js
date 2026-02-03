const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建粒子纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8); // 在 (8,8) 位置绘制半径为 8 的圆
  
  // 生成纹理，尺寸 16x16
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle', {
    // 粒子生命周期配置
    lifespan: 2000, // 粒子存活 2 秒
    
    // 速度配置
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 }, // 全方向发射
    
    // 缩放配置
    scale: { start: 1, end: 0 }, // 从原始大小缩放到 0
    
    // 透明度配置
    alpha: { start: 1, end: 0 }, // 从完全不透明到完全透明
    
    // 颜色配置
    tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00], // 多种颜色随机
    
    // 发射频率
    frequency: 500, // 每 500ms 发射一次
    
    // 最大存活粒子数量限制为 3
    maxAliveParticles: 3,
    
    // 每次发射的粒子数量
    quantity: 1
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Particle Emitter (Max 3 particles)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Particles emit continuously with max 3 alive at once', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);