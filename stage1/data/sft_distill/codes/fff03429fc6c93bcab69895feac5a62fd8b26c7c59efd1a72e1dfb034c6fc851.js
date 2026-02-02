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
    // 粒子速度范围
    speed: { min: 100, max: 200 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色变化（白色到蓝色）
    tint: [ 0xffffff, 0x00ffff, 0x0088ff ],
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 发射角度范围（360度全方向）
    angle: { min: 0, max: 360 },
    
    // 混合模式
    blendMode: 'ADD',
    
    // 发射频率（每100毫秒发射1个粒子）
    frequency: 100,
    
    // 最大粒子数量
    maxParticles: 20,
    
    // 每次发射的粒子数量
    quantity: 1
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 20 particles)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);