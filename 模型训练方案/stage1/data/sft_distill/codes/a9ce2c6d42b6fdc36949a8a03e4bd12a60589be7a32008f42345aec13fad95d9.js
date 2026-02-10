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
  const maxCircles = 3;
  const circleRadius = 30;
  
  // 添加标题文字
  this.add.text(400, 50, '每隔1秒生成灰色圆形（最多3个）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 显示计数器
  const countText = this.add.text(400, 100, `已生成: ${circleCount}/${maxCircles}`, {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每隔1秒执行一次
  this.time.addEvent({
    delay: 1000,                    // 1秒 = 1000毫秒
    callback: () => {
      // 生成随机位置（确保圆形不会超出边界）
      const x = Phaser.Math.Between(
        circleRadius + 50, 
        config.width - circleRadius - 50
      );
      const y = Phaser.Math.Between(
        150 + circleRadius, 
        config.height - circleRadius - 50
      );
      
      // 使用 Graphics 绘制灰色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1);  // 灰色
      graphics.fillCircle(x, y, circleRadius);
      
      // 添加圆形边框使其更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeCircle(x, y, circleRadius);
      
      // 更新计数
      circleCount++;
      countText.setText(`已生成: ${circleCount}/${maxCircles}`);
      
      // 添加生成动画效果
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
    repeat: maxCircles - 1          // 重复2次，加上首次执行共3次
  });
  
  // 添加说明文字
  this.add.text(400, 550, '观察圆形每秒生成一个', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);