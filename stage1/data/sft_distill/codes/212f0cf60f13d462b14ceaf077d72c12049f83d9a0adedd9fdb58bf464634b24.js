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
  // 不需要预加载外部资源
}

function create() {
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（钻石形状）
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建抖动动画效果
  // 抖动效果：快速左右和上下微小位移
  this.tweens.add({
    targets: diamond,
    x: {
      from: 400,
      to: 400,
      duration: 4000,
      ease: 'Linear'
    },
    y: {
      from: 300,
      to: 300,
      duration: 4000,
      ease: 'Linear'
    },
    // 使用 yoyo 和 repeat 创建抖动效果
    // 通过快速的位置变化模拟抖动
    onUpdate: function(tween, target) {
      // 在 4 秒内创建抖动效果
      const progress = tween.progress;
      const time = progress * 4000;
      
      // 使用正弦波创建抖动效果，频率逐渐增加
      const frequency = 20; // 抖动频率
      const amplitude = 5;  // 抖动幅度
      
      const offsetX = Math.sin(time * frequency * 0.01) * amplitude;
      const offsetY = Math.cos(time * frequency * 0.01) * amplitude;
      
      target.x = 400 + offsetX;
      target.y = 300 + offsetY;
    },
    loop: -1, // 无限循环
    duration: 4000
  });
  
  // 添加提示文字
  const text = this.add.text(400, 500, '抖动动画 (4秒循环)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);