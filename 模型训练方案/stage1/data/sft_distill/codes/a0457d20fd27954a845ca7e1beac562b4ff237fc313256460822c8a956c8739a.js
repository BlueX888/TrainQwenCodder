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
  const emitter = this.add.particles(400, 300, 'particle', {
    // 设置最大存活粒子数为 3
    maxAliveParticles: 3,
    
    // 粒子速度配置
    speed: { min: 100, max: 200 },
    
    // 粒子角度配置（全方向发射）
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 发射频率（每秒发射1个粒子）
    frequency: 1000,
    
    // 粒子颜色渐变
    tint: [0xff0000, 0x00ff00, 0x0000ff]
  });

  // 添加文本说明
  this.add.text(400, 50, '粒子发射器 - 最多3个粒子', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '粒子会持续发射，但同时最多只有3个存活', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);