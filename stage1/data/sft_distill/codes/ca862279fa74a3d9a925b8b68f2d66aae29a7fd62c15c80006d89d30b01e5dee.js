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
const MAX_CIRCLES = 8;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(25, 25, 25); // 半径 25 的圆形
  graphics.generateTexture('pinkCircle', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每 0.5 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 25 到 775（800 - 25）
  const y = Phaser.Math.Between(25, 575); // 25 到 575（600 - 25）

  // 在随机位置创建粉色圆形
  this.add.image(x, y, 'pinkCircle');

  // 增加计数
  circleCount++;

  // 输出日志（可选）
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);