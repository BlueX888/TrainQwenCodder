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
  const particles = this.add.particles(400, 300, 'particle');
  
  // 配置发射器
  const emitter = particles.createEmitter({
    // 粒子数量上限
    maxParticles: 12,
    maxAliveParticles: 12,
    
    // 发射速度（每秒发射的粒子数）
    frequency: 100,
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 粒子速度范围
    speed: { min: 100, max: 200 },
    
    // 粒子发射角度（360度全方向）
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色渐变
    tint: [ 0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0xff00ff ]
  });
  
  // 添加提示文本
  this.add.text(400, 550, '粒子发射器 - 最大粒子数: 12', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);