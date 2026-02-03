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
  // 使用 Graphics 绘制灰色菱形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  // 菱形中心在 (50, 50)，宽度100，高度100
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 50);    // 右点
  graphics.lineTo(50, 100);    // 底点
  graphics.lineTo(0, 50);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建抖动动画效果
  // 使用多个连续的小幅度移动来模拟抖动
  this.tweens.add({
    targets: diamond,
    x: '+=10',           // 向右移动10像素
    duration: 50,        // 快速移动
    yoyo: true,          // 来回移动
    repeat: 0,           // 单次不重复
    onComplete: () => {
      // 第一次抖动完成后，创建主抖动循环
      this.tweens.add({
        targets: diamond,
        x: { from: 390, to: 410 },  // 左右抖动范围
        y: { from: 295, to: 305 },  // 上下抖动范围
        duration: 50,                // 每次抖动持续时间
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,                  // 无限循环
        repeatDelay: 0
      });
    }
  });
  
  // 创建一个更自然的抖动效果 - 使用timeline
  this.tweens.timeline({
    targets: diamond,
    loop: -1,  // 无限循环
    loopDelay: 0,
    tweens: [
      // 快速抖动序列
      { x: '+=8', y: '+=3', duration: 40, ease: 'Power1' },
      { x: '-=12', y: '-=5', duration: 40, ease: 'Power1' },
      { x: '+=15', y: '+=8', duration: 40, ease: 'Power1' },
      { x: '-=18', y: '-=4', duration: 40, ease: 'Power1' },
      { x: '+=12', y: '+=6', duration: 40, ease: 'Power1' },
      { x: '-=8', y: '-=10', duration: 40, ease: 'Power1' },
      { x: '+=10', y: '+=5', duration: 40, ease: 'Power1' },
      { x: '-=15', y: '-=7', duration: 40, ease: 'Power1' },
      { x: '+=13', y: '+=4', duration: 40, ease: 'Power1' },
      { x: '-=10', y: '-=6', duration: 40, ease: 'Power1' },
      { x: '+=7', y: '+=8', duration: 40, ease: 'Power1' },
      { x: '-=9', y: '-=5', duration: 40, ease: 'Power1' },
      { x: '+=11', y: '+=3', duration: 40, ease: 'Power1' },
      { x: '-=14', y: '-=7', duration: 40, ease: 'Power1' },
      { x: '+=8', y: '+=6', duration: 40, ease: 'Power1' },
      { x: '-=6', y: '-=4', duration: 40, ease: 'Power1' },
      { x: '+=5', y: '+=2', duration: 40, ease: 'Power1' },
      { x: '-=7', y: '-=5', duration: 40, ease: 'Power1' },
      { x: '+=4', y: '+=3', duration: 40, ease: 'Power1' },
      { x: '-=2', y: '-=1', duration: 40, ease: 'Power1' },
      // 回到原位
      { x: 400, y: 300, duration: 3200, ease: 'Power1' }  // 剩余时间回到中心
    ]
  });
  
  // 添加说明文字
  this.add.text(400, 50, '灰色菱形抖动动画 (4秒循环)', {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);