const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

// 存储已生成的方块
let squares = [];
const MAX_SQUARES = 3;
const SQUARE_SIZE = 50;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加标题文字
  this.add.text(400, 30, '每0.5秒生成一个红色方块（最多3个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时器事件，每0.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500,                    // 0.5秒 = 500毫秒
    callback: spawnSquare,         // 回调函数
    callbackScope: this,           // 回调函数的作用域
    loop: true                     // 循环执行
  });

  // 生成方块的函数
  function spawnSquare() {
    // 检查是否已达到最大数量
    if (squares.length >= MAX_SQUARES) {
      timerEvent.remove();  // 停止定时器
      
      // 显示完成提示
      this.add.text(400, 580, '已生成3个方块，定时器已停止', {
        fontSize: '18px',
        color: '#00ff00'
      }).setOrigin(0.5);
      
      return;
    }

    // 生成随机位置
    const randomX = Phaser.Math.Between(SQUARE_SIZE / 2, 800 - SQUARE_SIZE / 2);
    const randomY = Phaser.Math.Between(80, 600 - SQUARE_SIZE / 2);

    // 使用 Graphics 绘制红色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);  // 红色，不透明
    graphics.fillRect(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    
    // 设置方块位置
    graphics.setPosition(randomX, randomY);

    // 添加方块编号文字
    const label = this.add.text(randomX, randomY, (squares.length + 1).toString(), {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 保存方块引用
    squares.push({ graphics, label });

    // 添加生成动画效果
    graphics.setScale(0);
    label.setScale(0);
    
    this.tweens.add({
      targets: [graphics, label],
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // 在控制台输出信息
    console.log(`生成第${squares.length}个方块，位置: (${randomX}, ${randomY})`);
  }
}

// 启动游戏
new Phaser.Game(config);