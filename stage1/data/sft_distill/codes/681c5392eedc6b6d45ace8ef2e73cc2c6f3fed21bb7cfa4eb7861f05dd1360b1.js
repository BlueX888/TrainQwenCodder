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
    // 粒子速度配置
    speed: { min: 100, max: 200 },
    
    // 粒子角度：全方向发射
    angle: { min: 0, max: 360 },
    
    // 粒子缩放：从 1 缩放到 0
    scale: { start: 1, end: 0 },
    
    // 粒子透明度：从 1 淡出到 0
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色：从白色渐变到蓝色
    tint: [ 0xffffff, 0x00ffff, 0x0080ff ],
    
    // 粒子生命周期：2000 毫秒
    lifespan: 2000,
    
    // 混合模式：ADD 使粒子叠加更亮
    blendMode: 'ADD',
    
    // 发射频率：每 100 毫秒发射 1 个粒子
    frequency: 100,
    
    // 最大粒子数量：20 个
    maxParticles: 20
  });

  // 添加文字说明
  this.add.text(400, 50, 'Particle Emitter (Max: 20)', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Particles emit continuously from center', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);