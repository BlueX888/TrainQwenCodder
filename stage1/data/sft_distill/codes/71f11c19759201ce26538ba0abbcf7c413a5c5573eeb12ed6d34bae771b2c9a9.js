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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粒子纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8); // 在 (8,8) 位置绘制半径为 8 的圆
  graphics.generateTexture('particle', 16, 16); // 生成 16x16 的纹理
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 在画布中央创建粒子发射器
  const particles = this.add.particles(400, 300, 'particle', {
    // 粒子速度配置
    speed: { min: 100, max: 200 },
    
    // 粒子角度：360 度全方向发射
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 粒子颜色渐变（从白色到蓝色）
    tint: [0xffffff, 0x00ffff, 0x0088ff],
    
    // 粒子数量上限
    maxParticles: 5,
    
    // 发射频率：每 500 毫秒发射 1 个粒子
    frequency: 500,
    
    // 混合模式
    blendMode: 'ADD'
  });

  // 添加说明文字
  this.add.text(400, 50, 'Particle Emitter Demo', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 80, 'Max Particles: 5', {
    fontSize: '16px',
    color: '#ffff00'
  }).setOrigin(0.5);
}

new Phaser.Game(config);