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
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  // 创建粒子发射器
  const particles = this.add.particles(centerX, centerY, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: 100,
    maxAliveParticles: 15,
    blendMode: 'ADD'
  });

  // 添加提示文本
  this.add.text(10, 10, 'Particle Emitter (Max: 15 particles)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);