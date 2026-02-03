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
  // 圆形计数器
  let circleCount = 0;
  const maxCircles = 5;
  const circleRadius = 30;
  
  // 创建定时器事件，每隔 1.5 秒执行一次
  this.time.addEvent({
    delay: 1500,                    // 1.5 秒 = 1500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true,                     // 循环执行
    repeat: maxCircles - 1          // 重复 4 次（加上首次共 5 次）
  });
  
  // 生成圆形的回调函数
  function spawnCircle() {
    circleCount++;
    
    // 生成随机位置（确保圆形完全在画布内）
    const x = Phaser.Math.Between(circleRadius, this.game.config.width - circleRadius);
    const y = Phaser.Math.Between(circleRadius, this.game.config.height - circleRadius);
    
    // 使用 Graphics 绘制灰色圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);  // 灰色
    graphics.fillCircle(x, y, circleRadius);
    
    // 添加文字标记（可选，用于显示生成顺序）
    this.add.text(x, y, circleCount.toString(), {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);