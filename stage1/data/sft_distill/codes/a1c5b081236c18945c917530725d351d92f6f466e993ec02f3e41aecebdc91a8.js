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
const CIRCLE_RADIUS = 20;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS);
  graphics.generateTexture('blueCircle', CIRCLE_RADIUS * 2, CIRCLE_RADIUS * 2);
  graphics.destroy();

  // 创建定时器事件，每 0.5 秒生成一个圆形
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });

  // 生成圆形的回调函数
  function spawnCircle() {
    if (circleCount >= MAX_CIRCLES) {
      // 达到最大数量，移除定时器
      timerEvent.remove();
      return;
    }

    // 生成随机位置（确保圆形完全在画布内）
    const x = Phaser.Math.Between(CIRCLE_RADIUS, config.width - CIRCLE_RADIUS);
    const y = Phaser.Math.Between(CIRCLE_RADIUS, config.height - CIRCLE_RADIUS);

    // 创建圆形精灵
    const circle = this.add.image(x, y, 'blueCircle');
    
    // 增加计数
    circleCount++;

    // 可选：添加淡入效果
    circle.setAlpha(0);
    this.tweens.add({
      targets: circle,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  // 添加文本显示当前圆形数量
  const countText = this.add.text(10, 10, 'Circles: 0 / 8', {
    fontSize: '24px',
    color: '#ffffff'
  });

  // 更新文本的定时器
  this.time.addEvent({
    delay: 100,
    callback: () => {
      countText.setText(`Circles: ${circleCount} / ${MAX_CIRCLES}`);
    },
    loop: true
  });
}

new Phaser.Game(config);