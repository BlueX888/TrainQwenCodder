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
  // 无需加载外部资源
}

function create() {
  // 圆形计数器
  let circleCount = 0;
  const maxCircles = 5;
  const circleRadius = 30;

  // 添加标题文本
  this.add.text(400, 30, '每2.5秒生成一个红色圆形（最多5个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 显示当前生成数量
  const countText = this.add.text(400, 70, `已生成: ${circleCount}/${maxCircles}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时器事件，每2.5秒执行一次
  this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: () => {
      // 生成随机位置（确保圆形完全在画布内）
      const x = Phaser.Math.Between(circleRadius, 800 - circleRadius);
      const y = Phaser.Math.Between(100 + circleRadius, 600 - circleRadius);

      // 使用Graphics绘制红色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1); // 红色，不透明
      graphics.fillCircle(x, y, circleRadius);

      // 添加白色边框使圆形更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeCircle(x, y, circleRadius);

      // 更新计数器
      circleCount++;
      countText.setText(`已生成: ${circleCount}/${maxCircles}`);

      // 添加生成动画效果（缩放）
      graphics.setScale(0);
      this.tweens.add({
        targets: graphics,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: maxCircles - 1 // 重复4次，加上首次执行共5次
  });

  // 添加提示文本
  this.add.text(400, 550, '圆形将在随机位置生成', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);