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
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每 1.5 秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1500,
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });

  // 添加文字提示显示当前圆形数量
  this.circleText = this.add.text(10, 10, `圆形数量: ${circleCount}/${MAX_CIRCLES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（考虑圆形半径，避免超出边界）
  const radius = 25;
  const x = Phaser.Math.Between(radius, config.width - radius);
  const y = Phaser.Math.Between(radius + 40, config.height - radius);

  // 创建圆形精灵
  const circle = this.add.sprite(x, y, 'redCircle');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: circle,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 增加计数
  circleCount++;

  // 更新文字显示
  this.circleText.setText(`圆形数量: ${circleCount}/${MAX_CIRCLES}`);
}

new Phaser.Game(config);