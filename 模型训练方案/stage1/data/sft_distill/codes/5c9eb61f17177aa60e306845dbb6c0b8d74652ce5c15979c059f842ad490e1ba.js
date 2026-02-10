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
  // 无需预加载外部资源
}

function create() {
  // 矩形计数器
  let rectangleCount = 0;
  const maxRectangles = 10;
  const rectangleWidth = 60;
  const rectangleHeight = 40;

  // 创建定时器事件，每2.5秒执行一次
  this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: () => {
      // 生成随机位置（确保矩形完全在画布内）
      const x = Phaser.Math.Between(0, this.scale.width - rectangleWidth);
      const y = Phaser.Math.Between(0, this.scale.height - rectangleHeight);

      // 使用 Graphics 绘制绿色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1); // 绿色
      graphics.fillRect(x, y, rectangleWidth, rectangleHeight);

      rectangleCount++;
      console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: maxRectangles - 1, // 重复9次，加上首次执行共10次
    loop: false
  });

  // 添加提示文本
  this.add.text(10, 10, '每2.5秒生成一个绿色矩形\n最多生成10个', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);