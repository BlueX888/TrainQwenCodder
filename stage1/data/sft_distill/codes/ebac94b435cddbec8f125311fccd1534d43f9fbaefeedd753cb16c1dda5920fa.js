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
  graphics.fillRect(0, 0, 8, 8);
  graphics.generateTexture('particle', 8, 8);
  graphics.destroy();
}

function create() {
  // 在画布中央创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle', {
    // 粒子速度配置
    speed: { min: 100, max: 200 },
    
    // 粒子角度：全方向发射
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色变化
    tint: [ 0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff ],
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 发射频率：每200毫秒发射1个粒子
    frequency: 200,
    
    // 每次发射的粒子数量
    quantity: 1,
    
    // 最大存活粒子数量限制为15
    maxAliveParticles: 15,
    
    // 混合模式
    blendMode: 'ADD'
  });

  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 15 particles)', {
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