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
  
  // 绘制一个白色圆形作为粒子
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理
  graphics.generateTexture('particle', 16, 16);
  
  // 销毁 graphics 对象
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
    
    // 粒子颜色渐变（从黄色到红色）
    tint: [0xffff00, 0xff6600, 0xff0000],
    
    // 粒子生命周期（毫秒）
    lifespan: 2000,
    
    // 发射频率（毫秒）
    frequency: 200,
    
    // 每次发射的粒子数量
    quantity: 1,
    
    // 粒子数量上限
    maxParticles: 10,
    
    // 混合模式
    blendMode: 'ADD'
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Particle Emitter (Max: 10 particles)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  // 显示当前粒子数量
  const countText = this.add.text(400, 550, '', {
    fontSize: '18px',
    color: '#00ff00'
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