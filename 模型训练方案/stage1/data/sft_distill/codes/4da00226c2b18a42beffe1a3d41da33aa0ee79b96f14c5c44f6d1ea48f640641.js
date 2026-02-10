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

let squareCount = 0;
const MAX_SQUARES = 10;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('purpleSquare', 50, 50);
  graphics.destroy();

  // 重置计数器
  squareCount = 0;

  // 添加提示文本
  this.add.text(10, 10, 'Purple squares will spawn every 2 seconds (max 10)', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 创建计数显示文本
  const countText = this.add.text(10, 40, `Squares: ${squareCount}/${MAX_SQUARES}`, {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  });

  // 创建定时器事件，每2秒执行一次
  timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      // 检查是否达到上限
      if (squareCount < MAX_SQUARES) {
        // 生成随机位置（确保方块完全在画面内）
        const x = Phaser.Math.Between(25, 775);
        const y = Phaser.Math.Between(80, 575);

        // 创建紫色方块
        const square = this.add.image(x, y, 'purpleSquare');
        
        // 添加简单的缩放动画效果
        square.setScale(0);
        this.tweens.add({
          targets: square,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });

        // 增加计数
        squareCount++;
        countText.setText(`Squares: ${squareCount}/${MAX_SQUARES}`);

        // 如果达到上限，移除定时器
        if (squareCount >= MAX_SQUARES) {
          timerEvent.remove();
          
          // 显示完成提示
          this.add.text(400, 300, 'All squares spawned!', {
            fontSize: '32px',
            color: '#9932cc',
            fontStyle: 'bold'
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
}

new Phaser.Game(config);