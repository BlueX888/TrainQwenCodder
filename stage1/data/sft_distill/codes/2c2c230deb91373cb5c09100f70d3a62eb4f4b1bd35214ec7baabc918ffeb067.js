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
  // 使用 Graphics 生成蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('blueCircle', 40, 40);
  graphics.destroy();

  // 创建定时器，每0.5秒生成一个圆形
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
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const radius = 20;
  const x = Phaser.Math.Between(radius, config.width - radius);
  const y = Phaser.Math.Between(radius, config.height - radius);

  // 添加圆形到场景
  this.add.image(x, y, 'blueCircle');

  // 增加计数
  circleCount++;

  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);