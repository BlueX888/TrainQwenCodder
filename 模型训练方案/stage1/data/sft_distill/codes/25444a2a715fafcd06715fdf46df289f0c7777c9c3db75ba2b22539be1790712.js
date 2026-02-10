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

let rectangleCount = 0;
const MAX_RECTANGLES = 12;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加标题文本
  this.add.text(10, 10, 'Green Rectangles Generator', {
    fontSize: '24px',
    color: '#ffffff'
  });

  // 添加计数器文本
  const counterText = this.add.text(10, 50, `Count: ${rectangleCount}/${MAX_RECTANGLES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 创建定时事件，每0.5秒执行一次，重复11次（加上首次执行共12次）
  this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(100, 550);
      
      // 生成随机尺寸（在合理范围内）
      const width = Phaser.Math.Between(30, 60);
      const height = Phaser.Math.Between(30, 60);

      // 创建Graphics对象绘制绿色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1); // 绿色，不透明
      graphics.fillRect(x, y, width, height);

      // 增加计数器
      rectangleCount++;
      counterText.setText(`Count: ${rectangleCount}/${MAX_RECTANGLES}`);

      // 添加一个白色边框使矩形更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, y, width, height);
    },
    callbackScope: this,
    repeat: MAX_RECTANGLES - 1, // 重复11次，加上首次执行共12次
    loop: false
  });
}

new Phaser.Game(config);