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
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 在画布中央创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle', {
    // 设置粒子数量上限为 5
    maxAliveParticles: 5,
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 发射速度：随机方向，速度 100-200
    speed: { min: 100, max: 200 },
    
    // 发射角度：全方向 360 度
    angle: { min: 0, max: 360 },
    
    // 粒子缩放：从 1 缩小到 0
    scale: { start: 1, end: 0 },
    
    // 粒子透明度：从 1 淡出到 0
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色渐变：白色到蓝色
    tint: [ 0xffffff, 0x00ffff, 0x0088ff ],
    
    // 发射频率：每 400 毫秒发射 1 个粒子
    frequency: 400,
    
    // 每次发射的粒子数量
    quantity: 1
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max 5 Particles)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Particles emit continuously from center', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);