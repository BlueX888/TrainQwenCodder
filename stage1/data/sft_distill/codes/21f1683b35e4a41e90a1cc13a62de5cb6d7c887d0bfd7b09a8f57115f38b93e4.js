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
  
  // 绘制一个白色圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理并命名为 'particle'
  graphics.generateTexture('particle', 16, 16);
  
  // 销毁 graphics 对象，因为纹理已经生成
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
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 粒子颜色渐变
    tint: [0xff0000, 0x00ff00, 0x0000ff],
    
    // 发射频率：每秒发射1个粒子
    frequency: 1000,
    
    // 最大存活粒子数量限制为3
    maxAliveParticles: 3,
    
    // 混合模式
    blendMode: 'ADD'
  });
  
  // 添加提示文本
  this.add.text(400, 50, '粒子发射器 (最多3个粒子)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '粒子会持续发射，但最多同时存在3个', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);