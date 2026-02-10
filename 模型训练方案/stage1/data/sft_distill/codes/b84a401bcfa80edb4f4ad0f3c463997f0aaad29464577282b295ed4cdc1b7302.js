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

let circleCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('grayCircle', 50, 50);
  graphics.destroy();

  // 创建定时器，每1秒执行一次
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已经生成了3个圆形
  if (circleCount >= 3) {
    // 达到上限，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 考虑圆形半径25
  const y = Phaser.Math.Between(25, 575);

  // 在随机位置创建圆形
  this.add.image(x, y, 'grayCircle');

  // 增加计数器
  circleCount++;

  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);