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
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 50, 30); // 50x30 的矩形
  graphics.generateTexture('blueRect', 50, 30);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建定时器事件，每 1.5 秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5 秒 = 1500 毫秒
    callback: spawnRectangle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加文本显示当前矩形数量
  this.countText = this.add.text(10, 10, 'Rectangles: 0 / 15', {
    fontSize: '20px',
    fill: '#ffffff'
  });
}

function spawnRectangle() {
  // 检查是否已达到最大数量
  if (rectangleCount >= MAX_RECTANGLES) {
    timerEvent.remove(); // 停止定时器
    console.log('已生成最大数量的矩形');
    return;
  }

  // 生成随机位置（确保矩形完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 25 到 775，避免超出边界
  const y = Phaser.Math.Between(15, 585); // 15 到 585，避免超出边界

  // 创建蓝色矩形精灵
  const rect = this.add.sprite(x, y, 'blueRect');
  
  // 添加简单的淡入效果
  rect.setAlpha(0);
  this.tweens.add({
    targets: rect,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });

  // 增加计数器
  rectangleCount++;

  // 更新文本显示
  this.countText.setText(`Rectangles: ${rectangleCount} / ${MAX_RECTANGLES}`);

  console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);