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
const MAX_SQUARES = 15;
const SQUARE_SIZE = 40;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用Graphics创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, SQUARE_SIZE, SQUARE_SIZE);
  graphics.generateTexture('redSquare', SQUARE_SIZE, SQUARE_SIZE);
  graphics.destroy();

  // 添加计数器文本显示
  const counterText = this.add.text(10, 10, `方块数量: ${squareCount}/${MAX_SQUARES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });

  // 创建定时器事件，每2.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 2500,                    // 2.5秒 = 2500毫秒
    callback: () => {
      if (squareCount < MAX_SQUARES) {
        // 生成随机位置（确保方块完全在画布内）
        const randomX = Phaser.Math.Between(
          SQUARE_SIZE / 2,
          config.width - SQUARE_SIZE / 2
        );
        const randomY = Phaser.Math.Between(
          SQUARE_SIZE / 2,
          config.height - SQUARE_SIZE / 2
        );

        // 创建红色方块
        const square = this.add.image(randomX, randomY, 'redSquare');
        
        // 添加简单的缩放动画效果
        square.setScale(0);
        this.tweens.add({
          targets: square,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });

        // 增加计数器
        squareCount++;
        counterText.setText(`方块数量: ${squareCount}/${MAX_SQUARES}`);

        // 如果达到最大数量，移除定时器
        if (squareCount >= MAX_SQUARES) {
          timerEvent.remove();
          
          // 显示完成提示
          this.add.text(config.width / 2, 30, '已生成全部方块！', {
            fontSize: '24px',
            color: '#00ff00'
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });

  // 添加说明文本
  this.add.text(config.width / 2, config.height - 30, 
    '每2.5秒生成一个红色方块', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);