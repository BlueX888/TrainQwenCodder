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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 圆形计数器
  let circleCount = 0;
  const maxCircles = 8;
  const circleRadius = 20;

  // 添加标题文本
  this.add.text(400, 30, 'Random Circle Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加计数器文本
  const counterText = this.add.text(400, 70, `Circles: 0 / ${maxCircles}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时器事件，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500,                    // 延迟1500毫秒（1.5秒）
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(
        circleRadius + 50, 
        config.width - circleRadius - 50
      );
      const y = Phaser.Math.Between(
        100 + circleRadius, 
        config.height - circleRadius - 50
      );

      // 使用 Graphics 绘制红色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);  // 红色，不透明
      graphics.fillCircle(x, y, circleRadius);

      // 更新计数器
      circleCount++;
      counterText.setText(`Circles: ${circleCount} / ${maxCircles}`);

      // 添加生成动画效果（可选）
      graphics.setAlpha(0);
      this.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    },
    callbackScope: this,
    repeat: maxCircles - 1,         // 重复7次，加上首次共8次
    loop: false
  });

  // 添加说明文本
  this.add.text(400, config.height - 30, 'Circles will spawn every 1.5 seconds (max 8)', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);