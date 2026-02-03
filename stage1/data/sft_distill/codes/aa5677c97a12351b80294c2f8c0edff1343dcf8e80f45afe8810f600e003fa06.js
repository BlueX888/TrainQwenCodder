const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let circleCount = 0;
const MAX_CIRCLES = 8;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成白色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(20, 20, 20); // 圆心在(20,20)，半径20
  graphics.generateTexture('whiteCircle', 40, 40);
  graphics.destroy();

  // 创建定时器事件，每500ms生成一个圆形
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
  const padding = 20; // 圆形半径
  const randomX = Phaser.Math.Between(padding, config.width - padding);
  const randomY = Phaser.Math.Between(padding, config.height - padding);

  // 创建圆形精灵
  const circle = this.add.image(randomX, randomY, 'whiteCircle');

  // 增加计数
  circleCount++;

  console.log(`生成第 ${circleCount} 个圆形，位置: (${randomX}, ${randomY})`);
}

new Phaser.Game(config);