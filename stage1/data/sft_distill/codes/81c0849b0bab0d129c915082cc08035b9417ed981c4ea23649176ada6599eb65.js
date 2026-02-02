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
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
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
    
    // 粒子缩放：从1逐渐缩小到0
    scale: { start: 1, end: 0 },
    
    // 粒子透明度：从1逐渐变为0
    alpha: { start: 1, end: 0 },
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 粒子颜色渐变（从白色到蓝色）
    tint: [ 0xffffff, 0x00ffff, 0x0080ff ],
    
    // 粒子混合模式
    blendMode: 'ADD',
    
    // 最大粒子数量限制
    maxParticles: 20,
    
    // 发射频率：每200毫秒发射2个粒子
    frequency: 200,
    quantity: 2
  });

  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 20 particles)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 添加粒子计数显示
  const countText = this.add.text(400, 550, '', {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 更新粒子计数显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      const aliveCount = particles.getAliveParticleCount();
      countText.setText(`Active Particles: ${aliveCount} / 20`);
    },
    loop: true
  });
}

new Phaser.Game(config);