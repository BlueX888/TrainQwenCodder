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

let rectangleCount = 0;
const MAX_RECTANGLES = 15;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 40, 30);
  graphics.generateTexture('blueRect', 40, 30);
  graphics.destroy();

  // 添加文本提示
  this.add.text(10, 10, '蓝色矩形将每1.5秒生成一个，最多15个', {
    fontSize: '16px',
    color: '#ffffff'
  });

  const countText = this.add.text(10, 35, `已生成: 0 / ${MAX_RECTANGLES}`, {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 创建定时器事件，每1.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: () => {
      // 检查是否达到最大数量
      if (rectangleCount < MAX_RECTANGLES) {
        // 生成随机位置
        const randomX = Phaser.Math.Between(0, config.width - 40);
        const randomY = Phaser.Math.Between(60, config.height - 30);

        // 创建蓝色矩形
        const rect = this.add.image(randomX, randomY, 'blueRect');
        rect.setOrigin(0, 0);

        // 增加计数
        rectangleCount++;
        countText.setText(`已生成: ${rectangleCount} / ${MAX_RECTANGLES}`);

        // 如果达到最大数量，停止定时器
        if (rectangleCount >= MAX_RECTANGLES) {
          timerEvent.remove();
          this.add.text(10, 60, '已达到最大数量！', {
            fontSize: '16px',
            color: '#ffff00'
          });
        }
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
}

new Phaser.Game(config);