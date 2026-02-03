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
  // 矩形计数器
  let rectangleCount = 0;
  const maxRectangles = 20;
  
  // 添加标题文本
  this.add.text(10, 10, '每3秒生成一个青色矩形 (最多20个)', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 显示计数器文本
  const counterText = this.add.text(10, 40, `已生成: ${rectangleCount}/${maxRectangles}`, {
    fontSize: '16px',
    color: '#00ffff'
  });
  
  // 创建定时器事件，每3秒触发一次
  this.time.addEvent({
    delay: 3000,           // 3秒 = 3000毫秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(80, 550);
      
      // 创建Graphics对象绘制青色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ffff, 1);  // 青色 (cyan)
      graphics.fillRect(x, y, 40, 40);  // 绘制40x40的矩形
      
      // 更新计数器
      rectangleCount++;
      counterText.setText(`已生成: ${rectangleCount}/${maxRectangles}`);
      
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
    repeat: 19,            // 重复19次，加上首次执行共20次
    startAt: 0             // 立即开始第一次
  });
}

new Phaser.Game(config);