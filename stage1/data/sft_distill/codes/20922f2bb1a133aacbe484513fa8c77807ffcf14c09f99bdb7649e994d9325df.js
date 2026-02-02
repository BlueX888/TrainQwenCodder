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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粒子纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8); // 在 (8,8) 位置绘制半径为 8 的圆
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 发射器位置：画布中央
    x: 400,
    y: 300,
    
    // 粒子速度配置
    speed: { min: 100, max: 200 },
    
    // 发射角度：全方向
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色渐变
    tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 混合模式
    blendMode: 'ADD',
    
    // 发射频率：每 100ms 发射 1 个粒子
    frequency: 100,
    
    // 最大粒子数量限制为 10
    maxParticles: 10,
    
    // 每次发射的粒子数量
    quantity: 1
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 10)', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Particles emit continuously from center', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);