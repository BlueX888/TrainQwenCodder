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
    // 粒子数量上限设为 8
    maxParticles: 8,
    // 发射速度
    speed: { min: 100, max: 200 },
    // 发射角度范围（全方向）
    angle: { min: 0, max: 360 },
    // 粒子缩放
    scale: { start: 1, end: 0 },
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    // 粒子颜色渐变
    tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
    // 发射频率（每秒发射的粒子数）
    frequency: 200,
    // 混合模式
    blendMode: 'ADD'
  });

  // 添加提示文字
  this.add.text(400, 50, 'Particle Emitter (Max: 8 particles)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 显示实时粒子数量
  const countText = this.add.text(400, 550, '', {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 更新粒子数量显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      const aliveCount = particles.getAliveParticleCount();
      countText.setText(`Active Particles: ${aliveCount} / 8`);
    },
    loop: true
  });
}

new Phaser.Game(config);