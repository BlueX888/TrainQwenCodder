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
const MAX_ELLIPSES = 12;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加标题文本
  this.add.text(10, 10, '蓝色椭圆生成器', {
    fontSize: '24px',
    color: '#ffffff'
  });

  // 显示计数器
  const countText = this.add.text(10, 50, `已生成: ${ellipseCount}/${MAX_ELLIPSES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 创建定时器事件，每2.5秒执行一次
  this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: () => {
      // 生成随机位置
      const randomX = Phaser.Math.Between(50, 750);
      const randomY = Phaser.Math.Between(50, 550);
      
      // 使用Graphics绘制蓝色椭圆
      const graphics = this.add.graphics();
      graphics.fillStyle(0x0066ff, 1); // 蓝色
      
      // 绘制椭圆 (x, y, 宽度, 高度)
      const ellipseWidth = Phaser.Math.Between(40, 80);
      const ellipseHeight = Phaser.Math.Between(30, 60);
      
      graphics.fillEllipse(randomX, randomY, ellipseWidth, ellipseHeight);
      
      // 添加白色边框使椭圆更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeEllipse(randomX, randomY, ellipseWidth, ellipseHeight);
      
      // 增加计数
      ellipseCount++;
      countText.setText(`已生成: ${ellipseCount}/${MAX_ELLIPSES}`);
      
      // 添加生成动画效果
      graphics.setAlpha(0);
      this.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
      
      console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${randomX}, ${randomY})`);
    },
    callbackScope: this,
    repeat: 11, // 重复11次，加上第一次总共12次
    loop: false
  });

  // 添加提示文本
  this.add.text(10, 560, '每2.5秒生成一个蓝色椭圆', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
}

new Phaser.Game(config);