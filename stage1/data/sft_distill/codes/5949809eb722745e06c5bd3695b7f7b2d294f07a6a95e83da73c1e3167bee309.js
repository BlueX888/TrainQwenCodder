const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 矩形计数器
  let rectangleCount = 0;
  const maxRectangles = 8;
  
  // 矩形尺寸
  const rectWidth = 60;
  const rectHeight = 40;
  
  // 创建首个矩形的函数
  const createRectangle = () => {
    if (rectangleCount >= maxRectangles) {
      return;
    }
    
    // 生成随机位置（确保矩形完全在画布内）
    const x = Phaser.Math.Between(0, config.width - rectWidth);
    const y = Phaser.Math.Between(0, config.height - rectHeight);
    
    // 使用 Graphics 绘制灰色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(x, y, rectWidth, rectHeight);
    
    rectangleCount++;
    
    // 在控制台显示生成信息
    console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
  };
  
  // 立即创建第一个矩形
  createRectangle.call(this);
  
  // 创建定时器，每隔 1 秒生成一个矩形
  // repeat: 7 表示在首次之后再重复 7 次，总共 8 次
  this.time.addEvent({
    delay: 1000,           // 1 秒 = 1000 毫秒
    callback: createRectangle,
    callbackScope: this,
    repeat: 7              // 重复 7 次（加上首次共 8 次）
  });
}

new Phaser.Game(config);