const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化计数器
  let rectangleCount = 0;
  const maxRectangles = 12;
  
  // 创建定时器事件，每0.5秒触发一次
  this.time.addEvent({
    delay: 500,                    // 延迟500毫秒（0.5秒）
    callback: spawnRectangle,      // 回调函数
    callbackScope: this,           // 回调函数的作用域
    repeat: maxRectangles - 1,     // 重复11次（加上首次共12次）
    loop: false                    // 不循环
  });
  
  // 生成矩形的函数
  function spawnRectangle() {
    rectangleCount++;
    
    // 生成随机位置
    // 矩形大小为40x30，确保不超出边界
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(15, 585);
    
    // 创建Graphics对象并绘制绿色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
    graphics.fillRect(x - 20, y - 15, 40, 30);  // 以(x,y)为中心绘制40x30的矩形
    
    // 可选：添加文字显示当前生成的矩形数量
    if (rectangleCount === 1) {
      this.countText = this.add.text(10, 10, `矩形数量: ${rectangleCount}`, {
        fontSize: '18px',
        color: '#ffffff'
      });
    } else {
      this.countText.setText(`矩形数量: ${rectangleCount}`);
    }
    
    console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);