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
  // 无需预加载资源
}

function create() {
  // 菱形计数器
  let diamondCount = 0;
  const maxDiamonds = 12;
  
  // 菱形尺寸
  const diamondSize = 30;
  
  // 创建定时器事件，每3秒触发一次
  this.time.addEvent({
    delay: 3000,                    // 3秒间隔
    callback: spawnDiamond,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: maxDiamonds - 1         // 重复11次（加上首次共12次）
  });
  
  // 生成菱形的函数
  function spawnDiamond() {
    diamondCount++;
    
    // 生成随机位置（留出边距避免菱形超出屏幕）
    const margin = diamondSize;
    const x = Phaser.Math.Between(margin, 800 - margin);
    const y = Phaser.Math.Between(margin, 600 - margin);
    
    // 创建 Graphics 对象绘制菱形
    const graphics = this.add.graphics();
    
    // 设置青色填充和描边
    graphics.fillStyle(0x00ffff, 1);      // 青色填充
    graphics.lineStyle(2, 0x00cccc, 1);   // 深青色描边
    
    // 绘制菱形（四个顶点）
    graphics.beginPath();
    graphics.moveTo(x, y - diamondSize);           // 上顶点
    graphics.lineTo(x + diamondSize, y);           // 右顶点
    graphics.lineTo(x, y + diamondSize);           // 下顶点
    graphics.lineTo(x - diamondSize, y);           // 左顶点
    graphics.closePath();
    
    // 填充和描边
    graphics.fillPath();
    graphics.strokePath();
    
    // 在控制台输出生成信息
    console.log(`菱形 ${diamondCount}/12 生成于 (${x}, ${y})`);
  }
  
  // 添加提示文本
  const text = this.add.text(10, 10, '每3秒生成一个青色菱形\n最多生成12个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

// 创建游戏实例
new Phaser.Game(config);