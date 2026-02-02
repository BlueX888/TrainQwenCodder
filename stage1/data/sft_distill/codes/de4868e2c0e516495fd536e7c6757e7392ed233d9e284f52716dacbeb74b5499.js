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
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  circleCount = 0;
  
  // 添加标题文本
  this.add.text(400, 30, '粉色圆形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数显示文本
  const countText = this.add.text(400, 70, `已生成: ${circleCount}/${MAX_CIRCLES}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每 0.5 秒触发一次
  this.time.addEvent({
    delay: 500,                    // 延迟 500 毫秒（0.5 秒）
    callback: () => {
      // 生成随机位置（确保圆形完全在画布内）
      const x = Phaser.Math.Between(
        CIRCLE_RADIUS, 
        config.width - CIRCLE_RADIUS
      );
      const y = Phaser.Math.Between(
        100 + CIRCLE_RADIUS,       // 避开顶部文字区域
        config.height - CIRCLE_RADIUS
      );
      
      // 使用 Graphics 绘制粉色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff69b4, 1);  // 粉色 (HotPink)
      graphics.fillCircle(x, y, CIRCLE_RADIUS);
      
      // 添加白色边框使圆形更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeCircle(x, y, CIRCLE_RADIUS);
      
      // 更新计数
      circleCount++;
      countText.setText(`已生成: ${circleCount}/${MAX_CIRCLES}`);
      
      // 添加淡入动画效果
      graphics.setAlpha(0);
      this.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: 200,
        ease: 'Power2'
      });
    },
    repeat: MAX_CIRCLES - 1,       // 重复 7 次，加上首次共 8 次
    callbackScope: this
  });
  
  // 添加提示文本
  this.add.text(400, config.height - 30, '每 0.5 秒生成一个粉色圆形', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);