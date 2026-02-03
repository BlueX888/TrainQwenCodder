const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
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
  
  // 创建定时器事件，每隔1秒执行一次
  this.time.addEvent({
    delay: 1000,                    // 1秒延迟
    callback: () => {
      // 生成随机位置（确保矩形完全在画布内）
      const x = Phaser.Math.Between(0, config.width - rectWidth);
      const y = Phaser.Math.Between(0, config.height - rectHeight);
      
      // 创建 Graphics 对象并绘制灰色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1);  // 灰色
      graphics.fillRect(x, y, rectWidth, rectHeight);
      
      rectangleCount++;
      console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: maxRectangles - 1       // 重复7次，加上首次执行共8次
  });
}

new Phaser.Game(config);