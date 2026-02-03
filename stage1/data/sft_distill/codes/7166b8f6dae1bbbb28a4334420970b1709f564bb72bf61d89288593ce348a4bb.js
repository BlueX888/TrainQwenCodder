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
  
  // 绘制一个白色圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('particle', 16, 16);
  
  // 销毁 Graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 发射器位置（画布中央）
    x: 400,
    y: 300,
    
    // 粒子数量上限
    maxParticles: 12,
    
    // 发射速度（像素/秒）
    speed: { min: 100, max: 200 },
    
    // 发射角度范围（0-360度，全方向）
    angle: { min: 0, max: 360 },
    
    // 粒子缩放
    scale: { start: 1, end: 0 },
    
    // 粒子透明度
    alpha: { start: 1, end: 0 },
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 粒子颜色渐变（白色到蓝色）
    tint: [0xffffff, 0x00ff00, 0x0000ff],
    
    // 发射频率（每秒发射粒子数）
    frequency: 200,
    
    // 混合模式
    blendMode: 'ADD'
  });
  
  // 添加说明文字
  this.add.text(400, 50, '粒子发射器（最多12个粒子）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '粒子会持续从中央发射', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);