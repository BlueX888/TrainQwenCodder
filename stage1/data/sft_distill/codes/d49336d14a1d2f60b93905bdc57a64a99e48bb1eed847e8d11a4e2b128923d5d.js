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
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 12;
  
  // 添加标题文本
  this.add.text(400, 30, '蓝色椭圆生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数显示
  const countText = this.add.text(400, 70, `已生成: ${ellipseCount} / ${maxEllipses}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每 2.5 秒触发一次，总共触发 12 次
  this.time.addEvent({
    delay: 2500, // 2.5 秒 = 2500 毫秒
    callback: () => {
      // 生成随机位置（考虑椭圆大小，避免超出边界）
      const radiusX = 40; // 椭圆 X 轴半径
      const radiusY = 25; // 椭圆 Y 轴半径
      const x = Phaser.Math.Between(radiusX + 20, 800 - radiusX - 20);
      const y = Phaser.Math.Between(radiusY + 100, 600 - radiusY - 20);
      
      // 使用 Graphics 绘制蓝色椭圆
      const graphics = this.add.graphics();
      graphics.fillStyle(0x0066ff, 1); // 蓝色
      graphics.fillEllipse(x, y, radiusX, radiusY);
      
      // 添加白色边框使椭圆更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeEllipse(x, y, radiusX, radiusY);
      
      // 更新计数
      ellipseCount++;
      countText.setText(`已生成: ${ellipseCount} / ${maxEllipses}`);
      
      // 添加生成动画效果（缩放）
      graphics.setScale(0);
      this.tweens.add({
        targets: graphics,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
    },
    callbackScope: this,
    repeat: maxEllipses - 1, // 重复 11 次，加上首次执行共 12 次
    loop: false
  });
  
  // 添加提示信息
  this.add.text(400, 580, '每 2.5 秒生成一个蓝色椭圆', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);