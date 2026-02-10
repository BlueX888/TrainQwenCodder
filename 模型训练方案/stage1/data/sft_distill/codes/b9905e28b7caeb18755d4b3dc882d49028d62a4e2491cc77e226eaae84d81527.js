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

let circleCount = 0;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建定时器事件，每 0.5 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已经生成了 8 个圆形
  if (circleCount >= 8) {
    timerEvent.remove(); // 停止定时器
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(25, 575);

  // 创建圆形精灵
  const circle = this.add.image(x, y, 'blueCircle');

  // 增加计数器
  circleCount++;

  // 可选：添加一些视觉效果，让圆形从小变大
  circle.setScale(0);
  this.tweens.add({
    targets: circle,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
}

new Phaser.Game(config);