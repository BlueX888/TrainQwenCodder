const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
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
    // 限制同时存活的粒子数量为 5
    maxAliveParticles: 5,
    
    // 粒子速度配置（向四周发射）
    speed: { min: 100, max: 200 },
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色（从白色渐变到蓝色）
    tint: [0xffffff, 0x00ffff, 0x0088ff],
    
    // 发射频率（每秒发射粒子数）
    frequency: 500,
    
    // 每次发射的粒子数量
    quantity: 1,
    
    // 粒子混合模式
    blendMode: 'ADD'
  });

  // 添加提示文字
  this.add.text(400, 50, 'Particle Emitter (Max 5 particles)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Particles emit continuously from center', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);