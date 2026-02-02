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
  // 无需预加载外部资源
}

function create() {
  // 计数器，用于追踪已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 12;
  
  // 矩形尺寸
  const rectWidth = 50;
  const rectHeight = 50;
  
  // 添加文字提示
  const text = this.add.text(10, 10, 'Rectangles: 0/12', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每隔1秒触发一次，重复11次（加上第一次共12次）
  this.time.addEvent({
    delay: 1000,           // 1秒 = 1000毫秒
    callback: spawnRectangle,
    callbackScope: this,
    repeat: 11,            // 重复11次，加上首次执行共12次
    loop: false
  });
  
  // 生成矩形的回调函数
  function spawnRectangle() {
    // 生成随机位置，确保矩形完全在画布内
    const x = Phaser.Math.Between(rectWidth / 2, this.scale.width - rectWidth / 2);
    const y = Phaser.Math.Between(rectHeight / 2, this.scale.height - rectHeight / 2);
    
    // 使用 Graphics 绘制紫色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色 (DarkOrchid)
    graphics.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);
    
    // 可选：添加边框使矩形更明显
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);
    
    // 更新计数器
    rectangleCount++;
    text.setText(`Rectangles: ${rectangleCount}/12`);
    
    // 可选：添加简单的缩放动画效果
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }
}

new Phaser.Game(config);