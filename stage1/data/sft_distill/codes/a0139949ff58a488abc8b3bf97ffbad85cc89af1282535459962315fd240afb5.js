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
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    lifespan: 2000,
    blendMode: 'ADD',
    frequency: 100,
    maxParticles: 10,
    tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]
  });

  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 10)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加粒子计数显示
  const countText = this.add.text(400, 550, '', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 更新粒子计数显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      const aliveCount = particles.getAliveParticleCount();
      countText.setText(`Active Particles: ${aliveCount} / 10`);
    },
    loop: true
  });
}

new Phaser.Game(config);