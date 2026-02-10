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

let ellipseCount = 0;
const MAX_ELLIPSES = 15;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 添加标题文本
  this.add.text(400, 30, 'White Ellipses Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加计数器文本
  const counterText = this.add.text(400, 70, `Count: ${ellipseCount} / ${MAX_ELLIPSES}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时事件，每1.5秒触发一次，重复14次（加上第一次共15次）
  this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: () => {
      // 生成随机位置（留出边距，避免椭圆超出边界）
      const x = Phaser.Math.Between(60, 740);
      const y = Phaser.Math.Between(120, 540);
      
      // 生成随机椭圆大小（宽度和高度）
      const width = Phaser.Math.Between(40, 80);
      const height = Phaser.Math.Between(30, 60);
      
      // 使用Graphics绘制白色椭圆
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1); // 白色，不透明
      graphics.fillEllipse(x, y, width, height);
      
      // 更新计数器
      ellipseCount++;
      counterText.setText(`Count: ${ellipseCount} / ${MAX_ELLIPSES}`);
      
      // 可选：添加一个淡入效果
      graphics.setAlpha(0);
      this.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    },
    callbackScope: this,
    repeat: MAX_ELLIPSES - 1 // 重复14次，加上第一次共15次
  });
}

new Phaser.Game(config);