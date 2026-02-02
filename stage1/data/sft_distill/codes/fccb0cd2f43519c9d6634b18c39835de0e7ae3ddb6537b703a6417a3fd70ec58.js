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
  // 使用 Graphics 创建粒子纹理
  const graphics = this.add.graphics();
  
  // 绘制一个白色圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 在画布中央创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle', {
    // 粒子速度范围
    speed: { min: 100, max: 200 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色（彩虹效果）
    tint: [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3],
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 发射角度范围（全方向）
    angle: { min: 0, max: 360 },
    
    // 粒子混合模式
    blendMode: 'ADD',
    
    // 发射频率（每秒发射的粒子数）
    frequency: 100,
    
    // 最大粒子数量
    maxParticles: 20,
    
    // 每次发射的粒子数量
    quantity: 1
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 20 particles)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Particles emit continuously from center', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);