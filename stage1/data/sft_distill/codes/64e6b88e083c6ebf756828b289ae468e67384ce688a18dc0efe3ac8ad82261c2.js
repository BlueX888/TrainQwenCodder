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

// 方块计数器
let squareCount = 0;
const MAX_SQUARES = 15;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('redSquare', 40, 40);
  graphics.destroy();

  // 添加计数器文本显示
  const countText = this.add.text(10, 10, `方块数量: 0 / ${MAX_SQUARES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });

  // 创建定时器事件，每2.5秒执行一次
  const timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: () => {
      // 检查是否已达到最大数量
      if (squareCount >= MAX_SQUARES) {
        timerEvent.remove(); // 停止定时器
        countText.setText(`方块数量: ${squareCount} / ${MAX_SQUARES} (已完成)`);
        return;
      }

      // 生成随机位置（确保方块完全在画布内）
      const x = Phaser.Math.Between(20, 780); // 留出方块半宽的边距
      const y = Phaser.Math.Between(20, 580);

      // 创建红色方块
      const square = this.add.image(x, y, 'redSquare');
      
      // 添加简单的缩放动画效果
      square.setScale(0);
      this.tweens.add({
        targets: square,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      // 增加计数器
      squareCount++;
      countText.setText(`方块数量: ${squareCount} / ${MAX_SQUARES}`);
    },
    loop: true // 循环执行
  });

  // 添加提示文本
  this.add.text(400, 300, '每2.5秒生成一个红色方块', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);