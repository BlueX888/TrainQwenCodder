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

// 存储生成的圆形
let circles = [];
let timerEvent = null;

function preload() {
  // 无需预加载资源
}

function create() {
  // 重置圆形数组
  circles = [];
  
  // 创建定时器，每1秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒间隔
    callback: spawnCircle, // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 生成圆形的函数
  function spawnCircle() {
    // 检查是否已达到最大数量
    if (circles.length >= 3) {
      // 移除定时器
      if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
      }
      return;
    }
    
    // 生成随机位置
    const radius = 30; // 圆形半径
    const x = Phaser.Math.Between(radius, config.width - radius);
    const y = Phaser.Math.Between(radius, config.height - radius);
    
    // 使用 Graphics 绘制灰色圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(x, y, radius);
    
    // 添加到数组中
    circles.push(graphics);
    
    console.log(`生成第 ${circles.length} 个圆形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);