const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 程序化生成粒子纹理
  const graphics = this.add.graphics();
  
  // 绘制一个白色圆形作为粒子纹理
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  
  // 生成纹理并销毁 graphics 对象
  graphics.generateTexture('particle', 16, 16);
  graphics.destroy();
}

function create() {
  // 添加提示文字
  const text = this.add.text(400, 50, '移动鼠标查看粒子拖尾效果', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);

  // 创建粒子发射器
  const particles = this.add.particles(0, 0, 'particle', {
    // 粒子生命周期（毫秒）
    lifespan: 1000,
    
    // 粒子速度配置
    speed: { min: 50, max: 150 },
    
    // 粒子发射角度（360度全方向）
    angle: { min: 0, max: 360 },
    
    // 粒子缩放变化（从1缩小到0）
    scale: { start: 1, end: 0 },
    
    // 粒子透明度变化（从1淡出到0）
    alpha: { start: 1, end: 0 },
    
    // 粒子颜色渐变（从蓝色到紫色）
    tint: [ 0x00d4ff, 0x7b2cbf, 0xff006e ],
    
    // 混合模式（ADD 产生发光效果）
    blendMode: 'ADD',
    
    // 发射频率（每10毫秒发射1-2个粒子）
    frequency: 10,
    quantity: 2,
    
    // 初始位置在屏幕中心
    x: 400,
    y: 300
  });

  // 监听指针移动事件
  this.input.on('pointermove', (pointer) => {
    // 更新粒子发射器位置到指针位置
    particles.setPosition(pointer.x, pointer.y);
  });

  // 监听指针按下事件（增强效果）
  this.input.on('pointerdown', (pointer) => {
    // 按下时爆发更多粒子
    particles.explode(30, pointer.x, pointer.y);
  });

  // 添加额外说明
  const tipText = this.add.text(400, 550, '点击鼠标产生粒子爆发', {
    fontSize: '18px',
    color: '#aaaaaa',
    align: 'center'
  });
  tipText.setOrigin(0.5);
}

new Phaser.Game(config);