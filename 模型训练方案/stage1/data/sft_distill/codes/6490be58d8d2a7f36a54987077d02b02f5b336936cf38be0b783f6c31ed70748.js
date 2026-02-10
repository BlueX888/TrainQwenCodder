const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 生成白色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(20, 20, 20); // 圆心在(20,20)，半径20
  graphics.generateTexture('whiteCircle', 40, 40);
  graphics.destroy();

  // 圆形计数器
  let circleCount = 0;
  const maxCircles = 8;

  // 创建定时器事件，每0.5秒生成一个圆形
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: () => {
      // 生成随机位置（确保圆形不会超出边界）
      const radius = 20;
      const x = Phaser.Math.Between(radius, config.width - radius);
      const y = Phaser.Math.Between(radius, config.height - radius);

      // 创建白色圆形精灵
      this.add.image(x, y, 'whiteCircle');

      // 增加计数器
      circleCount++;

      // 达到最大数量后移除定时器
      if (circleCount >= maxCircles) {
        timerEvent.remove();
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
}

new Phaser.Game(config);