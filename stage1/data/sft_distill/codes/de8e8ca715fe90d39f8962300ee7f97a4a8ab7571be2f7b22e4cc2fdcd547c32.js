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
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(20, 20, 20); // 半径为20的圆形
  graphics.generateTexture('pinkCircle', 40, 40);
  graphics.destroy();

  // 创建定时器事件，每0.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    timerEvent.remove(); // 停止定时器
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const padding = 20; // 圆形半径
  const randomX = Phaser.Math.Between(padding, config.width - padding);
  const randomY = Phaser.Math.Between(padding, config.height - padding);

  // 添加圆形到场景
  this.add.image(randomX, randomY, 'pinkCircle');

  // 增加计数
  circleCount++;
}

new Phaser.Game(config);