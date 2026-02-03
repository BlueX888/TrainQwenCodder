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
  // 创建粒子纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 在画布中央创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle', {
    // 粒子速度配置
    speed: { min: 100, max: 200 },
    
    // 粒子角度：全方向发射
    angle: { min: 0, max: 360 },
    
    // 粒子缩放：从 1 逐渐缩小到 0
    scale: { start: 1, end: 0 },
    
    // 粒子透明度：从 1 逐渐变为 0
    alpha: { start: 1, end: 0 },
    
    // 粒子生命周期：2000 毫秒
    lifespan: 2000,
    
    // 粒子混合模式：ADD 模式使粒子发光
    blendMode: 'ADD',
    
    // 粒子数量上限：15 个
    maxParticles: 15,
    
    // 发射频率：每 100 毫秒发射 1 个粒子
    frequency: 100,
    
    // 粒子颜色渐变：白色到蓝色
    tint: [ 0xffffff, 0x00ffff, 0x0088ff ]
  });

  // 添加文字说明
  this.add.text(400, 50, 'Particle Emitter', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Max Particles: 15', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);
}

new Phaser.Game(config);